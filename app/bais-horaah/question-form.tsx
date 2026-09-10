'use client';
import { FormEvent, useState } from 'react';

export default function BaisHoraahQuestionForm() {
  const [reference, setReference] = useState('');
  const [error, setError] = useState('');
  const [sending, setSending] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setSending(true);
    const form = event.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries()) as Record<
      string,
      string
    >;
    const preferred = data.preferred || 'Email';
    const question = `Preferred response method: ${preferred}\n\n${data.question || ''}`;
    const response = await fetch('/api/questions', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ ...data, question }),
    });
    const result = (await response.json()) as {
      reference?: string;
      error?: string;
    };
    setSending(false);
    if (!response.ok || !result.reference) {
      setError(
        result.error ||
          'The question could not be submitted. Please try again or call the hotline.',
      );
      return;
    }
    setReference(result.reference);
    form.reset();
  }

  if (reference) {
    return (
      <div className="p-8 sm:p-10 bg-white border border-gray-100 text-center space-y-5">
        <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center text-2xl font-bold mx-auto border border-emerald-100">
          ✓
        </div>
        <div className="space-y-1">
          <span className="inline-block px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-medium rounded-full border border-emerald-100">
            Question Received
          </span>
          <h2 className="text-2xl font-serif font-bold text-[#102a43] pt-2">
            Question received securely
          </h2>
        </div>
        <p className="text-sm text-slate-600">Your reference number is:</p>
        <strong className="text-2xl font-mono text-[#c69b46] bg-slate-50 px-5 py-2.5 rounded-xl border border-slate-200 inline-block font-semibold tracking-wider">
          {reference}
        </strong>
        <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
          Please keep this reference number. A member of the Bais Horaah team will review your submission and respond promptly.
        </p>
        <button
          type="button"
          className="mt-2 px-6 py-3 bg-[#102a43] hover:bg-[#1a385c] text-white text-xs font-medium rounded-xl transition-all cursor-pointer"
          onClick={() => setReference('')}
        >
          Submit another question
        </button>
      </div>
    );
  }

  return (
    <form
      className="p-6 sm:p-8 bg-gray-50 border border-gray-100 space-y-6"
      onSubmit={submit}
    >
      <div className="border-b border-slate-100 pb-5 space-y-1.5">
        <h2 className="text-xl sm:text-2xl font-serif font-semibold text-[#102a43]">
          Ask the Bais Horaah
        </h2>
        <p className="text-xs text-slate-500">
          Submit your Halachic inquiry confidentially. Required fields are marked with an asterisk (<span className="text-red-500">*</span>).
        </p>
      </div>

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
            Phone number
          </label>
          <input
            name="phone"
            type="tel"
            autoComplete="tel"
            placeholder="(555) 000-0000"
            className="w-full h-11 px-3.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm font-normal text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#102a43]/15 focus:border-[#102a43] focus:bg-white transition-all"
          />
        </div>
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-slate-700">
            Preferred response method
          </label>
          <select
            name="preferred"
            className="w-full h-11 px-3.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm font-normal text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#102a43]/15 focus:border-[#102a43] focus:bg-white transition-all cursor-pointer"
          >
            <option>Email</option>
            <option>Phone call</option>
            <option>Either email or phone</option>
          </select>
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-slate-700">
          Question category
        </label>
        <select
          name="topic"
          className="w-full h-11 px-3.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm font-normal text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#102a43]/15 focus:border-[#102a43] focus:bg-white transition-all cursor-pointer"
        >
          <option>Loan or repayment</option>
          <option>Heter Iska</option>
          <option>Business or partnership</option>
          <option>Banking or mortgage</option>
          <option>Investment</option>
          <option>Sale or payment plan</option>
          <option>Other Ribbis question</option>
        </select>
      </div>

      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-slate-700">
          Your question <span className="text-red-500">*</span>
        </label>
        <textarea
          name="question"
          required
          rows={6}
          placeholder="Please describe the arrangement, the parties involved, what money or benefit is being given or received, and any relevant deadlines or context..."
          className="w-full p-3.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm font-normal text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#102a43]/15 focus:border-[#102a43] focus:bg-white transition-all leading-relaxed"
        />
      </div>

      <label className="flex items-start gap-3 text-xs text-slate-600 leading-relaxed cursor-pointer select-none">
        <input
          type="checkbox"
          required
          className="mt-0.5 rounded border-slate-300 text-[#102a43] focus:ring-[#102a43]"
        />
        <span>
          I understand that online responses do not replace urgent personal guidance, and I confirm I have not included sensitive passwords, account numbers, or payment credentials.
        </span>
      </label>

      {error && (
        <p
          className="text-xs text-red-700 bg-red-50 p-3 rounded-xl border border-red-200 text-center font-medium"
          role="alert"
        >
          {error}
        </p>
      )}

      <button
        type="submit"
        className="w-fit px-4 h-12 bg-[#102a43] hover:bg-[#1a385c] text-white font-medium text-sm transition-all shadow-sm hover:shadow active:scale-[0.99] disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
        disabled={sending}
      >
        {sending ? 'Submitting question...' : 'Submit Question Securely'}
      </button>
    </form>
  );
}

