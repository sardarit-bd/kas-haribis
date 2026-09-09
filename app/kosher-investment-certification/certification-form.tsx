'use client';
import { FormEvent, useState } from 'react';

export default function CertificationForm() {
  const [busy, setBusy] = useState(false),
    [error, setError] = useState(''),
    [reference, setReference] = useState('');
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError('');
    const form = event.currentTarget;
    try {
      const response = await fetch('/api/certification-applications', {
          method: 'POST',
          body: new FormData(form),
        }),
        result = (await response.json()) as any;
      if (!response.ok)
        throw new Error(
          result.error || 'The application could not be submitted.',
        );
      setReference(result.reference);
      form.reset();
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : 'The application could not be submitted.',
      );
    } finally {
      setBusy(false);
    }
  }
  if (reference)
    return (
      <div className="p-8 bg-white border border-[#e2e8f0] rounded-2xl shadow-md text-center space-y-4">
        <span className="w-12 h-12 bg-[#e9f4eb] text-[#367448] rounded-full flex items-center justify-center text-xl font-bold mx-auto">✓</span>
        <small className="text-[#367448] font-mono font-bold text-[10px] tracking-widest uppercase block">APPLICATION RECEIVED</small>
        <h3 className="text-2xl font-serif font-bold text-[#102a43]">Thank you</h3>
        <p className="text-sm text-[#64748b]">Your reference number is:</p>
        <strong className="text-2xl font-mono text-[#c69b46] bg-[#f8fafc] px-4 py-2 rounded-lg border border-[#e2e8f0] inline-block">{reference}</strong>
        <p className="text-xs text-[#64748b]">
          Kav Haribis will review the initial information and contact you if
          additional documents are required.
        </p>
        <button
          className="mt-4 px-6 py-3 bg-[#102a43] hover:bg-[#1a385c] text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-colors shadow-md cursor-pointer"
          onClick={() => setReference('')}
        >
          Submit another application
        </button>
      </div>
    );
  return (
    <form className="p-6 sm:p-8 bg-white border border-[#e2e8f0] rounded-2xl shadow-md space-y-5" onSubmit={submit}>
      <div className="border-b border-[#f1f5f9] pb-4 space-y-1">
        <small className="text-[#c69b46] font-mono font-bold text-[10px] tracking-widest uppercase block">CONFIDENTIAL INITIAL APPLICATION</small>
        <h3 className="text-xl font-serif font-bold text-[#102a43]">Institution or investment details</h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <label className="block space-y-1.5 text-xs font-bold text-[#102a43] uppercase tracking-wider">
          Company, bank, or sponsor name
          <input
            name="company_name"
            required
            className="w-full h-11 px-3.5 bg-white border border-[#cbd5da] rounded-xl text-sm font-normal text-[#102a43] normal-case focus:outline-none focus:ring-2 focus:ring-[#102a43]/20 focus:border-[#102a43]"
          />
        </label>
        <label className="block space-y-1.5 text-xs font-bold text-[#102a43] uppercase tracking-wider">
          Offering, product, or institution name
          <input
            name="offering_name"
            className="w-full h-11 px-3.5 bg-white border border-[#cbd5da] rounded-xl text-sm font-normal text-[#102a43] normal-case focus:outline-none focus:ring-2 focus:ring-[#102a43]/20 focus:border-[#102a43]"
          />
        </label>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <label className="block space-y-1.5 text-xs font-bold text-[#102a43] uppercase tracking-wider">
          Review type
          <select
            name="investment_type"
            className="w-full h-11 px-3.5 bg-white border border-[#cbd5da] rounded-xl text-sm font-normal text-[#102a43] normal-case cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#102a43]/20 focus:border-[#102a43]"
          >
            <option>Bank certification</option>
            <option>Mortgage company certification</option>
            <option>Direct lender certification</option>
            <option>Other lending company</option>
            <option>Real estate investment</option>
            <option>Private equity</option>
            <option>Private credit</option>
            <option>Business investment</option>
            <option>Fund</option>
            <option>Loan or note</option>
            <option>Other</option>
          </select>
        </label>
        <label className="block space-y-1.5 text-xs font-bold text-[#102a43] uppercase tracking-wider">
          Minimum investment or loan amount
          <input
            name="minimum_investment"
            placeholder="If applicable"
            className="w-full h-11 px-3.5 bg-white border border-[#cbd5da] rounded-xl text-sm font-normal text-[#102a43] normal-case focus:outline-none focus:ring-2 focus:ring-[#102a43]/20 focus:border-[#102a43]"
          />
        </label>
      </div>

      <label className="block space-y-1.5 text-xs font-bold text-[#102a43] uppercase tracking-wider">
        Website <em className="not-italic text-[10px] font-normal text-[#94a3b8] normal-case">(optional)</em>
        <input
          name="website"
          type="url"
          placeholder="https://…"
          className="w-full h-11 px-3.5 bg-white border border-[#cbd5da] rounded-xl text-sm font-normal text-[#102a43] normal-case focus:outline-none focus:ring-2 focus:ring-[#102a43]/20 focus:border-[#102a43]"
        />
      </label>

      <label className="block space-y-1.5 text-xs font-bold text-[#102a43] uppercase tracking-wider">
        Describe the complete financial structure
        <textarea
          name="structure_details"
          minLength={20}
          rows={6}
          required
          placeholder="Explain ownership, funding sources, products or investments, returns or interest, repayment, guarantees, fees, distributions, and all parties involved…"
          className="w-full p-3.5 bg-white border border-[#cbd5da] rounded-xl text-sm font-normal text-[#102a43] normal-case focus:outline-none focus:ring-2 focus:ring-[#102a43]/20 focus:border-[#102a43]"
        />
      </label>

      <label className="block space-y-1.5 text-xs font-bold text-[#102a43] uppercase tracking-wider">
        Who are the intended investors or borrowers?
        <textarea
          name="investor_profile"
          rows={3}
          placeholder="Individuals, businesses, accredited investors, institutions, homeowners…"
          className="w-full p-3.5 bg-white border border-[#cbd5da] rounded-xl text-sm font-normal text-[#102a43] normal-case focus:outline-none focus:ring-2 focus:ring-[#102a43]/20 focus:border-[#102a43]"
        />
      </label>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <label className="block space-y-1.5 text-xs font-bold text-[#102a43] uppercase tracking-wider">
          Current Heter Iska
          <select
            name="current_heter_iska"
            className="w-full h-11 px-3.5 bg-white border border-[#cbd5da] rounded-xl text-sm font-normal text-[#102a43] normal-case cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#102a43]/20 focus:border-[#102a43]"
          >
            <option>No Heter Iska yet</option>
            <option>Existing Heter Iska available</option>
            <option>Not sure</option>
          </select>
        </label>
        <label className="block space-y-1.5 text-xs font-bold text-[#102a43] uppercase tracking-wider">
          Desired timeline
          <input
            name="desired_timeline"
            placeholder="Example: before September launch"
            className="w-full h-11 px-3.5 bg-white border border-[#cbd5da] rounded-xl text-sm font-normal text-[#102a43] normal-case focus:outline-none focus:ring-2 focus:ring-[#102a43]/20 focus:border-[#102a43]"
          />
        </label>
      </div>

      <label className="block space-y-1.5 text-xs font-bold text-[#102a43] uppercase tracking-wider">
        Principal agreement or supporting document <em className="not-italic text-[10px] font-normal text-[#94a3b8] normal-case">(optional)</em>
        <input
          name="attachment"
          type="file"
          accept="application/pdf,image/png,image/jpeg,image/webp,.doc,.docx"
          className="w-full text-xs text-[#64748b] file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-[#102a43] file:text-white hover:file:bg-[#1a385c] file:cursor-pointer"
        />
        <small className="text-[11px] font-normal text-[#94a3b8] normal-case block">PDF, Word, JPG, PNG, or WEBP up to 15 MB.</small>
      </label>

      <fieldset className="border border-[#e2e8f0] p-4 rounded-xl space-y-4">
        <legend className="text-xs font-bold text-[#c69b46] px-2 uppercase tracking-wider">Contact information</legend>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <label className="block space-y-1.5 text-xs font-bold text-[#102a43] uppercase tracking-wider">
            Contact name
            <input
              name="contact_name"
              required
              className="w-full h-11 px-3.5 bg-white border border-[#cbd5da] rounded-xl text-sm font-normal text-[#102a43] normal-case focus:outline-none focus:ring-2 focus:ring-[#102a43]/20 focus:border-[#102a43]"
            />
          </label>
          <label className="block space-y-1.5 text-xs font-bold text-[#102a43] uppercase tracking-wider">
            Email
            <input
              name="email"
              type="email"
              required
              className="w-full h-11 px-3.5 bg-white border border-[#cbd5da] rounded-xl text-sm font-normal text-[#102a43] normal-case focus:outline-none focus:ring-2 focus:ring-[#102a43]/20 focus:border-[#102a43]"
            />
          </label>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <label className="block space-y-1.5 text-xs font-bold text-[#102a43] uppercase tracking-wider">
            Phone
            <input
              name="phone"
              type="tel"
              className="w-full h-11 px-3.5 bg-white border border-[#cbd5da] rounded-xl text-sm font-normal text-[#102a43] normal-case focus:outline-none focus:ring-2 focus:ring-[#102a43]/20 focus:border-[#102a43]"
            />
          </label>
          <label className="block space-y-1.5 text-xs font-bold text-[#102a43] uppercase tracking-wider">
            Preferred response
            <select
              name="response_method"
              className="w-full h-11 px-3.5 bg-white border border-[#cbd5da] rounded-xl text-sm font-normal text-[#102a43] normal-case cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#102a43]/20 focus:border-[#102a43]"
            >
              <option>Email</option>
              <option>Phone</option>
              <option>Either email or phone</option>
            </select>
          </label>
        </div>
      </fieldset>

      <label className="flex items-start gap-3 text-xs text-[#64748b] leading-relaxed cursor-pointer">
        <input type="checkbox" required className="mt-0.5 rounded border-[#cbd5da] text-[#102a43] focus:ring-[#102a43]" />
        <span>
          I understand that submitting this form is not certification or
          approval, and that Kav Haribis may require additional information.
        </span>
      </label>

      <button
        className="w-full h-12 bg-[#102a43] hover:bg-[#1a385c] text-white font-bold text-sm uppercase tracking-wider rounded-xl transition-colors shadow-md disabled:opacity-50 cursor-pointer"
        disabled={busy}
      >
        {busy ? 'Submitting securely…' : 'Submit Application →'}
      </button>
      {error && <p className="text-xs text-[#9b1c1c] bg-[#fde8e8] p-3 rounded-lg border border-[#f8b4b4] text-center">{error}</p>}
    </form>
  );
}
