'use client';
import { FormEvent, useState } from 'react';

type DocumentRow = {
  id: string;
  title: string;
  description: string;
  filename: string;
  size: number;
  active: number;
};
const CHUNK_SIZE = 5 * 1024 * 1024;

export default function HeterManager({
  initialDocuments,
}: {
  initialDocuments: DocumentRow[];
}) {
  const [documents, setDocuments] = useState(initialDocuments);
  const [editing, setEditing] = useState<DocumentRow | null>(null);
  const [message, setMessage] = useState('');
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);

  async function upload(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const file = data.get('file') as File;
    const title = String(data.get('title') || '');
    const description = String(data.get('description') || '');
    const active = data.get('publishNow') === 'on' ? 1 : 0;
    if (!file || file.type !== 'application/pdf') {
      setMessage('Please choose a PDF file.');
      return;
    }
    setUploading(true);
    setProgress(0);
    setMessage('Preparing secure upload…');
    let session: any = null;
    try {
      let response = await fetch('/api/admin/heter-upload?action=start', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          filename: file.name,
          size: file.size,
        }),
      });
      session = await response.json();
      if (!response.ok)
        throw new Error(session.error || 'Could not start upload.');
      const parts = [];
      const total = Math.ceil(file.size / CHUNK_SIZE);
      for (let index = 0; index < total; index++) {
        const blob = file.slice(
          index * CHUNK_SIZE,
          Math.min(file.size, (index + 1) * CHUNK_SIZE),
        );
        response = await fetch(
          `/api/admin/heter-upload?action=part&key=${encodeURIComponent(session.key)}&uploadId=${encodeURIComponent(session.uploadId)}&partNumber=${index + 1}`,
          {
            method: 'POST',
            headers: { 'content-type': 'application/octet-stream' },
            body: blob,
          },
        );
        const part = await response.json();
        if (!response.ok)
          throw new Error(part.error || `Could not upload piece ${index + 1}.`);
        parts.push(part);
        setProgress(Math.round(((index + 1) / total) * 100));
        setMessage(`Uploading securely… ${index + 1} of ${total} pieces`);
      }
      response = await fetch('/api/admin/heter-upload?action=complete', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          ...session,
          title,
          description,
          filename: file.name,
          size: file.size,
          active,
          parts,
        }),
      });
      const result = await response.json();
      if (!response.ok)
        throw new Error(result.error || 'Could not finish upload.');
      setDocuments((current) => [
        {
          id: session.id,
          title,
          description,
          filename: file.name,
          size: file.size,
          active,
        },
        ...current,
      ]);
      form.reset();
      setMessage(
        active
          ? 'PDF uploaded and published.'
          : 'PDF uploaded as a draft. Press Publish when it is ready.',
      );
      setProgress(100);
    } catch (error) {
      if (session?.uploadId)
        fetch('/api/admin/heter-upload?action=abort', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify(session),
        }).catch(() => {});
      setMessage(error instanceof Error ? error.message : 'The upload failed.');
    } finally {
      setUploading(false);
    }
  }

  async function saveEdit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editing) return;
    const data = new FormData(event.currentTarget);
    const title = String(data.get('title') || '').trim(),
      description = String(data.get('description') || '').trim();
    setMessage('Saving changes…');
    const response = await fetch('/api/admin/heter-upload', {
      method: 'PUT',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ id: editing.id, title, description }),
    });
    const result = (await response.json()) as any;
    if (!response.ok) {
      setMessage(result.error || 'Could not save changes.');
      return;
    }
    setDocuments((current) =>
      current.map((item) =>
        item.id === editing.id ? { ...item, title, description } : item,
      ),
    );
    setEditing(null);
    setMessage('Heter Iska information updated.');
  }

  async function remove(id: string) {
    if (!confirm('Remove this Heter Iska and its protected file?')) return;
    const response = await fetch(
      `/api/admin/heter-upload?id=${encodeURIComponent(id)}`,
      { method: 'DELETE' },
    );
    if (response.ok) {
      setDocuments((current) => current.filter((item) => item.id !== id));
      if (editing?.id === id) setEditing(null);
    } else setMessage('The document could not be removed.');
  }

  async function togglePublished(item: DocumentRow) {
    const active = item.active ? 0 : 1;
    setMessage(active ? 'Publishing…' : 'Unpublishing…');
    const response = await fetch('/api/admin/heter-upload', {
      method: 'PUT',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ id: item.id, active }),
    });
    const result = (await response.json()) as any;
    if (!response.ok) {
      setMessage(result.error || 'Could not change publication status.');
      return;
    }
    setDocuments((current) =>
      current.map((document) =>
        document.id === item.id ? { ...document, active } : document,
      ),
    );
    setMessage(
      active
        ? `${item.title} is now published.`
        : `${item.title} is now hidden from the public page.`,
    );
  }

  return (
    <div className="managerLayout">
      <section className="settingsCard">
        {editing && (
          <button
            type="button"
            className="backManagerButton"
            onClick={() => setEditing(null)}
          >
            ← Back to Heter Iska Manager
          </button>
        )}
        <h2>{editing ? 'Edit Heter Iska' : 'Upload one Heter Iska PDF'}</h2>
        {editing ? (
          <>
            <p>
              Change the public title or description without replacing the
              protected PDF.
            </p>
            <form key={editing.id} onSubmit={saveEdit}>
              <label>
                Document title
                <input
                  name="title"
                  defaultValue={editing.title}
                  required
                  dir="auto"
                />
              </label>
              <label>
                Short description
                <textarea
                  name="description"
                  rows={6}
                  defaultValue={editing.description}
                  dir="auto"
                />
              </label>
              <div className="editFormActions">
                <button className="primary">Save changes</button>
                <button
                  type="button"
                  className="cancelEditButton"
                  onClick={() => setEditing(null)}
                >
                  Cancel and go back
                </button>
              </div>
            </form>
            <div className="editingFile">
              <b>Protected file remains unchanged</b>
              <span>
                {editing.filename} · {(editing.size / 1024 / 1024).toFixed(1)}{' '}
                MB
              </span>
            </div>
          </>
        ) : (
          <>
            <p>
              Large PDFs are automatically sent in smaller pieces to prevent the
              “Payload Too Large” error.
            </p>
            <form onSubmit={upload}>
              <label>
                Document title
                <input name="title" required placeholder="General Heter Iska" />
              </label>
              <label>
                Short description
                <textarea
                  name="description"
                  rows={4}
                  placeholder="Explain when this document should be used."
                />
              </label>
              <label>
                PDF file
                <input
                  name="file"
                  type="file"
                  accept="application/pdf,.pdf"
                  required
                />
              </label>
              <label className="publishChoice">
                <input name="publishNow" type="checkbox" /> Publish on the
                public Heter Iska page immediately
              </label>
              {uploading && (
                <progress max="100" value={progress}>
                  {progress}%
                </progress>
              )}
              <button className="primary" disabled={uploading}>
                {uploading ? `Uploading — ${progress}%` : 'Upload PDF securely'}
              </button>
            </form>
            <small>
              Leave the publish box unchecked to save the PDF as a private
              draft. Upload one PDF at a time. Maximum file size: 100 MB.
            </small>
          </>
        )}
        <p>{message}</p>
      </section>
      <section className="managedList">
        <div className="connectionStatus">
          <b>Protected documents</b>
          <span className="ready">{documents.length} files</span>
        </div>
        {documents.length === 0 ? (
          <p>No PDFs uploaded yet.</p>
        ) : (
          documents.map((item) => (
            <article
              className={editing?.id === item.id ? 'editingRow' : ''}
              key={item.id}
            >
              <div className="fileIcon">PDF</div>
              <div>
                <b dir="auto">{item.title}</b>
                <span>
                  {item.filename} · {(item.size / 1024 / 1024).toFixed(1)} MB
                </span>
                <strong
                  className={item.active ? 'publishedStatus' : 'draftStatus'}
                >
                  {item.active ? 'Published' : 'Draft — not public'}
                </strong>
              </div>
              {item.active && (
                <a href={`/api/heter-preview?id=${item.id}`} target="_blank">
                  View
                </a>
              )}
              <button
                className={item.active ? 'unpublishButton' : 'publishButton'}
                onClick={() => togglePublished(item)}
              >
                {item.active ? 'Unpublish' : 'Publish'}
              </button>
              <button
                className="editButton"
                onClick={() => {
                  setEditing(item);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              >
                Edit
              </button>
              <button onClick={() => remove(item.id)}>Remove</button>
            </article>
          ))
        )}
      </section>
    </div>
  );
}
