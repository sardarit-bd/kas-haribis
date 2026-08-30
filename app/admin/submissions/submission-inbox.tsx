'use client';
import { useMemo, useState } from 'react';
type Item = {
  id: string;
  reference: string;
  name: string;
  email: string;
  phone: string;
  organization: string;
  topic: string;
  message: string;
  response_method: string;
  status: string;
  notes: string;
  created_at: string;
  related_name: string;
  related_url: string;
  request_subtype: string;
  preferred_date: string;
  location: string;
  audience: string;
  attachment_name: string;
};
export default function SubmissionInbox({
  initialItems,
  mode = 'general',
}: {
  initialItems: Item[];
  mode?: 'general' | 'genealogy';
}) {
  const [items, setItems] = useState(initialItems),
    [active, setActive] = useState<Item | null>(null),
    [query, setQuery] = useState(''),
    [status, setStatus] = useState('All');
  const filtered = useMemo(
    () =>
      items.filter(
        (x) =>
          (status === 'All' || x.status === status) &&
          (
            x.name +
            x.email +
            x.topic +
            x.message +
            x.organization +
            (x.related_name || '')
          )
            .toLowerCase()
            .includes(query.toLowerCase()),
      ),
    [items, query, status],
  );
  async function save() {
    if (!active) return;
    const response = await fetch('/api/contact-submissions', {
      method: 'PUT',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(active),
    });
    if (response.ok)
      setItems((current) =>
        current.map((x) => (x.id === active.id ? active : x)),
      );
  }
  async function remove(item: Item) {
    if (!confirm(`Remove submission ${item.reference}?`)) return;
    await fetch(`/api/contact-submissions?id=${encodeURIComponent(item.id)}`, {
      method: 'DELETE',
    });
    setItems((current) => current.filter((x) => x.id !== item.id));
    setActive(null);
  }
  return (
    <div className="submissionAdmin">
      <section className="submissionToolbar">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={
            mode === 'genealogy'
              ? 'Search a name, entity, location, or request…'
              : 'Search name, email, organization, topic, or message…'
          }
        />
        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option>All</option>
          <option>New</option>
          <option>Reviewing</option>
          <option>Responded</option>
          <option>Closed</option>
        </select>
        <b>
          {filtered.length} {mode === 'genealogy' ? 'requests' : 'submissions'}
        </b>
      </section>
      <div className="submissionLayout">
        <section className="submissionList">
          {filtered.length ? (
            filtered.map((x) => (
              <button
                key={x.id}
                className={active?.id === x.id ? 'active' : ''}
                onClick={() => setActive(x)}
              >
                <span>
                  <b>{x.topic}</b>
                  <em>{x.status}</em>
                </span>
                <strong>{x.name}</strong>
                <small>
                  {x.reference} · {new Date(x.created_at).toLocaleDateString()}
                </small>
                <p>{x.message}</p>
              </button>
            ))
          ) : (
            <div className="emptyState">
              <b>No matching submissions</b>
            </div>
          )}
        </section>
        <section className="submissionDetail">
          {active ? (
            <>
              <div className="submissionDetailHead">
                <div>
                  <small>{active.reference}</small>
                  <h2>{active.topic}</h2>
                </div>
                <button className="deleteButton" onClick={() => remove(active)}>
                  Remove
                </button>
              </div>
              <p className="submissionMessage">{active.message}</p>
              <dl>
                <dt>Name</dt>
                <dd>{active.name}</dd>
                <dt>Email</dt>
                <dd>
                  <a href={`mailto:${active.email}`}>{active.email}</a>
                </dd>
                {active.phone && (
                  <>
                    <dt>Phone</dt>
                    <dd>
                      <a href={`tel:${active.phone}`}>{active.phone}</a>
                    </dd>
                  </>
                )}
                {active.organization && (
                  <>
                    <dt>Organization</dt>
                    <dd>{active.organization}</dd>
                  </>
                )}
                {active.related_name && (
                  <>
                    <dt>
                      {mode === 'genealogy'
                        ? 'Research subject'
                        : 'Related bank / business'}
                    </dt>
                    <dd>{active.related_name}</dd>
                  </>
                )}
                {active.related_url && (
                  <>
                    <dt>Website</dt>
                    <dd>
                      <a
                        href={active.related_url}
                        target="_blank"
                        rel="noreferrer"
                      >
                        Open website ↗
                      </a>
                    </dd>
                  </>
                )}
                {active.request_subtype && (
                  <>
                    <dt>Research purpose</dt>
                    <dd>{active.request_subtype}</dd>
                  </>
                )}
                {active.preferred_date && (
                  <>
                    <dt>Preferred date</dt>
                    <dd>{active.preferred_date}</dd>
                  </>
                )}
                {active.location && (
                  <>
                    <dt>Relevant locations</dt>
                    <dd>{active.location}</dd>
                  </>
                )}
                {active.audience && (
                  <>
                    <dt>
                      {mode === 'genealogy'
                        ? 'Years / generations'
                        : 'Audience'}
                    </dt>
                    <dd>{active.audience}</dd>
                  </>
                )}
                <dt>Preferred response</dt>
                <dd>{active.response_method}</dd>
                <dt>Received</dt>
                <dd>{new Date(active.created_at).toLocaleString()}</dd>
              </dl>
              {active.attachment_name && (
                <a
                  className="submissionAttachment"
                  href={`/api/contact-attachment?id=${encodeURIComponent(active.id)}`}
                  target="_blank"
                >
                  View supporting document: {active.attachment_name} ↗
                </a>
              )}
              <label>
                Status
                <select
                  value={active.status}
                  onChange={(e) =>
                    setActive({ ...active, status: e.target.value })
                  }
                >
                  <option>New</option>
                  <option>Reviewing</option>
                  <option>Responded</option>
                  <option>Closed</option>
                </select>
              </label>
              <label>
                Private administrator notes
                <textarea
                  rows={7}
                  value={active.notes || ''}
                  onChange={(e) =>
                    setActive({ ...active, notes: e.target.value })
                  }
                />
              </label>
              <button className="primary" onClick={save}>
                Save status and notes
              </button>
            </>
          ) : (
            <div className="emptyState">
              <b>Select a submission</b>
              <p>Choose a message from the inbox to read all details.</p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
