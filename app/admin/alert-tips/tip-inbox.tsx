'use client';
import { useState } from 'react';
type Tip = {
  id: string;
  reference: string;
  name: string;
  email: string;
  phone: string;
  topic: string;
  organization: string;
  tip: string;
  source_url: string;
  status: string;
  notes: string;
  created_at: string;
};
export default function TipInbox({ initialItems }: { initialItems: Tip[] }) {
  const [items, setItems] = useState(initialItems),
    [selected, setSelected] = useState<Tip | null>(initialItems[0] || null),
    [msg, setMsg] = useState('');
  async function reload() {
    const j = (await fetch('/api/alert-tips').then((r) => r.json())) as any;
    setItems(j.tips || []);
  }
  async function save() {
    if (!selected) return;
    const r = await fetch('/api/alert-tips', {
      method: 'PUT',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(selected),
    });
    if (r.ok) {
      await reload();
      setMsg('Tip record updated.');
    }
  }
  async function remove() {
    if (!selected || !confirm(`Remove tip ${selected.reference}?`)) return;
    await fetch(`/api/alert-tips?id=${encodeURIComponent(selected.id)}`, {
      method: 'DELETE',
    });
    await reload();
    setSelected(null);
    setMsg('Tip removed.');
  }
  return (
    <div className="tipInbox">
      <section>
        <h2>Submissions</h2>
        <div className="tipInboxList">
          {items.map((x) => (
            <button
              className={selected?.id === x.id ? 'active' : ''}
              onClick={() => {
                setSelected(x);
                setMsg('');
              }}
              key={x.id}
            >
              <span>{x.status}</span>
              <b>{x.topic || 'General tip'}</b>
              <small>
                {x.organization || x.name || 'Anonymous'} ·{' '}
                {new Date(x.created_at).toLocaleDateString()}
              </small>
            </button>
          ))}
        </div>
      </section>
      <section className="tipReview">
        {selected ? (
          <>
            <div className="bankEditorHeading">
              <div>
                <p className="eyebrow gold">{selected.reference}</p>
                <h2>{selected.topic || 'Submitted tip'}</h2>
              </div>
              <button onClick={() => setSelected(null)}>Close</button>
            </div>
            <dl>
              <dt>Submitted by</dt>
              <dd>{selected.name || 'Anonymous'}</dd>
              <dt>Organization</dt>
              <dd>{selected.organization || 'Not provided'}</dd>
              <dt>Email</dt>
              <dd>{selected.email || 'Not provided'}</dd>
              <dt>Phone</dt>
              <dd>{selected.phone || 'Not provided'}</dd>
              <dt>Source</dt>
              <dd>
                {selected.source_url ? (
                  <a
                    href={selected.source_url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Open supporting link ↗
                  </a>
                ) : (
                  'Not provided'
                )}
              </dd>
            </dl>
            <div className="tipFullText">
              <small>SUBMITTED INFORMATION</small>
              <p>{selected.tip}</p>
            </div>
            <label>
              Status
              <select
                value={selected.status}
                onChange={(e) =>
                  setSelected({ ...selected, status: e.target.value })
                }
              >
                <option>New</option>
                <option>Reviewing</option>
                <option>Needs follow-up</option>
                <option>Used for alert</option>
                <option>Closed</option>
              </select>
            </label>
            <label>
              Private notes
              <textarea
                rows={6}
                value={selected.notes || ''}
                onChange={(e) =>
                  setSelected({ ...selected, notes: e.target.value })
                }
              />
            </label>
            <div className="editFormActions">
              <button className="primary" onClick={save}>
                Save review
              </button>
              <button className="deleteButton" onClick={remove}>
                Remove tip
              </button>
            </div>
            {msg && <p className="adminSaveMessage">{msg}</p>}
          </>
        ) : (
          <div className="investEmpty">
            <h2>Select a tip</h2>
            <p>Choose a submission from the inbox to review it.</p>
          </div>
        )}
      </section>
    </div>
  );
}
