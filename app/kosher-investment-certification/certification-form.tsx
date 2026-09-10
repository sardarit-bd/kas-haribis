'use client';
import { FormEvent, useState } from 'react';

export default function CertificationForm() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [reference, setReference] = useState('');

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError('');
    const form = event.currentTarget;
    try {
      const response = await fetch('/api/certification-applications', {
        method: 'POST',
        body: new FormData(form),
      });
      const result = (await response.json()) as any;
      if (!response.ok) {
        throw new Error(
          result.error || 'The application could not be submitted.',
        );
      }
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

  if (reference) {
    return (
      <div className="p-8 sm:p-10 bg-white border border-slate-200/80 rounded-2xl shadow-sm text-center space-y-5">
        <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center text-2xl font-bold mx-auto border border-emerald-100">
          ✓
        </div>
        <div className="space-y-1">
          <span className="inline-block px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-medium rounded-full border border-emerald-100">
            Application Received
          </span>
          <h3 className="text-2xl font-serif font-bold text-[#102a43] pt-2">
            Thank you for your submission
          </h3>
        </div>
        <p className="text-sm text-slate-600">Your reference number is:</p>
        <strong className="text-2xl font-mono text-[#c69b46] bg-slate-50 px-5 py-2.5 rounded-xl border border-slate-200 inline-block font-semibold tracking-wider">
          {reference}
        </strong>
        <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
          Kav Haribis will review your initial information and reach out if any additional documentation or clarification is needed.
        </p>
        <button
          type="button"
          className="mt-2 px-6 py-3 bg-[#102a43] hover:bg-[#1a385c] text-white text-xs font-semibold rounded-xl transition-all shadow-sm cursor-pointer"
          onClick={() => setReference('')}
        >
          Submit another application
        </button>
      </div>
    );
  }

  return (
    <form
      className="p-6 sm:p-8 bg-white border border-gray-100 space-y-6"
      onSubmit={submit}
    >
      <div className="border-b border-slate-100 pb-5 space-y-1.5">
        <div className="hidden items-center gap-1.5 px-3 py-1 bg-[#f8f5ee] border border-[#e8dfce] text-[#9a7629] text-xs font-medium">
          <span className="w-1.5 h-1.5 rounded-full bg-[#c69b46] hidden"></span>
          Confidential Initial Application
        </div>
        <h3 className="text-xl sm:text-2xl font-serif font-semibold text-[#102a43] pt-1">
          Institution or Investment Details
        </h3>
        <p className="text-xs text-slate-500">
          Please provide initial details regarding your entity, financial structure, and contact information.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-slate-700">
            Company, bank, or sponsor name <span className="text-red-500">*</span>
          </label>
          <input
            name="company_name"
            required
            placeholder="e.g. Acme Capital Partners"
            className="w-full h-11 px-3.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm font-normal text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#102a43]/15 focus:border-[#102a43] focus:bg-white transition-all"
          />
        </div>
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-slate-700">
            Offering, product, or institution name
          </label>
          <input
            name="offering_name"
            placeholder="e.g. Real Estate Debt Fund I"
            className="w-full h-11 px-3.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm font-normal text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#102a43]/15 focus:border-[#102a43] focus:bg-white transition-all"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-slate-700">
            Review type
          </label>
          <select
            name="investment_type"
            className="w-full h-11 px-3.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm font-normal text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#102a43]/15 focus:border-[#102a43] focus:bg-white transition-all cursor-pointer"
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
        </div>
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-slate-700">
            Minimum investment or loan amount
          </label>
          <input
            name="minimum_investment"
            placeholder="e.g. $100,000 (if applicable)"
            className="w-full h-11 px-3.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm font-normal text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#102a43]/15 focus:border-[#102a43] focus:bg-white transition-all"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-slate-700">
          Website <span className="text-xs font-normal text-slate-400">(optional)</span>
        </label>
        <input
          name="website"
          type="url"
          placeholder="https://example.com"
          className="w-full h-11 px-3.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm font-normal text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#102a43]/15 focus:border-[#102a43] focus:bg-white transition-all"
        />
      </div>

      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-slate-700">
          Financial structure description <span className="text-red-500">*</span>
        </label>
        <textarea
          name="structure_details"
          minLength={20}
          rows={5}
          required
          placeholder="Please explain the ownership structure, funding sources, returns or interest rates, repayment terms, guarantees, fees, distributions, and involved parties..."
          className="w-full p-3.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm font-normal text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#102a43]/15 focus:border-[#102a43] focus:bg-white transition-all leading-relaxed"
        />
      </div>

      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-slate-700">
          Intended investors or borrowers
        </label>
        <textarea
          name="investor_profile"
          rows={3}
          placeholder="e.g. Individual retail investors, accredited investors, institutional clients, homeowners..."
          className="w-full p-3.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm font-normal text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#102a43]/15 focus:border-[#102a43] focus:bg-white transition-all leading-relaxed"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-slate-700">
            Current Heter Iska status
          </label>
          <select
            name="current_heter_iska"
            className="w-full h-11 px-3.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm font-normal text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#102a43]/15 focus:border-[#102a43] focus:bg-white transition-all cursor-pointer"
          >
            <option>No Heter Iska yet</option>
            <option>Existing Heter Iska available</option>
            <option>Not sure</option>
          </select>
        </div>
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-slate-700">
            Desired timeline
          </label>
          <input
            name="desired_timeline"
            placeholder="e.g. Next 2-3 weeks / Before Q4 launch"
            className="w-full h-11 px-3.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm font-normal text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#102a43]/15 focus:border-[#102a43] focus:bg-white transition-all"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-slate-700">
          Principal agreement or supporting document <span className="text-xs font-normal text-slate-400">(optional)</span>
        </label>
        <div className="p-3 bg-slate-50/70 border border-dashed border-slate-300 rounded-xl text-xs text-slate-600">
          <input
            name="attachment"
            type="file"
            accept="application/pdf,image/png,image/jpeg,image/webp,.doc,.docx"
            className="w-full text-xs text-slate-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-medium file:bg-[#102a43] file:text-white hover:file:bg-[#1a385c] file:cursor-pointer transition-colors"
          />
          <span className="text-[11px] text-slate-400 block mt-1.5">Accepted files: PDF, Word, JPG, PNG, or WEBP up to 15 MB.</span>
        </div>
      </div>

      <div className="pt-2">
        <div className="p-4 sm:p-5 bg-slate-50/60 border border-slate-200/80 rounded-xl space-y-4">
          <h4 className="text-xs font-semibold text-[#102a43] uppercase tracking-wider">
            Contact Information
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-slate-700">
                Contact name <span className="text-red-500">*</span>
              </label>
              <input
                name="contact_name"
                required
                placeholder="Full name"
                className="w-full h-10 px-3 bg-white border border-slate-200 rounded-lg text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#102a43]/15 focus:border-[#102a43] transition-all"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-slate-700">
                Email address <span className="text-red-500">*</span>
              </label>
              <input
                name="email"
                type="email"
                required
                placeholder="name@company.com"
                className="w-full h-10 px-3 bg-white border border-slate-200 rounded-lg text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#102a43]/15 focus:border-[#102a43] transition-all"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-slate-700">
                Phone number
              </label>
              <input
                name="phone"
                type="tel"
                placeholder="(555) 000-0000"
                className="w-full h-10 px-3 bg-white border border-slate-200 rounded-lg text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#102a43]/15 focus:border-[#102a43] transition-all"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-slate-700">
                Preferred response method
              </label>
              <select
                name="response_method"
                className="w-full h-10 px-3 bg-white border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#102a43]/15 focus:border-[#102a43] transition-all cursor-pointer"
              >
                <option>Email</option>
                <option>Phone</option>
                <option>Either email or phone</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <label className="flex items-start gap-3 text-xs text-slate-600 leading-relaxed cursor-pointer select-none">
        <input
          type="checkbox"
          required
          className="mt-0.5 rounded border-slate-300 text-[#102a43] focus:ring-[#102a43]"
        />
        <span>
          I understand that submitting this initial application does not constitute certification or approval, and that Kav Haribis may require additional information before reaching a determination.
        </span>
      </label>

      <button
        type="submit"
        className="w-full h-12 bg-[#102a43] hover:bg-[#1a385c] text-white font-medium text-sm rounded-xl transition-all shadow-sm hover:shadow active:scale-[0.99] disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
        disabled={busy}
      >
        {busy ? 'Submitting securely...' : 'Submit Application'}
      </button>

      {error && (
        <p className="text-xs text-red-700 bg-red-50 p-3 rounded-xl border border-red-200 text-center font-medium">
          {error}
        </p>
      )}
    </form>
  );
}

