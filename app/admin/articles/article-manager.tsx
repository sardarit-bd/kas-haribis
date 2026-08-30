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
export default function ArticleManager({
  initialItems,
}: {
  initialItems: Item[];
}) {
  const [items, setItems] = useState(initialItems),
    [editing, setEditing] = useState<Item | null>(null),
    [q, setQ] = useState(''),
    [msg, setMsg] = useState(''),
    [busy, setBusy] = useState(false);
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
      setMsg('Uploading and checking PDF…');
      const fd = new FormData();
      fd.set('id', id);
      fd.set('file', file);
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
            <button onClick={() => setEditing(null)}>← Back to add</button>
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
              />
              <small>
                Upload the complete PDF. The administrator automatically counts
                its pages. Maximum 20 MB.
              </small>
            </label>
            {v.pdf_url && (
              <a href={v.pdf_url} target="_blank">
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
