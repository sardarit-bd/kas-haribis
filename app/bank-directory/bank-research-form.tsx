'use client';
import { FormEvent, useState } from 'react';

export default function BankResearchForm() {
  const [mode, setMode] = useState('Request research on a lender');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [reference, setReference] = useState('');

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError('');
    const form = event.currentTarget;
    const data = new FormData(form);
    data.set('topic', 'Bank correction or update');
    data.set('request_subtype', mode);
    try {
      const response = await fetch('/api/contact-submissions', {
        method: 'POST',
        body: data,
      });
      const result = (await response.json()) as any;
      if (!response.ok)
        throw new Error(
          result.error || 'The information could not be submitted.',
        );
      setReference(result.reference);
      form.reset();
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : 'The information could not be submitted.',
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="container px-4 sm:px-8 py-12 border-t border-[#e2e8f0]" id="submit-bank-information">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
        {/* Intro Side */}
        <div className="lg:col-span-5 space-y-6">
          <div>
            <h2 className="text-[#102a43] font-serif font-bold text-2xl sm:text-3xl lg:text-4xl leading-tight">
              Help strengthen the directory
            </h2>
          </div>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
            Know something about a bank, lender, mortgage company, credit union,
            or financing provider? Request new research or securely share
            information with Kav Haribis.
          </p>
          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-3.5 p-3.5 bg-white text-xs sm:text-sm font-medium text-[#102a43] border border-gray-100">
              <span className="w-7 h-7 rounded-lg bg-[#102a43]/10 text-[#102a43] flex items-center justify-center text-xs shrink-0 font-bold">01</span>
              <span>Request research on an unlisted lender</span>
            </div>
            <div className="flex items-center gap-3.5 p-3.5 bg-white border-gray-100 text-xs sm:text-sm font-medium text-[#102a43]">
              <span className="w-7 h-7 rounded-lg bg-[#102a43]/10 text-[#102a43] flex items-center justify-center text-xs shrink-0 font-bold">02</span>
              <span>Share new documents or information</span>
            </div>
            <div className="flex items-center gap-3.5 p-3.5 bg-white border-gray-100 text-xs sm:text-sm font-medium text-[#102a43]">
              <span className="w-7 h-7 rounded-lg bg-[#102a43]/10 text-[#102a43] flex items-center justify-center text-xs shrink-0 font-bold">03</span>
              <span>Request an update to an existing listing</span>
            </div>
          </div>
          <aside className="p-4 bg-slate-50 border-l-4 border-[#102a43] rounded-r-xl space-y-1">
            <strong className="text-xs font-semibold text-[#102a43] block">Privacy Reminder</strong>
            <p className="text-xs text-slate-600 leading-relaxed">
              Never upload account numbers, passwords, card details, or other
              private financial credentials.
            </p>
          </aside>
        </div>

        {/* Form Side */}
        <div className="lg:col-span-7">
          {reference ? (
            <div className="p-8 sm:p-10 bg-white border border-slate-200/80 shadow-sm text-center space-y-5">
              <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center text-2xl mx-auto font-bold border border-emerald-200">
                ✓
              </div>
              <div>
                <h3 className="text-2xl font-serif font-bold text-[#102a43] mb-1">
                  Submission Received
                </h3>
                <p className="text-sm text-slate-600">
                  Thank you for helping strengthen our community directory.
                </p>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 max-w-sm mx-auto space-y-1">
                <span className="text-xs text-slate-500 font-medium block">Your Reference Number</span>
                <strong className="text-xl font-mono text-[#a37828] block">{reference}</strong>
              </div>

              <p className="text-xs text-slate-500">
                The Kav Haribis research team will review the information shortly.
              </p>

              <button
                className="mt-2 px-6 py-2.5 bg-[#102a43] hover:bg-[#1a385c] text-white text-xs font-semibold rounded-xl transition-all shadow-sm cursor-pointer"
                onClick={() => setReference('')}
              >
                Submit Another Lender
              </button>
            </div>
          ) : (
            <form onSubmit={submit} className="p-6 sm:p-8 bg-white border border-gray-100 space-y-6">
              <div className="border-b border-slate-100 pb-4">
                <h3 className="text-xl font-serif font-bold text-[#102a43]">
                  Submit Information
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                  Select a request type and fill in the details for our research team.
                </p>
              </div>

              {/* Segmented Request Mode Selector */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 block">
                  Request Type <span className="text-rose-500">*</span>
                </label>
                <div className="bg-slate-100/80 p-1 rounded-xl grid grid-cols-1 sm:grid-cols-3 gap-1 border border-slate-200/60">
                  {[
                    'Request research on a lender',
                    'Share new lender information',
                    'Request an update to a listing',
                  ].map((choice) => {
                    const isSelected = mode === choice;
                    return (
                      <button
                        key={choice}
                        type="button"
                        onClick={() => setMode(choice)}
                        className={`py-2 px-3 rounded-lg text-xs font-medium transition-all text-center cursor-pointer ${
                          isSelected
                            ? 'bg-white text-[#102a43] font-semibold shadow-sm border border-slate-200/80'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        {choice}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Institution Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 flex items-center justify-between">
                  <span>Bank, Lender, or Institution Name <span className="text-rose-500">*</span></span>
                </label>
                <input
                  name="related_name"
                  required
                  placeholder="e.g. Chase Bank, Rocket Mortgage"
                  className="w-full h-11 px-3.5 bg-[#f8fafc] focus:bg-white border border-slate-200 hover:border-slate-300 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#102a43]/15 focus:border-[#102a43] transition-all"
                />
              </div>

              {/* Website & Relationship row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 flex items-center justify-between">
                    <span>Website <span className="text-slate-400 font-normal">(optional)</span></span>
                  </label>
                  <input
                    name="related_url"
                    type="url"
                    placeholder="https://..."
                    className="w-full h-11 px-3.5 bg-[#f8fafc] focus:bg-white border border-slate-200 hover:border-slate-300 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#102a43]/15 focus:border-[#102a43] transition-all"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 flex items-center justify-between">
                    <span>Your Relationship <span className="text-slate-400 font-normal">(optional)</span></span>
                  </label>
                  <select
                    name="organization"
                    className="w-full h-11 px-3.5 bg-[#f8fafc] focus:bg-white border border-slate-200 hover:border-slate-300 rounded-xl text-sm text-slate-800 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#102a43]/15 focus:border-[#102a43] transition-all"
                  >
                    <option value="">Select relationship</option>
                    <option>Customer or borrower</option>
                    <option>Employee or representative</option>
                    <option>Broker or professional</option>
                    <option>Community researcher</option>
                    <option>Other</option>
                  </select>
                </div>
              </div>

              {/* Textarea */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 block">
                  Information or Details <span className="text-rose-500">*</span>
                </label>
                <textarea
                  name="message"
                  rows={4}
                  minLength={10}
                  required
                  placeholder={
                    mode === 'Request research on a lender'
                      ? 'Describe what lender or financing product you would like researched...'
                      : 'Provide details about the information, document, or listing update...'
                  }
                  className="w-full p-3.5 bg-[#f8fafc] focus:bg-white border border-slate-200 hover:border-slate-300 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#102a43]/15 focus:border-[#102a43] transition-all"
                />
              </div>

              {/* Supporting document */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 flex items-center justify-between">
                  <span>Supporting Document <span className="text-slate-400 font-normal">(optional)</span></span>
                </label>
                <div className="bg-[#f8fafc] border border-slate-200 hover:border-slate-300 rounded-xl p-3 flex items-center gap-3">
                  <input
                    type="file"
                    name="attachment"
                    accept="application/pdf,image/png,image/jpeg,image/webp,.doc,.docx"
                    className="w-full text-xs text-slate-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-[#102a43] file:text-white hover:file:bg-[#1a385c] file:cursor-pointer transition-all"
                  />
                </div>
                <span className="text-[11px] text-slate-400 block">Accepted formats: PDF, DOCX, JPG, PNG up to 10MB</span>
              </div>

              {/* User Name & Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 block">
                    Your Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    name="name"
                    autoComplete="name"
                    required
                    placeholder="Full name"
                    className="w-full h-11 px-3.5 bg-[#f8fafc] focus:bg-white border border-slate-200 hover:border-slate-300 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#102a43]/15 focus:border-[#102a43] transition-all"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 block">
                    Email Address <span className="text-rose-500">*</span>
                  </label>
                  <input
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    placeholder="email@example.com"
                    className="w-full h-11 px-3.5 bg-[#f8fafc] focus:bg-white border border-slate-200 hover:border-slate-300 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#102a43]/15 focus:border-[#102a43] transition-all"
                  />
                </div>
              </div>

              {/* Phone & Response method */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 flex items-center justify-between">
                    <span>Phone <span className="text-slate-400 font-normal">(optional)</span></span>
                  </label>
                  <input
                    name="phone"
                    type="tel"
                    autoComplete="tel"
                    placeholder="(555) 000-0000"
                    className="w-full h-11 px-3.5 bg-[#f8fafc] focus:bg-white border border-slate-200 hover:border-slate-300 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#102a43]/15 focus:border-[#102a43] transition-all"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 block">
                    Preferred Response Method
                  </label>
                  <select
                    name="response_method"
                    className="w-full h-11 px-3.5 bg-[#f8fafc] focus:bg-white border border-slate-200 hover:border-slate-300 rounded-xl text-sm text-slate-800 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#102a43]/15 focus:border-[#102a43] transition-all"
                  >
                    <option>Email</option>
                    <option>Phone</option>
                    <option>Either email or phone</option>
                  </select>
                </div>
              </div>

              <button
                className="w-full h-12 bg-[#102a43] hover:bg-[#173f5f] text-white font-semibold text-sm rounded-xl transition-all shadow-sm hover:shadow-md cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
                disabled={busy}
              >
                {busy ? (
                  <>
                    <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                    Submitting securely…
                  </>
                ) : (
                  'Submit to Research Team →'
                )}
              </button>

              {error && (
                <p className="text-xs text-rose-700 bg-rose-50 p-3.5 rounded-xl border border-rose-200 text-center">
                  ⚠️ {error}
                </p>
              )}
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
