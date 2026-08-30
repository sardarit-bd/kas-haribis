'use client';
import { FormEvent, useMemo, useState } from 'react';

type Bank = {
  id: string;
  title: string;
  status: string;
  summary: string;
  comment: string;
  last_updated: string;
  full_report: string;
  sort_order: number;
  institution_type: string;
  website: string;
  logo_url: string;
  researcher: string;
  source_urls: string;
  ownership_details: string;
  iska_details: string;
  internal_notes: string;
};
type AccessCode = { id: string; code_hint: string; created_at: string };
const statuses = [
  ['kosher', 'Kosher'],
  ['mehudar', 'Mehudar'],
  ['only-kosher-with-iska', 'Kosher with Heter Iska'],
  ['case-by-case', 'Case by case'],
  ['questionable', 'Questionable'],
  ['no-good', 'Not recommended'],
  ['lack-of-information', 'Insufficient information'],
];
const emptyBank = (order: number): Bank => ({
  id: '',
  title: '',
  status: 'kosher',
  summary: '',
  comment: '',
  last_updated: '',
  full_report: '',
  sort_order: order,
  institution_type: '',
  website: '',
  logo_url: '',
  researcher: '',
  source_urls: '',
  ownership_details: '',
  iska_details: '',
  internal_notes: '',
});

