'use client';

import { useState } from 'react';

type Row = {
  key: string;
  title: string;
  institution_type: string;
  status_recommendation: string;
  website: string;
  summary: string;
  public_comment: string;
  last_updated: string;
  ownership_details: string;
  iska_details: string;
  source_urls: string;
  full_report: string;
  internal_notes: string;
  busy?: boolean;
  message?: string;
};
const statuses = [
  ['lack-of-information', 'Not determined'],
  ['mehudar', 'Preferred'],
  ['kosher', 'Not problematic'],
  ['only-kosher-with-iska', 'Heter Iska required'],
  ['case-by-case', 'Case by case'],
  ['questionable', 'Needs clarification'],
  ['no-good', 'Problematic'],
];
const blank = (): Row => ({
  key: crypto.randomUUID(),
  title: '',
  institution_type: '',
  status_recommendation: 'lack-of-information',
  website: '',
  summary: '',
  public_comment: '',
  last_updated: new Date().toISOString().slice(0, 10),
  ownership_details: '',
  iska_details: '',
  source_urls: '',
  full_report: '',
  internal_notes: '',
});

export default function SpreadsheetGrid({
  researcherName,
}: {
  researcherName: string;
}) {
  const [rows, setRows] = useState<Row[]>([blank()]);
  const update = (key: string, field: keyof Row, value: string) =>
    setRows((current) =>
      current.map((row) =>
        row.key === key ? { ...row, [field]: value, message: '' } : row,
      ),
    );
  async function save(row: Row, submit: boolean) {
    if (!row.title.trim() || !row.institution_type.trim()) {
      setRows((current) =>
        current.map((item) =>
          item.key === row.key
            ? { ...item, message: 'Enter the bank name and type.' }
            : item,
        ),
      );
      return;
    }
    setRows((current) =>
      current.map((item) =>
        item.key === row.key
          ? { ...item, busy: true, message: submit ? 'Submitting…' : 'Saving…' }
          : item,
      ),
    );
    const response = await fetch('/api/bank-research', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ ...row, researcher_name: researcherName, submit }),
    });
    const json = (await response.json()) as any;
    if (!response.ok) {
      setRows((current) =>
        current.map((item) =>
          item.key === row.key
            ? {
                ...item,
                busy: false,
                message: json.error || 'Could not save this row.',
              }
            : item,
        ),
      );
      return;
    }
    setRows((current) =>
      current.map((item) =>
        item.key === row.key
          ? {
              ...item,
              busy: false,
              message: submit
                ? 'Submitted for approval'
                : 'Saved as a private draft',
            }
          : item,
      ),
    );
    if (submit) setTimeout(() => location.reload(), 900);
  }
  return (
    <section className="researchSheetCard">
      <div className="researchSheetHeading">
        <div>
          <small>QUICK SPREADSHEET ENTRY</small>
          <h2>Enter lenders in a chart</h2>
          <p>
            Type directly into the rows like a Google Sheet. Every row includes
            the same fields as the full bank form. Submit a completed row for
            review; it will not go live until the owner approves it.
          </p>
        </div>
        <button
          type="button"
          className="primary"
          onClick={() => setRows((current) => [...current, blank()])}
        >
          + Add another row
        </button>
      </div>
      <div className="researchSheetScroll">
        <table className="researchSheet">
          <thead>
            <tr>
              <th>Bank name *</th>
              <th>Type *</th>
              <th>Status</th>
              <th>Author</th>
              <th>Last updated</th>
              <th>Public comment</th>
              <th>Website</th>
              <th>Research summary</th>
              <th>Ownership & control</th>
              <th>Heter Iska details</th>
              <th>Source links</th>
              <th>Full report</th>
              <th>Private notes</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.key}>
                <td>
                  <input
                    value={row.title}
                    onChange={(e) => update(row.key, 'title', e.target.value)}
                    placeholder="Bank or lender"
                  />
                </td>
                <td>
                  <input
                    value={row.institution_type}
                    onChange={(e) =>
                      update(row.key, 'institution_type', e.target.value)
                    }
                    placeholder="Public bank…"
                  />
                </td>
                <td>
                  <select
                    value={row.status_recommendation}
                    onChange={(e) =>
                      update(row.key, 'status_recommendation', e.target.value)
                    }
                  >
                    {statuses.map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </td>
                <td>
                  <input
                    value={researcherName}
                    readOnly
                    title="Filled automatically from the signed-in researcher"
                  />
                </td>
                <td>
                  <input
                    type="date"
                    value={row.last_updated}
                    onChange={(e) =>
                      update(row.key, 'last_updated', e.target.value)
                    }
                  />
                </td>
                <td>
                  <textarea
                    value={row.public_comment}
                    onChange={(e) =>
                      update(row.key, 'public_comment', e.target.value)
                    }
                    placeholder="Comment shown publicly"
                  />
                </td>
                <td>
                  <input
                    type="url"
                    value={row.website}
                    onChange={(e) => update(row.key, 'website', e.target.value)}
                    placeholder="https://…"
                  />
                </td>
                <td>
                  <textarea
                    value={row.summary}
                    onChange={(e) => update(row.key, 'summary', e.target.value)}
                    placeholder="Directory summary"
                  />
                </td>
                <td>
                  <textarea
                    value={row.ownership_details}
                    onChange={(e) =>
                      update(row.key, 'ownership_details', e.target.value)
                    }
                    placeholder="Owners, shareholders, control…"
                  />
                </td>
                <td>
                  <textarea
                    value={row.iska_details}
                    onChange={(e) =>
                      update(row.key, 'iska_details', e.target.value)
                    }
                    placeholder="Authority, scope, conditions…"
                  />
                </td>
                <td>
                  <textarea
                    value={row.source_urls}
                    onChange={(e) =>
                      update(row.key, 'source_urls', e.target.value)
                    }
                    placeholder="One link per line"
                  />
                </td>
                <td>
                  <textarea
                    value={row.full_report}
                    onChange={(e) =>
                      update(row.key, 'full_report', e.target.value)
                    }
                    placeholder="Complete protected report"
                  />
                </td>
                <td>
                  <textarea
                    value={row.internal_notes}
                    onChange={(e) =>
                      update(row.key, 'internal_notes', e.target.value)
                    }
                    placeholder="Never shown publicly"
                  />
                </td>
                <td className="researchSheetActions">
                  <button
                    type="button"
                    disabled={row.busy}
                    onClick={() => save(row, false)}
                  >
                    Save draft
                  </button>
                  <button
                    type="button"
                    className="primary"
                    disabled={row.busy}
                    onClick={() => save(row, true)}
                  >
                    Submit for approval
                  </button>
                  {rows.length > 1 && (
                    <button
                      type="button"
                      className="sheetRemove"
                      onClick={() =>
                        setRows((current) =>
                          current.filter((item) => item.key !== row.key),
                        )
                      }
                    >
                      Remove row
                    </button>
                  )}
                  {row.message && <small>{row.message}</small>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="researchSheetNote">
        For a logo or PDF/Word attachment, save the row as a draft and open it
        in the detailed form below.
      </p>
    </section>
  );
}
