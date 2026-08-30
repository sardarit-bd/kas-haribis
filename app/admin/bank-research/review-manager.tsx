'use client';

import { FormEvent, useMemo, useState } from 'react';

type Item = {
  id: string;
  reference: string;
  researcher_email: string;
  researcher_name: string;
  title: string;
  institution_type: string;
  status_recommendation: string;
  website: string;
  summary: string;
  public_comment: string;
  last_updated: string;
  full_report: string;
  source_urls: string;
  ownership_details: string;
  iska_details: string;
  internal_notes: string;
  logo_name: string;
  report_name: string;
  workflow_status: string;
  review_notes: string;
  reviewer_email: string;
  reviewer_name: string;
  reviewed_at: string;
  published_bank_id: string;
};
type Person = {
  email: string;
  name: string;
  active: number;
  created_at: string;
  code_configured?: number;
  access_type?: string;
  expires_at?: string;
  code_updated_at?: string;
};
type Kind = 'researchers' | 'reviewers';
const endpoint = (kind: Kind) =>
  kind === 'researchers'
    ? '/api/bank-researchers'
    : '/api/bank-research-reviewers';

const labels: Record<string, string> = {
  mehudar: 'Preferred',
  kosher: 'Not problematic',
  'only-kosher-with-iska': 'Heter Iska required',
  'case-by-case': 'Case by case',
  questionable: 'Needs clarification',
  'no-good': 'Problematic',
  'lack-of-information': 'Not yet determined',
};

