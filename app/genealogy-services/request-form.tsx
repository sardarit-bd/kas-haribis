'use client';
import { FormEvent, useState } from 'react';

export default function GenealogyRequestForm() {
  const [busy, setBusy] = useState(false),
    [error, setError] = useState(''),
    [reference, setReference] = useState('');
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError('');
    const form = event.currentTarget,
      data = new FormData(form);
    data.set('topic', 'Genealogy research request');
    try {
      const response = await fetch('/api/contact-submissions', {
          method: 'POST',
          body: data,
        }),
        result = (await response.json()) as {
          reference?: string;
          error?: string;
        };
      if (!response.ok)
        throw new Error(result.error || 'Your request could not be submitted.');
      setReference(result.reference || '');
      form.reset();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Your request could not be submitted.',
      );
    } finally {
      setBusy(false);
    }
  }
  if (reference)
    return (
      <div className="p-8 bg-white border border-[#e2e8f0] rounded-2xl shadow-md text-center space-y-4">
        <div className="w-12 h-12 bg-[#e9f4eb] text-[#367448] rounded-full flex items-center justify-center text-xl font-bold mx-auto">✓</div>
        <small className="text-[#367448] font-mono font-bold text-[10px] tracking-widest uppercase block">REQUEST RECEIVED</small>
        <h2 className="text-2xl font-serif font-bold text-[#102a43]">Thank you</h2>
        <p className="text-sm text-[#64748b]">
          Your genealogy research request has been saved. Kav Haribis will
          review it and contact you about the next steps and pricing.
        </p>
        <strong className="text-2xl font-mono text-[#c69b46] bg-[#f8fafc] px-4 py-2 rounded-lg border border-[#e2e8f0] inline-block">{reference}</strong>
        <div>
          <button
            type="button"
            className="mt-4 px-6 py-3 bg-[#102a43] hover:bg-[#1a385c] text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-colors shadow-md cursor-pointer"
            onClick={() => setReference('')}
          >
            Submit another request
          </button>
        </div>
      </div>
    );
  return (
    <form className="p-6 sm:p-8 bg-white border border-[#e2e8f0] rounded-2xl shadow-md space-y-5" onSubmit={submit}>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <label className="block space-y-1.5 text-xs font-bold text-[#102a43] uppercase tracking-wider">
          Full name
          <input
            name="name"
            autoComplete="name"
            required
            className="w-full h-11 px-3.5 bg-white border border-[#cbd5da] rounded-xl text-sm font-normal text-[#102a43] normal-case focus:outline-none focus:ring-2 focus:ring-[#102a43]/20 focus:border-[#102a43]"
          />
        </label>
        <label className="block space-y-1.5 text-xs font-bold text-[#102a43] uppercase tracking-wider">
          Email address
          <input
            name="email"
            type="email"
            autoComplete="email"
            required
            className="w-full h-11 px-3.5 bg-white border border-[#cbd5da] rounded-xl text-sm font-normal text-[#102a43] normal-case focus:outline-none focus:ring-2 focus:ring-[#102a43]/20 focus:border-[#102a43]"
          />
        </label>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <label className="block space-y-1.5 text-xs font-bold text-[#102a43] uppercase tracking-wider">
          Phone number
          <input
            name="phone"
            type="tel"
            autoComplete="tel"
            required
            className="w-full h-11 px-3.5 bg-white border border-[#cbd5da] rounded-xl text-sm font-normal text-[#102a43] normal-case focus:outline-none focus:ring-2 focus:ring-[#102a43]/20 focus:border-[#102a43]"
          />
        </label>
        <label className="block space-y-1.5 text-xs font-bold text-[#102a43] uppercase tracking-wider">
          Organization <em className="not-italic text-[10px] font-normal text-[#94a3b8] normal-case">(optional)</em>
          <input
            name="organization"
            className="w-full h-11 px-3.5 bg-white border border-[#cbd5da] rounded-xl text-sm font-normal text-[#102a43] normal-case focus:outline-none focus:ring-2 focus:ring-[#102a43]/20 focus:border-[#102a43]"
          />
        </label>
      </div>

      <label className="block space-y-1.5 text-xs font-bold text-[#102a43] uppercase tracking-wider">
        Research purpose
        <select
          name="request_subtype"
          required
          defaultValue=""
          className="w-full h-11 px-3.5 bg-white border border-[#cbd5da] rounded-xl text-sm font-normal text-[#102a43] normal-case cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#102a43]/20 focus:border-[#102a43]"
        >
          <option value="" disabled>
            Choose the purpose
          </option>
          <option>Clarify potentially problematic ownership</option>
          <option>Financial institution or business ownership</option>
          <option>Family-history research</option>
          <option>Trust, estate, or succession research</option>
          <option>Another ethical genealogy purpose</option>
        </select>
      </label>

      <label className="block space-y-1.5 text-xs font-bold text-[#102a43] uppercase tracking-wider">
        Person, family, business, or institution being researched
        <input
          name="related_name"
          required
          placeholder="Name or entity"
          className="w-full h-11 px-3.5 bg-white border border-[#cbd5da] rounded-xl text-sm font-normal text-[#102a43] normal-case focus:outline-none focus:ring-2 focus:ring-[#102a43]/20 focus:border-[#102a43]"
        />
      </label>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <label className="block space-y-1.5 text-xs font-bold text-[#102a43] uppercase tracking-wider">
          Relevant locations <em className="not-italic text-[10px] font-normal text-[#94a3b8] normal-case">(optional)</em>
          <input
            name="location"
            placeholder="Cities, states, or countries"
            className="w-full h-11 px-3.5 bg-white border border-[#cbd5da] rounded-xl text-sm font-normal text-[#102a43] normal-case focus:outline-none focus:ring-2 focus:ring-[#102a43]/20 focus:border-[#102a43]"
          />
        </label>
        <label className="block space-y-1.5 text-xs font-bold text-[#102a43] uppercase tracking-wider">
          Approximate years or generations <em className="not-italic text-[10px] font-normal text-[#94a3b8] normal-case">(optional)</em>
          <input
            name="audience"
            placeholder="Example: 1920–present"
            className="w-full h-11 px-3.5 bg-white border border-[#cbd5da] rounded-xl text-sm font-normal text-[#102a43] normal-case focus:outline-none focus:ring-2 focus:ring-[#102a43]/20 focus:border-[#102a43]"
          />
        </label>
      </div>

      <label className="block space-y-1.5 text-xs font-bold text-[#102a43] uppercase tracking-wider">
        What needs to be investigated?
        <textarea
          name="message"
          rows={6}
          minLength={20}
          required
          placeholder="Explain the question, what you already know, and the result you are trying to clarify…"
          className="w-full p-3.5 bg-white border border-[#cbd5da] rounded-xl text-sm font-normal text-[#102a43] normal-case focus:outline-none focus:ring-2 focus:ring-[#102a43]/20 focus:border-[#102a43]"
        />
      </label>

      <label className="block space-y-1.5 text-xs font-bold text-[#102a43] uppercase tracking-wider">
        Preferred response method
        <select
          name="response_method"
          className="w-full h-11 px-3.5 bg-white border border-[#cbd5da] rounded-xl text-sm font-normal text-[#102a43] normal-case cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#102a43]/20 focus:border-[#102a43]"
        >
          <option>Email</option>
          <option>Phone</option>
          <option>Either email or phone</option>
        </select>
      </label>

      <label className="block space-y-1.5 text-xs font-bold text-[#102a43] uppercase tracking-wider">
        Supporting records <em className="not-italic text-[10px] font-normal text-[#94a3b8] normal-case">(optional)</em>
        <input
          name="attachment"
          type="file"
          accept="application/pdf,image/png,image/jpeg,image/webp,.doc,.docx"
          className="w-full text-xs text-[#64748b] file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-[#102a43] file:text-white hover:file:bg-[#1a385c] file:cursor-pointer"
        />
        <small className="text-[11px] font-normal text-[#94a3b8] normal-case block">PDF, Word, JPG, PNG, or WEBP up to 10 MB.</small>
      </label>

      <button
        className="w-full h-12 bg-[#102a43] hover:bg-[#1a385c] text-white font-bold text-sm uppercase tracking-wider rounded-xl transition-colors shadow-md disabled:opacity-50 cursor-pointer"
        disabled={busy}
      >
        {busy ? 'Submitting securely…' : 'Submit Research Request →'}
      </button>

      {error && (
        <p className="text-xs text-[#9b1c1c] bg-[#fde8e8] p-3 rounded-lg border border-[#f8b4b4] text-center" role="alert">
          {error}
        </p>
      )}

      <small className="block text-center text-xs text-[#94a3b8]">
        Please submit only information you are authorized to share and only for
        lawful, ethical purposes.
      </small>
    </form>
  );
}
