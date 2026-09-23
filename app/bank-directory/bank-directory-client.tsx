'use client';
import { AnimatePresence, motion } from 'framer-motion';
import { useMemo, useState } from 'react';
import BankReportUnlock from './bank-report-unlock';
import BankResearchForm from './bank-research-form';

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
  const [unlock, setUnlock] = useState<Bank | null>(null);
  const [detailBank, setDetailBank] = useState<Bank | null>(null);
  const [requestUpdateBank, setRequestUpdateBank] = useState<Bank | null>(null);
  const [perPage, setPerPage] = useState<number | 'all'>(12);
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');

  const filtered = useMemo(
    () =>
      banks.filter(
        (bank) =>
          (status === 'all' || bank.status === status) &&
          (bank.title + ' ' + bank.comment + ' ' + bank.summary)
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
        return 'bg-[#38a169] text-white border-[#2f855a]';
      case 'only-kosher-with-iska':
      case 'case-by-case':
        return 'bg-[#d69e2e] text-white border-[#b7791f]';
      case 'questionable':
      case 'no-good':
        return 'bg-[#e53e3e] text-white border-[#c53030]';
      default:
        return 'bg-[#4a5568] text-white border-[#2d3748]';
    }
  };


  const statusCards = [
    {
      key: 'mehudar',
      title: 'Mehudar',
      desc: 'No Jewish CEO or Board Member.',
      bg: 'bg-[#3b52c1] hover:bg-[#3144a5] text-white',
    },
    {
      key: 'kosher',
      title: 'Kosher',
      desc: 'No Jewish shareholder who seems to have any opinion based on his stock ownership.',
      bg: 'bg-[#38a169] hover:bg-[#2f855a] text-white',
    },
    {
      key: 'only-kosher-with-iska',
      title: 'Kosher Only With Iska',
      desc: 'Permitted only with a valid heter iska.',
      bg: 'bg-[#f59e0b] hover:bg-[#d97706] text-white',
    },
    {
      key: 'case-by-case',
      title: 'Case by Case',
      desc: 'Requires individual review or specific circumstances.',
      bg: 'bg-[#d69e2e] hover:bg-[#b7791f] text-white',
    },
    {
      key: 'questionable',
      title: 'Questionable',
      desc: 'We have the info but there is a point that needs clarification.',
      bg: 'bg-[#facc15] hover:bg-[#eab308] text-[#102a43]',
    },
    {
      key: 'no-good',
      title: 'Not recommended',
      desc: 'Halachically problematic.',
      bg: 'bg-[#e53e3e] hover:bg-[#c53030] text-white',
    },
    {
      key: 'lack-of-information',
      title: 'Lack of Information',
      desc: 'Insufficient data to make a determination.',
      bg: 'bg-[#718096] hover:bg-[#4a5568] text-white',
    },
  ];

  return (
    <section className="container px-4 sm:px-8 py-10 md:py-14">

      {/* 7 Status Cards Grid */}
      <div className="mb-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 container justify-center">
          {statusCards.map((card, idx) => {
            const isSelected = status === card.key;
            return (
              <motion.button
                key={card.key}
                type="button"
                onClick={() => handleStatusChange(isSelected ? 'all' : card.key)}
                initial={{ opacity: 0, scale: 0.9, y: 15 }}
                whileInView={{ opacity: 1, scale: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.25, ease: 'easeOut', delay: idx * 0.05 }}
                whileHover={{ scale: 1.03, y: -2 }}
                whileTap={{ scale: 0.98 }}
                className={`p-5 text-center transition-all cursor-pointer flex flex-col justify-center items-center shadow-sm relative overflow-hidden rounded-lg ${
                  card.bg
                } ${
                  isSelected
                    ? 'shadow-xl ring-2 ring-white/60'
                    : 'opacity-95 hover:opacity-100'
                }`}
              >
                <h3 className="text-lg sm:text-xl font-bold mb-1.5 leading-tight flex items-center justify-center gap-2">
                  {card.title}
                  {isSelected && (
                    <span className="text-[10px] uppercase tracking-wider bg-white text-[#102a43] px-2 py-0.5 rounded-full font-extrabold shadow-sm">
                      Active
                    </span>
                  )}
                </h3>
                <p className="text-xs sm:text-sm font-medium leading-snug opacity-90 max-w-xs">
                  {card.desc}
                </p>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Directory Tools */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[minmax(200px,1fr)_minmax(150px,0.7fr)_minmax(130px,0.6fr)_minmax(140px,0.5fr)] gap-4 items-end mb-8 bg-white p-4 sm:p-5 border border-slate-200/80 rounded-xl shadow-xs"
      >
        <label className="flex flex-col gap-1.5 text-sm font-semibold text-[#102a43]">
          Search financial institutions within {filtered.length} Bank List
          <input
            value={query}
            onChange={(event) => handleQueryChange(event.target.value)}
            placeholder="Bank or lender name…"
            className="h-[43px] px-3.5 bg-white border border-[#cbd5da] rounded-lg text-sm text-[#102a43] font-normal normal-case focus:outline-none focus:ring-2 focus:ring-[#102a43]/20 focus:border-[#102a43]"
          />
        </label>
        <label className="flex flex-col gap-1.5 text-sm font-semibold text-[#102a43]">
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
        <label className="flex flex-col gap-1.5 text-sm font-semibold text-[#102a43]">
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
            <option value={12}>12 per page</option>
            <option value={24}>24 per page</option>
            <option value={48}>48 per page</option>
            <option value="all">All</option>
          </select>
        </label>
        <div className="flex flex-col gap-1.5 text-sm font-semibold text-[#102a43]">
          View Mode
          <div className="flex items-center h-[43px] border border-[#cbd5da] rounded-lg p-1 bg-slate-50">
            <button
              type="button"
              onClick={() => setViewMode('list')}
              className={`flex-1 h-full flex items-center justify-center gap-1.5 px-3 rounded text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'list'
                  ? 'bg-[#102a43] text-white shadow-sm'
                  : 'text-slate-600 hover:text-[#102a43]'
              }`}
              title="List View"
              aria-label="List View"
            >
              <svg className="w-4 h-4 fill-current shrink-0" viewBox="0 0 24 24">
                <path d="M4 6h16v2H4zm0 5h16v2H4zm0 5h16v2H4z"/>
              </svg>
              List
            </button>
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`flex-1 h-full flex items-center justify-center gap-1.5 px-3 rounded text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-[#102a43] text-white shadow-sm'
                  : 'text-slate-600 hover:text-[#102a43]'
              }`}
              title="Grid View"
              aria-label="Grid View"
            >
              <svg className="w-4 h-4 fill-current shrink-0" viewBox="0 0 24 24">
                <path d="M4 4h7v7H4zm9 0h7v7h-7zm0 9h7v7h-7zm-9 0h7v7H4z"/>
              </svg>
              Grid
            </button>
          </div>
        </div>
      </motion.div>

      {/* Directory Cards (Grid / List View) */}
      {filtered.length === 0 ? (
        <motion.p
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-6 text-center text-sm font-semibold text-[#876622] bg-[#fff7e5] border border-[#f3e4bc] rounded-lg"
        >
          No banks match this search. Clear the search or choose All statuses.
        </motion.p>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
          {paginatedBanks.map((bank, idx) => (
            <motion.article
              key={bank.id}
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              whileInView={{ opacity: 1, scale: 1, y: 0 }}
              viewport={{ once: true, margin: '-30px' }}
              transition={{ duration: 0.4, ease:"easeInOut", delay: (idx % 4) * 0.06 }}
              whileHover={{ y: -6 }}
              className="bg-white border border-slate-200 p-5 transition-all flex flex-col justify-between h-full rounded-xl shadow-xs hover:shadow-md"
            >
              <div className="w-full">
                {/* Bank Logo Container with Status Badge Overlay */}
                <div className="relative w-full h-40 flex items-center justify-center mb-7 overflow-hidden rounded-lg bg-slate-50/50 p-2">
                  {/* Status Badge Overlap */}
                  <span
                    className={`absolute top-2 right-2 z-10 px-2.5 py-0.5 text-xs font-bold text-white rounded-lg shadow-xs ${getStatusBadgeStyle(
                      bank.status,
                    )}`}
                  >
                    {labels[bank.status] || bank.status}
                  </span>

                  {Boolean(bank.has_full_report) && (
                    <span className="absolute top-2 left-2 z-10 text-[10px] font-extrabold uppercase px-2 py-0.5 bg-amber-100 text-amber-900 border border-amber-300 rounded-sm">
                      $15 Report
                    </span>
                  )}

                  {bank.logo_url ? (
                    <motion.img
                      whileHover={{ scale: 1.05 }}
                      transition={{ duration: 0.3 }}
                      className="max-h-full max-w-full object-contain w-full h-full"
                      src={bank.logo_url}
                      alt={bank.title}
                    />
                  ) : (
                    <div className="w-14 h-14 flex items-center justify-center rounded-xl bg-[#102a43] text-white font-bold text-xl">
                      {bank.title.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>

                {/* Last Updated Date */}
                <p className="text-xs sm:text-sm font-semibold text-slate-800/80 mb-1">
                  {bank.last_updated
                    ? new Date(`${bank.last_updated}T00:00:00`).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })
                    : 'Date not specified'}
                </p>

                {/* Title & Institution Type */}
                <h3 className="text-base sm:text-xl py-3 font-serif font-bold text-[#102a43] leading-snug mb-1">
                  {bank.title}
                </h3>
                {bank.institution_type && (
                  <p className="text-xs text-slate-500 font-medium mb-3">
                    {bank.institution_type}
                  </p>
                )}

                {/* Summary description */}
                <p className="text-md text-slate-500 line-clamp-2 mb-4">
                  {bank.summary || bank.comment || 'The current directory lists this institution under the status shown above.'}
                </p>
              </div>

              {/* Bottom Buttons */}
              <div className="grid grid-cols-2 gap-2.5 pt-3 w-full">
                <button
                  type="button"
                  onClick={() => setDetailBank(bank)}
                  className="w-full py-1.5 px-1 bg-[#102a43] hover:bg-[#1a385c] text-white text-xs font-bold transition-colors text-center cursor-pointer rounded-md"
                >
                  Full Report
                </button>
                <button
                  type="button"
                  onClick={() => setRequestUpdateBank(bank)}
                  className="w-full py-1.5 px-1 bg-[#102a43] hover:bg-[#1a385c] text-white text-xs font-medium transition-colors text-center cursor-pointer rounded-md"
                >
                  Request Update
                </button>
              </div>
            </motion.article>
          ))}
        </div>
      ) : (
        /* List View */
        <div className="flex flex-col gap-4">
          {paginatedBanks.map((bank, idx) => (
            <motion.article
              key={bank.id}
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              whileInView={{ opacity: 1, scale: 1, y: 0 }}
              viewport={{ once: true, margin: '-20px' }}
              transition={{ duration: 0.35, delay: (idx % 6) * 0.04 }}
              whileHover={{ y: -3 }}
              className="bg-white border border-slate-200 p-4 sm:p-5 transition-all flex flex-col md:flex-row md:items-center justify-between gap-6 hover:shadow-md rounded-xl"
            >
              {/* Left: Logo container */}
              <div className="w-full md:w-48 h-32 md:h-36 shrink-0 flex items-center justify-center p-3 bg-slate-50 border border-slate-100 rounded-lg relative overflow-hidden">
                {bank.logo_url ? (
                  <motion.img
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.3 }}
                    className="max-h-full max-w-full object-contain"
                    src={bank.logo_url}
                    alt={bank.title}
                  />
                ) : (
                  <div className="w-12 h-12 flex items-center justify-center rounded-lg bg-[#102a43] text-white font-bold text-lg">
                    {bank.title.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>

              {/* Middle: Details */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span
                    className={`px-2.5 py-0.5 text-xs font-bold text-white rounded-lg border ${getStatusBadgeStyle(
                      bank.status,
                    )}`}
                  >
                    {labels[bank.status] || bank.status}
                  </span>

                  {Boolean(bank.has_full_report) && (
                    <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 bg-amber-100 text-amber-900 border border-amber-300 rounded-sm">
                      $15 Report
                    </span>
                  )}

                  <span className="text-xs text-slate-500 font-medium ml-auto sm:ml-0">
                    Updated:{' '}
                    {bank.last_updated
                      ? new Date(`${bank.last_updated}T00:00:00`).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })
                      : 'Date not specified'}
                  </span>
                </div>

                <h3 className="text-lg sm:text-xl font-serif font-bold text-[#102a43] leading-snug mb-1">
                  {bank.title}
                </h3>

                {bank.institution_type && (
                  <p className="text-xs text-slate-500 font-medium mb-2">
                    {bank.institution_type}
                  </p>
                )}

                <p className="text-sm text-slate-600 line-clamp-3">
                  {bank.summary || bank.comment || 'The current directory lists this institution under the status shown above.'}
                </p>
              </div>

              {/* Right: Action Buttons */}
              <div className="w-full md:w-44 shrink-0 flex flex-col sm:flex-row md:flex-col gap-2.5 justify-center pt-2 md:pt-0 border-t md:border-t-0 border-slate-100">
                <button
                  type="button"
                  onClick={() => setDetailBank(bank)}
                  className="w-full py-2 px-3 bg-[#102a43] hover:bg-[#1a385c] text-white text-xs font-bold transition-colors text-center cursor-pointer rounded-md"
                >
                  Full Report
                </button>
                <button
                  type="button"
                  onClick={() => setRequestUpdateBank(bank)}
                  className="w-full py-2 px-3 bg-[#102a43] hover:bg-[#1a385c] text-white text-xs font-medium transition-colors text-center cursor-pointer rounded-md"
                >
                  Request Update
                </button>
              </div>
            </motion.article>
          ))}
        </div>
      )}

      {/* Pagination */}
      {filtered.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8 p-4 sm:p-5 bg-white rounded-xl border border-slate-200/80">
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

      {/* Bottom CTA Section */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 25 }}
        whileInView={{ opacity: 1, scale: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="mt-16 sm:mt-12 -mx-4 sm:-mx-8"
      >
        <section className="bg-gray-200">
          <section className="container max-w-[1440px] mx-auto px-4 sm:px-8">
            <div className="bg-[#102a43] text-white p-8 sm:p-12 md:p-[50px] flex flex-col items-center justify-between text-center gap-8 md:gap-[50px]">
              <div className="max-w-[880px] mx-auto">
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-semibold text-white leading-tight mb-4 tracking-tight">
                  Don’t see what you’re looking for?
                </h2>
                <p className="text-slate-200 text-base sm:text-lg leading-relaxed font-normal">
                  Have info on any bank or lender that may be useful?
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-5">
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() =>
                    setRequestUpdateBank({
                      id: 'general',
                      title: 'Bank / Lender Directory Inquiry',
                      status: 'all',
                      summary: '',
                      comment: '',
                      last_updated: '',
                      has_full_report: 0,
                      source: '',
                      institution_type: '',
                      website: '',
                      logo_url: '',
                    })
                  }
                  style={{ color: 'white' }}
                  className="inline-flex items-center gap-2.5 px-6 py-3.5 pBG text-white font-semibold text-sm sm:text-base shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer"
                >
                  <span>Please Reach Out</span>
                </motion.button>
              </div>
            </div>
          </section>
        </section>
      </motion.div>

      {/* Modal 1: Bank Full Details / Full Report Modal */}
      <AnimatePresence>
        {detailBank && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 15 }}
              transition={{ duration: 0.25 }}
              className="relative bg-white rounded-2xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto"
            >
              <button
                onClick={() => setDetailBank(null)}
                className="absolute top-4 right-4 w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center font-bold text-lg transition-colors"
                aria-label="Close modal"
              >
                ✕
              </button>

              {/* Modal Header */}
              <div className="flex items-start gap-4 pr-8 border-b border-slate-100 pb-5">
                <div className="w-28 h-28 shrink-0 flex items-center justify-center bg-[#f8fafc] border border-slate-200 rounded-xl overflow-hidden p-2">
                  {detailBank.logo_url ? (
                    <img
                      className="max-h-full max-w-full object-contain"
                      src={detailBank.logo_url}
                      alt={detailBank.title}
                    />
                  ) : (
                    <div className="w-14 h-14 flex items-center justify-center rounded-xl bg-[#102a43] text-white font-bold text-xl">
                      {detailBank.title.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span
                      className={`px-2.5 py-0.5 text-xs font-bold rounded-md border ${getStatusBadgeStyle(
                        detailBank.status,
                      )}`}
                    >
                      {labels[detailBank.status] || detailBank.status}
                    </span>
                    {detailBank.last_updated && (
                      <span className="text-xs text-slate-500 font-medium">
                        Last updated:{' '}
                        {new Date(
                          `${detailBank.last_updated}T00:00:00`,
                        ).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </span>
                    )}
                  </div>
                  <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#102a43]">
                    {detailBank.title}
                  </h2>
                  {detailBank.institution_type && (
                    <p className="text-xs text-slate-500 font-medium mt-0.5">
                      {detailBank.institution_type}
                    </p>
                  )}
                </div>
              </div>

              {/* Modal Content */}
              <div className="space-y-4 text-sm text-slate-700 leading-relaxed">
                {detailBank.summary && (
                  <div>
                    <h4 className="font-semibold text-[#102a43] text-xs uppercase tracking-wider mb-1.5">
                      Research Summary
                    </h4>
                    <p className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-slate-700 leading-relaxed">
                      {detailBank.summary}
                    </p>
                  </div>
                )}

                {detailBank.comment && (
                  <div>
                    <h4 className="font-semibold text-[#102a43] text-xs uppercase tracking-wider mb-1.5">
                      Kav Haribis Comment
                    </h4>
                    <p className="bg-amber-50/70 p-4 rounded-xl border border-amber-200/60 text-amber-900 leading-relaxed">
                      {detailBank.comment}
                    </p>
                  </div>
                )}

                {detailBank.website && (
                  <div>
                    <a
                      className="inline-flex items-center gap-1 text-xs font-bold text-[#c69b46] hover:underline"
                      href={detailBank.website}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Visit Institution Website ↗
                    </a>
                  </div>
                )}

                <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900">
                  ⚠️ Information may change. Confirm current status with the Bais
                  Horaah before making financial decisions.
                </div>

                {/* Protected Full Report */}
                {Boolean(detailBank.has_full_report) ? (
                  <div className="pt-4 border-t border-slate-100 flex flex-col items-center justify-center p-6 bg-[#102a43] rounded-2xl text-white text-center space-y-3">
                    <div>
                      <h3 className="font-serif font-bold text-lg text-white">
                        Protected Full Report ($15)
                      </h3>
                      <p className="text-xs text-slate-300">
                        Unlock the complete in-depth legal and halachic research
                        report for this institution.
                      </p>
                    </div>
                    <button
                      className="px-6 py-2.5 bg-[#c69b46] hover:bg-[#b0883b] text-white text-xs font-bold rounded-xl transition-colors shadow-md cursor-pointer"
                      onClick={() => {
                        const target = detailBank;
                        setDetailBank(null);
                        setUnlock(target);
                      }}
                    >
                      Unlock Full Report — $15
                    </button>
                  </div>
                ) : (
                  <div className="pt-2 text-xs text-slate-400 text-center">
                    Full detailed report not uploaded for this institution yet.
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal 2: Request Update Modal */}
      <AnimatePresence>
        {requestUpdateBank && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 15 }}
              transition={{ duration: 0.25 }}
              className="relative bg-white max-w-5xl w-full p-5 shadow-2xl max-h-[90vh] overflow-y-auto rounded-xl"
            >
              <button
                onClick={() => setRequestUpdateBank(null)}
                className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center font-bold text-lg transition-colors"
                aria-label="Close modal"
              >
                ✕
              </button>

              <div className="mb-2 pr-8 border-b pb-3 border-gray-200">
                <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#102a43]">
                  Request Update for {requestUpdateBank.title}
                </h2>
              </div>

              <BankResearchForm defaultBankName={requestUpdateBank.title} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Unlock Modal */}
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


