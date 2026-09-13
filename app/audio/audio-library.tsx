'use client';

import { useMemo, useRef, useState } from 'react';

type Audio = { id: number; title: string; series: string; audioUrl: string };

const seriesDetails = [
  {
    value: 'english-series',
    language: 'English',
    title: '5-Minute English Series',
    description:
      'Clear, practical Hilchos Ribbis guidance in short five-minute lessons.',
    monogram: 'EN',
  },
  {
    value: 'hebrew-series',
    language: 'עברית',
    title: '5-Minute Hebrew Series',
    description: 'שיעורים קצרים ובהירים בהלכות ריבית לחיי היום־יום.',
    monogram: 'עב',
  },
  {
    value: 'yiddish-series',
    language: 'אידיש',
    title: '5-Minute Yiddish Series',
    description: 'קורצע און קלארע שיעורים איבער הלכות ריבית למעשה.',
    monogram: 'אי',
  },
  {
    value: 'general-shiurim',
    language: 'General',
    title: 'General Shiurim',
    description:
      'Longer shiurim, special presentations, interviews, and standalone Torah discussions.',
    monogram: 'שי',
  },
  {
    value: 'video-shiurim',
    language: 'Video',
    title: 'Video Shiurim',
    description:
      'Watch visual shiurim, presentations, and special Kav Haribis programs.',
    monogram: '▶',
  },
] as const;

const seriesLabels = Object.fromEntries(
  seriesDetails.map((item) => [item.value, item.language]),
);

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

