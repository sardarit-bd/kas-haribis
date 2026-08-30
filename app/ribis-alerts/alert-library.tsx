'use client';
import { useMemo, useState } from 'react';
type Alert = {
  id: string;
  title: string;
  alert_date: string;
  category: string;
  severity: string;
  alert_status: string;
  reviewed_by: string;
  expires_at: string;
  summary: string;
  full_details: string;
  action_label: string;
  action_url: string;
  featured: number;
  updated_at: string;
};
const action = (x: string) =>
  x?.startsWith('/') || /^https?:\/\//i.test(x || '') ? x : '';
export default function AlertLibrary({ items }: { items: Alert[] }) {
  const [query, setQuery] = useState(''),
    [category, setCategory] = useState('All'),
    [selected, setSelected] = useState<Alert | null>(null),
    [copied, setCopied] = useState('');
  const categories = [
      'All',
      ...Array.from(new Set(items.map((x) => x.category).filter(Boolean))),
    ],
    featured =
      items.find((x) => x.featured && x.alert_status !== 'Archived') ||
      items.find((x) => x.alert_status !== 'Archived'),
    filtered = useMemo(
      () =>
        items.filter(
          (x) =>
            (category === 'All' || x.category === category) &&
            (x.title + x.summary + x.full_details)
              .toLowerCase()
              .includes(query.toLowerCase()),
        ),
      [items, query, category],
    );
  async function copy(x: Alert) {
    const url = `${location.origin}${location.pathname}#alert-${x.id}`;
    await navigator.clipboard.writeText(url);
    setCopied(x.id);
    setTimeout(() => setCopied(''), 1800);
  }
  async function share(x: Alert) {
    const url = `${location.origin}${location.pathname}#alert-${x.id}`;
    if (navigator.share)
      await navigator.share({ title: x.title, text: x.summary, url });
    else await copy(x);
  }
  function printAlert(x: Alert) {
    setSelected(x);
    setTimeout(() => window.print(), 100);
  }
  return (
    <>
      <section className="modernAlertArea">
        {featured && (
          <article
            className={`featuredAlert severity-${featured.severity.toLowerCase()}`}
            id={`alert-${featured.id}`}
          >
            <div className="featuredAlertFlag">
              <span>!</span>
              <b>FEATURED ALERT</b>
            </div>
            <div>
              <div className="alertMeta">
                <time>
                  {new Date(
                    `${featured.alert_date}T00:00:00`,
                  ).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </time>
                <span>{featured.category}</span>
                <b>{featured.severity}</b>
              </div>
              <h2>{featured.title}</h2>
              <p>{featured.summary}</p>
              <div className="featuredActions">
                <button
                  className="primary"
                  onClick={() => setSelected(featured)}
                >
                  View Full Alert
                </button>
                <button onClick={() => share(featured)}>Share</button>
              </div>
              <small>
                Reviewed by {featured.reviewed_by || 'Kav Haribis'}
                {featured.updated_at
                  ? ` · Updated ${new Date(featured.updated_at).toLocaleDateString()}`
                  : ''}
              </small>
            </div>
          </article>
        )}
        <div className="alertTools">
          <label>
            <span>Search alerts</span>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search loans, banks, Heter Iska…"
            />
          </label>
          <div>
            {categories.map((x) => (
              <button
                className={category === x ? 'active' : ''}
                onClick={() => setCategory(x)}
                key={x}
              >
                {x}
              </button>
            ))}
          </div>
        </div>
        <div className="modernAlertGrid">
          {filtered.map((x) => (
            <article
              className={`alertCard severity-${x.severity.toLowerCase()} ${x.alert_status.toLowerCase()}`}
              key={x.id}
              id={`alert-${x.id}`}
            >
              <div className="alertCardHead">
                <span>!</span>
                <div>
                  <small>{x.category}</small>
                  <time>
                    {x.alert_date
                      ? new Date(`${x.alert_date}T00:00:00`).toLocaleDateString(
                          'en-US',
                          { year: 'numeric', month: 'short', day: 'numeric' },
                        )
                      : 'Current'}
                  </time>
                </div>
                <b>{x.alert_status || x.severity}</b>
              </div>
              <h3>{x.title}</h3>
              <p>{x.summary}</p>
              <div className="alertCardReview">
                Reviewed by <b>{x.reviewed_by || 'Kav Haribis'}</b>
                {x.updated_at && (
                  <span>
                    Updated {new Date(x.updated_at).toLocaleDateString()}
                  </span>
                )}
              </div>
              <div className="alertCardActions">
                <button className="primary" onClick={() => setSelected(x)}>
                  View Full Alert
                </button>
                <button title="Share" onClick={() => share(x)}>
                  Share
                </button>
                <button title="Copy link" onClick={() => copy(x)}>
                  {copied === x.id ? 'Copied' : 'Copy link'}
                </button>
                <button title="Print" onClick={() => printAlert(x)}>
                  Print
                </button>
              </div>
            </article>
          ))}
        </div>
        {!filtered.length && (
          <div className="alertNoResults">
            <h3>No matching alerts</h3>
            <p>Try another search or category.</p>
          </div>
        )}
      </section>
      {selected && (
        <div
          className="alertModal"
          role="dialog"
          aria-modal="true"
          aria-label={selected.title}
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setSelected(null);
          }}
        >
          <article>
            <button
              className="alertModalClose"
              onClick={() => setSelected(null)}
              aria-label="Close"
            >
              ×
            </button>
            <div className="alertMeta">
              <time>
                {selected.alert_date
                  ? new Date(
                      `${selected.alert_date}T00:00:00`,
                    ).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })
                  : 'Current alert'}
              </time>
              <span>{selected.category}</span>
              <b>{selected.severity}</b>
            </div>
            <h2>{selected.title}</h2>
            <p className="modalSummary">{selected.summary}</p>
            <div className="modalDetails">
              {selected.full_details || selected.summary}
            </div>
            <div className="modalReview">
              <b>Reviewed by {selected.reviewed_by || 'Kav Haribis'}</b>
              <span>Status: {selected.alert_status || 'Active'}</span>
              {selected.expires_at && (
                <span>
                  Review/expiration date:{' '}
                  {new Date(
                    `${selected.expires_at}T00:00:00`,
                  ).toLocaleDateString()}
                </span>
              )}
            </div>
            <div className="modalActions">
              {action(selected.action_url) && (
                <a className="primary" href={selected.action_url}>
                  {selected.action_label || 'Learn more'} →
                </a>
              )}
              <button onClick={() => share(selected)}>Share</button>
              <button onClick={() => copy(selected)}>
                {copied === selected.id ? 'Link copied' : 'Copy link'}
              </button>
              <button onClick={() => window.print()}>Print</button>
            </div>
          </article>
        </div>
      )}
    </>
  );
}
