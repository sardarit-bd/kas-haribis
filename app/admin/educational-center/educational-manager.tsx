'use client';
import { FormEvent, useState } from 'react';

type Item = {
  id: string;
  title: string;
  description: string;
  resource_type: string;
  audience: string;
  file_key: string;
  file_name: string;
  file_type: string;
  published: number;
  featured: number;
  sort_order: number;
};
const blank = {
  id: '',
  title: '',
  description: '',
  resource_type: 'Coloring Page',
  audience: 'Elementary students',
  file_key: '',
  file_name: '',
  file_type: '',
  published: 0,
  featured: 0,
  sort_order: 0,
};

export default function EducationalManager({
  initialItems,
}: {
  initialItems: Item[];
}) {
  const [items, setItems] = useState(initialItems),
    [editing, setEditing] = useState<Item | null>(null),
    [message, setMessage] = useState(''),
    [busy, setBusy] = useState(false),
    v = editing || blank;
  async function reload() {
    const j = (await fetch('/api/educational-resources').then((r) =>
      r.json(),
    )) as any;
    setItems(j.resources || []);
  }
  async function uploadFile(id: string, file: File, published: boolean) {
    if (file.size > 20 * 1024 * 1024)
      throw new Error('Choose a file up to 20 MB.');
    const chunkSize = 512 * 1024,
      total = Math.ceil(file.size / chunkSize),
      uploadId = crypto.randomUUID();
    for (let index = 0; index < total; index++) {
      setMessage(`Uploading file… ${Math.round((index / total) * 100)}%`);
      const response = await fetch('/api/admin/educational-upload', {
        method: 'POST',
        headers: {
          'content-type': 'application/octet-stream',
          'x-upload-action': 'chunk',
          'x-resource-id': id,
          'x-upload-id': uploadId,
          'x-chunk-index': String(index),
          'x-chunk-total': String(total),
        },
        body: file.slice(
          index * chunkSize,
          Math.min(file.size, (index + 1) * chunkSize),
        ),
      });
      const result = (await response
        .json()
        .catch(() => ({
          error: `Upload stopped (${response.status}).`,
        }))) as any;
      if (!response.ok)
        throw new Error(result.error || 'The file could not be uploaded.');
    }
    setMessage('Finishing upload…');
    const response = await fetch('/api/admin/educational-upload', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-upload-action': 'complete',
      },
      body: JSON.stringify({
        id,
        uploadId,
        total,
        fileName: file.name,
        fileType: file.type,
        published,
      }),
    });
    const result = (await response
      .json()
      .catch(() => ({
        error: `Upload could not be finished (${response.status}).`,
      }))) as any;
    if (!response.ok)
      throw new Error(result.error || 'The file could not be finished.');
  }
  async function save(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setMessage('Saving resource…');
    const form = e.currentTarget,
      d = Object.fromEntries(new FormData(form).entries()) as any;
    d.published = d.published === 'on';
    d.featured = d.featured === 'on';
    const file = (form.elements.namedItem('resource_file') as HTMLInputElement)
        ?.files?.[0],
      isNew = !d.id;
    try {
      const r = await fetch('/api/educational-resources', {
          method: isNew ? 'POST' : 'PUT',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify(isNew && file ? { ...d, published: false } : d),
        }),
        j = (await r
          .json()
          .catch(() => ({
            error: `The resource could not be saved (${r.status}).`,
          }))) as any;
      if (!r.ok) throw new Error(j.error || 'Could not save.');
      const id = d.id || j.id;
      if (file) await uploadFile(id, file, d.published);
      await reload();
      setEditing(null);
      form.reset();
      setMessage(
        d.published
          ? 'Resource saved and published on the website.'
          : 'Resource saved as hidden. Press ‘Publish on website’ when it is ready.',
      );
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : 'The resource could not be saved. Please try again.',
      );
      await reload().catch(() => {});
    } finally {
      setBusy(false);
    }
  }
  async function publish(item: Item) {
    setMessage(
      item.published ? `Hiding ${item.title}…` : `Publishing ${item.title}…`,
    );
    const r = await fetch('/api/educational-resources', {
        method: 'PUT',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ ...item, published: !item.published }),
      }),
      j = (await r.json()) as any;
    if (!r.ok) {
      setMessage(j.error || 'The publishing status could not be changed.');
      return;
    }
    await reload();
    setEditing(null);
    setMessage(
      item.published
        ? `${item.title} is now hidden from the website.`
        : `${item.title} is now live in the Educational Center.`,
    );
  }
  async function remove(item: Item) {
    if (!confirm(`Remove ${item.title}?`)) return;
    await fetch(
      `/api/educational-resources?id=${encodeURIComponent(item.id)}`,
      { method: 'DELETE' },
    );
    await reload();
    setEditing(null);
    setMessage('Resource removed.');
  }
  return (
    <div className="articleAdminLayout">
      <section className="articleEditorCard">
        <div className="bankEditorHeading">
          <div>
            <p className="eyebrow gold">
              {editing ? 'EDIT RESOURCE' : 'NEW RESOURCE'}
            </p>
            <h2>{editing ? editing.title : 'Add educational material'}</h2>
          </div>
          {editing && (
            <button onClick={() => setEditing(null)}>← Add new</button>
          )}
        </div>
        <form key={v.id || 'new'} onSubmit={save}>
          <input type="hidden" name="id" value={v.id} />
          <div className="businessFormGrid">
            <label>
              Title
              <input name="title" defaultValue={v.title} required />
            </label>
            <label>
              Resource type
              <select name="resource_type" defaultValue={v.resource_type}>
                <option>Coloring Page</option>
                <option>PDF Pamphlet</option>
                <option>Picture Book</option>
                <option>Illustrated Story</option>
                <option>Worksheet</option>
                <option>Curriculum</option>
                <option>Teacher Guide</option>
              </select>
            </label>
            <label>
              Audience
              <input
                name="audience"
                defaultValue={v.audience}
                placeholder="Example: Grades 3–6"
              />
            </label>
            <label>
              Display order
              <input
                type="number"
                name="sort_order"
                defaultValue={v.sort_order}
              />
            </label>
          </div>
          <label>
            Description
            <textarea
              name="description"
              rows={4}
              defaultValue={v.description}
            />
          </label>
          <div className="articleUploadBox">
            <label>
              {v.file_key ? 'Replace file' : 'Resource file'}
              <input
                type="file"
                name="resource_file"
                accept="application/pdf,image/png,image/jpeg,image/webp"
                required={!v.file_key}
              />
              <small>PDF, PNG, JPG or WEBP, up to 20 MB.</small>
            </label>
            {v.file_key && (
              <a href={`/api/educational-file?id=${v.id}`} target="_blank">
                Open current file ↗
              </a>
            )}
          </div>
          <div className="adminSwitches">
            <label>
              <input
                type="checkbox"
                name="published"
                defaultChecked={Boolean(v.published)}
              />{' '}
              Publish immediately on website
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
          <button className="primary" disabled={busy}>
            {busy ? 'Saving…' : editing ? 'Save changes' : 'Upload resource'}
          </button>
        </form>
        {message && <p className="adminSaveMessage">{message}</p>}
      </section>
      <section className="articleAdminList">
        <div className="bankListHeader">
          <div>
            <h2>Educational resources</h2>
            <span>{items.length} records</span>
          </div>
        </div>
        <div className="articleAdminRows">
          {items.map((item) => (
            <article
              key={item.id}
              className={item.published ? 'resourceIsLive' : 'resourceIsHidden'}
            >
              <span>
                {item.file_type === 'application/pdf' ? 'PDF' : 'PRINT'}
              </span>
              <div>
                <b>{item.title}</b>
                <small>
                  {item.resource_type} ·{' '}
                  {item.published ? 'Live on website' : 'Not published'}
                </small>
              </div>
              <div className="bankRowActions educationAdminActions">
                <button
                  className={
                    item.published
                      ? 'hideResourceButton'
                      : 'publishResourceButton'
                  }
                  onClick={() => publish(item)}
                >
                  {item.published ? 'Hide from website' : 'Publish on website'}
                </button>
                <button
                  onClick={() => {
                    setEditing(item);
                    scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                >
                  Edit
                </button>
                <button className="deleteButton" onClick={() => remove(item)}>
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
