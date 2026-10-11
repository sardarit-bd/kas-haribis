'use client';
import { FormEvent, useMemo, useState } from 'react';
type Item = {
  id: string;
  title: string;
  hebrew_title: string;
  publication_date: string;
  author: string;
  summary: string;
  pdf_url: string;
  cover_url: string;
  page_count: number;
  published: number;
  featured: number;
  sort_order: number;
};
const blank = (n: number): Item => ({
  id: '',
  title: '',
  hebrew_title: '',
  publication_date: '',
  author: 'Kav Haribis',
  summary: '',
  pdf_url: '',
  cover_url: '',
  page_count: 0,
  published: 1,
  featured: 0,
  sort_order: n,
});
async function loadPdfJs(): Promise<any> {
  if (typeof window === 'undefined') return null;
  const w = window as any;
  if (w.pdfjsLib) return w.pdfjsLib;

  return new Promise((resolve, reject) => {
    const existing = document.querySelector('script[data-pdfjs]');
    if (existing) {
      if (w.pdfjsLib) {
        resolve(w.pdfjsLib);
      } else {
        existing.addEventListener('load', () => resolve(w.pdfjsLib));
        existing.addEventListener('error', reject);
      }
      return;
    }

    const script = document.createElement('script');
    script.src =
      'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
    script.async = true;
    script.dataset.pdfjs = 'true';
    script.onload = () => {
      const lib = w.pdfjsLib;
      if (lib) {
        lib.GlobalWorkerOptions.workerSrc =
          'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
        resolve(lib);
      } else {
        reject(new Error('PDF.js library could not be loaded'));
      }
    };
    script.onerror = () => reject(new Error('Failed to load PDF.js'));
    document.head.appendChild(script);
  });
}

async function renderPdfFirstPage(file: File): Promise<Blob | null> {
  try {
    const pdfjs = await loadPdfJs();
    if (!pdfjs) return null;
    const arrayBuffer = await file.arrayBuffer();
    const loadingTask = pdfjs.getDocument({ data: arrayBuffer });
    const pdfDoc = await loadingTask.promise;
    const page = await pdfDoc.getPage(1);

    const unscaledViewport = page.getViewport({ scale: 1 });
    const targetWidth = 696;
    const scale = targetWidth / unscaledViewport.width;
    const viewport = page.getViewport({ scale });

    const canvas = document.createElement('canvas');
    canvas.width = Math.round(viewport.width);
    canvas.height = Math.round(viewport.height);

    const context = canvas.getContext('2d');
    if (!context) return null;

    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, canvas.width, canvas.height);

    await page.render({
      canvasContext: context,
      viewport,
    }).promise;

    return new Promise((resolve) => {
      canvas.toBlob((blob) => resolve(blob), 'image/jpeg', 0.85);
    });
  } catch (e) {
    console.error('Error generating PDF cover:', e);
    return null;
  }
}