export default function AudioLibrary({ audios }: { audios: Audio[] }) {
  const [query, setQuery] = useState('');
  const [series, setSeries] = useState('english-series');
  const [perPage, setPerPage] = useState<number | 'all'>(15);
  const [currentPage, setCurrentPage] = useState(1);
  const pickerRef = useRef<HTMLElement>(null);
  const libraryRef = useRef<HTMLElement>(null);

  const filtered = useMemo(
    () =>
      audios.filter(
        (item) =>
          item.series === series &&
          item.title.toLowerCase().includes(query.toLowerCase()),
      ),
    [audios, query, series],
  );

  const totalPages = useMemo(() => {
    if (perPage === 'all') return 1;
    return Math.max(1, Math.ceil(filtered.length / perPage));
  }, [filtered.length, perPage]);

  const activePage = Math.min(currentPage, totalPages);

  const paginatedAudios = useMemo(() => {
    if (perPage === 'all') return filtered;
    const start = (activePage - 1) * perPage;
    return filtered.slice(start, start + perPage);
  }, [filtered, activePage, perPage]);

  function chooseSeries(value: string) {
    setSeries(value);
    setQuery('');
    setCurrentPage(1);
  }

  const handleQueryChange = (val: string) => {
    setQuery(val);
    setCurrentPage(1);
  };

  const handlePerPageChange = (val: number | 'all') => {
    setPerPage(val);
    setCurrentPage(1);
  };

  const selected =
    seriesDetails.find((item) => item.value === series) ?? seriesDetails[0];

  const pageNumbers = getPageNumbers(activePage, totalPages);
  const startIndex = perPage === 'all' ? 0 : (activePage - 1) * perPage;

  return (
    <section className="w-full bg-[#f7f3ea] py-10 sm:py-14" ref={libraryRef}>
      <div className="container max-w-[1440px] mx-auto px-4 sm:px-8">
        <div className="text-center mb-8 hidden">
          <div className="mx-auto text-center mb-6">
            <span className="text-[#a37828] text-xs font-bold tracking-widest uppercase block mb-1">NOW BROWSING</span>
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-[#102a43]">{selected.title}</h2>
          </div>
        </div>

        {/* Filter controls bar */}
        <div className="bg-white p-4 sm:p-6 mb-8 flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
          <label className="flex-1 text-sm font-bold text-gray-600 flex flex-col gap-1.5">
            Select Collection ({filtered.length} {filtered.length === 1 ? 'item' : 'items'})
            <select
              className="w-full bg-[#f8fafc] focus:bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-800 text-sm font-normal focus:outline-none focus:ring-2 focus:ring-[#102a43]/15 focus:border-[#102a43] cursor-pointer transition-all"
              value={series}
              onChange={(event) => chooseSeries(event.target.value)}
            >
              {seriesDetails.map((item) => {
                const count = audios.filter(
                  (audio) => audio.series === item.value,
                ).length;
                return (
                  <option value={item.value} key={item.value}>
                    {item.title} ({count})
                  </option>
                );
              })}
            </select>
          </label>

          <div className="flex-1 relative flex flex-col justify-end">
            <span className="absolute left-3.5 bottom-2.5 text-slate-400 text-base pointer-events-none" aria-hidden="true">⌕</span>
            <input
              className="w-full bg-[#f8fafc] focus:bg-white border border-slate-300 rounded-xl pl-9 pr-3.5 py-2.5 text-slate-800 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-[#102a43]/15 focus:border-[#102a43] transition-all"
              value={query}
              onChange={(event) => handleQueryChange(event.target.value)}
              placeholder="Search by topic…"
              aria-label="Search audio recordings"
            />
          </div>

          <label className="w-full md:w-48 text-sm font-bold text-gray-600 flex flex-col gap-1.5">
            Record per page
            <select
              className="w-full bg-[#f8fafc] focus:bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-800 text-sm font-normal focus:outline-none focus:ring-2 focus:ring-[#102a43]/15 focus:border-[#102a43] cursor-pointer transition-all"
              value={perPage}
              onChange={(event) => {
                const val =
                  event.target.value === 'all'
                    ? 'all'
                    : Number(event.target.value);
                handlePerPageChange(val);
              }}
            >
              <option value={15}>15 per page</option>
              <option value={25}>25 per page</option>
              <option value={50}>50 per page</option>
              <option value="all">All</option>
            </select>
          </label>
        </div>

        {filtered.length ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
              {paginatedAudios.map((item, index) => {
                const globalIndex = startIndex + index;
                return (
                  <article key={item.id} className="bg-white p-5 hover:border-slate-300 hover:shadow-md transition-all flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-[#f8fafc] border border-slate-200 text-[#102a43] font-mono text-sm font-bold flex items-center justify-center shrink-0 shadow-sm">
                      {String(globalIndex + 1).padStart(2, '0')}
                    </div>
                    <div className="flex-1 min-w-0">
                      <small className="text-gray-500 text-[12px] font-normal block mb-1 hidden">
                        {item.series === 'general-shiurim'
                          ? 'GENERAL SHIURIM'
                          : item.series === 'video-shiurim'
                            ? 'VIDEO SHIURIM'
                            : `5-MINUTE ${seriesLabels[item.series] || 'AUDIO'} SERIES`}
                      </small>
                      <h3 className="text-2xl font-meduim text-[#102a43] mb-3 leading-snug truncate" title={item.title}>{item.title}</h3>
                      {item.series === 'video-shiurim' ? (
                        <VideoPlayer url={item.audioUrl} title={item.title} />
                      ) : (
                        <audio controls preload="none" src={item.audioUrl} className="w-full h-10 rounded-lg focus:outline-none">
                          Your browser does not support audio playback.
                        </audio>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 text-sm text-slate-600">
              <div className="text-slate-600">
                Showing{' '}
                <b className="text-slate-900 font-semibold">
                  {perPage === 'all'
                    ? `1–${filtered.length}`
                    : `${startIndex + 1}–${Math.min(startIndex + perPage, filtered.length)}`}
                </b>{' '}
                of <b className="text-slate-900 font-semibold">{filtered.length}</b> recordings
              </div>
              {perPage !== 'all' && totalPages > 1 && (
                <div className="flex items-center gap-2">
                  <button
                    className="px-3.5 py-1.5 rounded-xl border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed text-xs font-semibold transition shadow-sm"
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
                          className={`w-8 h-8 rounded-xl text-xs font-bold transition flex items-center justify-center ${activePage === page ? 'bg-[#c69b46] text-white shadow-sm' : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-50'}`}
                          onClick={() => setCurrentPage(page)}
                        >
                          {page}
                        </button>
                      ) : (
                        <span
                          key={`ellipsis-${idx}`}
                          className="px-1 text-slate-400"
                        >
                          …
                        </span>
                      ),
                    )}
                  </div>

                  <button
                    className="px-3.5 py-1.5 rounded-xl border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed text-xs font-semibold transition shadow-sm"
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
          </>
        ) : (
          <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center my-8 shadow-sm">
            <span className="text-4xl text-[#a37828] block mb-3">♫</span>
            <h3 className="text-xl font-serif font-bold text-[#102a43] mb-2">This series is ready for recordings</h3>
            <p className="text-slate-600 text-sm max-w-md mx-auto">
              New {selected.language} shiurim will appear here as soon as they
              are published from the Audio Administrator.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}

function VideoPlayer({ url, title }: { url: string; title: string }) {
  const youtube = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([A-Za-z0-9_-]{6,})/,
  );
  if (youtube)
    return (
      <iframe
        className="w-full aspect-video rounded-lg border border-slate-700"
        src={`https://www.youtube.com/embed/${youtube[1]}`}
        title={title}
        loading="lazy"
        allow="accelerometer; autoplay; encrypted-media; picture-in-picture"
        allowFullScreen
      />
    );
  return (
    <video className="w-full aspect-video rounded-lg border border-slate-700 bg-black" controls preload="metadata" src={url}>
      Your browser does not support video playback.
    </video>
  );
}

