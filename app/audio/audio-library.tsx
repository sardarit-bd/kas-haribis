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
    window.setTimeout(
      () =>
        libraryRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        }),
      50,
    );
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
    <>
      <section
        className="audioSeriesPicker"
        ref={pickerRef}
        aria-labelledby="choose-a-series"
      >
        <div className="audioSectionHeading">
          <span>LISTEN &amp; LEARN</span>
          <h2 id="choose-a-series">Choose an Audio Collection</h2>
          <p>
            Choose a 5-minute language series, General Shiurim, or the Video
            Shiurim collection.
          </p>
        </div>
        <div className="audioSeriesCards">
          {seriesDetails.map((item, index) => {
            const count = audios.filter(
              (audio) => audio.series === item.value,
            ).length;
            return (
              <button
                key={item.value}
                className={`audioSeriesCard ${series === item.value ? 'selected' : ''}`}
                onClick={() => chooseSeries(item.value)}
              >
                <span className="seriesNumber">0{index + 1}</span>
                <span
                  className="seriesMonogram"
                  dir={index === 0 ? 'ltr' : 'rtl'}
                >
                  {item.monogram}
                </span>
                <small>
                  {item.language} · {count} {count === 1 ? 'SHIUR' : 'SHIURIM'}
                </small>
                <strong>{item.title}</strong>
                <span
                  className="seriesDescription"
                  dir={index === 1 || index === 2 ? 'rtl' : 'ltr'}
                >
                  {item.description}
                </span>
                <span className="seriesAction">
                  Explore series <b>→</b>
                </span>
              </button>
            );
          })}
        </div>
      </section>

      <section className="audioLibraryModern" ref={libraryRef}>
        <button
          className="backToSeries"
          type="button"
          onClick={() =>
            pickerRef.current?.scrollIntoView({
              behavior: 'smooth',
              block: 'start',
            })
          }
        >
          ← Back to all series
        </button>
        <div className="audioLibraryTitle">
          <div>
            <span>NOW BROWSING</span>
            <h2>{selected.title}</h2>
          </div>
          <b>{filtered.length} recordings</b>
        </div>
        <div className="audioSearchRow">
          <div className="audioSearch">
            <span aria-hidden="true">⌕</span>
            <input
              value={query}
              onChange={(event) => handleQueryChange(event.target.value)}
              placeholder="Search this series by topic…"
              aria-label="Search this audio series"
            />
          </div>
          <label className="audioPerPageSelect">
            Record per page
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
              <option value={15}>15 per page</option>
              <option value={25}>25 per page</option>
              <option value={50}>50 per page</option>
              <option value="all">All</option>
            </select>
          </label>
        </div>
        {filtered.length ? (
          <>
            <div className="audioGridModern">
              {paginatedAudios.map((item, index) => {
                const globalIndex = startIndex + index;
                return (
                  <article key={item.id}>
                    <div className="audioTrackNumber">
                      {String(globalIndex + 1).padStart(2, '0')}
                    </div>
                    <div className="audioTrackBody">
                      <small>
                        {item.series === 'general-shiurim'
                          ? 'GENERAL SHIURIM'
                          : item.series === 'video-shiurim'
                            ? 'VIDEO SHIURIM'
                            : `5-MINUTE ${seriesLabels[item.series] || 'AUDIO'} SERIES`}
                      </small>
                      <h3>{item.title}</h3>
                      {item.series === 'video-shiurim' ? (
                        <VideoPlayer url={item.audioUrl} title={item.title} />
                      ) : (
                        <audio controls preload="none" src={item.audioUrl}>
                          Your browser does not support audio playback.
                        </audio>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
            <div className="directoryPagination">
              <div className="paginationInfo">
                Showing{' '}
                <b>
                  {perPage === 'all'
                    ? `1–${filtered.length}`
                    : `${startIndex + 1}–${Math.min(startIndex + perPage, filtered.length)}`}
                </b>{' '}
                of <b>{filtered.length}</b> recordings
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
          </>
        ) : (
          <div className="audioEmpty">
            <span>♫</span>
            <h3>This series is ready for recordings</h3>
            <p>
              New {selected.language} shiurim will appear here as soon as they
              are published from the Audio Administrator.
            </p>
          </div>
        )}
      </section>
    </>
  );
}

function VideoPlayer({ url, title }: { url: string; title: string }) {
  const youtube = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([A-Za-z0-9_-]{6,})/,
  );
  if (youtube)
    return (
      <iframe
        className="videoShiurPlayer"
        src={`https://www.youtube.com/embed/${youtube[1]}`}
        title={title}
        loading="lazy"
        allow="accelerometer; autoplay; encrypted-media; picture-in-picture"
        allowFullScreen
      />
    );
  return (
    <video className="videoShiurPlayer" controls preload="metadata" src={url}>
      Your browser does not support video playback.
    </video>
  );
}
