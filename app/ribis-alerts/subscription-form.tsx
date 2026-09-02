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
    <section className="relative overflow-hidden bg-gradient-to-br from-[#0a192f] via-[#102a43] to-[#1e3a5f] rounded-3xl p-6 sm:p-10 lg:p-12 text-white shadow-2xl border border-amber-500/25 my-10 max-w-7xl mx-auto">
      {/* Background Decorative Glow Effects */}
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
        {/* Left Column: Heading & Key Value Propositions */}
        <div className="lg:col-span-6 space-y-4 text-left">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 text-xs font-semibold uppercase tracking-widest">
            <svg className="w-4 h-4 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <span>RIBBIS ALERTS BY EMAIL</span>
          </div>

          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-bold text-white tracking-tight leading-tight">
            Stay Informed with Important Ribbis Alerts & Updates
          </h2>

          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            Get urgent halachic warnings, new Kav Haribis alert releases, and bank/business directory updates delivered straight to your inbox.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2 text-xs font-medium text-slate-300">
            <div className="flex items-center gap-1.5 bg-white/5 px-3 py-1.5 rounded-lg border border-white/10">
              <svg className="w-4 h-4 text-emerald-400 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>Instant Notifications</span>
            </div>
            <div className="flex items-center gap-1.5 bg-white/5 px-3 py-1.5 rounded-lg border border-white/10">
              <svg className="w-4 h-4 text-emerald-400 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>Zero Spam</span>
            </div>
            <div className="flex items-center gap-1.5 bg-white/5 px-3 py-1.5 rounded-lg border border-white/10">
              <svg className="w-4 h-4 text-emerald-400 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>Unsubscribe Anytime</span>
            </div>
          </div>
        </div>

        {/* Right Column: Interactive Form */}
        <div className="lg:col-span-6 bg-white/5 backdrop-blur-md p-6 sm:p-8 rounded-2xl border border-white/10 shadow-inner">
          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5 text-left">
                Full Name <span className="text-slate-500 font-normal">(Optional)</span>
              </label>
              <input
                name="name"
                type="text"
                placeholder="e.g. Moshe Cohen"
                className="w-full bg-slate-900/80 border border-slate-700/80 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition shadow-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5 text-left">
                Email Address <span className="text-amber-400">*</span>
              </label>
              <input
                name="email"
                type="email"
                required
                placeholder="you@example.com"
                className="w-full bg-slate-900/80 border border-slate-700/80 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition shadow-xs"
              />
            </div>

            <button
              type="submit"
              disabled={busy}
              className="w-full mt-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold py-3.5 px-6 rounded-xl shadow-lg hover:shadow-amber-500/25 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer text-sm"
            >
              {busy ? (
                <>
                  <svg className="animate-spin w-4 h-4 text-slate-950" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>Subscribing…</span>
                </>
              ) : (
                <>
                  <span>Subscribe to Ribbis Alerts</span>
                  <svg className="w-4 h-4 text-slate-950" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </>
              )}
            </button>

            {state && (
              <div
                className={`p-3.5 rounded-xl text-xs font-semibold border flex items-center gap-2.5 transition-all ${
                  isSuccess
                    ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
                    : 'bg-rose-500/15 border-rose-500/40 text-rose-300'
                }`}
              >
                <svg
                  className={`w-4 h-4 shrink-0 ${isSuccess ? 'text-emerald-400' : 'text-rose-400'}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  {isSuccess ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  )}
                </svg>
                <span>{state}</span>
              </div>
            )}
          </form>

          <p className="text-[11px] text-slate-400 text-center mt-4 flex items-center justify-center gap-1">
            <svg className="w-3.5 h-3.5 text-amber-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <span>Your information is secure and will never be shared.</span>
          </p>
        </div>
      </div>
    </section>
  );
}

