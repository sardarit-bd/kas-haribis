'use client';
import { FormEvent, useEffect, useState } from 'react';

const choices = [
  'Request research on a lender',
  'Share new lender information',
  'Request an update to a listing',
];

export default function BankResearchPopup() {
  const [open, setOpen] = useState(false),
    [mode, setMode] = useState(choices[0]),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(''),
    [reference, setReference] = useState('');
  useEffect(() => {
    if (!open) return;
    const close = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', close);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', close);
      document.body.style.overflow = '';
    };
  }, [open]);
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
    <>
      <aside className="bankResearchPrompt">
        <div>
          <small>HELP IMPROVE THE DIRECTORY</small>
          <b>Can’t find a lender—or have new information?</b>
          <span>Request research, share documents, or suggest an update.</span>
        </div>
        <button type="button" onClick={() => setOpen(true)}>
          Submit to the research team →
        </button>
      </aside>
      {open && (
        <div
          className="bankResearchModalBackdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setOpen(false);
          }}
        >
          <div
            className="bankResearchModal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="bank-research-modal-title"
          >
            <button
              className="bankResearchModalClose"
              type="button"
              aria-label="Close research submission form"
              onClick={() => setOpen(false)}
            >
              ×
            </button>
            <div className="bankResearchModalTitle">
              <small>COMMUNITY RESEARCH</small>
              <h2 id="bank-research-modal-title">
                Submit to the research team
              </h2>
              <p>
                Request research, share lender information, or submit an update.
              </p>
            </div>
            {reference ? (
              <div className="bankResearchSuccess">
                <span>✓</span>
                <small>SUBMISSION RECEIVED</small>
                <h3>Thank you for helping the community</h3>
                <p>Your reference number is:</p>
                <strong>{reference}</strong>
                <p>
                  The Kav Haribis research team will review the information.
                </p>
                <button onClick={() => setReference('')}>
                  Submit another lender
                </button>
              </div>
            ) : (
              <form onSubmit={submit} className="bankResearchForm">
                <div className="bankRequestChoices">
                  {choices.map((choice, index) => (
                    <label
                      className={mode === choice ? 'selected' : ''}
                      key={choice}
                    >
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
                    <input
                      name="related_url"
                      type="url"
                      placeholder="https://…"
                    />
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
                    rows={5}
                    minLength={10}
                    required
                    placeholder={
                      mode === choices[0]
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
                  <small>
                    PDF, Word, JPG, PNG, or WEBP up to 10 MB. Do not upload
                    private financial credentials.
                  </small>
                </label>
                <div className="bankResearchRow">
                  <label>
                    Your name
                    <input name="name" autoComplete="name" required />
                  </label>
                  <label>
                    Email address
                    <input
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                    />
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
          </div>
        </div>
      )}
    </>
  );
}
