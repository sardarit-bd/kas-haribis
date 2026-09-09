'use client';
import { FormEvent, useState } from 'react';
export default function TipForm() {
  const [busy, setBusy] = useState(false),
    [error, setError] = useState(''),
    [reference, setReference] = useState('');
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
  if (reference)
    return (
      <div className="p-8 bg-white border border-[#e2e8f0] rounded-2xl shadow-md text-center space-y-4">
        <span className="w-12 h-12 bg-[#e9f4eb] text-[#367448] rounded-full flex items-center justify-center text-xl font-bold mx-auto">✓</span>
        <h3 className="text-2xl font-serif font-bold text-[#102a43]">Thank you. Your tip was submitted.</h3>
        <p className="text-sm text-[#64748b]">
          Your private reference number is <strong className="text-[#c69b46] font-mono">{reference}</strong>. Kav
          Haribis will review the information before publishing anything.
        </p>
        <button
          className="mt-4 px-6 py-3 bg-[#102a43] hover:bg-[#1a385c] text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-colors shadow-md cursor-pointer"
          onClick={() => setReference('')}
        >
          Submit another tip
        </button>
      </div>
    );
  return (
    <form className="space-y-5" onSubmit={submit}>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <label className="block space-y-1.5 text-xs font-bold text-[#102a43] uppercase tracking-wider">
          Your name <small className="not-italic font-normal text-[#94a3b8] normal-case">(optional)</small>
          <input
            name="name"
            className="w-full h-11 px-3.5 bg-white border border-[#cbd5da] rounded-xl text-sm font-normal text-[#102a43] normal-case focus:outline-none focus:ring-2 focus:ring-[#102a43]/20 focus:border-[#102a43]"
          />
        </label>
        <label className="block space-y-1.5 text-xs font-bold text-[#102a43] uppercase tracking-wider">
          Email <small className="not-italic font-normal text-[#94a3b8] normal-case">(optional)</small>
          <input
            type="email"
            name="email"
            className="w-full h-11 px-3.5 bg-white border border-[#cbd5da] rounded-xl text-sm font-normal text-[#102a43] normal-case focus:outline-none focus:ring-2 focus:ring-[#102a43]/20 focus:border-[#102a43]"
          />
        </label>
        <label className="block space-y-1.5 text-xs font-bold text-[#102a43] uppercase tracking-wider">
          Phone <small className="not-italic font-normal text-[#94a3b8] normal-case">(optional)</small>
          <input
            name="phone"
            className="w-full h-11 px-3.5 bg-white border border-[#cbd5da] rounded-xl text-sm font-normal text-[#102a43] normal-case focus:outline-none focus:ring-2 focus:ring-[#102a43]/20 focus:border-[#102a43]"
          />
        </label>
        <label className="block space-y-1.5 text-xs font-bold text-[#102a43] uppercase tracking-wider">
          Topic
          <select
            name="topic"
            className="w-full h-11 px-3.5 bg-white border border-[#cbd5da] rounded-xl text-sm font-normal text-[#102a43] normal-case cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#102a43]/20 focus:border-[#102a43]"
          >
            <option>Loan or agreement</option>
            <option>Bank or financial institution</option>
            <option>Business practice</option>
            <option>Investment</option>
            <option>Heter Iska</option>
            <option>Directory correction</option>
            <option>Other</option>
          </select>
        </label>
        <label className="sm:col-span-2 block space-y-1.5 text-xs font-bold text-[#102a43] uppercase tracking-wider">
          Business, bank, or organization involved{' '}
          <small className="not-italic font-normal text-[#94a3b8] normal-case">(if applicable)</small>
          <input
            name="organization"
            className="w-full h-11 px-3.5 bg-white border border-[#cbd5da] rounded-xl text-sm font-normal text-[#102a43] normal-case focus:outline-none focus:ring-2 focus:ring-[#102a43]/20 focus:border-[#102a43]"
          />
        </label>
        <label className="sm:col-span-2 block space-y-1.5 text-xs font-bold text-[#102a43] uppercase tracking-wider">
          Source or supporting link <small className="not-italic font-normal text-[#94a3b8] normal-case">(optional)</small>
          <input
            type="url"
            name="source_url"
            placeholder="https://…"
            className="w-full h-11 px-3.5 bg-white border border-[#cbd5da] rounded-xl text-sm font-normal text-[#102a43] normal-case focus:outline-none focus:ring-2 focus:ring-[#102a43]/20 focus:border-[#102a43]"
          />
        </label>
        <label className="sm:col-span-2 block space-y-1.5 text-xs font-bold text-[#102a43] uppercase tracking-wider">
          Describe the concern or update
          <textarea
            name="tip"
            rows={5}
            required
            minLength={20}
            placeholder="Please include the relevant facts, dates, contract terms, or other details that will help Kav Haribis review the matter."
            className="w-full p-3.5 bg-white border border-[#cbd5da] rounded-xl text-sm font-normal text-[#102a43] normal-case focus:outline-none focus:ring-2 focus:ring-[#102a43]/20 focus:border-[#102a43]"
          />
        </label>
      </div>

      <p className="text-xs text-[#94a3b8] leading-relaxed">
        Your contact information is optional and is kept private. Submitting a
        tip does not create a Bais Horaah question or guarantee publication.
      </p>

      {error && <p className="text-xs text-[#9b1c1c] bg-[#fde8e8] p-3 rounded-lg border border-[#f8b4b4] text-center">{error}</p>}

      <button
        className="w-full h-12 bg-[#102a43] hover:bg-[#1a385c] text-white font-bold text-sm uppercase tracking-wider rounded-xl transition-colors shadow-md disabled:opacity-50 cursor-pointer"
        disabled={busy}
      >
        {busy ? 'Submitting…' : 'Submit Tip Securely'}
      </button>
    </form>
  );
}
