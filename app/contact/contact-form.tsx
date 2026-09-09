'use client';
import { FormEvent, useState } from 'react';
export default function ContactForm() {
  const [notice, setNotice] = useState(''),
    [reference, setReference] = useState(''),
    [busy, setBusy] = useState(false),
    [topic, setTopic] = useState('General message');
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setNotice('');
    const form = event.currentTarget,
      data = new FormData(form);
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
        throw new Error(result.error || 'Your message could not be submitted.');
      setReference(result.reference || '');
      form.reset();
      setTopic('General message');
    } catch (error) {
      setNotice(
        error instanceof Error
          ? error.message
          : 'Your message could not be submitted.',
      );
    } finally {
      setBusy(false);
    }
  }
  if (reference)
    return (
      <div className="md:col-span-7 bg-white border border-slate-200 border-t-4 border-t-emerald-500 p-8 sm:p-12 text-center space-y-4">
        <span className="w-14 h-14 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto text-2xl font-bold">✓</span>
        <small className="text-[10px] font-bold tracking-widest text-[#a37828] uppercase block">MESSAGE RECEIVED</small>
        <h2 className="text-3xl font-serif font-bold text-[#102a43]">Thank you for contacting us</h2>
        <p className="text-slate-600 text-sm">Your reference number is:</p>
        <strong className="block font-mono text-2xl font-bold text-[#102a43] bg-slate-100 py-3 px-6 rounded-xl border border-slate-200 my-2">{reference}</strong>
        <p className="text-slate-600 text-sm max-w-md mx-auto">
          Kav Haribis will review your submission and respond using the contact
          information provided.
        </p>
        <button className="inline-flex items-center px-6 py-3 rounded-xl bg-[#102a43] hover:bg-[#102a43]/90 text-white font-bold text-xs uppercase tracking-wider transition shadow-sm cursor-pointer" style={{ color: 'white' }} type="button" onClick={() => setReference('')}>
          Send another message
        </button>
      </div>
    );
  return (
    <form className="md:col-span-7 bg-white border border-slate-200/90 p-6 sm:p-10 space-y-5" onSubmit={submit}>
      <div>
        <small className="text-[10px] font-bold tracking-widest text-[#a37828] uppercase block mb-1">ONLINE SUBMISSION</small>
        <h2 className="text-3xl sm:text-4xl font-serif font-bold text-[#102a43] my-2">Tell us what you need</h2>
        <p className="text-slate-600 text-sm leading-relaxed">
          Your message will be saved securely in the private Kav Haribis
          administrator inbox.
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <label className="block text-xs font-bold text-slate-700 space-y-1.5">
          Full name
          <input
            className="w-full mt-1.5 px-3.5 py-3 border border-slate-300 rounded-xl bg-[#f8fafc] text-slate-900 text-sm focus:outline-none focus:bg-white focus:border-[#c69b46] focus:ring-2 focus:ring-[#c69b46]/20 transition"
            name="name"
            autoComplete="name"
            required
            placeholder="Your name"
          />
        </label>
        <label className="block text-xs font-bold text-slate-700 space-y-1.5">
          Email address
          <input
            className="w-full mt-1.5 px-3.5 py-3 border border-slate-300 rounded-xl bg-[#f8fafc] text-slate-900 text-sm focus:outline-none focus:bg-white focus:border-[#c69b46] focus:ring-2 focus:ring-[#c69b46]/20 transition"
            name="email"
            type="email"
            autoComplete="email"
            required
            placeholder="you@example.com"
          />
        </label>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <label className="block text-xs font-bold text-slate-700 space-y-1.5">
          Phone number <em className="text-slate-400 font-normal not-italic">optional</em>
          <input
            className="w-full mt-1.5 px-3.5 py-3 border border-slate-300 rounded-xl bg-[#f8fafc] text-slate-900 text-sm focus:outline-none focus:bg-white focus:border-[#c69b46] focus:ring-2 focus:ring-[#c69b46]/20 transition"
            name="phone"
            type="tel"
            autoComplete="tel"
            placeholder="(000) 000-0000"
          />
        </label>
        <label className="block text-xs font-bold text-slate-700 space-y-1.5">
          Organization <em className="text-slate-400 font-normal not-italic">optional</em>
          <input
            className="w-full mt-1.5 px-3.5 py-3 border border-slate-300 rounded-xl bg-[#f8fafc] text-slate-900 text-sm focus:outline-none focus:bg-white focus:border-[#c69b46] focus:ring-2 focus:ring-[#c69b46]/20 transition"
            name="organization"
            placeholder="Business, school, or organization"
          />
        </label>
      </div>
      <label className="block text-xs font-bold text-slate-700 space-y-1.5">
        What is this about?
        <select
          className="w-full mt-1.5 px-3.5 py-3 border border-slate-300 rounded-xl bg-[#f8fafc] text-slate-900 text-sm focus:outline-none focus:bg-white focus:border-[#c69b46] focus:ring-2 focus:ring-[#c69b46]/20 transition cursor-pointer"
          name="topic"
          required
          value={topic}
          onChange={(event) => setTopic(event.target.value)}
        >
          <option>General message</option>
          <option>Bank correction or update</option>
          <option>Program or speaking request</option>
          <option>Investment certification request</option>
          <option>Business directory submission</option>
          <option>Sponsorship inquiry</option>
          <option>Publications and seforim</option>
          <option>Donation or payment question</option>
        </select>
      </label>
      {topic === 'Bank correction or update' && (
        <fieldset className="border border-slate-200 rounded-2xl p-4 sm:p-6 bg-[#f8fafc]/60 space-y-4">
          <legend className="text-xs font-bold text-[#a37828] uppercase tracking-wider px-2">Bank information</legend>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className="block text-xs font-bold text-slate-700 space-y-1.5">
              Bank or institution name
              <input
                className="w-full mt-1.5 px-3.5 py-3 border border-slate-300 rounded-xl bg-white text-slate-900 text-sm focus:outline-none focus:border-[#c69b46] focus:ring-2 focus:ring-[#c69b46]/20 transition"
                name="related_name"
                required
                placeholder="Full institution name"
              />
            </label>
            <label className="block text-xs font-bold text-slate-700 space-y-1.5">
              Bank website <em className="text-slate-400 font-normal not-italic">optional</em>
              <input className="w-full mt-1.5 px-3.5 py-3 border border-slate-300 rounded-xl bg-white text-slate-900 text-sm focus:outline-none focus:border-[#c69b46] focus:ring-2 focus:ring-[#c69b46]/20 transition" name="related_url" type="url" placeholder="https://…" />
            </label>
          </div>
          <label className="block text-xs font-bold text-slate-700 space-y-1.5">
            Type of request
            <select name="request_subtype" className="w-full mt-1.5 px-3.5 py-3 border border-slate-300 rounded-xl bg-white text-slate-900 text-sm focus:outline-none focus:border-[#c69b46] focus:ring-2 focus:ring-[#c69b46]/20 transition cursor-pointer">
              <option>Share new information</option>
              <option>Request an update to the listing</option>
              <option>Report an incorrect status or comment</option>
              <option>Submit Heter Iska documentation</option>
            </select>
          </label>
        </fieldset>
      )}
      {topic === 'Program or speaking request' && (
        <fieldset className="border border-slate-200 rounded-2xl p-4 sm:p-6 bg-[#f8fafc]/60 space-y-4">
          <legend className="text-xs font-bold text-[#a37828] uppercase tracking-wider px-2">Program information</legend>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className="block text-xs font-bold text-slate-700 space-y-1.5">
              School or organization
              <input className="w-full mt-1.5 px-3.5 py-3 border border-slate-300 rounded-xl bg-white text-slate-900 text-sm focus:outline-none focus:border-[#c69b46] focus:ring-2 focus:ring-[#c69b46]/20 transition" name="related_name" required />
            </label>
            <label className="block text-xs font-bold text-slate-700 space-y-1.5">
              Preferred date <em className="text-slate-400 font-normal not-italic">optional</em>
              <input className="w-full mt-1.5 px-3.5 py-3 border border-slate-300 rounded-xl bg-white text-slate-900 text-sm focus:outline-none focus:border-[#c69b46] focus:ring-2 focus:ring-[#c69b46]/20 transition" name="preferred_date" type="date" />
            </label>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className="block text-xs font-bold text-slate-700 space-y-1.5">
              Location
              <input className="w-full mt-1.5 px-3.5 py-3 border border-slate-300 rounded-xl bg-white text-slate-900 text-sm focus:outline-none focus:border-[#c69b46] focus:ring-2 focus:ring-[#c69b46]/20 transition" name="location" placeholder="City or online" />
            </label>
            <label className="block text-xs font-bold text-slate-700 space-y-1.5">
              Audience
              <input
                className="w-full mt-1.5 px-3.5 py-3 border border-slate-300 rounded-xl bg-white text-slate-900 text-sm focus:outline-none focus:border-[#c69b46] focus:ring-2 focus:ring-[#c69b46]/20 transition"
                name="audience"
                placeholder="Students, business owners, community…"
              />
            </label>
          </div>
        </fieldset>
      )}
      {topic === 'Investment certification request' && (
        <fieldset className="border border-slate-200 rounded-2xl p-4 sm:p-6 bg-[#f8fafc]/60 space-y-4">
          <legend className="text-xs font-bold text-[#a37828] uppercase tracking-wider px-2">Certification request</legend>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className="block text-xs font-bold text-slate-700 space-y-1.5">
              Business or investment name
              <input className="w-full mt-1.5 px-3.5 py-3 border border-slate-300 rounded-xl bg-white text-slate-900 text-sm focus:outline-none focus:border-[#c69b46] focus:ring-2 focus:ring-[#c69b46]/20 transition" name="related_name" required />
            </label>
            <label className="block text-xs font-bold text-slate-700 space-y-1.5">
              Website <em className="text-slate-400 font-normal not-italic">optional</em>
              <input className="w-full mt-1.5 px-3.5 py-3 border border-slate-300 rounded-xl bg-white text-slate-900 text-sm focus:outline-none focus:border-[#c69b46] focus:ring-2 focus:ring-[#c69b46]/20 transition" name="related_url" type="url" placeholder="https://…" />
            </label>
          </div>
          <label className="block text-xs font-bold text-slate-700 space-y-1.5">
            Structure requiring review
            <input
              className="w-full mt-1.5 px-3.5 py-3 border border-slate-300 rounded-xl bg-white text-slate-900 text-sm focus:outline-none focus:border-[#c69b46] focus:ring-2 focus:ring-[#c69b46]/20 transition"
              name="request_subtype"
              placeholder="Loan, fund, partnership, investment offering…"
            />
          </label>
        </fieldset>
      )}
      {(topic === 'Business directory submission' ||
        topic === 'Sponsorship inquiry') && (
        <fieldset className="border border-slate-200 rounded-2xl p-4 sm:p-6 bg-[#f8fafc]/60 space-y-4">
          <legend className="text-xs font-bold text-[#a37828] uppercase tracking-wider px-2">
            {topic === 'Sponsorship inquiry'
              ? 'Sponsor information'
              : 'Business information'}
          </legend>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className="block text-xs font-bold text-slate-700 space-y-1.5">
              Business name
              <input className="w-full mt-1.5 px-3.5 py-3 border border-slate-300 rounded-xl bg-white text-slate-900 text-sm focus:outline-none focus:border-[#c69b46] focus:ring-2 focus:ring-[#c69b46]/20 transition" name="related_name" required />
            </label>
            <label className="block text-xs font-bold text-slate-700 space-y-1.5">
              Website <em className="text-slate-400 font-normal not-italic">optional</em>
              <input className="w-full mt-1.5 px-3.5 py-3 border border-slate-300 rounded-xl bg-white text-slate-900 text-sm focus:outline-none focus:border-[#c69b46] focus:ring-2 focus:ring-[#c69b46]/20 transition" name="related_url" type="url" placeholder="https://…" />
            </label>
          </div>
        </fieldset>
      )}
      <label className="block text-xs font-bold text-slate-700 space-y-1.5">
        Your message
        <textarea
          className="w-full mt-1.5 px-3.5 py-3 border border-slate-300 rounded-xl bg-[#f8fafc] text-slate-900 text-sm focus:outline-none focus:bg-white focus:border-[#c69b46] focus:ring-2 focus:ring-[#c69b46]/20 transition resize-y"
          name="message"
          rows={7}
          required
          minLength={10}
          placeholder="Please include the details we will need to respond…"
        />
      </label>
      <label className="block text-xs font-bold text-slate-700 space-y-1.5">
        Preferred response method
        <select name="response_method" className="w-full mt-1.5 px-3.5 py-3 border border-slate-300 rounded-xl bg-[#f8fafc] text-slate-900 text-sm focus:outline-none focus:bg-white focus:border-[#c69b46] focus:ring-2 focus:ring-[#c69b46]/20 transition cursor-pointer">
          <option>Email</option>
          <option>Phone</option>
          <option>Either email or phone</option>
        </select>
      </label>
      <label className="block text-xs font-bold text-slate-700 space-y-1.5">
        Supporting document <em className="text-slate-400 font-normal not-italic">optional</em>
        <input
          className="w-full mt-1.5 px-3.5 py-3 border border-slate-300 rounded-xl bg-[#f8fafc] text-slate-900 text-sm file:mr-4 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-[#102a43] file:text-white cursor-pointer"
          name="attachment"
          type="file"
          accept="application/pdf,image/png,image/jpeg,image/webp,.doc,.docx"
        />
        <small className="block text-[10px] font-medium text-slate-400 mt-1">PDF, Word document, JPG, PNG, or WEBP up to 10 MB.</small>
      </label>
      <button className="w-full mt-3 py-3.5 px-6 rounded-xl bg-[#102a43] hover:bg-[#102a43]/90 text-white font-bold text-sm tracking-wide transition shadow-sm cursor-pointer disabled:opacity-50" style={{ color: 'white' }} type="submit" disabled={busy}>
        {busy ? 'Submitting…' : 'Submit Message →'}
      </button>
      {notice && (
        <p className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 text-sm rounded-xl" aria-live="polite">
          {notice}
        </p>
      )}
      <small className="block mt-4 text-xs text-slate-500 leading-relaxed text-center">
        For questions requiring a halachic response, please use the Bais Horaah
        question form. Never submit passwords, card numbers, or account numbers.
      </small>
    </form>
  );
}
