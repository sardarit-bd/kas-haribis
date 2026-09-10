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
  const getSeverityStyle = (sev: string) => {
    switch (sev?.toLowerCase()) {
      case 'high':
      case 'critical':
        return 'border-[#9b1c1c] bg-[#fde8e8] text-[#9b1c1c]';
      case 'medium':
      case 'warning':
        return 'border-[#c69b46] bg-[#fff7e5] text-[#876622]';
      default:
        return 'border-[#4c895d] bg-[#e9f4eb] text-[#367448]';
    }
  };

  return (
    <>
      <section className="space-y-8 container">
        {/* Featured Alert Banner */}
        {featured && (
          <article
            className={` p-6 sm:p-8 bg-gray-50 border-2 shadow-md space-y-4 ${
              featured.severity?.toLowerCase() === 'high'
                ? 'border-[#9b1c1c]'
                : 'border-[#c69b46]'
            }`}
            id={`alert-${featured.id}`}
          >
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-[#102a43] text-[#c69b46] font-bold text-xs flex items-center justify-center">!</span>
              <b className="text-xs font-mono font-bold text-[#c69b46] tracking-widest uppercase">FEATURED ALERT</b>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-xs text-[#64748b] flex-wrap">
                <time className="font-semibold text-[#102a43]">
                  {new Date(
                    `${featured.alert_date}T00:00:00`,
                  ).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </time>
                <span>·</span>
                <span className="font-semibold text-[#475569]">{featured.category}</span>
                <b className={`not-italic px-2.5 py-0.5 text-[11px] font-bold rounded-full border ${getSeverityStyle(featured.severity)}`}>
                  {featured.severity}
                </b>
              </div>
              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#102a43] leading-tight">{featured.title}</h2>
              <p className="text-sm text-[#475569] leading-relaxed max-w-3xl">{featured.summary}</p>
              <div className="flex items-center gap-3 pt-2">
                <button
                  className="px-5 py-2.5 bg-[#102a43] hover:bg-[#1a385c] text-white text-xs font-bold uppercase tracking-wider transition-colors shadow-sm cursor-pointer"
                  onClick={() => setSelected(featured)}
                >
                  View Full Alert
                </button>
                <button
                  className="px-4 py-2.5 bg-white border border-[#cbd5da] hover:bg-[#f8fafc] text-[#102a43] text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
                  onClick={() => share(featured)}
                >
                  Share
                </button>
              </div>
              <small className="block text-[11px] text-[#94a3b8] pt-1">
                Reviewed by {featured.reviewed_by || 'Kav Haribis'}
                {featured.updated_at
                  ? ` · Updated ${new Date(featured.updated_at).toLocaleDateString()}`
                  : ''}
              </small>
            </div>
          </article>
        )}

        {/* Filter Tools */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 p-4 bg-[#f7f3ea]">
          <label className="flex items-center gap-3 flex-1 bg-white px-3.5 py-2 focus-within:ring-2 focus-within:ring-[#102a43]/20">
            <span className="text-xs font-bold text-[#102a43] uppercase tracking-wider shrink-0">Search</span>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search loans, banks, Heter Iska…"
              className="w-full text-sm text-[#102a43] focus:outline-none bg-transparent"
            />
          </label>
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
            {categories.map((x) => (
              <button
                className={`px-3 py-1.5 text-xs font-bold transition-colors whitespace-nowrap cursor-pointer ${
                  category === x
                    ? 'bg-[#102a43] text-white'
                    : 'bg-white text-[#60717d] hover:bg-[#f8fafc]'
                }`}
                onClick={() => setCategory(x)}
                key={x}
              >
                {x}
              </button>
            ))}
          </div>
        </div>

        {/* Alert Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((x) => (
            <article
              className="p-6 bg-white border border-gray-200 flex flex-col justify-between space-y-4"
              key={x.id}
              id={`alert-${x.id}`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2 pb-3 border-b border-[#f1f5f9]">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-[#102a43] text-[#c69b46] font-bold text-[10px] flex items-center justify-center">!</span>
                    <small className="text-xs font-bold text-[#64748b]">{x.category}</small>
                  </div>
                  <b className={`not-italic px-2 py-0.5 text-[10px] font-bold rounded-full border ${getSeverityStyle(x.severity)}`}>
                    {x.alert_status || x.severity}
                  </b>
                </div>
                <h3 className="text-lg font-serif font-bold text-[#102a43] leading-snug">{x.title}</h3>
                <p className="text-xs text-[#475569] leading-relaxed line-clamp-3">{x.summary}</p>
                <div className="text-[11px] text-[#94a3b8]">
                  Reviewed by <b className="font-semibold text-[#102a43]">{x.reviewed_by || 'Kav Haribis'}</b>
                  {x.updated_at && (
                    <span className="block mt-0.5">
                      Updated {new Date(x.updated_at).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 pt-3 border-t border-[#f1f5f9] text-xs font-bold flex-wrap">
                <button
                  className="px-3.5 py-1.5 bg-[#102a43] hover:bg-[#1a385c] text-white rounded-lg transition-colors text-xs font-bold shadow-sm cursor-pointer"
                  onClick={() => setSelected(x)}
                >
                  View Full Alert
                </button>
                <button
                  className="px-3 py-1.5 bg-white border border-[#cbd5da] text-[#102a43] rounded-lg hover:bg-[#f8fafc] transition-colors cursor-pointer"
                  title="Share"
                  onClick={() => share(x)}
                >
                  Share
                </button>
                <button
                  className="px-3 py-1.5 bg-white border border-[#cbd5da] text-[#102a43] rounded-lg hover:bg-[#f8fafc] transition-colors cursor-pointer"
                  title="Copy link"
                  onClick={() => copy(x)}
                >
                  {copied === x.id ? 'Copied' : 'Copy'}
                </button>
                <button
                  className="px-3 py-1.5 bg-white border border-[#cbd5da] text-[#102a43] rounded-lg hover:bg-[#f8fafc] transition-colors cursor-pointer ml-auto"
                  title="Print"
                  onClick={() => printAlert(x)}
                >
                  Print
                </button>
              </div>
            </article>
          ))}
        </div>

        {!filtered.length && (
          <div className="p-12 text-center bg-white border border-dashed border-[#cbd5e1] rounded-2xl max-w-md mx-auto space-y-2">
            <h3 className="text-xl font-serif font-bold text-[#102a43]">No matching alerts</h3>
            <p className="text-sm text-[#64748b]">Try another search or category.</p>
          </div>
        )}
      </section>

      {/* Modal Popup */}
      {selected && (
        <div
          className="fixed inset-0 z-50 bg-[#071728]/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
          role="dialog"
          aria-modal="true"
          aria-label={selected.title}
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setSelected(null);
          }}
        >
          <article className="relative w-full max-w-2xl bg-white border border-[#e2e8f0] rounded-2xl shadow-2xl p-6 sm:p-8 space-y-5 my-8">
            <button
              className="absolute top-4 right-4 w-9 h-9 rounded-full bg-[#f8fafc] hover:bg-[#e2e8f0] text-[#102a43] font-bold text-xl flex items-center justify-center transition-colors cursor-pointer"
              onClick={() => setSelected(null)}
              aria-label="Close"
            >
              ×
            </button>
            <div className="flex items-center gap-3 text-xs text-[#64748b]">
              <time className="font-semibold text-[#102a43]">
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
              <span>·</span>
              <span>{selected.category}</span>
              <b className={`not-italic px-2.5 py-0.5 text-[10px] font-bold rounded-full border ${getSeverityStyle(selected.severity)}`}>
                {selected.severity}
              </b>
            </div>
            <h2 className="text-2xl font-serif font-bold text-[#102a43]">{selected.title}</h2>
            <p className="p-4 bg-[#f8fafc] rounded-xl border border-[#e2e8f0] text-sm text-[#102a43] font-medium leading-relaxed">{selected.summary}</p>
            <div className="text-sm text-[#475569] leading-relaxed space-y-3 whitespace-pre-line">
              {selected.full_details || selected.summary}
            </div>
            <div className="p-4 bg-[#f7f3ea] border border-[#e2dacd] rounded-xl text-xs text-[#556673] space-y-1">
              <b className="text-[#102a43] block">Reviewed by {selected.reviewed_by || 'Kav Haribis'}</b>
              <span>Status: {selected.alert_status || 'Active'}</span>
              {selected.expires_at && (
                <span className="block">
                  Review/expiration date:{' '}
                  {new Date(
                    `${selected.expires_at}T00:00:00`,
                  ).toLocaleDateString()}
                </span>
              )}
            </div>
            <div className="flex items-center gap-3 pt-3 border-t border-[#f1f5f9] flex-wrap text-xs font-bold">
              {action(selected.action_url) && (
                <a className="px-5 py-2.5 bg-[#102a43] hover:bg-[#1a385c] text-white rounded-xl transition-colors shadow-sm" href={selected.action_url}>
                  {selected.action_label || 'Learn more'} →
                </a>
              )}
              <button className="px-4 py-2.5 bg-white border border-[#cbd5da] text-[#102a43] rounded-xl hover:bg-[#f8fafc] transition-colors cursor-pointer" onClick={() => share(selected)}>Share</button>
              <button className="px-4 py-2.5 bg-white border border-[#cbd5da] text-[#102a43] rounded-xl hover:bg-[#f8fafc] transition-colors cursor-pointer" onClick={() => copy(selected)}>
                {copied === selected.id ? 'Link copied' : 'Copy link'}
              </button>
              <button className="px-4 py-2.5 bg-white border border-[#cbd5da] text-[#102a43] rounded-xl hover:bg-[#f8fafc] transition-colors cursor-pointer ml-auto" onClick={() => window.print()}>Print</button>
            </div>
          </article>
        </div>
      )}
    </>
  );
}
