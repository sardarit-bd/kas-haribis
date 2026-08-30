'use client';
import { FormEvent, useState } from 'react';
export default function BankResearchForm() {
  const [mode, setMode] = useState('Request research on a lender'),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(''),
    [reference, setReference] = useState('');
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError('');
    const form = event.currentTarget,
      data = new FormData(form);
    data.set('topic', 'Bank correction or update');
    data.set('request_subtype', mode);
    try {
      const response = await fetch('/api/contact-submissions', {
          method: 'POST',
          body: data,
        }),
        result = (await response.json()) as any;
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
    <section className="bankResearchSubmission" id="submit-bank-information">
      <div className="bankResearchIntro">
        <p className="eyebrow gold">COMMUNITY RESEARCH</p>
        <h2>Help strengthen the directory</h2>
        <p>
          Know something about a bank, lender, mortgage company, credit union,
          or financing provider? Request new research or securely share
          information with Kav Haribis.
        </p>
        <div className="bankResearchBenefits">
          <span>
            <b>01</b> Request research on an unlisted lender
          </span>
          <span>
            <b>02</b> Share new documents or information
          </span>
          <span>
            <b>03</b> Request an update to an existing listing
          </span>
        </div>
        <aside>
          <strong>Privacy reminder</strong>
          <p>
            Never upload account numbers, passwords, card details, or other
            private financial credentials.
          </p>
        </aside>
      </div>
      {reference ? (
        <div className="bankResearchSuccess">
          <span>✓</span>
          <small>SUBMISSION RECEIVED</small>
          <h3>Thank you for helping the community</h3>
          <p>Your reference number is:</p>
          <strong>{reference}</strong>
          <p>The Kav Haribis research team will review the information.</p>
          <button onClick={() => setReference('')}>
            Submit another lender
          </button>
        </div>
      ) : (
        <form onSubmit={submit} className="bankResearchForm">
          <div className="bankFormHeading">
            <small>BANK & LENDER RESEARCH</small>
            <h3>Submit information</h3>
            <p>Select what you would like the research team to review.</p>
          </div>
          <div className="bankRequestChoices">
            {[
              'Request research on a lender',
              'Share new lender information',
              'Request an update to a listing',
            ].map((choice, index) => (
              <label className={mode === choice ? 'selected' : ''} key={choice}>
                <input
                  type="radio"
                  name="mode"
                  value={choice}
                  checked={mode === choice}
                  onChange={() => setMode(choice)}
                />
                <span>{index + 1}</span>
                <b>{choice}</b>
              </label>
            ))}
          </div>
          <label>
            Bank, lender, or institution name
            <input
              name="related_name"
              required
              placeholder="Enter the full name"
            />
          </label>
          <div className="bankResearchRow">
            <label>
              Institution website <em>optional</em>
              <input name="related_url" type="url" placeholder="https://…" />
            </label>
            <label>
              Your relationship <em>optional</em>
              <select name="organization">
                <option value="">Please select</option>
                <option>Customer or borrower</option>
                <option>Employee or representative</option>
                <option>Broker or professional</option>
                <option>Community researcher</option>
                <option>Other</option>
              </select>
            </label>
          </div>
          <label>
            Information or research request
            <textarea
              name="message"
              rows={7}
              minLength={10}
              required
              placeholder={
                mode === 'Request research on a lender'
                  ? 'Tell us what lender or product you would like researched and why…'
                  : 'Describe the information, correction, or update in detail…'
              }
            />
          </label>
          <label className="bankDocumentUpload">
            Supporting document <em>optional</em>
            <input
              type="file"
              name="attachment"
              accept="application/pdf,image/png,image/jpeg,image/webp,.doc,.docx"
            />
            <small>PDF, Word, JPG, PNG, or WEBP up to 10 MB.</small>
          </label>
          <div className="bankResearchRow">
            <label>
              Your name
              <input name="name" autoComplete="name" required />
            </label>
            <label>
              Email address
              <input name="email" type="email" autoComplete="email" required />
            </label>
          </div>
          <div className="bankResearchRow">
            <label>
              Phone <em>optional</em>
              <input name="phone" type="tel" autoComplete="tel" />
            </label>
            <label>
              Preferred response
              <select name="response_method">
                <option>Email</option>
                <option>Phone</option>
                <option>Either email or phone</option>
              </select>
            </label>
          </div>
          <button className="primary" disabled={busy}>
            {busy ? 'Submitting securely…' : 'Submit to Research Team →'}
          </button>
          {error && <p className="bankResearchError">{error}</p>}
        </form>
      )}
    </section>
  );
}
