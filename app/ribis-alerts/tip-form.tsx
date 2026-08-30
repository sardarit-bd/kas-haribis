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
      <div className="tipSuccess">
        <span>✓</span>
        <h3>Thank you. Your tip was submitted.</h3>
        <p>
          Your private reference number is <strong>{reference}</strong>. Kav
          Haribis will review the information before publishing anything.
        </p>
        <button onClick={() => setReference('')}>Submit another tip</button>
      </div>
    );
  return (
    <form className="alertTipForm" onSubmit={submit}>
      <div className="tipFormGrid">
        <label>
          Your name <small>(optional)</small>
          <input name="name" />
        </label>
        <label>
          Email <small>(optional)</small>
          <input type="email" name="email" />
        </label>
        <label>
          Phone <small>(optional)</small>
          <input name="phone" />
        </label>
        <label>
          Topic
          <select name="topic">
            <option>Loan or agreement</option>
            <option>Bank or financial institution</option>
            <option>Business practice</option>
            <option>Investment</option>
            <option>Heter Iska</option>
            <option>Directory correction</option>
            <option>Other</option>
          </select>
        </label>
        <label className="wide">
          Business, bank, or organization involved{' '}
          <small>(if applicable)</small>
          <input name="organization" />
        </label>
        <label className="wide">
          Source or supporting link <small>(optional)</small>
          <input type="url" name="source_url" placeholder="https://…" />
        </label>
        <label className="wide">
          Describe the concern or update
          <textarea
            name="tip"
            rows={7}
            required
            minLength={20}
            placeholder="Please include the relevant facts, dates, contract terms, or other details that will help Kav Haribis review the matter."
          />
        </label>
      </div>
      <p className="tipPrivacy">
        Your contact information is optional and is kept private. Submitting a
        tip does not create a Bais Horaah question or guarantee publication.
      </p>
      {error && <p className="tipError">{error}</p>}
      <button className="primary" disabled={busy}>
        {busy ? 'Submitting…' : 'Submit Tip Securely'}
      </button>
    </form>
  );
}