export default function BankManager({
  initialBanks,
}: {
  initialBanks: Bank[];
}) {
  const [banks, setBanks] = useState(initialBanks),
    [editing, setEditing] = useState<Bank | null>(null),
    [query, setQuery] = useState(''),
    [message, setMessage] = useState('');
  const [codes, setCodes] = useState<AccessCode[]>([]),
    [newCode, setNewCode] = useState('');
  const filtered = useMemo(
    () =>
      banks.filter((bank) =>
        (bank.title + ' ' + bank.comment)
          .toLowerCase()
          .includes(query.toLowerCase()),
      ),
    [banks, query],
  );
  const value = editing || emptyBank(banks.length + 1);
  async function reload() {
    const result = (await fetch('/api/banks').then((response) =>
      response.json(),
    )) as { banks: Bank[] };
    setBanks(result.banks);
  }
  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());
    setMessage('Saving…');
    const response = await fetch('/api/banks', {
      method: data.id ? 'PUT' : 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(data),
    });
    const result = (await response.json()) as { error?: string };
    if (!response.ok) {
      setMessage(result.error || 'Could not save the bank.');
      return;
    }
    await reload();
    form.reset();
    setEditing(null);
    setMessage(
      data.id ? 'Bank and comment updated.' : 'Bank added to the directory.',
    );
  }
  async function remove(bank: Bank) {
    if (!confirm(`Remove ${bank.title} from the bank directory?`)) return;
    const response = await fetch(
      `/api/banks?id=${encodeURIComponent(bank.id)}`,
      { method: 'DELETE' },
    );
    if (!response.ok) {
      setMessage('The bank could not be removed.');
      return;
    }
    setBanks((current) => current.filter((item) => item.id !== bank.id));
    if (editing?.id === bank.id) setEditing(null);
    setMessage(`${bank.title} was removed.`);
  }
  async function loadCodes(bankId: string) {
    const result = (await fetch(
      `/api/admin/bank-report-codes?bankId=${encodeURIComponent(bankId)}`,
    ).then((response) => response.json())) as { codes?: AccessCode[] };
    setCodes(result.codes || []);
  }
  async function createCode() {
    if (!editing) return;
    setNewCode('');
    const response = await fetch('/api/admin/bank-report-codes', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ bankId: editing.id }),
    });
    const result = (await response.json()) as { code?: string; error?: string };
    if (!response.ok || !result.code) {
      setMessage(result.error || 'The access code could not be created.');
      return;
    }
    setNewCode(result.code);
    setMessage(
      'New access code created. Copy it now and give it to the visitor.',
    );
    loadCodes(editing.id);
  }
  async function removeCode(id: string) {
    if (!confirm('Remove this access code? It will stop working immediately.'))
      return;
    await fetch(`/api/admin/bank-report-codes?id=${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
    if (editing) loadCodes(editing.id);
  }
  function edit(bank: Bank) {
    setEditing(bank);
    setMessage('');
    setNewCode('');
    loadCodes(bank.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  return (
    <div className="bankAdminLayout">
      <section className="bankEditorCard">
        <div className="bankEditorHeading">
          <div>
            <p className="eyebrow gold">{editing ? 'EDIT BANK' : 'NEW BANK'}</p>
            <h2>{editing ? editing.title : 'Add a bank or lender'}</h2>
          </div>
          {editing && (
            <button type="button" onClick={() => setEditing(null)}>
              ← Back to add bank
            </button>
          )}
        </div>
        <form key={value.id || 'new'} onSubmit={save}>
          <input type="hidden" name="id" value={value.id} />
          <div className="bankFormGrid">
            <label>
              Bank or institution name
              <input
                name="title"
                defaultValue={value.title}
                required
                placeholder="Enter the full bank name"
              />
            </label>
            <label>
              Institution type
              <input
                name="institution_type"
                defaultValue={value.institution_type}
                placeholder="Public bank, private lender…"
              />
            </label>
            <label>
              Directory status
              <select name="status" defaultValue={value.status}>
                {statuses.map(([key, label]) => (
                  <option value={key} key={key}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Institution website
              <input
                name="website"
                type="url"
                defaultValue={value.website}
                placeholder="https://…"
              />
            </label>
          </div>
          <label>
            Research summary
            <textarea
              name="summary"
              rows={5}
              defaultValue={value.summary}
              placeholder="Enter the research findings or Heter Iska information."
            />
          </label>
          <label>
            Comment shown with this bank
            <textarea
              name="comment"
              rows={3}
              defaultValue={value.comment}
              placeholder="Add a special note, warning, clarification, or current update."
            />
            <small>
              This comment will appear publicly when visitors open this bank.
            </small>
          </label>
          <label>
            Ownership and control research
            <textarea
              name="ownership_details"
              rows={4}
              defaultValue={value.ownership_details}
            />
          </label>
          <label>
            Heter Iska details
            <textarea
              name="iska_details"
              rows={4}
              defaultValue={value.iska_details}
            />
          </label>
          <label>
            Source links
            <textarea
              name="source_urls"
              rows={3}
              defaultValue={value.source_urls}
            />
          </label>
          <label>
            Private administrator notes
            <textarea
              name="internal_notes"
              rows={3}
              defaultValue={value.internal_notes}
            />
          </label>
          <label className="fullReportEditor">
            Protected full report — $15 access
            <textarea
              name="full_report"
              rows={12}
              defaultValue={value.full_report}
              placeholder="Enter the complete detailed report. This text is never included in the public directory and is shown only after payment or a valid access code."
            />
            <small>
              Visitors will see the Full Report button only when this field
              contains a report.
            </small>
          </label>
          <div className="bankFormGrid compactFields">
            <label>
              Researcher
              <input name="researcher" defaultValue={value.researcher} />
            </label>
            <label>
              Last updated date
              <input
                name="last_updated"
                type="date"
                defaultValue={value.last_updated}
              />
              <small>This date will be displayed publicly.</small>
            </label>
            <label>
              Display order
              <input
                name="sort_order"
                type="number"
                min="0"
                defaultValue={value.sort_order}
              />
            </label>
          </div>
          {value.logo_url && (
            <img
              className="adminLogoPreview"
              src={value.logo_url}
              alt="Current institution logo"
            />
          )}
          <div className="editFormActions">
            <button className="primary">
              {editing ? 'Save bank changes' : 'Add bank'}
            </button>
            {editing && (
              <button
                className="cancelEditButton"
                type="button"
                onClick={() => setEditing(null)}
              >
                Cancel editing
              </button>
            )}
          </div>
        </form>
        {message && <p className="adminSaveMessage">{message}</p>}
        {editing && (
          <section className="bankCodeManager">
            <div>
              <h3>Full report access codes</h3>
              <p>
                Create a free-access code to give to a specific visitor. Codes
                can be removed at any time.
              </p>
            </div>
            <button className="primary" type="button" onClick={createCode}>
              Generate new code
            </button>
            {newCode && (
              <div className="newAccessCode">
                <small>NEW CODE — COPY NOW</small>
                <strong>{newCode}</strong>
                <button
                  type="button"
                  onClick={() => navigator.clipboard.writeText(newCode)}
                >
                  Copy code
                </button>
              </div>
            )}
            <div className="accessCodeList">
              {codes.length === 0 ? (
                <p>No access codes created for this bank.</p>
              ) : (
                codes.map((code) => (
                  <article key={code.id}>
                    <span>
                      <b>{code.code_hint}</b>
                      <small>
                        Created{' '}
                        {new Date(code.created_at).toLocaleDateString('en-US')}
                      </small>
                    </span>
                    <button type="button" onClick={() => removeCode(code.id)}>
                      Remove
                    </button>
                  </article>
                ))
              )}
            </div>
          </section>
        )}
      </section>
      <section className="bankAdminList">
        <div className="bankListHeader">
          <div>
            <h2>All banks and institutions</h2>
            <span>{banks.length} directory records</span>
          </div>
          <button
            className="primary"
            onClick={() => {
              setEditing(null);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          >
            + Add new bank
          </button>
        </div>
        <label className="bankAdminSearch">
          Search banks or comments
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Type a bank name…"
          />
        </label>
        <div className="bankAdminRows">
          {filtered.length === 0 ? (
            <div className="emptyState">
              <b>No banks found</b>
              <p>Try a different search.</p>
            </div>
          ) : (
            filtered.map((bank) => (
              <article key={bank.id}>
                <div className="bankAdminIdentity">
                  <span className="bankInitial">
                    {bank.title.charAt(0).toUpperCase()}
                  </span>
                  <div>
                    <b>{bank.title}</b>
                    <i className={`bankStatus status-${bank.status}`}>
                      {statuses.find(
                        (status) => status[0] === bank.status,
                      )?.[1] || bank.status}
                    </i>
                    {bank.full_report && (
                      <small className="reportReadyBadge">
                        $15 FULL REPORT
                      </small>
                    )}
                  </div>
                </div>
                <div className="bankAdminComment">
                  <small>COMMENT</small>
                  <p>{bank.comment || 'No comment added yet.'}</p>
                  {bank.last_updated && (
                    <time dateTime={bank.last_updated}>
                      Last updated:{' '}
                      {new Date(
                        `${bank.last_updated}T00:00:00`,
                      ).toLocaleDateString('en-US')}
                    </time>
                  )}
                </div>
                <div className="bankRowActions">
                  <button onClick={() => edit(bank)}>Edit</button>
                  <button className="deleteButton" onClick={() => remove(bank)}>
                    Remove
                  </button>
                </div>
              </article>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
