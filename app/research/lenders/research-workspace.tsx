'use client';
import { FormEvent, useMemo, useState } from 'react';
type Item = {
  id: string;
  reference: string;
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
  updated_at: string;
};
const blank: Item = {
  id: '',
  reference: '',
  title: '',
  institution_type: '',
  status_recommendation: 'lack-of-information',
  website: '',
  summary: '',
  public_comment: '',
  last_updated: new Date().toISOString().slice(0, 10),
  full_report: '',
  source_urls: '',
  ownership_details: '',
  iska_details: '',
  internal_notes: '',
  logo_name: '',
  report_name: '',
  workflow_status: 'Draft',
  review_notes: '',
  updated_at: '',
};
const statuses = [
  ['mehudar', 'Level 1 - Preferred'],
  ['kosher', 'Level 2 - Not problematic'],
  ['only-kosher-with-iska', 'Level 3 - Heter Iska required'],
  ['case-by-case', 'Level 4 - Case by case'],
  ['questionable', 'Level 5 - Needs clarification'],
  ['no-good', 'Level 6 - Problematic'],
  ['lack-of-information', 'Level 7 - Not yet determined'],
];
export default function LenderResearchWorkspace({
  initialItems,
  researcherName,
}: {
  initialItems: Item[];
  researcherName: string;
}) {
  const [items, setItems] = useState(initialItems),
    [editing, setEditing] = useState<Item>(blank),
    [message, setMessage] = useState(''),
    [busy, setBusy] = useState(false),
    [query, setQuery] = useState('');
  const filtered = useMemo(
    () =>
      items.filter((x) =>
        (x.title + x.institution_type + x.workflow_status)
          .toLowerCase()
          .includes(query.toLowerCase()),
      ),
    [items, query],
  );
  async function reload(id?: string) {
    const j = (await fetch('/api/bank-research').then((r) => r.json())) as any;
    setItems(j.submissions || []);
    if (id) {
      const found = (j.submissions || []).find((x: Item) => x.id === id);
      if (found) setEditing(found);
    }
  }
  async function save(form: HTMLFormElement, submit: boolean) {
    setBusy(true);
    setMessage(
      submit ? 'Submitting for administrator review…' : 'Saving draft…',
    );
    const data = Object.fromEntries(new FormData(form).entries()) as any;
    data.id = editing.id;
    data.researcher_name = researcherName;
    data.submit = submit;
    const r = await fetch('/api/bank-research', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(data),
      }),
      j = (await r.json()) as any;
    if (!r.ok) {
      setMessage(j.error || 'The research could not be saved.');
      setBusy(false);
      return;
    }
    const id = j.id;
    for (const kind of ['logo', 'report']) {
      const file = (form.elements.namedItem(`${kind}_file`) as HTMLInputElement)
        ?.files?.[0];
      if (file) {
        const fd = new FormData();
        fd.set('id', id);
        fd.set('kind', kind);
        fd.set('file', file);
        const ur = await fetch('/api/bank-research-upload', {
            method: 'POST',
            body: fd,
          }),
          uj = (await ur.json()) as any;
        if (!ur.ok) {
          setMessage(
            `Research saved, but the ${kind} upload failed: ${uj.error}`,
          );
          setBusy(false);
          await reload(id);
          return;
        }
      }
    }
    await reload(id);
    setMessage(
      submit
        ? 'Submitted. The administrator can now review it; it is not live on the website yet.'
        : 'Draft saved privately.',
    );
    setBusy(false);
  }
  function choose(x: Item) {
    setEditing(x);
    setMessage('');
    scrollTo({ top: 0, behavior: 'smooth' });
  }
  return (
    <div className="researchWorkspace">
      <section className="researchEditor">
        <div className="researchEditorTitle">
          <div>
            <small>
              {editing.id ? editing.reference : 'NEW RESEARCH RECORD'}
            </small>
            <h2>{editing.id ? editing.title : 'Research a bank or lender'}</h2>
          </div>
          {editing.id && (
            <button onClick={() => setEditing(blank)}>+ New record</button>
          )}
        </div>
        {editing.workflow_status === 'Changes requested' && (
          <aside className="researchChanges">
            <b>Administrator requested changes</b>
            <p>{editing.review_notes}</p>
          </aside>
        )}
        <form
          key={editing.id || 'new'}
          onSubmit={(e) => {
            e.preventDefault();
            save(e.currentTarget, false);
          }}
        >
          <fieldset>
            <legend>Institution</legend>
            <div className="researchFormGrid">
              <label>
                Bank or lender name
                <input name="title" defaultValue={editing.title} required />
              </label>
              <label>
                Institution type
                <input
                  name="institution_type"
                  defaultValue={editing.institution_type}
                  required
                  placeholder="Public bank, private lender, credit union…"
                />
              </label>
              <label>
                Recommended status
                <select
                  name="status_recommendation"
                  defaultValue={editing.status_recommendation}
                >
                  {statuses.map((x) => (
                    <option key={x[0]} value={x[0]}>
                      {x[1]}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Research completed / updated
                <input
                  type="date"
                  name="last_updated"
                  defaultValue={editing.last_updated}
                />
              </label>
              <label className="full">
                Institution website
                <input
                  type="url"
                  name="website"
                  defaultValue={editing.website}
                  placeholder="https://…"
                />
              </label>
            </div>
          </fieldset>
          <fieldset>
            <legend>Research findings</legend>
            <label>
              Short research summary
              <textarea
                name="summary"
                rows={5}
                defaultValue={editing.summary}
                placeholder="A concise explanation suitable for the bank record."
              />
            </label>
            <label>
              Public comment
              <textarea
                name="public_comment"
                rows={3}
                defaultValue={editing.public_comment}
                placeholder="Warning, clarification, conditions, or current update shown to website visitors."
              />
            </label>
            <label>
              Ownership and control research
              <textarea
                name="ownership_details"
                rows={5}
                defaultValue={editing.ownership_details}
                placeholder="Owners, major shareholders, board control, parent company, subsidiaries…"
              />
            </label>
            <label>
              Heter Iska details
              <textarea
                name="iska_details"
                rows={4}
                defaultValue={editing.iska_details}
                placeholder="Authority, document status, scope, conditions, and limitations."
              />
            </label>
            <label>
              Source links
              <textarea
                name="source_urls"
                rows={4}
                defaultValue={editing.source_urls}
                placeholder="One source URL per line."
              />
            </label>
          </fieldset>
          <fieldset>
            <legend>Complete report and internal record</legend>
            <label>
              Full report text
              <textarea
                name="full_report"
                rows={12}
                defaultValue={editing.full_report}
                placeholder="Enter the complete research report. If approved, this becomes the protected $15 full report."
              />
            </label>
            <label>
              Private researcher notes
              <textarea
                name="internal_notes"
                rows={4}
                defaultValue={editing.internal_notes}
                placeholder="Notes for the administrator only. Never shown publicly."
              />
            </label>
            <div className="researchFormGrid">
              <label>
                Institution logo
                <input
                  type="file"
                  name="logo_file"
                  accept="image/png,image/jpeg,image/webp"
                />
                <small>
                  {editing.logo_name
                    ? `Current: ${editing.logo_name}`
                    : 'PNG, JPG, or WEBP up to 5 MB.'}
                </small>
              </label>
              <label>
                Original research report
                <input
                  type="file"
                  name="report_file"
                  accept="application/pdf,.doc,.docx"
                />
                <small>
                  {editing.report_name
                    ? `Current: ${editing.report_name}`
                    : 'PDF or Word file up to 20 MB.'}
                </small>
              </label>
            </div>
            {editing.report_name && (
              <a
                className="researchFileLink"
                href={`/api/bank-research-file?id=${editing.id}&kind=report`}
                target="_blank"
              >
                Open attached research report ↗
              </a>
            )}
          </fieldset>
          <div className="researchActions">
            <button
              className="secondaryResearch"
              disabled={
                busy ||
                ['Approved', 'Rejected'].includes(editing.workflow_status)
              }
            >
              {busy ? 'Working…' : 'Save private draft'}
            </button>
            <button
              type="button"
              className="primary"
              disabled={
                busy ||
                ['Approved', 'Rejected'].includes(editing.workflow_status)
              }
              onClick={(e) => {
                const form = e.currentTarget.form;
                if (form && form.reportValidity()) save(form, true);
              }}
            >
              Submit to administrator →
            </button>
          </div>
          {message && <p className="researchMessage">{message}</p>}
        </form>
      </section>
      <aside className="researchList">
        <div>
          <h2>Your research</h2>
          <span>{items.length} records</span>
        </div>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search lender or status…"
        />
        {filtered.map((x) => (
          <button
            key={x.id}
            onClick={() => choose(x)}
            className={editing.id === x.id ? 'active' : ''}
          >
            <span
              className={`workflow ${x.workflow_status.toLowerCase().replace(/\s/g, '-')}`}
            >
              {x.workflow_status}
            </span>
            <b>{x.title}</b>
            <small>
              {x.institution_type || 'Type not entered'} ·{' '}
              {new Date(x.updated_at).toLocaleDateString()}
            </small>
          </button>
        ))}
      </aside>
    </div>
  );
}
