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

function getPageNumbers(current: number, total: number) {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }
  if (current <= 3) {
    return [1, 2, 3, 4, '...', total];
  }
  if (current >= total - 2) {
    return [1, '...', total - 3, total - 2, total - 1, total];
  }
  return [1, '...', current - 1, current, current + 1, '...', total];
}

export default function BankDirectoryClient({ banks }: { banks: Bank[] }) {
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('all');
  const [open, setOpen] = useState<string | number | null>(null);
  const [unlock, setUnlock] = useState<Bank | null>(null);
  const [view, setView] = useState<'list' | 'grid'>('list');
  const [perPage, setPerPage] = useState<number | 'all'>(16);
  const [currentPage, setCurrentPage] = useState(1);

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

  const totalPages = useMemo(() => {
    if (perPage === 'all') return 1;
    return Math.max(1, Math.ceil(filtered.length / perPage));
  }, [filtered.length, perPage]);

  const activePage = Math.min(currentPage, totalPages);

  const paginatedBanks = useMemo(() => {
    if (perPage === 'all') return filtered;
    const start = (activePage - 1) * perPage;
    return filtered.slice(start, start + perPage);
  }, [filtered, activePage, perPage]);

  const handleQueryChange = (val: string) => {
    setQuery(val);
    setCurrentPage(1);
  };

  const handleStatusChange = (val: string) => {
    setStatus(val);
    setCurrentPage(1);
  };

  const handlePerPageChange = (val: number | 'all') => {
    setPerPage(val);
    setCurrentPage(1);
  };

  const pageNumbers = getPageNumbers(activePage, totalPages);
  const startIndex = perPage === 'all' ? 0 : (activePage - 1) * perPage;

  return (
    <section className="directorySection">
      <div className="directoryTools">
        <label>
          Search financial institutions
          <input
            value={query}
            onChange={(event) => handleQueryChange(event.target.value)}
            placeholder="Bank or lender name…"
          />
        </label>
        <label>
          Status
          <select
            value={status}
            onChange={(event) => handleStatusChange(event.target.value)}
          >
            <option value="all">All statuses</option>
            {Object.entries(labels).map(([value, label]) => (
              <option value={value} key={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <label className="directoryPerPageSelect">
          Reports per page
          <select
            value={perPage}
            onChange={(event) => {
              const val =
                event.target.value === 'all'
                  ? 'all'
                  : Number(event.target.value);
              handlePerPageChange(val);
            }}
          >
            <option value={16}>16 per page</option>
            <option value={25}>25 per page</option>
            <option value={50}>50 per page</option>
            <option value="all">All</option>
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
        {paginatedBanks.map((bank) => (
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
      {filtered.length > 0 && (
        <div className="directoryPagination">
          <div className="paginationInfo">
            Showing{' '}
            <b>
              {perPage === 'all'
                ? `1–${filtered.length}`
                : `${startIndex + 1}–${Math.min(startIndex + perPage, filtered.length)}`}
            </b>{' '}
            of <b>{filtered.length}</b> banks
          </div>
          {perPage !== 'all' && totalPages > 1 && (
            <div className="paginationControls">
              <button
                className="paginationBtn"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={activePage === 1}
                aria-label="Previous page"
              >
                ← Prev
              </button>

              <div className="paginationPages">
                {pageNumbers.map((page, idx) =>
                  typeof page === 'number' ? (
                    <button
                      key={page}
                      className={`paginationPageBtn ${activePage === page ? 'active' : ''}`}
                      onClick={() => setCurrentPage(page)}
                    >
                      {page}
                    </button>
                  ) : (
                    <span
                      key={`ellipsis-${idx}`}
                      className="paginationEllipsis"
                    >
                      …
                    </span>
                  ),
                )}
              </div>

              <button
                className="paginationBtn"
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
                disabled={activePage === totalPages}
                aria-label="Next page"
              >
                Next →
              </button>
            </div>
          )}
        </div>
      )}
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
