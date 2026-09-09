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

  const getStatusBadgeStyle = (statusKey: string) => {
    switch (statusKey) {
      case 'kosher':
      case 'mehudar':
        return 'bg-[#e9f4eb] text-[#367448] border-[#c5e1cd]';
      case 'only-kosher-with-iska':
      case 'case-by-case':
        return 'bg-[#fff7e5] text-[#876622] border-[#f3e4bc]';
      case 'questionable':
      case 'no-good':
        return 'bg-[#fde8e8] text-[#9b1c1c] border-[#f8b4b4]';
      default:
        return 'bg-[#f1f5f9] text-[#475569] border-[#cbd5e1]';
    }
  };

  return (
    <section className="container max-w-[1440px] mx-auto px-4 sm:px-8 py-10 md:py-14">
      {/* Directory Tools */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[minmax(200px,1fr)_minmax(150px,0.7fr)_minmax(130px,0.6fr)_auto_auto] gap-4 items-end mb-8 bg-[#f7f3ea] p-5 sm:p-6 rounded-xl border border-[#e2dacd]">
        <label className="flex flex-col gap-1.5 text-xs font-bold text-[#102a43] uppercase tracking-wider">
          Search financial institutions
          <input
            value={query}
            onChange={(event) => handleQueryChange(event.target.value)}
            placeholder="Bank or lender name…"
            className="h-[43px] px-3.5 bg-white border border-[#cbd5da] rounded-lg text-sm text-[#102a43] font-normal normal-case focus:outline-none focus:ring-2 focus:ring-[#102a43]/20 focus:border-[#102a43]"
          />
        </label>
        <label className="flex flex-col gap-1.5 text-xs font-bold text-[#102a43] uppercase tracking-wider">
          Status
          <select
            value={status}
            onChange={(event) => handleStatusChange(event.target.value)}
            className="h-[43px] px-3.5 bg-white border border-[#cbd5da] rounded-lg text-sm text-[#102a43] font-normal normal-case cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#102a43]/20 focus:border-[#102a43]"
          >
            <option value="all">All statuses</option>
            {Object.entries(labels).map(([value, label]) => (
              <option value={value} key={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1.5 text-xs font-bold text-[#102a43] uppercase tracking-wider">
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
            className="h-[43px] px-3.5 bg-white border border-[#cbd5da] rounded-lg text-sm text-[#102a43] font-normal normal-case cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#102a43]/20 focus:border-[#102a43]"
          >
            <option value={16}>16 per page</option>
            <option value={25}>25 per page</option>
            <option value={50}>50 per page</option>
            <option value="all">All</option>
          </select>
        </label>
        <b className="self-center py-2 text-sm font-bold text-[#102a43] whitespace-nowrap" aria-live="polite">
          {filtered.length} banks listed
        </b>
        <div
          className="inline-flex items-center self-end border border-[#cbd5da] rounded-lg overflow-hidden bg-white w-full sm:w-auto"
          role="group"
          aria-label="Choose directory layout"
        >
          <button
            className={`h-[43px] px-4 border-r border-[#dce3e7] text-[11px] font-extrabold flex-1 sm:flex-none flex items-center justify-center gap-1.5 transition-colors ${
              view === 'list'
                ? 'bg-[#102a43] text-white'
                : 'bg-white text-[#60717d] hover:bg-[#f7f9fa]'
            }`}
            onClick={() => setView('list')}
            aria-pressed={view === 'list'}
          >
            <span className="text-base">☷</span> List
          </button>
          <button
            className={`h-[43px] px-4 text-[11px] font-extrabold flex-1 sm:flex-none flex items-center justify-center gap-1.5 transition-colors ${
              view === 'grid'
                ? 'bg-[#102a43] text-white'
                : 'bg-white text-[#60717d] hover:bg-[#f7f9fa]'
            }`}
            onClick={() => setView('grid')}
            aria-pressed={view === 'grid'}
          >
            <span className="text-base">▦</span> Grid
          </button>
        </div>
      </div>

      {/* Directory Grid / List View */}
      <div
        className={
          view === 'grid'
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 items-start'
            : 'flex flex-col gap-4'
        }
      >
        {filtered.length === 0 && (
          <p className="col-span-full p-6 text-center text-sm font-semibold text-[#876622] bg-[#fff7e5] border border-[#f3e4bc] rounded-xl">
            No banks match this search. Clear the search or choose All statuses.
          </p>
        )}
        {paginatedBanks.map((bank) => (
          <article
            key={bank.id}
            className="bg-white border border-[#e2e8f0] rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden"
          >
            <div
              className={`p-5 flex flex-col justify-between gap-4 ${
                view === 'grid' ? 'min-h-[220px]' : ''
              }`}
            >
              <button
                className="w-full text-left flex items-start justify-between gap-3 group focus:outline-none"
                onClick={() => setOpen(open === bank.id ? null : bank.id)}
                aria-expanded={open === bank.id}
              >
                <div className="flex items-start gap-3.5 flex-1 min-w-0">
                  {bank.logo_url ? (
                    <img
                      className="w-12 h-12 object-contain rounded-lg p-1 bg-[#f8fafc] border border-[#e2e8f0] shrink-0"
                      src={bank.logo_url}
                      alt=""
                    />
                  ) : null}
                  <div className="flex-1 min-w-0">
                    <b className="text-lg font-serif font-bold text-[#102a43] group-hover:text-[#c69b46] transition-colors block truncate">
                      {bank.title}
                    </b>
                    <small className="text-xs text-[#64748b] block mt-0.5">
                      {bank.institution_type ? `${bank.institution_type} · ` : ''}
                      {bank.last_updated
                        ? `Last updated ${new Date(`${bank.last_updated}T00:00:00`).toLocaleDateString('en-US')}`
                        : 'Update date not entered'}
                    </small>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2 shrink-0">
                  <strong className="text-xl font-bold text-[#64748b] group-hover:text-[#102a43]">
                    {open === bank.id ? '−' : '+'}
                  </strong>
                </div>
              </button>

              <div className="flex items-center justify-between gap-3 pt-2 border-t border-[#f1f5f9]">
                <i
                  className={`not-italic px-3 py-1 text-xs font-bold rounded-full border ${getStatusBadgeStyle(
                    bank.status,
                  )}`}
                >
                  {labels[bank.status] || bank.status}
                </i>
                {Boolean(bank.has_full_report) ? (
                  <button
                    className="px-3.5 py-1.5 text-xs font-bold text-white bg-[#102a43] hover:bg-[#1a385c] rounded-lg transition-colors shadow-sm"
                    onClick={() => setUnlock(bank)}
                  >
                    View Full Report <span className="text-[#c69b46]">— $15</span>
                  </button>
                ) : (
                  <button
                    className="px-3 py-1.5 text-xs font-medium text-[#94a3b8] bg-[#f8fafc] rounded-lg border border-[#e2e8f0] cursor-not-allowed"
                    disabled
                  >
                    Full report not available yet
                  </button>
                )}
              </div>
            </div>

            {open === bank.id && (
              <div className="p-5 bg-[#f8fafc] border-t border-[#e2e8f0] text-sm text-[#334155] space-y-4">
                {bank.last_updated && (
                  <p className="text-xs text-[#64748b]">
                    <b className="font-semibold text-[#102a43]">Last updated:</b>{' '}
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
                <p className="leading-relaxed">
                  {bank.summary ||
                    'The current directory lists this institution under the status shown above. Contact Kav Haribis for details before relying on the listing.'}
                </p>
                {bank.comment && (
                  <div className="p-3.5 bg-white border border-[#cbd5e1] rounded-lg text-xs">
                    <b className="text-[#102a43] block mb-1">Kav Haribis comment</b>
                    <p className="text-[#475569] leading-relaxed">{bank.comment}</p>
                  </div>
                )}
                {bank.website && (
                  <a
                    className="inline-flex items-center text-xs font-bold text-[#c69b46] hover:underline"
                    href={bank.website}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Institution website ↗
                  </a>
                )}
                <p className="p-3 text-xs text-[#876622] bg-[#fff7e5] border border-[#f3e4bc] rounded-lg">
                  Information may change. Confirm the current status with the
                  Bais Horaah before making a financial decision.
                </p>
              </div>
            )}
          </article>
        ))}
      </div>

      {/* Pagination */}
      {filtered.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8 p-4 sm:p-5 bg-[#f7f3ea] border border-[#e2dacd] rounded-xl">
          <div className="text-xs sm:text-sm text-[#556673]">
            Showing{' '}
            <b className="text-[#102a43]">
              {perPage === 'all'
                ? `1–${filtered.length}`
                : `${startIndex + 1}–${Math.min(startIndex + perPage, filtered.length)}`}
            </b>{' '}
            of <b className="text-[#102a43]">{filtered.length}</b> banks
          </div>
          {perPage !== 'all' && totalPages > 1 && (
            <div className="flex items-center gap-2">
              <button
                className="px-3.5 py-1.5 border border-[#c8d3d9] rounded-lg bg-white text-[#102a43] text-xs font-bold hover:bg-[#102a43] hover:border-[#102a43] hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={activePage === 1}
                aria-label="Previous page"
              >
                ← Prev
              </button>

              <div className="flex items-center gap-1">
                {pageNumbers.map((page, idx) =>
                  typeof page === 'number' ? (
                    <button
                      key={page}
                      className={`min-w-[34px] h-[34px] px-2 border rounded-lg text-xs font-bold transition-colors ${
                        activePage === page
                          ? 'bg-[#102a43] border-[#102a43] text-white'
                          : 'bg-white border-[#d4dedf] text-[#4a5c68] hover:border-[#102a43] hover:text-[#102a43]'
                      }`}
                      onClick={() => setCurrentPage(page)}
                    >
                      {page}
                    </button>
                  ) : (
                    <span
                      key={`ellipsis-${idx}`}
                      className="px-1.5 text-[#8c9da8] font-bold"
                    >
                      …
                    </span>
                  ),
                )}
              </div>

              <button
                className="px-3.5 py-1.5 border border-[#c8d3d9] rounded-lg bg-white text-[#102a43] text-xs font-bold hover:bg-[#102a43] hover:border-[#102a43] hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
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

