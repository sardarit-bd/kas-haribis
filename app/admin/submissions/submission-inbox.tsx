'use client';
import { useMemo, useState } from 'react';
import {
  FiCalendar,
  FiClock,
  FiEye,
  FiFileText,
  FiGlobe,
  FiMail,
  FiMapPin,
  FiMessageSquare,
  FiPaperclip,
  FiPhone,
  FiSave,
  FiTrash2,
  FiUser,
  FiX
} from 'react-icons/fi';

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
    [status, setStatus] = useState('All'),
    [toast, setToast] = useState<string | null>(null),
    [saving, setSaving] = useState(false);

  const filtered = useMemo(
    () =>
      items.filter(
        (x) =>
          (status === 'All' || x.status === status) &&
          (
            (x.reference || '') +
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
    if (!active || saving) return;
    setSaving(true);
    try {
      const response = await fetch('/api/contact-submissions', {
        method: 'PUT',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(active),
      });
      if (response.ok) {
        const updatedItem = active;
        setItems((current) =>
          current.map((x) => (x.id === updatedItem.id ? updatedItem : x)),
        );
        setToast(`Submission ${updatedItem.reference} status updated to "${updatedItem.status}"`);
        setTimeout(() => setToast(null), 4000);
        setActive(null);
      } else {
        alert('Failed to save status update. Please try again.');
      }
    } catch {
      alert('An error occurred while saving.');
    } finally {
      setSaving(false);
    }
  }

  async function remove(item: Item, e?: React.MouseEvent) {
    if (e) e.stopPropagation();
    if (!confirm(`Remove submission ${item.reference}?`)) return;
    await fetch(`/api/contact-submissions?id=${encodeURIComponent(item.id)}`, {
      method: 'DELETE',
    });
    setItems((current) => current.filter((x) => x.id !== item.id));
    if (active?.id === item.id) {
      setActive(null);
    }
  }

  return (
    <div className="submissionAdmin">
      <section className="submissionToolbar">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={
            mode === 'genealogy'
              ? 'Search Ref ID, name, entity, location, or request…'
              : 'Search Ref ID, name, email, organization, topic, or message…'
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

      <div className="submissionTableContainer">
        {filtered.length ? (
          <table className="submissionTable">
            <thead>
              <tr>
                <th>Ref ID</th>
                <th>Topic / Subject</th>
                <th>Sender</th>
                <th>Date</th>
                <th>Status</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((x) => (
                <tr
                  key={x.id}
                  className={`submissionRow ${active?.id === x.id ? 'active' : ''}`}
                  onClick={() => setActive(x)}
                >
                  <td className="refCell">
                    <code>{x.reference}</code>
                  </td>
                  <td className="topicCell">
                    <strong>{x.topic}</strong>
                    <p>{x.message}</p>
                  </td>
                  <td className="senderCell">
                    <span className="senderName">{x.name}</span>
                    <small>{x.email}</small>
                  </td>
                  <td className="dateCell">
                    {new Date(x.created_at).toLocaleDateString()}
                  </td>
                  <td className="statusCell">
                    <span className={`statusBadge status-${x.status.toLowerCase()}`}>
                      {x.status}
                    </span>
                  </td>
                  <td className="actionsCell" onClick={(e) => e.stopPropagation()}>
                    <button
                      type="button"
                      className="viewRowButton"
                      title="View details"
                      onClick={() => setActive(x)}
                    >
                      <FiEye />
                    </button>
                    <button
                      type="button"
                      className="deleteRowButton"
                      title="Delete submission"
                      onClick={(e) => remove(x, e)}
                    >
                      <FiTrash2 />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="emptyState">
            <b>No matching submissions</b>
          </div>
        )}
      </div>

      {active && (
        <div className="submissionModalOverlay" onClick={() => setActive(null)}>
          <div className="submissionModal" onClick={(e) => e.stopPropagation()}>
            <div className="submissionModalHeader">
              <div className="modalHeaderMain">
                <div className="modalBadgeRow">
                  <span className="modalRefBadge">{active.reference}</span>
                  <span className={`statusBadge status-${active.status.toLowerCase()}`}>
                    {active.status}
                  </span>
                </div>
                <h2>{active.topic}</h2>
              </div>
              <div className="modalHeaderActions">
                <button
                  type="button"
                  className="modalDeleteButton"
                  title="Delete submission"
                  onClick={(e) => remove(active, e)}
                >
                  <FiTrash2 />
                  <span>Delete</span>
                </button>
                <button
                  type="button"
                  className="modalCloseButton"
                  title="Close modal"
                  onClick={() => setActive(null)}
                >
                  <FiX />
                </button>
              </div>
            </div>

            <div className="submissionModalBody">
              <div className="submissionMessageCard">
                <div className="cardLabel">
                  <FiMessageSquare /> Submission Message
                </div>
                <p>{active.message}</p>
              </div>

              <div className="submissionDetailsSection">
                <h3 className="sectionTitle">Contact & Request Details</h3>
                <div className="detailsGrid">
                  <div className="detailItem">
                    <span className="detailLabel"><FiUser /> Name</span>
                    <span className="detailValue">{active.name}</span>
                  </div>
                  <div className="detailItem">
                    <span className="detailLabel"><FiMail /> Email</span>
                    <span className="detailValue">
                      <a href={`mailto:${active.email}`}>{active.email}</a>
                    </span>
                  </div>
                  {active.phone && (
                    <div className="detailItem">
                      <span className="detailLabel"><FiPhone /> Phone</span>
                      <span className="detailValue">
                        <a href={`tel:${active.phone}`}>{active.phone}</a>
                      </span>
                    </div>
                  )}
                  {active.organization && (
                    <div className="detailItem">
                      <span className="detailLabel"><FiPhone/> Organization</span>
                      <span className="detailValue">{active.organization}</span>
                    </div>
                  )}
                  {active.related_name && (
                    <div className="detailItem">
                      <span className="detailLabel">
                        <FiFileText /> {mode === 'genealogy' ? 'Research subject' : 'Related bank / business'}
                      </span>
                      <span className="detailValue">{active.related_name}</span>
                    </div>
                  )}
                  {active.related_url && (
                    <div className="detailItem">
                      <span className="detailLabel"><FiGlobe /> Website</span>
                      <span className="detailValue">
                        <a href={active.related_url} target="_blank" rel="noreferrer">
                          Open website ↗
                        </a>
                      </span>
                    </div>
                  )}
                  {active.request_subtype && (
                    <div className="detailItem">
                      <span className="detailLabel"><FiFileText /> Research purpose</span>
                      <span className="detailValue">{active.request_subtype}</span>
                    </div>
                  )}
                  {active.preferred_date && (
                    <div className="detailItem">
                      <span className="detailLabel"><FiCalendar /> Preferred date</span>
                      <span className="detailValue">{active.preferred_date}</span>
                    </div>
                  )}
                  {active.location && (
                    <div className="detailItem">
                      <span className="detailLabel"><FiMapPin /> Relevant locations</span>
                      <span className="detailValue">{active.location}</span>
                    </div>
                  )}
                  {active.audience && (
                    <div className="detailItem">
                      <span className="detailLabel">
                        <FiUser /> {mode === 'genealogy' ? 'Years / generations' : 'Audience'}
                      </span>
                      <span className="detailValue">{active.audience}</span>
                    </div>
                  )}
                  <div className="detailItem">
                    <span className="detailLabel"><FiMessageSquare /> Preferred response</span>
                    <span className="detailValue">{active.response_method}</span>
                  </div>
                  <div className="detailItem">
                    <span className="detailLabel"><FiClock /> Received</span>
                    <span className="detailValue">{new Date(active.created_at).toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {active.attachment_name && (
                <div className="attachmentSection">
                  <a
                    className="submissionAttachmentCard"
                    href={`/api/contact-attachment?id=${encodeURIComponent(active.id)}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <FiPaperclip className="attachIcon" />
                    <div className="attachMeta">
                      <span className="attachTitle">Supporting Document</span>
                      <span className="attachName">{active.attachment_name}</span>
                    </div>
                    <span className="attachAction">View File ↗</span>
                  </a>
                </div>
              )}

              <div className="adminControlSection">
                <h3 className="sectionTitle"><FiSave /> Administrator Status & Notes</h3>
                <div className="adminControlsGrid">
                  <div className="inputGroup">
                    <label htmlFor="modal-status-select">Update Status</label>
                    <select
                      id="modal-status-select"
                      value={active.status}
                      onChange={(e) => setActive({ ...active, status: e.target.value })}
                    >
                      <option>New</option>
                      <option>Reviewing</option>
                      <option>Responded</option>
                      <option>Closed</option>
                    </select>
                  </div>
                  <div className="inputGroup fullWidth">
                    <label htmlFor="modal-notes-area">Private Administrator Notes</label>
                    <textarea
                      id="modal-notes-area"
                      rows={4}
                      placeholder="Add internal administrator notes or processing comments..."
                      value={active.notes || ''}
                      onChange={(e) => setActive({ ...active, notes: e.target.value })}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="submissionModalFooter">
              <button
                type="button"
                className="secondary"
                onClick={() => setActive(null)}
                disabled={saving}
              >
                Close
              </button>
              <button
                type="button"
                className="primary"
                onClick={save}
                disabled={saving}
              >
                {saving ? (
                  'Saving...'
                ) : (
                  <>
                    <FiSave /> Save Status & Notes
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            zIndex: 9999,
            backgroundColor: '#0c2340',
            color: '#ffffff',
            padding: '14px 20px',
            borderRadius: '8px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.25)',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            border: '1px solid #1e3a8a',
            fontSize: '14px',
            fontWeight: 500,
          }}
        >
          <span
            style={{
              backgroundColor: '#10b981',
              color: '#ffffff',
              borderRadius: '50%',
              width: '22px',
              height: '22px',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '12px',
              fontWeight: 'bold',
            }}
          >
            ✓
          </span>
          <span>{toast}</span>
          <button
            type="button"
            onClick={() => setToast(null)}
            style={{
              background: 'none',
              border: 'none',
              color: '#94a3b8',
              cursor: 'pointer',
              marginLeft: '8px',
              fontSize: '16px',
            }}
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
}


