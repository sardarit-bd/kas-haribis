'use client';

import {
  AlertCircle,
  Building2,
  CheckCircle2,
  FileText,
  Link2,
  Loader2,
  Lock,
  Mail,
  Phone,
  Plus,
  RefreshCw,
  Send,
  ShieldAlert,
  Sparkles,
  User,
} from 'lucide-react';
import { FormEvent, useState } from 'react';

export default function TipForm() {
  const [isOpen, setIsOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [reference, setReference] = useState('');

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError('');
    const form = e.currentTarget,
      data = Object.fromEntries(new FormData(form).entries());
    const r = await fetch('/api/alert-tips', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(data),
      }),
      j = (await r.json()) as any;
    if (!r.ok) {
      setError(j.error || 'Your tip could not be submitted.');
      setBusy(false);
      return;
    }
    setReference(j.reference);
    form.reset();
    setBusy(false);
  }

  return (
    <section className="w-full py-8 bg-slate-50/50">
      <div className="container max-w-4xl mx-auto px-4 sm:px-8">
        <div className="bg-white shadow-[0_15px_45px_rgba(16,42,67,0.06)] border border-slate-200/80 overflow-hidden transition-all">
          {/* Header Toggle Bar */}
          <button
            type="button"
            onClick={() => setIsOpen((prev) => !prev)}
            className="w-full p-6 sm:p-7 bg-[#102a43] hover:bg-[#153452] text-white flex items-center justify-between text-left transition-colors cursor-pointer group select-none"
          >
            <div className="flex items-center gap-3.5 sm:gap-4">
              <div className="w-10 h-10 rounded-xl bg-[#c69b46]/20 border border-[#c69b46]/30 text-[#e3c176] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-[#e3c176] mb-0.5">
                  <Lock className="w-3 h-3" /> Confidential & Secure
                </span>
                <h2 className="font-serif text-xl sm:text-2xl font-bold text-white leading-tight">
                  Share information securely
                </h2>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <span className="text-xs font-medium text-slate-300 hidden sm:inline-block">
                {isOpen ? 'Close Form' : 'Open Form'}
              </span>
              <div className="w-10 h-10 rounded-full bg-white/10 group-hover:bg-white/20 text-[#e3c176] flex items-center justify-center shrink-0 transition-all duration-300">
                <Plus className={`w-5 h-5 transition-transform duration-300 ${isOpen ? 'rotate-45 text-rose-300' : ''}`} />
              </div>
            </div>
          </button>

          {/* Form / Content Body (Collapsible) */}
          {isOpen && (
            <div className="border-t border-slate-200/80 animate-fadeIn">
              {reference ? (
                /* Success View */
                <div className="p-8 sm:p-12 text-center relative overflow-hidden bg-white">
                  <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-[#102a43]" />
                  
                  <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 ring-8 ring-emerald-50/60 shadow-inner">
                    <CheckCircle2 className="w-9 h-9" />
                  </div>

                  <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 mb-3">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                    Tip Submitted Successfully
                  </span>

                  <h3 className="text-2xl sm:text-3xl font-serif font-bold text-[#102a43] mb-3">
                    Thank You For Your Submission
                  </h3>
                  
                  <p className="text-sm sm:text-base text-slate-600 max-w-xl mx-auto mb-8 leading-relaxed">
                    Your information helps protect the community. Kav Haribis will thoroughly review the details before taking any action or publishing guidance.
                  </p>

                  <div className="bg-slate-900 text-white rounded-2xl p-6 max-w-md mx-auto mb-8 border border-slate-800 shadow-inner">
                    <span className="block text-xs uppercase tracking-wider font-semibold text-slate-400 mb-2">
                      Your Private Reference Number
                    </span>
                    <div className="font-mono text-2xl font-bold text-[#e3c176] tracking-widest bg-slate-800/80 py-2.5 px-4 rounded-xl border border-slate-700/60">
                      {reference}
                    </div>
                    <small className="block text-[11px] text-slate-400 mt-2">
                      Please save this reference for any future follow-up.
                    </small>
                  </div>

                  <button
                    className="inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-[#102a43] hover:bg-[#1a385c] text-white text-xs sm:text-sm font-bold uppercase tracking-wider rounded-xl transition-all shadow-lg hover:shadow-xl cursor-pointer active:scale-95"
                    onClick={() => setReference('')}
                  >
                    <RefreshCw className="w-4 h-4" />
                    Submit Another Tip
                  </button>
                </div>
              ) : (
                /* Form Content */
                <form className="p-6 sm:p-8 md:p-10 space-y-6 bg-white" onSubmit={submit}>
                  <p className="text-slate-600 text-sm leading-relaxed mb-4">
                    Have information regarding potential Ribbis concerns, contract issues, or institutional practices? Let our Rabbonim review it privately.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    {/* Name */}
                    <div className="space-y-2">
                      <label className="flex items-center justify-between text-xs font-bold text-[#102a43] uppercase tracking-wider">
                        <span className="flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-slate-400" />
                          Your Name
                        </span>
                        <span className="text-[10px] font-semibold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full normal-case">Optional</span>
                      </label>
                      <input
                        name="name"
                        placeholder="e.g. Yisroel Cohen"
                        className="w-full h-11 px-4 bg-slate-50/50 hover:bg-white focus:bg-white border border-slate-200 rounded-xl text-sm text-[#102a43] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#102a43]/20 focus:border-[#102a43] transition-all"
                      />
                    </div>

                    {/* Email */}
                    <div className="space-y-2">
                      <label className="flex items-center justify-between text-xs font-bold text-[#102a43] uppercase tracking-wider">
                        <span className="flex items-center gap-1.5">
                          <Mail className="w-3.5 h-3.5 text-slate-400" />
                          Email Address
                        </span>
                        <span className="text-[10px] font-semibold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full normal-case">Optional</span>
                      </label>
                      <input
                        type="email"
                        name="email"
                        placeholder="name@example.com"
                        className="w-full h-11 px-4 bg-slate-50/50 hover:bg-white focus:bg-white border border-slate-200 rounded-xl text-sm text-[#102a43] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#102a43]/20 focus:border-[#102a43] transition-all"
                      />
                    </div>

                    {/* Phone */}
                    <div className="space-y-2">
                      <label className="flex items-center justify-between text-xs font-bold text-[#102a43] uppercase tracking-wider">
                        <span className="flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5 text-slate-400" />
                          Phone Number
                        </span>
                        <span className="text-[10px] font-semibold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full normal-case">Optional</span>
                      </label>
                      <input
                        name="phone"
                        placeholder="(555) 000-0000"
                        className="w-full h-11 px-4 bg-slate-50/50 hover:bg-white focus:bg-white border border-slate-200 rounded-xl text-sm text-[#102a43] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#102a43]/20 focus:border-[#102a43] transition-all"
                      />
                    </div>

                    {/* Topic */}
                    <div className="space-y-2">
                      <label className="flex items-center justify-between text-xs font-bold text-[#102a43] uppercase tracking-wider">
                        <span className="flex items-center gap-1.5">
                          <FileText className="w-3.5 h-3.5 text-slate-400" />
                          Topic / Category
                        </span>
                        <span className="text-[10px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full normal-case">Select One</span>
                      </label>
                      <select
                        name="topic"
                        className="w-full h-11 px-4 bg-slate-50/50 hover:bg-white focus:bg-white border border-slate-200 rounded-xl text-sm text-[#102a43] cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#102a43]/20 focus:border-[#102a43] transition-all"
                      >
                        <option>Loan or agreement</option>
                        <option>Bank or financial institution</option>
                        <option>Business practice</option>
                        <option>Investment</option>
                        <option>Heter Iska</option>
                        <option>Directory correction</option>
                        <option>Other</option>
                      </select>
                    </div>

                    {/* Organization */}
                    <div className="sm:col-span-2 space-y-2">
                      <label className="flex items-center justify-between text-xs font-bold text-[#102a43] uppercase tracking-wider">
                        <span className="flex items-center gap-1.5">
                          <Building2 className="w-3.5 h-3.5 text-slate-400" />
                          Business, Bank, or Organization Involved
                        </span>
                        <span className="text-[10px] font-semibold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full normal-case">If Applicable</span>
                      </label>
                      <input
                        name="organization"
                        placeholder="e.g. First National Bank / ABC LLC"
                        className="w-full h-11 px-4 bg-slate-50/50 hover:bg-white focus:bg-white border border-slate-200 rounded-xl text-sm text-[#102a43] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#102a43]/20 focus:border-[#102a43] transition-all"
                      />
                    </div>

                    {/* Source URL */}
                    <div className="sm:col-span-2 space-y-2">
                      <label className="flex items-center justify-between text-xs font-bold text-[#102a43] uppercase tracking-wider">
                        <span className="flex items-center gap-1.5">
                          <Link2 className="w-3.5 h-3.5 text-slate-400" />
                          Source or Supporting Link
                        </span>
                        <span className="text-[10px] font-semibold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full normal-case">Optional</span>
                      </label>
                      <input
                        type="url"
                        name="source_url"
                        placeholder="https://example.com/document"
                        className="w-full h-11 px-4 bg-slate-50/50 hover:bg-white focus:bg-white border border-slate-200 rounded-xl text-sm text-[#102a43] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#102a43]/20 focus:border-[#102a43] transition-all"
                      />
                    </div>

                    {/* Description */}
                    <div className="sm:col-span-2 space-y-2">
                      <label className="flex items-center justify-between text-xs font-bold text-[#102a43] uppercase tracking-wider">
                        <span className="flex items-center gap-1.5">
                          <ShieldAlert className="w-3.5 h-3.5 text-slate-400" />
                          Describe the Concern or Update
                        </span>
                        <span className="text-[10px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full normal-case">Min 20 characters</span>
                      </label>
                      <textarea
                        name="tip"
                        rows={5}
                        required
                        minLength={20}
                        placeholder="Please include relevant facts, dates, contract terms, or specific details that will help Kav Haribis review the matter..."
                        className="w-full p-4 bg-slate-50/50 hover:bg-white focus:bg-white border border-slate-200 rounded-xl text-sm text-[#102a43] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#102a43]/20 focus:border-[#102a43] transition-all leading-relaxed"
                      />
                    </div>
                  </div>

                  {/* Privacy notice box */}
                  <div className="bg-amber-50/60 border border-amber-200/80 rounded-2xl p-4 flex items-start gap-3 text-slate-700 text-xs leading-relaxed">
                    <Lock className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                    <div>
                      <strong className="font-semibold text-amber-950 block mb-0.5">Privacy Assurance</strong>
                      Your contact information is optional and is kept strictly private. Submitting a tip does not create a formal Bais Horaah question or guarantee public publication.
                    </div>
                  </div>

                  {/* Error Message */}
                  {error && (
                    <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium flex items-center gap-2.5 animate-fadeIn">
                      <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                      <span>{error}</span>
                    </div>
                  )}

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={busy}
                    className="w-full h-13 bg-[#102a43] hover:bg-[#1a385c] text-white font-bold text-sm uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-[#102a43]/15 hover:shadow-xl hover:shadow-[#102a43]/25 flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer active:scale-[0.99]"
                  >
                    {busy ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-[#e3c176]" />
                        <span>Submitting Securely…</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 text-[#e3c176]" />
                        <span>Submit Tip Securely</span>
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
