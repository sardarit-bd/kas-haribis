'use client';
import { useMemo, useState } from 'react';
import BankReportUnlock from './bank-report-unlock';

type Bank = {
  id: string | number;
  title: string;
  status: string;
  summary: string;
  comment: string;
  last_updated: string;
  has_full_report: number;
  source: string;
  institution_type: string;
  website: string;
  logo_url: string;
};
const labels: Record<string, string> = {
  kosher: 'Kosher',
  mehudar: 'Mehudar',
  'only-kosher-with-iska': 'Kosher with Heter Iska',
  'case-by-case': 'Case by case',
  questionable: 'Questionable',
  'no-good': 'Not recommended',
  'lack-of-information': 'Insufficient information',
};

export default function BankDirectoryClient({ banks }: { banks: Bank[] }) {
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('all');
  const [open, setOpen] = useState<string | number | null>(null);
  const [unlock, setUnlock] = useState<Bank | null>(null);
  const [view, setView] = useState<'list' | 'grid'>('list');
  const filtered = useMemo(
    () =>
      banks.filter(
        (bank) =>
          (status === 'all' || bank.status === status) &&
          (bank.title + ' ' + bank.comment)
            .toLowerCase()
            .includes(query.toLowerCase()),
      ),
    [banks, query, status],
  );

  return (
    <section className="directorySection">
      <div className="directoryTools">
        <label>
          Search financial institutions
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Bank or lender name…"
          />
        </label>
        <label>
          Status
          <select
            value={status}
            onChange={(event) => setStatus(event.target.value)}
          >
            <option value="all">All statuses</option>
            {Object.entries(labels).map(([value, label]) => (
              <option value={value} key={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <b aria-live="polite">{filtered.length} banks listed</b>
        <div
          className="bankViewToggle"
          role="group"
          aria-label="Choose directory layout"
        >
          <button
            className={view === 'list' ? 'active' : ''}
            onClick={() => setView('list')}
            aria-pressed={view === 'list'}
          >
            <span>☷</span> List
          </button>
          <button
            className={view === 'grid' ? 'active' : ''}
            onClick={() => setView('grid')}
            aria-pressed={view === 'grid'}
          >
            <span>▦</span> Grid
          </button>
        </div>
      </div>
      <div
        className={`bankList ${view === 'grid' ? 'bankGridView' : 'bankListView'}`}
      >
        {filtered.length === 0 && (
          <p className="directoryWarning">
            No banks match this search. Clear the search or choose All statuses.
          </p>
        )}
        {filtered.map((bank) => (
          <article key={bank.id}>
            <div className="bankCardTop">
              <button
                className="bankSummary"
                onClick={() => setOpen(open === bank.id ? null : bank.id)}
                aria-expanded={open === bank.id}
              >
                {bank.logo_url ? (
                  <img className="bankCardLogo" src={bank.logo_url} alt="" />
                ) : null}
                <span>
                  <b>{bank.title}</b>
                  <small>
                    {bank.institution_type ? `${bank.institution_type} · ` : ''}
                    {bank.last_updated
                      ? `Last updated ${new Date(`${bank.last_updated}T00:00:00`).toLocaleDateString('en-US')}`
                      : 'Update date not entered'}
                  </small>
                </span>
                <i className={`bankStatus status-${bank.status}`}>
                  {labels[bank.status] || bank.status}
                </i>
                <strong>{open === bank.id ? '−' : '+'}</strong>
              </button>
              {Boolean(bank.has_full_report) ? (
                <button
                  className="bankReportCardButton"
                  onClick={() => setUnlock(bank)}
                >
                  View Full Report <span>— $15</span>
                </button>
              ) : (
                <button className="bankReportCardButton unavailable" disabled>
                  Full report not available yet
                </button>
              )}
            </div>
            {open === bank.id && (
              <div className="bankDetails">
                {bank.last_updated && (
                  <p className="bankUpdatedDate">
                    <b>Last updated:</b>{' '}
                    <time dateTime={bank.last_updated}>
                      {new Date(
                        `${bank.last_updated}T00:00:00`,
                      ).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </time>
                  </p>
                )}
                <p>
                  {bank.summary ||
                    'The current directory lists this institution under the status shown above. Contact Kav Haribis for details before relying on the listing.'}
                </p>
                {bank.comment && (
                  <div className="bankPublicComment">
                    <b>Kav Haribis comment</b>
                    <p>{bank.comment}</p>
                  </div>
                )}
                {bank.website && (
                  <a
                    className="bankWebsiteLink"
                    href={bank.website}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Institution website ↗
                  </a>
                )}
                <p className="directoryWarning">
                  Information may change. Confirm the current status with the
                  Bais Horaah before making a financial decision.
                </p>
              </div>
            )}
          </article>
        ))}
      </div>
      {unlock && (
        <BankReportUnlock
          bankId={String(unlock.id)}
          bankName={unlock.title}
          onClose={() => setUnlock(null)}
        />
      )}
    </section>
  );
}