export default function BankResearchReview({
  initialItems,
  initialResearchers,
  initialReviewers = [],
  currentUser = { email: '', name: '' },
  owner = true,
}: {
  initialItems: Item[];
  initialResearchers: Person[];
  initialReviewers?: Person[];
  currentUser?: { email: string; name: string };
  owner?: boolean;
}) {
  const [items, setItems] = useState(initialItems);
  const [researchers, setResearchers] = useState(initialResearchers);
  const [reviewers, setReviewers] = useState(initialReviewers);
  const [selected, setSelected] = useState<Item | null>(
    initialItems.find((x) => x.workflow_status === 'Submitted') ||
      initialItems.find((x) => x.workflow_status === 'Reviewer approved') ||
      initialItems[0] ||
      null,
  );
  const [notes, setNotes] = useState(selected?.review_notes || '');
  const [message, setMessage] = useState('');
  const [filter, setFilter] = useState(owner ? 'Ready for owner' : 'Submitted');
  const filtered = useMemo(
    () =>
      items.filter(
        (x) =>
          filter === 'All' ||
          (filter === 'Ready for owner'
            ? x.workflow_status === 'Reviewer approved'
            : x.workflow_status === filter),
      ),
    [items, filter],
  );

  async function reload() {
    const response = await fetch('/api/bank-research');
    const json = (await response.json()) as any;
    if (!response.ok) {
      setMessage(json.error || 'Could not refresh the queue.');
      return;
    }
    setItems(json.submissions || []);
    if (selected) {
      const next =
        (json.submissions || []).find((x: Item) => x.id === selected.id) ||
        null;
      setSelected(next);
      setNotes(next?.review_notes || '');
    }
  }
  async function action(name: string) {
    if (!selected) return;
    if (
      name === 'approve' &&
      !confirm(
        `Approve ${selected.title} and publish it live in the Kosher Bank Directory?`,
      )
    )
      return;
    setMessage(
      name === 'approve' ? 'Publishing approved research…' : 'Saving review…',
    );
    const response = await fetch('/api/bank-research', {
      method: 'PUT',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        id: selected.id,
        action: name,
        review_notes: notes,
        reviewer_name: currentUser.name,
      }),
    });
    const json = (await response.json()) as any;
    if (!response.ok) {
      setMessage(json.error || 'The review could not be saved.');
      return;
    }
    await reload();
    setMessage(
      name === 'approve'
        ? 'Approved and published live in the Bank Directory.'
        : name === 'reviewer_approve'
          ? 'Forwarded to the owner for final approval.'
          : name === 'request_changes'
            ? 'Returned to the researcher with your notes.'
            : 'Research record rejected.',
    );
  }
  async function addPerson(event: FormEvent<HTMLFormElement>, kind: Kind) {
    event.preventDefault();
    const form = event.currentTarget;
    const personLabel = kind === 'researchers' ? 'Researcher' : 'Reviewer';
    setMessage(`Adding ${personLabel.toLowerCase()} access…`);
    try {
      const response = await fetch(endpoint(kind), {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(Object.fromEntries(new FormData(form).entries())),
      });
      const json = (await response.json()) as any;
      if (!response.ok) {
        setMessage(json.error || 'Access could not be added.');
        return;
      }
      form.reset();
      await loadPeople(kind);
      setMessage(`${personLabel} access added.`);
    } catch {
      setMessage(`${personLabel} access could not be added. Please try again.`);
    }
  }
  async function loadPeople(kind: Kind) {
    const json = (await fetch(endpoint(kind)).then((r) => r.json())) as any;
    kind === 'researchers'
      ? setResearchers(json.researchers || [])
      : setReviewers(json.reviewers || []);
  }
  async function toggle(person: Person, kind: Kind) {
    await fetch(endpoint(kind), {
      method: 'PUT',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ ...person, active: !person.active }),
    });
    loadPeople(kind);
  }
  async function remove(person: Person, kind: Kind) {
    if (!confirm(`Remove access for ${person.email}?`)) return;
    await fetch(`${endpoint(kind)}?email=${encodeURIComponent(person.email)}`, {
      method: 'DELETE',
    });
    loadPeople(kind);
  }
  async function saveResearcherCode(
    event: FormEvent<HTMLFormElement>,
    person: Person,
  ) {
    event.preventDefault();
    const form = event.currentTarget;
    setMessage(`Saving the individual code for ${person.email}…`);
    const response = await fetch(endpoint('researchers'), {
        method: 'PUT',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          email: person.email,
          ...Object.fromEntries(new FormData(form).entries()),
        }),
      }),
      json = (await response.json()) as any;
    if (!response.ok) {
      setMessage(json.error || 'The code could not be saved.');
      return;
    }
    form.reset();
    await loadPeople('researchers');
    setMessage(
      `Individual code saved for ${person.email}. Their previous sessions were signed out.`,
    );
  }

  return (
    <>
      {owner && (
        <>
          <ResearcherAccess
            people={researchers}
            add={addPerson}
            toggle={toggle}
            remove={remove}
            saveCode={saveResearcherCode}
          />
          <PeopleAccess
            eyebrow="REVIEWER ACCESS"
            title="Authorized reviewers"
            description="Reviewers can inspect submissions, return them for corrections, or forward them to you. They cannot publish."
            people={reviewers}
            kind="reviewers"
            add={addPerson}
            toggle={toggle}
            remove={remove}
          />
        </>
      )}
      {message && (
        <p className="researchMessage" role="status" aria-live="polite">
          {message}
        </p>
      )}
      <div className="researchReviewLayout">
        <aside className="researchReviewQueue">
          <div>
            <h2>Review queue</h2>
            <span>
              {items.filter((x) => x.workflow_status === 'Submitted').length}{' '}
              awaiting review ·{' '}
              {
                items.filter((x) => x.workflow_status === 'Reviewer approved')
                  .length
              }{' '}
              ready for owner
            </span>
          </div>
          <select value={filter} onChange={(e) => setFilter(e.target.value)}>
            {owner && <option>Ready for owner</option>}
            <option>Submitted</option>
            <option>Changes requested</option>
            <option>Draft</option>
            <option>Approved</option>
            {owner && <option>Rejected</option>}
            <option>All</option>
          </select>
          {filtered.length ? (
            filtered.map((x) => (
              <button
                key={x.id}
                className={selected?.id === x.id ? 'active' : ''}
                onClick={() => {
                  setSelected(x);
                  setNotes(x.review_notes || '');
                  setMessage('');
                }}
              >
                <span
                  className={`workflow ${x.workflow_status.toLowerCase().replace(/\s/g, '-')}`}
                >
                  {x.workflow_status}
                </span>
                <b>{x.title}</b>
                <small>
                  {x.researcher_name || x.researcher_email} ·{' '}
                  {x.institution_type}
                </small>
              </button>
            ))
          ) : (
            <p className="emptyQueue">No records in this group.</p>
          )}
        </aside>
        <section className="researchReviewDetail">
          {selected ? (
            <>
              <header>
                <div>
                  <small>{selected.reference}</small>
                  <h2>{selected.title}</h2>
                  <p>
                    Submitted by{' '}
                    {selected.researcher_name || selected.researcher_email}
                  </p>
                </div>
                <span
                  className={`workflow ${selected.workflow_status.toLowerCase().replace(/\s/g, '-')}`}
                >
                  {selected.workflow_status}
                </span>
              </header>
              <div className="researchDecisionSummary">
                <article>
                  <small>INSTITUTION TYPE</small>
                  <b>{selected.institution_type}</b>
                </article>
                <article>
                  <small>RECOMMENDED STATUS</small>
                  <b>
                    {labels[selected.status_recommendation] ||
                      selected.status_recommendation}
                  </b>
                </article>
                <article>
                  <small>LAST RESEARCHED</small>
                  <b>{selected.last_updated || 'Not entered'}</b>
                </article>
              </div>
              {selected.reviewer_email && (
                <ReviewBlock
                  title="Reviewer"
                  text={`${selected.reviewer_name || selected.reviewer_email}${selected.reviewed_at ? ` · ${new Date(selected.reviewed_at).toLocaleDateString('en-US')}` : ''}`}
                />
              )}
              {selected.logo_name && (
                <img
                  className="researchReviewLogo"
                  src={`/api/bank-research-file?id=${selected.id}&kind=logo`}
                  alt={`${selected.title} logo`}
                />
              )}
              <ReviewBlock
                title="Public research summary"
                text={selected.summary}
              />
              <ReviewBlock
                title="Public comment"
                text={selected.public_comment}
              />
              <ReviewBlock
                title="Ownership and control"
                text={selected.ownership_details}
              />
              <ReviewBlock
                title="Heter Iska details"
                text={selected.iska_details}
              />
              <ReviewBlock
                title="Full protected report ($15)"
                text={selected.full_report}
              />
              <ReviewBlock title="Sources" text={selected.source_urls} />
              <ReviewBlock
                title="Private researcher notes"
                text={selected.internal_notes}
              />
              {selected.website && (
                <a
                  className="researchFileLink"
                  href={selected.website}
                  target="_blank"
                  rel="noreferrer"
                >
                  Open institution website ↗
                </a>
              )}
              {selected.report_name && (
                <a
                  className="researchFileLink"
                  href={`/api/bank-research-file?id=${selected.id}&kind=report`}
                  target="_blank"
                >
                  Open original attached report: {selected.report_name} ↗
                </a>
              )}
              <label className="reviewNotes">
                Review notes
                <textarea
                  rows={5}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Explain requested corrections or record the reason for approval."
                />
              </label>
              <div className="approvalActions">
                <button onClick={() => action('request_changes')}>
                  Return for corrections
                </button>
                {owner ? (
                  <>
                    <button className="reject" onClick={() => action('reject')}>
                      Reject
                    </button>
                    <button
                      className="approve"
                      onClick={() => action('approve')}
                    >
                      ✓ Approve & publish live
                    </button>
                  </>
                ) : (
                  <button
                    className="approve"
                    onClick={() => action('reviewer_approve')}
                  >
                    ✓ Forward to owner
                  </button>
                )}
              </div>
              {selected.published_bank_id && (
                <a className="publishedBankLink" href="/admin/banks">
                  Open this listing in Bank Manager →
                </a>
              )}
            </>
          ) : (
            <div className="investEmpty">
              <h2>Select a research record</h2>
              <p>Choose a submission from the review queue.</p>
            </div>
          )}
        </section>
      </div>
    </>
  );
}

