'use client';

import { FormEvent, useState } from 'react';

export default function SubscriptionForm() {
  const [state, setState] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [busy, setBusy] = useState(false);

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setState('');
    setIsSuccess(false);

    const f = e.currentTarget;
    try {
      const r = await fetch('/api/alert-subscriptions', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(Object.fromEntries(new FormData(f).entries())),
      });
      const j = (await r.json()) as any;
      if (r.ok) {
        setIsSuccess(true);
        setState('Thank you! You are now subscribed to Ribbis Alerts.');
        f.reset();
      } else {
        setIsSuccess(false);
        setState(j.error || 'Could not subscribe. Please try again.');
      }
    } catch {
      setIsSuccess(false);
      setState('An error occurred. Please check your connection and try again.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="w-full py-16 bg-[#f7f3ea] border-t border-b border-[#e2d8c3] ">
      <div className="container max-w-4xl mx-auto px-4 text-center">
        {/* Header */}
        <p className="eyebrow gold mb-2">SUBSCRIBE TO OUR NEWSLETTER</p>
        <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-[#102a43] mb-3">
          Stay Updated with Ribbis Alerts &amp; Releases
        </h2>
        <p className="text-slate-600 text-sm sm:text-base max-w-2xl mx-auto mb-8">
          Get urgent halachic warnings, official Kav Haribis alerts, and directory updates delivered straight to your inbox.
        </p>

        {/* Classic 1-Line Newsletter Form */}
        <form onSubmit={submit} className="max-w-xl mx-auto space-y-3">
          <div className="flex flex-col sm:flex-row gap-2.5 bg-white p-2 rounded-2xl shadow-sm border border-[#dcd4c3]">
            <input
              name="email"
              type="email"
              required
              placeholder="Enter your email address..."
              className="flex-1 px-4 py-3 text-sm text-[#102a43] placeholder-slate-400 bg-transparent focus:outline-none"
            />
            <button
              type="submit"
              disabled={busy}
              className="bg-[#102a43] hover:bg-[#173f5f] text-white font-bold px-7 py-3 rounded-xl transition duration-200 flex items-center justify-center gap-2 shrink-0 disabled:opacity-50 cursor-pointer text-sm"
            >
              {busy ? (
                <span>Subscribing…</span>
              ) : (
                <>
                  <span>Subscribe</span>
                  <span>→</span>
                </>
              )}
            </button>
          </div>

          {/* Status Alert Message */}
          {state && (
            <div
              className={`p-3 rounded-xl text-xs font-semibold text-center border transition-all ${
                isSuccess
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                  : 'bg-rose-50 border-rose-300 text-rose-800'
              }`}
            >
              {state}
            </div>
          )}
        </form>

        <p className="text-xs text-slate-500 mt-4">
          🔒 We respect your privacy. Unsubscribe at any time.
        </p>
      </div>
    </section>
  );
}
