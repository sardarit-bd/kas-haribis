'use client';
import { FormEvent, useState } from 'react';

type DocumentOption = { id: string; title: string };
type CodeRow = {
  id: string;
  document_id: string;
  document_title: string;
  code_hint: string;
  label: string;
  code_type: 'single' | 'reusable';
  active: number;
  use_count: number;
  created_at: string;
  last_used_at: string | null;
};

export default function AccessCodeManager({
  documents,
  initialCodes,
}: {
  documents: DocumentOption[];
  initialCodes: CodeRow[];
}) {
  const [codes, setCodes] = useState(initialCodes);
  const [newCode, setNewCode] = useState('');
  const [message, setMessage] = useState('');
  const [creating, setCreating] = useState(false);
  async function create(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setCreating(true);
    setMessage('');
    const form = event.currentTarget;
    const data = new FormData(form);
    const documentId = String(data.get('documentId') || ''),
      codeType = String(data.get('codeType') || ''),
      label = String(data.get('label') || '');
    try {
      const response = await fetch('/api/admin/heter-access-codes', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ documentId, codeType, label }),
      });
      const result = (await response.json()) as {
        error?: string;
        code?: string;
      };
      if (!response.ok || !result.code) {
        setMessage(result.error || 'The code could not be created.');
        return;
      }
      setNewCode(result.code);
      setMessage(
        'Copy this code now. For security, the full code will not be shown again.',
      );
      const listResponse = await fetch('/api/admin/heter-access-codes');
      const list = (await listResponse.json()) as { codes?: CodeRow[] };
      if (listResponse.ok) setCodes(list.codes || []);
      form.reset();
    } catch {
      setMessage('The code could not be created.');
    } finally {
      setCreating(false);
    }
  }
  async function toggle(item: CodeRow) {
    const response = await fetch('/api/admin/heter-access-codes', {
      method: 'PUT',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ id: item.id, active: !item.active }),
    });
    const result = (await response.json()) as { error?: string };
    if (response.ok)
      setCodes((current) =>
        current.map((row) =>
          row.id === item.id ? { ...row, active: item.active ? 0 : 1 } : row,
        ),
      );
    else setMessage(result.error || 'The code status could not be changed.');
  }
  async function remove(id: string) {
    if (
      !confirm(
        'Remove this access code? Anyone holding it will no longer be able to use it.',
      )
    )
      return;
    const response = await fetch(
      `/api/admin/heter-access-codes?id=${encodeURIComponent(id)}`,
      { method: 'DELETE' },
    );
    if (response.ok)
      setCodes((current) => current.filter((row) => row.id !== id));
  }
  async function copyCode() {
    if (!newCode) return;
    await navigator.clipboard.writeText(newCode);
    setMessage('Code copied.');
  }
  return (
    <section className="heterCodeAdmin">
      <div className="adminHeading">
        <div>
          <p className="eyebrow gold">COMPLIMENTARY DOWNLOADS</p>
          <h1>Heter Iska access codes</h1>
          <p>
            Create a one-time code or a reusable code for a specific protected
            document.
          </p>
        </div>
        <span className="countBadge">
          {codes.filter((code) => code.active).length} active
        </span>
      </div>
      <div className="heterCodeAdminGrid">
        <form className="settingsCard" onSubmit={create}>
          <h2>Create a new code</h2>
          <label>
            Heter Iska document
            <select name="documentId" required defaultValue="">
              <option value="" disabled>
                Choose a document
              </option>
              {documents.map((document) => (
                <option value={document.id} key={document.id}>
                  {document.title}
                </option>
              ))}
            </select>
          </label>
          <label>
            Code type
            <select name="codeType" required defaultValue="single">
              <option value="single">Single use — works once</option>
              <option value="reusable">
                Reusable — works until deactivated
              </option>
            </select>
          </label>
          <label>
            Label or recipient <small>(optional)</small>
            <input
              name="label"
              placeholder="Example: Rabbi Cohen or Event handout"
              maxLength={120}
            />
          </label>
          <button
            className="primary"
            disabled={creating || documents.length === 0}
          >
            {creating ? 'Creating…' : 'Create access code'}
          </button>
          {newCode && (
            <div className="newHeterCode">
              <small>NEW CODE — COPY NOW</small>
              <strong>{newCode}</strong>
              <button type="button" onClick={copyCode}>
                Copy code
              </button>
            </div>
          )}
          {message && <p>{message}</p>}
        </form>
        <div className="heterCodeList">
          <div className="connectionStatus">
            <b>Created codes</b>
            <span className="ready">{codes.length} total</span>
          </div>
          {codes.length === 0 ? (
            <div className="emptyState">
              <b>No access codes yet</b>
              <p>Create the first code using the form.</p>
            </div>
          ) : (
            codes.map((item) => {
              const usedSingle =
                item.code_type === 'single' && item.use_count > 0;
              return (
                <article key={item.id}>
                  <div className="codeTypeIcon">
                    {item.code_type === 'single' ? '1×' : '∞'}
                  </div>
                  <div className="codeDetails">
                    <b>{item.label || item.document_title}</b>
                    {item.label && <span>{item.document_title}</span>}
                    <small>
                      {item.code_hint} ·{' '}
                      {item.code_type === 'single' ? 'Single use' : 'Reusable'}{' '}
                      · Used {item.use_count}{' '}
                      {item.use_count === 1 ? 'time' : 'times'}
                    </small>
                    <small>
                      {item.last_used_at
                        ? `Last used ${new Date(item.last_used_at).toLocaleString('en-US')}`
                        : `Created ${new Date(item.created_at).toLocaleDateString('en-US')}`}
                    </small>
                  </div>
                  <span className={item.active ? 'codeActive' : 'codeInactive'}>
                    {item.active ? 'Active' : usedSingle ? 'Used' : 'Inactive'}
                  </span>
                  {!usedSingle && (
                    <button className="codeToggle" onClick={() => toggle(item)}>
                      {item.active ? 'Deactivate' : 'Activate'}
                    </button>
                  )}
                  <button
                    className="codeRemove"
                    onClick={() => remove(item.id)}
                  >
                    Remove
                  </button>
                </article>
              );
            })
          )}
        </div>
      </div>
    </section>
  );
}
