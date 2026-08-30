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

export default function AudioLibrary({ audios }: { audios: Audio[] }) {
  const [query, setQuery] = useState('');
  const [series, setSeries] = useState('english-series');
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

  function chooseSeries(value: string) {
    setSeries(value);
    setQuery('');
    window.setTimeout(
      () =>
        libraryRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        }),
      50,
    );
  }

  const selected =
    seriesDetails.find((item) => item.value === series) ?? seriesDetails[0];

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
        <div className="audioSearch">
          <span aria-hidden="true">⌕</span>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search this series by topic…"
            aria-label="Search this audio series"
          />
        </div>
        {filtered.length ? (
          <div className="audioGridModern">
            {filtered.map((item, index) => (
              <article key={item.id}>
                <div className="audioTrackNumber">
                  {String(index + 1).padStart(2, '0')}
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
            ))}
          </div>
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