export default function ArticleManager({
  initialItems,
}: {
  initialItems: Item[];
}) {
  const [items, setItems] = useState(initialItems),
    [editing, setEditing] = useState<Item | null>(null),
    [q, setQ] = useState(''),
    [msg, setMsg] = useState(''),
    [busy, setBusy] = useState(false),
    [coverBlob, setCoverBlob] = useState<Blob | null>(null),
    [coverPreview, setCoverPreview] = useState<string>(''),
    [generatingCover, setGeneratingCover] = useState(false);
  const v = editing || blank(items.length + 1),
    filtered = useMemo(
      () =>
        items.filter((x) =>
          (x.title + x.hebrew_title + x.author)
            .toLowerCase()
            .includes(q.toLowerCase()),
        ),
      [items, q],
    );
  async function reload() {
    const j = (await fetch('/api/articles').then((r) => r.json())) as any;
    setItems(j.articles || []);
  }

  async function onPdfChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) {
      setCoverBlob(null);
      setCoverPreview('');
      return;
    }
    setGeneratingCover(true);
    setMsg('Generating cover preview from first page…');
    const blob = await renderPdfFirstPage(file);
    setGeneratingCover(false);
    if (blob) {
      setCoverBlob(blob);
      setCoverPreview(URL.createObjectURL(blob));
      setMsg('Cover preview generated successfully.');
    } else {
      setMsg('Could not render cover preview automatically (PDF details will still be saved).');
    }
  }

  async function save(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setMsg('Saving publication…');
    const form = e.currentTarget,
      d = Object.fromEntries(new FormData(form).entries()) as any;
    d.published = d.published === 'on';
    d.featured = d.featured === 'on';
    const r = await fetch('/api/articles', {
        method: d.id ? 'PUT' : 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(d),
      }),
      j = (await r.json()) as any;
    if (!r.ok) {
      setMsg(j.error || 'Could not save.');
      setBusy(false);
      return;
    }
    const id = d.id || j.id,
      file = (form.elements.namedItem('pdf_file') as HTMLInputElement)
        ?.files?.[0];
    if (file) {
      setMsg('Uploading PDF and cover image…');
      const fd = new FormData();
      fd.set('id', id);
      fd.set('file', file);
      if (coverBlob) {
        fd.set('cover', coverBlob, `${id}-cover.jpg`);
      }
      const ur = await fetch('/api/admin/article-upload', {
          method: 'POST',
          body: fd,
        }),
        uj = (await ur.json()) as any;
      if (!ur.ok) {
        setMsg(`Publication details saved, but PDF failed: ${uj.error}`);
        setBusy(false);
        await reload();
        return;
      }
      if (uj.pageCount !== 2)
        setMsg(`Saved. Note: this PDF contains ${uj.pageCount} pages, not 2.`);
    }
    await reload();
    setEditing(null);
    setCoverBlob(null);
    setCoverPreview('');
    form.reset();
    if (!file || !msg.includes('contains'))
      setMsg(d.id ? 'Publication updated.' : 'Publication uploaded and added.');
    setBusy(false);
  }
  async function remove(x: Item) {
    if (!confirm(`Remove ${x.title}?`)) return;
    await fetch(`/api/articles?id=${encodeURIComponent(x.id)}`, {
      method: 'DELETE',
    });
    await reload();
    setEditing(null);
    setCoverBlob(null);
    setCoverPreview('');
    setMsg(`${x.title} was removed.`);
  }
  return (
    <div className="articleAdminLayout">
      <section className="articleEditorCard">
        <div className="bankEditorHeading">
          <div>
            <p className="eyebrow gold">
              {editing ? 'EDIT PUBLICATION' : 'NEW PUBLICATION'}
            </p>
            <h2>{editing ? editing.title : 'Upload an article or gilyon'}</h2>
          </div>
          {editing && (
            <button onClick={() => { setEditing(null); setCoverBlob(null); setCoverPreview(''); }}>← Back to add</button>
          )}
        </div>
        <form key={v.id || 'new'} onSubmit={save}>
          <input type="hidden" name="id" value={v.id} />
          <input type="hidden" name="pdf_url" value={v.pdf_url} />
          <input type="hidden" name="cover_url" value={v.cover_url} />
          <input type="hidden" name="page_count" value={v.page_count} />
          <div className="businessFormGrid">
            <label>
              English or primary title
              <input name="title" defaultValue={v.title} required />
            </label>
            <label>
              Hebrew title
              <input
                name="hebrew_title"
                dir="rtl"
                defaultValue={v.hebrew_title}
              />
            </label>
            <label>
              Publication date
              <input
                type="date"
                name="publication_date"
                defaultValue={v.publication_date}
              />
            </label>
            <label>
              Author / publisher
              <input name="author" defaultValue={v.author} />
            </label>
          </div>
          <label>
            Description
            <textarea
              name="summary"
              rows={5}
              defaultValue={v.summary}
              placeholder="Briefly explain what this issue discusses."
            />
          </label>
          <div className="articleUploadBox">
            <label>
              {v.pdf_url ? 'Replace PDF' : 'Article PDF'}
              <input
                type="file"
                name="pdf_file"
                accept="application/pdf"
                required={!v.pdf_url}
                onChange={onPdfChange}
              />
              <small>
                Upload the complete PDF. The administrator automatically extracts page 1 as the cover and counts its pages. Maximum 20 MB.
              </small>
            </label>
            {generatingCover && (
              <p className="adminSaveMessage" style={{ margin: '8px 0 0 0', color: '#c69b46' }}>
                ⏳ Rendering page 1 cover image from PDF…
              </p>
            )}
            {coverPreview && !generatingCover && (
              <div style={{ marginTop: '12px', display: 'flex', gap: '12px', alignItems: 'flex-start', background: '#f8fafc', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <img
                  src={coverPreview}
                  alt="Generated Cover Preview"
                  style={{ width: '64px', height: '84px', objectFit: 'cover', borderRadius: '4px', border: '1px solid #cbd5e1', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}
                />
                <div style={{ fontSize: '12px' }}>
                  <b style={{ color: '#102a43', display: 'block', marginBottom: '2px' }}>✓ First page cover extracted</b>
                  <span style={{ color: '#64748b', lineHeight: '1.4' }}>
                    This cover image will be saved to R2 and displayed across the public archive.
                  </span>
                </div>
              </div>
            )}
            {!coverPreview && v.cover_url && (
              <div style={{ marginTop: '12px', display: 'flex', gap: '12px', alignItems: 'flex-start', background: '#f8fafc', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <img
                  src={v.cover_url}
                  alt="Current Cover"
                  style={{ width: '64px', height: '84px', objectFit: 'cover', borderRadius: '4px', border: '1px solid #cbd5e1' }}
                />
                <div style={{ fontSize: '12px' }}>
                  <b style={{ color: '#102a43', display: 'block', marginBottom: '2px' }}>Current cover</b>
                  <span style={{ color: '#64748b', lineHeight: '1.4' }}>
                    Selecting a new PDF will automatically generate a replacement cover.
                  </span>
                </div>
              </div>
            )}
            {v.pdf_url && (
              <a href={v.pdf_url} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-block', marginTop: '8px' }}>
                Open current PDF ↗
              </a>
            )}
          </div>
          <div className="businessFormGrid">
            <label>
              Display order
              <input
                type="number"
                name="sort_order"
                defaultValue={v.sort_order}
              />
            </label>
            <div className="adminSwitches">
              <label>
                <input
                  type="checkbox"
                  name="published"
                  defaultChecked={Boolean(v.published)}
                />{' '}
                Published
              </label>
              <label>
                <input
                  type="checkbox"
                  name="featured"
                  defaultChecked={Boolean(v.featured)}
                />{' '}
                Featured
              </label>
            </div>
          </div>
          <div className="editFormActions">
            <button className="primary" disabled={busy}>
              {busy
                ? 'Saving…'
                : editing
                  ? 'Save changes'
                  : 'Upload and publish'}
            </button>
            {editing && (
              <button type="button" onClick={() => setEditing(null)}>
                Cancel
              </button>
            )}
          </div>
        </form>
        {msg && <p className="adminSaveMessage">{msg}</p>}
      </section>
      <section className="articleAdminList">
        <div className="bankListHeader">
          <div>
            <h2>All publications</h2>
            <span>{items.length} records</span>
          </div>
          <button
            className="primary"
            onClick={() => {
              setEditing(null);
              scrollTo({ top: 0, behavior: 'smooth' });
            }}
          >
            + Add publication
          </button>
        </div>
        <label className="bankAdminSearch">
          Search articles
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Title or author…"
          />
        </label>
        <div className="articleAdminRows">
          {filtered.map((x) => (
            <article key={x.id}>
              {x.cover_url ? (
                <img src={x.cover_url} alt="" />
              ) : (
                <span>PDF</span>
              )}
              <div>
                <b dir={/[֐-׿]/.test(x.title) ? 'rtl' : 'ltr'}>{x.title}</b>
                <small>
                  {x.publication_date || 'No date'} · {x.page_count || '?'}{' '}
                  pages · {x.published ? 'Published' : 'Hidden'}
                </small>
              </div>
              <div className="bankRowActions">
                <button
                  onClick={() => {
                    setEditing(x);
                    setMsg('');
                    scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                >
                  Edit
                </button>
                <button className="deleteButton" onClick={() => remove(x)}>
                  Remove
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
