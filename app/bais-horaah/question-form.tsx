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
  if (reference)
    return (
      <div className="p-8 bg-white border border-[#e2e8f0] rounded-2xl shadow-md text-center space-y-4">
        <div className="w-12 h-12 bg-[#e9f4eb] text-[#367448] rounded-full flex items-center justify-center text-xl font-bold mx-auto">✓</div>
        <h2 className="text-2xl font-serif font-bold text-[#102a43]">Question received</h2>
        <p className="text-sm text-[#64748b]">Your reference number is:</p>
        <strong className="text-2xl font-mono text-[#c69b46] bg-[#f8fafc] px-4 py-2 rounded-lg border border-[#e2e8f0] inline-block">{reference}</strong>
        <p className="text-xs text-[#64748b]">
          Please keep this number. A member of the Bais Horaah team will review
          your submission.
        </p>
        <button
          type="button"
          className="mt-4 px-6 py-3 bg-[#102a43] hover:bg-[#1a385c] text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-colors shadow-md cursor-pointer"
          onClick={() => setReference('')}
        >
          Submit another question
        </button>
      </div>
    );
  return (
    <form className="p-6 sm:p-8 bg-white border border-[#e2e8f0] rounded-2xl shadow-md space-y-5" onSubmit={submit}>
      <div className="border-b border-[#f1f5f9] pb-4 space-y-1">
        <small className="text-[#c69b46] font-mono font-bold text-[10px] tracking-widest uppercase block">PRIVATE QUESTION FORM</small>
        <h2 className="text-xl font-serif font-bold text-[#102a43]">Ask the Bais Horaah</h2>
        <p className="text-xs text-[#94a3b8]">Fields marked with an asterisk are required.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <label className="block space-y-1.5 text-xs font-bold text-[#102a43] uppercase tracking-wider">
          Full name *
          <input
            name="name"
            autoComplete="name"
            required
            placeholder="Your name"
            className="w-full h-11 px-3.5 bg-white border border-[#cbd5da] rounded-xl text-sm font-normal text-[#102a43] normal-case focus:outline-none focus:ring-2 focus:ring-[#102a43]/20 focus:border-[#102a43]"
          />
        </label>
        <label className="block space-y-1.5 text-xs font-bold text-[#102a43] uppercase tracking-wider">
          Email address *
          <input
            name="email"
            type="email"
            autoComplete="email"
            required
            placeholder="you@example.com"
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
            placeholder="(000) 000-0000"
            className="w-full h-11 px-3.5 bg-white border border-[#cbd5da] rounded-xl text-sm font-normal text-[#102a43] normal-case focus:outline-none focus:ring-2 focus:ring-[#102a43]/20 focus:border-[#102a43]"
          />
        </label>
        <label className="block space-y-1.5 text-xs font-bold text-[#102a43] uppercase tracking-wider">
          Preferred response
          <select
            name="preferred"
            className="w-full h-11 px-3.5 bg-white border border-[#cbd5da] rounded-xl text-sm font-normal text-[#102a43] normal-case cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#102a43]/20 focus:border-[#102a43]"
          >
            <option>Email</option>
            <option>Phone call</option>
            <option>Either email or phone</option>
          </select>
        </label>
      </div>

      <label className="block space-y-1.5 text-xs font-bold text-[#102a43] uppercase tracking-wider">
        Question category
        <select
          name="topic"
          className="w-full h-11 px-3.5 bg-white border border-[#cbd5da] rounded-xl text-sm font-normal text-[#102a43] normal-case cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#102a43]/20 focus:border-[#102a43]"
        >
          <option>Loan or repayment</option>
          <option>Heter Iska</option>
          <option>Business or partnership</option>
          <option>Banking or mortgage</option>
          <option>Investment</option>
          <option>Sale or payment plan</option>
          <option>Other Ribbis question</option>
        </select>
      </label>

      <label className="block space-y-1.5 text-xs font-bold text-[#102a43] uppercase tracking-wider">
        Your question *
        <textarea
          name="question"
          required
          rows={7}
          placeholder="Describe the arrangement, the parties involved, what money or benefit is being given, and any relevant deadlines or documents…"
          className="w-full p-3.5 bg-white border border-[#cbd5da] rounded-xl text-sm font-normal text-[#102a43] normal-case focus:outline-none focus:ring-2 focus:ring-[#102a43]/20 focus:border-[#102a43]"
        />
      </label>

      <label className="flex items-start gap-3 text-xs text-[#64748b] leading-relaxed cursor-pointer">
        <input type="checkbox" required className="mt-0.5 rounded border-[#cbd5da] text-[#102a43] focus:ring-[#102a43]" />
        <span>
          I understand that online information is not a substitute for urgent
          personal guidance, and I have not included passwords, account numbers,
          or card information.
        </span>
      </label>

      {error && (
        <p className="text-xs text-[#9b1c1c] bg-[#fde8e8] p-3 rounded-lg border border-[#f8b4b4] text-center" role="alert">
          {error}
        </p>
      )}

      <button
        className="w-full h-12 bg-[#102a43] hover:bg-[#1a385c] text-white font-bold text-sm uppercase tracking-wider rounded-xl transition-colors shadow-md disabled:opacity-50 cursor-pointer"
        disabled={sending}
      >
        {sending ? 'Submitting…' : 'Submit question securely →'}
      </button>
    </form>
  );
}
