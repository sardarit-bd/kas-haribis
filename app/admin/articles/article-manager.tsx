'use client';
import { FormEvent, useMemo, useState } from 'react';
import {
  renderPdfFirstPage,
  renderPdfFirstPageFromUrl,
} from '../../lib/pdf-cover';
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
    [manualCoverFile, setManualCoverFile] = useState<File | null>(null),
    [manualCoverPreview, setManualCoverPreview] = useState<string>(''),
    [generatingCover, setGeneratingCover] = useState(false);

  const resetCovers = () => {
    setCoverBlob(null);
    setCoverPreview('');
    setManualCoverFile(null);
    setManualCoverPreview('');
  };

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
      setCoverBlob(null);
      setCoverPreview('');
      setMsg('Could not render cover preview automatically. Please choose a manual cover image below.');
    }
  }

  function onManualCoverChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) {
      setManualCoverFile(null);
      setManualCoverPreview('');
      return;
    }
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setMsg('Manual cover must be a JPEG, PNG, or WebP image.');
      e.target.value = '';
      setManualCoverFile(null);
      setManualCoverPreview('');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setMsg('Manual cover image must be 5 MB or smaller.');
      e.target.value = '';
      setManualCoverFile(null);
      setManualCoverPreview('');
      return;
    }
    setManualCoverFile(file);
    setManualCoverPreview(URL.createObjectURL(file));
    setMsg('Manual cover image selected.');
  }

  async function regenerateCoverFromExistingPdf() {
    if (!v.id || !v.pdf_url) return;
    setGeneratingCover(true);
    setMsg('Fetching existing PDF to extract cover…');
    try {
      const generated = await renderPdfFirstPageFromUrl(v.pdf_url);
      if (!generated) {
        throw new Error('Failed to render page 1 of PDF');
      }
      setCoverBlob(generated);
      setCoverPreview(URL.createObjectURL(generated));
      setMsg('Cover extracted from existing PDF. Click "Save changes" to upload and apply.');
    } catch (err: any) {
      setMsg(`Cover extraction failed: ${err.message || 'Unknown error'}. You can upload a manual cover image below.`);
    } finally {
      setGeneratingCover(false);
    }
  }

  async function save(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (generatingCover) {
      setMsg('Please wait for cover generation to complete…');
      return;
    }
    setBusy(true);
    setMsg('Saving publication…');
    const form = e.currentTarget,
      d = Object.fromEntries(new FormData(form).entries()) as any;
    d.published = d.published === 'on';
    d.featured = d.featured === 'on';

    const file = (form.elements.namedItem('pdf_file') as HTMLInputElement)
      ?.files?.[0];

    // If PDF is selected, ensure a cover is ready (manual or auto-generated)
    let effectiveCoverBlob = coverBlob;
    if (file && !manualCoverFile && !effectiveCoverBlob) {
      setGeneratingCover(true);
      setMsg('Rendering page 1 cover image from PDF…');
      effectiveCoverBlob = await renderPdfFirstPage(file);
      setGeneratingCover(false);
      if (effectiveCoverBlob) {
        setCoverBlob(effectiveCoverBlob);
        setCoverPreview(URL.createObjectURL(effectiveCoverBlob));
      } else {
        setMsg('Could not generate cover image from PDF. Please upload a manual cover image (JPG, PNG, or WebP) or try another PDF.');
        setBusy(false);
        return;
      }
    } else if (!file && !manualCoverFile && !effectiveCoverBlob && !v.cover_url && v.pdf_url) {
      setGeneratingCover(true);
      setMsg('Extracting missing cover image from current PDF…');
      effectiveCoverBlob = await renderPdfFirstPageFromUrl(v.pdf_url);
      setGeneratingCover(false);
      if (effectiveCoverBlob) {
        setCoverBlob(effectiveCoverBlob);
        setCoverPreview(URL.createObjectURL(effectiveCoverBlob));
      }
    }

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
    const id = d.id || j.id;

    if (file) {
      setMsg('Uploading PDF and cover image…');
      const fd = new FormData();
      fd.set('id', id);
      fd.set('file', file);
      if (manualCoverFile) {
        fd.set('cover', manualCoverFile, manualCoverFile.name);
      } else if (effectiveCoverBlob) {
        fd.set('cover', effectiveCoverBlob, `${id}-cover.jpg`);
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
    } else if (manualCoverFile || effectiveCoverBlob) {
      setMsg('Uploading cover image…');
      const fd = new FormData();
      fd.set('id', id);
      if (manualCoverFile) {
        fd.set('cover', manualCoverFile, manualCoverFile.name);
      } else if (effectiveCoverBlob) {
        fd.set('cover', effectiveCoverBlob, `${id}-cover.jpg`);
      }
      const ur = await fetch('/api/admin/article-upload', {
          method: 'POST',
          body: fd,
        }),
        uj = (await ur.json()) as any;
      if (!ur.ok) {
        setMsg(`Publication details saved, but cover failed: ${uj.error}`);
        setBusy(false);
        await reload();
        return;
      }
    }
    await reload();
    setEditing(null);
    resetCovers();
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
    resetCovers();
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
            <button onClick={() => { setEditing(null); resetCovers(); }}>← Back to add</button>
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
                disabled={busy || generatingCover}
              />
              <small>
                Upload the complete PDF. The administrator automatically extracts page 1 as the cover and counts its pages. Maximum 20 MB.
              </small>
            </label>

            <label style={{ marginTop: '14px', display: 'block' }}>
              <span>Manual cover image (optional override)</span>
              <input
                type="file"
                name="manual_cover"
                accept="image/jpeg,image/png,image/webp"
                onChange={onManualCoverChange}
                disabled={busy || generatingCover}
              />
              <small>
                Upload a custom cover image (JPG, PNG, or WebP up to 5 MB) if you wish to override or recover without PDF re-rendering.
              </small>
            </label>

            {generatingCover && (
              <p className="adminSaveMessage" style={{ margin: '8px 0 0 0', color: '#c69b46' }}>
                ⏳ Rendering page 1 cover image from PDF…
              </p>
            )}

            {manualCoverPreview && !generatingCover && (
              <div style={{ marginTop: '12px', display: 'flex', gap: '12px', alignItems: 'flex-start', background: '#f0fdf4', padding: '10px', borderRadius: '8px', border: '1px solid #bbf7d0' }}>
                <img
                  src={manualCoverPreview}
                  alt="Manual Cover Preview"
                  style={{ width: '64px', height: '84px', objectFit: 'cover', borderRadius: '4px', border: '1px solid #86efac', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}
                />
                <div style={{ fontSize: '12px' }}>
                  <b style={{ color: '#166534', display: 'block', marginBottom: '2px' }}>✓ Manual cover image selected</b>
                  <span style={{ color: '#15803d', lineHeight: '1.4' }}>
                    This manual image takes precedence and will be saved to R2 as the article cover.
                  </span>
                </div>
              </div>
            )}

            {!manualCoverPreview && coverPreview && !generatingCover && (
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

            {!manualCoverPreview && !coverPreview && v.cover_url && (
              <div style={{ marginTop: '12px', display: 'flex', gap: '12px', alignItems: 'flex-start', background: '#f8fafc', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <img
                  src={v.cover_url}
                  alt="Current Cover"
                  style={{ width: '64px', height: '84px', objectFit: 'cover', borderRadius: '4px', border: '1px solid #cbd5e1' }}
                />
                <div style={{ fontSize: '12px' }}>
                  <b style={{ color: '#102a43', display: 'block', marginBottom: '2px' }}>Current cover</b>
                  <span style={{ color: '#64748b', lineHeight: '1.4' }}>
                    Selecting a new PDF or manual image will update this cover.
                  </span>
                </div>
              </div>
            )}

            {!manualCoverPreview && !coverPreview && !v.cover_url && v.pdf_url && (
              <div style={{ marginTop: '12px', padding: '10px', background: '#fffbeb', border: '1px solid #fef3c7', borderRadius: '8px' }}>
                <b style={{ color: '#92400e', fontSize: '12px', display: 'block', marginBottom: '4px' }}>
                  ⚠️ No cover image currently set (placeholder displayed on public archive)
                </b>
                <button
                  type="button"
                  onClick={regenerateCoverFromExistingPdf}
                  disabled={generatingCover || busy}
                  style={{
                    padding: '6px 12px',
                    fontSize: '12px',
                    fontWeight: 600,
                    background: '#102a43',
                    color: '#f7f3ea',
                    borderRadius: '4px',
                    border: 'none',
                    cursor: 'pointer',
                  }}
                >
                  ⚡ Extract cover from current PDF
                </button>
              </div>
            )}

            {v.pdf_url && (
              <a href={v.pdf_url} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-block', marginTop: '10px' }}>
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
            <button className="primary" disabled={busy || generatingCover}>
              {busy
                ? 'Saving…'
                : generatingCover
                  ? 'Processing PDF…'
                  : editing
                    ? 'Save changes'
                    : 'Upload and publish'}
            </button>
            {editing && (
              <button type="button" onClick={() => { setEditing(null); resetCovers(); }}>
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
