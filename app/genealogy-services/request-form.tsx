'use client';
import { FormEvent, useState } from 'react';

export default function GenealogyRequestForm() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [reference, setReference] = useState('');

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError('');
    const form = event.currentTarget;
    const data = new FormData(form);
    data.set('topic', 'Genealogy research request');
    try {
      const response = await fetch('/api/contact-submissions', {
        method: 'POST',
        body: data,
      });
      const result = (await response.json()) as {
        reference?: string;
        error?: string;
      };
      if (!response.ok) {
        throw new Error(result.error || 'Your request could not be submitted.');
      }
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

  if (reference) {
    return (
      <div className="p-8 sm:p-10 bg-white border border-gray-100 text-center space-y-5">
        <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center text-2xl font-bold mx-auto border border-emerald-100">
          ✓
        </div>
        <div className="space-y-1">
          <span className="inline-block px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-medium rounded-full border border-emerald-100">
            Request Received
          </span>
          <h2 className="text-2xl font-serif font-bold text-[#102a43] pt-2">
            Thank you for your submission
          </h2>
        </div>
        <p className="text-sm text-slate-600 max-w-md mx-auto">
          Your genealogy research request has been saved. Kav Haribis will review it and contact you about the next steps and pricing.
        </p>
        <strong className="text-2xl font-mono text-[#c69b46] bg-slate-50 px-5 py-2.5 rounded-xl border border-slate-200 inline-block font-semibold tracking-wider">
          {reference}
        </strong>
        <div>
          <button
            type="button"
            className="mt-2 px-6 py-3 bg-[#102a43] hover:bg-[#1a385c] text-white text-xs font-medium rounded-xl transition-all cursor-pointer"
            onClick={() => setReference('')}
          >
            Submit another request
          </button>
        </div>
      </div>
    );
  }

  return (
    <form
      className="p-6 sm:p-8 bg-gray-50 border border-gray-100 space-y-6"
      onSubmit={submit}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-slate-700">
            Full name <span className="text-red-500">*</span>
          </label>
          <input
            name="name"
            autoComplete="name"
            required
            placeholder="e.g. David Cohen"
            className="w-full h-11 px-3.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm font-normal text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#102a43]/15 focus:border-[#102a43] focus:bg-white transition-all"
          />
        </div>
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-slate-700">
            Email address <span className="text-red-500">*</span>
          </label>
          <input
            name="email"
            type="email"
            autoComplete="email"
            required
            placeholder="you@example.com"
            className="w-full h-11 px-3.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm font-normal text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#102a43]/15 focus:border-[#102a43] focus:bg-white transition-all"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-slate-700">
            Phone number <span className="text-red-500">*</span>
          </label>
          <input
            name="phone"
            type="tel"
            autoComplete="tel"
            required
            placeholder="(555) 000-0000"
            className="w-full h-11 px-3.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm font-normal text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#102a43]/15 focus:border-[#102a43] focus:bg-white transition-all"
          />
        </div>
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-slate-700">
            Organization <span className="text-xs font-normal text-slate-400">(optional)</span>
          </label>
          <input
            name="organization"
            placeholder="Company or institution name"
            className="w-full h-11 px-3.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm font-normal text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#102a43]/15 focus:border-[#102a43] focus:bg-white transition-all"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-slate-700">
          Research purpose <span className="text-red-500">*</span>
        </label>
        <select
          name="request_subtype"
          required
          defaultValue=""
          className="w-full h-11 px-3.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm font-normal text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#102a43]/15 focus:border-[#102a43] focus:bg-white transition-all cursor-pointer"
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
      </div>

      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-slate-700">
          Person, family, business, or institution being researched <span className="text-red-500">*</span>
        </label>
        <input
          name="related_name"
          required
          placeholder="Name or entity to investigate"
          className="w-full h-11 px-3.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm font-normal text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#102a43]/15 focus:border-[#102a43] focus:bg-white transition-all"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-slate-700">
            Relevant locations <span className="text-xs font-normal text-slate-400">(optional)</span>
          </label>
          <input
            name="location"
            placeholder="Cities, states, or countries"
            className="w-full h-11 px-3.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm font-normal text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#102a43]/15 focus:border-[#102a43] focus:bg-white transition-all"
          />
        </div>
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-slate-700">
            Approximate years or generations <span className="text-xs font-normal text-slate-400">(optional)</span>
          </label>
          <input
            name="audience"
            placeholder="e.g. 1920–present"
            className="w-full h-11 px-3.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm font-normal text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#102a43]/15 focus:border-[#102a43] focus:bg-white transition-all"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-slate-700">
          What needs to be investigated? <span className="text-red-500">*</span>
        </label>
        <textarea
          name="message"
          rows={6}
          minLength={20}
          required
          placeholder="Please explain the question, what facts you already know, and the results you are trying to clarify..."
          className="w-full p-3.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm font-normal text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#102a43]/15 focus:border-[#102a43] focus:bg-white transition-all leading-relaxed"
        />
      </div>

      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-slate-700">
          Preferred response method
        </label>
        <select
          name="response_method"
          className="w-full h-11 px-3.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm font-normal text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#102a43]/15 focus:border-[#102a43] focus:bg-white transition-all cursor-pointer"
        >
          <option>Email</option>
          <option>Phone</option>
          <option>Either email or phone</option>
        </select>
      </div>

      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-slate-700">
          Supporting records <span className="text-xs font-normal text-slate-400">(optional)</span>
        </label>
        <div className="p-3 bg-white border border-dashed border-slate-300 rounded-xl text-xs text-slate-600">
          <input
            name="attachment"
            type="file"
            accept="application/pdf,image/png,image/jpeg,image/webp,.doc,.docx"
            className="w-full text-xs text-slate-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-medium file:bg-[#102a43] file:text-white hover:file:bg-[#1a385c] file:cursor-pointer transition-colors"
          />
          <span className="text-[11px] text-slate-400 block mt-1.5">Accepted files: PDF, Word, JPG, PNG, or WEBP up to 10 MB.</span>
        </div>
      </div>

      <button
        type="submit"
        className="w-fit px-4 h-12 bg-[#102a43] hover:bg-[#1a385c] text-white font-medium text-sm transition-all shadow-sm hover:shadow active:scale-[0.99] disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
        disabled={busy}
      >
        {busy ? 'Submitting securely...' : 'Submit Research Request'}
      </button>

      {error && (
        <p
          className="text-xs text-red-700 bg-red-50 p-3 rounded-xl border border-red-200 text-center font-medium"
          role="alert"
        >
          {error}
        </p>
      )}

      <p className="text-center text-xs text-slate-400">
        Please submit only information you are authorized to share and only for lawful, ethical purposes.
      </p>
    </form>
  );
}

