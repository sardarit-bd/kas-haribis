'use client';
import { useMemo, useState } from 'react';
type Item = {
  id: string;
  reference: string;
  company_name: string;
  contact_name: string;
  email: string;
  phone: string;
  website: string;
  investment_type: string;
  offering_name: string;
  minimum_investment: string;
  structure_details: string;
  investor_profile: string;
  current_heter_iska: string;
  desired_timeline: string;
  response_method: string;
  status: string;
  notes: string;
  attachment_name: string;
  created_at: string;
};
const statuses = [
  'New',
  'Reviewing',
  'More Information Needed',
  'Approved',
  'Approved with Conditions',
  'Declined',
  'Closed',
];
export default function CertificationAdmin({
  initialItems,
}: {
  initialItems: Item[];
}) {
  const [items, setItems] = useState(initialItems),
    [active, setActive] = useState<Item | null>(null),
    [query, setQuery] = useState(''),
    [status, setStatus] = useState('All'),
    [message, setMessage] = useState('');
  const filtered = useMemo(
    () =>
      items.filter(
        (x) =>
          (status === 'All' || x.status === status) &&
          (
            x.company_name +
            x.offering_name +
            x.contact_name +
            x.email +
            x.investment_type
          )
            .toLowerCase()
            .includes(query.toLowerCase()),
      ),
    [items, query, status],
  );
  async function save() {
    if (!active) return;
    setMessage('Saving…');
    const response = await fetch('/api/certification-applications', {
      method: 'PUT',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(active),
    });
    if (response.ok) {
      setItems((current) =>
        current.map((x) => (x.id === active.id ? active : x)),
      );
      setMessage('Status and notes saved.');
    } else setMessage('Could not save.');
  }
  async function remove(item: Item) {
    if (!confirm(`Remove application ${item.reference}?`)) return;
    await fetch(
      `/api/certification-applications?id=${encodeURIComponent(item.id)}`,
      { method: 'DELETE' },
    );
    setItems((current) => current.filter((x) => x.id !== item.id));
    setActive(null);
  }
  return (
    <div className="certAdmin">
      <section className="certAdminTools">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search company, offering, contact, or type…"
        />
        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option>All</option>
          {statuses.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
        <b>{filtered.length} applications</b>
      </section>
      <div className="certAdminLayout">
        <section className="certAdminList">
          {filtered.length ? (
            filtered.map((x) => (
              <button
                key={x.id}
                className={active?.id === x.id ? 'active' : ''}
                onClick={() => {
                  setActive(x);
                  setMessage('');
                }}
              >
                <span>
                  <b>{x.company_name}</b>
                  <em>{x.status}</em>
                </span>
                <strong>{x.offering_name || x.investment_type}</strong>
                <small>
                  {x.reference} · {new Date(x.created_at).toLocaleDateString()}
                </small>
              </button>
            ))
          ) : (
            <div className="emptyState">
              <b>No matching applications</b>
            </div>
          )}
        </section>
        <section className="certAdminDetail">
          {active ? (
            <>
              <div className="certAdminHead">
                <div>
                  <small>{active.reference}</small>
                  <h2>{active.company_name}</h2>
                  <p>{active.offering_name || active.investment_type}</p>
                </div>
                <button onClick={() => remove(active)}>Remove</button>
              </div>
              <div className="certAdminFacts">
                <span>
                  <small>CONTACT</small>
                  <b>{active.contact_name}</b>
                  <a href={`mailto:${active.email}`}>{active.email}</a>
                  {active.phone && (
                    <a href={`tel:${active.phone}`}>{active.phone}</a>
                  )}
                </span>
                <span>
                  <small>INVESTMENT</small>
                  <b>{active.investment_type}</b>
                  <p>{active.minimum_investment || 'No minimum entered'}</p>
                </span>
                <span>
                  <small>HETER ISKA</small>
                  <b>{active.current_heter_iska}</b>
                  <p>{active.desired_timeline || 'No timeline entered'}</p>
                </span>
              </div>
              {active.website && (
                <a
                  className="certAdminLink"
                  href={active.website}
                  target="_blank"
                  rel="noreferrer"
                >
                  Open company website ↗
                </a>
              )}
              <h3>Financial structure</h3>
              <p className="certStructure">{active.structure_details}</p>
              {active.investor_profile && (
                <>
                  <h3>Intended investors</h3>
                  <p className="certStructure">{active.investor_profile}</p>
                </>
              )}
              {active.attachment_name && (
                <a
                  className="certAdminDocument"
                  href={`/api/certification-attachment?id=${encodeURIComponent(active.id)}`}
                  target="_blank"
                >
                  View supporting document: {active.attachment_name} ↗
                </a>
              )}
              <div className="certAdminDecision">
                <label>
                  Application status
                  <select
                    value={active.status}
                    onChange={(e) =>
                      setActive({ ...active, status: e.target.value })
                    }
                  >
                    {statuses.map((s) => (
                      <option key={s}>{s}</option>
                    ))}
                  </select>
                </label>
                <label>
                  Private review notes
                  <textarea
                    rows={9}
                    value={active.notes || ''}
                    onChange={(e) =>
                      setActive({ ...active, notes: e.target.value })
                    }
                    placeholder="Record document requests, review findings, conditions, and follow-up…"
                  />
                </label>
                <button className="primary" onClick={save}>
                  Save review
                </button>
                {message && <p>{message}</p>}
              </div>
            </>
          ) : (
            <div className="emptyState">
              <b>Select an application</b>
              <p>Choose an application to review the full submission.</p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