function AccessFields() {
  const [type, setType] = useState('permanent');
  return (
    <>
      <input
        name="code"
        inputMode="numeric"
        pattern="[0-9]{6}"
        minLength={6}
        maxLength={6}
        required
        placeholder="Individual 6-digit code"
        aria-label="Individual six-digit code"
      />
      <select
        name="access_type"
        value={type}
        onChange={(e) => setType(e.target.value)}
        aria-label="Code duration"
      >
        <option value="permanent">Permanent — until I stop it</option>
        <option value="temporary">Temporary — expires</option>
      </select>
      {type === 'temporary' && (
        <input
          name="expires_at"
          type="datetime-local"
          required
          aria-label="Expiration date and time"
        />
      )}
    </>
  );
}

function ResearcherAccess({
  people,
  add,
  toggle,
  remove,
  saveCode,
}: {
  people: Person[];
  add: (event: FormEvent<HTMLFormElement>, kind: Kind) => void;
  toggle: (person: Person, kind: Kind) => void;
  remove: (person: Person, kind: Kind) => void;
  saveCode: (event: FormEvent<HTMLFormElement>, person: Person) => void;
}) {
  return (
    <section className="researcherAccess researcherCredentialAccess">
      <div>
        <small>RESEARCHER ACCESS</small>
        <h2>Authorized researchers</h2>
        <p>
          Each researcher has their own six-digit code. Choose permanent access
          until you stop it, or temporary access with an expiration date.
          Researchers cannot publish.
        </p>
      </div>
      <form
        className="researcherAddForm"
        onSubmit={(e) => add(e, 'researchers')}
      >
        <input name="name" placeholder="Researcher name" />
        <input
          name="email"
          type="email"
          required
          placeholder="person@email.com"
        />
        <AccessFields />
        <button className="primary">Add researcher</button>
      </form>
      <div className="researcherChips">
        {people.length ? (
          people.map((person) => (
            <article
              key={person.email}
              className={person.active ? '' : 'inactive'}
            >
              <div className="researcherIdentity">
                <b>{person.name || person.email}</b>
                <small>{person.email}</small>
                <em
                  className={
                    person.code_configured ? 'codeReady' : 'codeMissing'
                  }
                >
                  {person.code_configured
                    ? person.access_type === 'temporary'
                      ? `Temporary${person.expires_at ? ` · expires ${new Date(person.expires_at).toLocaleString()}` : ''}`
                      : 'Permanent until stopped'
                    : 'No individual code set'}
                </em>
              </div>
              <form
                className="researcherCodeForm"
                onSubmit={(e) => saveCode(e, person)}
              >
                <AccessFields />
                <button className="primary">
                  {person.code_configured ? 'Change code' : 'Set code'}
                </button>
              </form>
              <div className="researcherControls">
                <button onClick={() => toggle(person, 'researchers')}>
                  {person.active ? 'Pause access' : 'Restore access'}
                </button>
                <button onClick={() => remove(person, 'researchers')}>
                  Remove
                </button>
              </div>
            </article>
          ))
        ) : (
          <p>No researchers have been added yet.</p>
        )}
      </div>
    </section>
  );
}

function PeopleAccess({
  eyebrow,
  title,
  description,
  people,
  kind,
  add,
  toggle,
  remove,
}: {
  eyebrow: string;
  title: string;
  description: string;
  people: Person[];
  kind: Kind;
  add: (event: FormEvent<HTMLFormElement>, kind: Kind) => void;
  toggle: (person: Person, kind: Kind) => void;
  remove: (person: Person, kind: Kind) => void;
}) {
  return (
    <section className="researcherAccess">
      <div>
        <small>{eyebrow}</small>
        <h2>{title}</h2>
        <p>{description}</p>
      </div>
      <form onSubmit={(e) => add(e, kind)}>
        <input
          name="name"
          placeholder={`${kind === 'researchers' ? 'Researcher' : 'Reviewer'} name`}
        />
        <input
          name="email"
          type="email"
          required
          placeholder="person@email.com"
        />
        <button className="primary">Add {kind.slice(0, -1)}</button>
      </form>
      <div className="researcherChips">
        {people.length ? (
          people.map((person) => (
            <article
              key={person.email}
              className={person.active ? '' : 'inactive'}
            >
              <span>
                <b>{person.name || person.email}</b>
                <small>{person.email}</small>
              </span>
              <button onClick={() => toggle(person, kind)}>
                {person.active ? 'Pause' : 'Restore'}
              </button>
              <button onClick={() => remove(person, kind)}>Remove</button>
            </article>
          ))
        ) : (
          <p>No {kind} have been added yet.</p>
        )}
      </div>
    </section>
  );
}
function ReviewBlock({ title, text }: { title: string; text: string }) {
  return (
    <section className="reviewBlock">
      <small>{title}</small>
      <p>{text || 'Not provided.'}</p>
    </section>
  );
}
