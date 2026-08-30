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
      <div className="genealogySuccess">
        <span>✓</span>
        <small>REQUEST RECEIVED</small>
        <h2>Thank you</h2>
        <p>
          Your genealogy research request has been saved. Kav Haribis will
          review it and contact you about the next steps and pricing.
        </p>
        <strong>{reference}</strong>
        <button type="button" onClick={() => setReference('')}>
          Submit another request
        </button>
      </div>
    );
  return (
    <form className="genealogyForm" onSubmit={submit}>
      <div className="genealogyFormRow">
        <label>
          Full name
          <input name="name" autoComplete="name" required />
        </label>
        <label>
          Email address
          <input name="email" type="email" autoComplete="email" required />
        </label>
      </div>
      <div className="genealogyFormRow">
        <label>
          Phone number
          <input name="phone" type="tel" autoComplete="tel" required />
        </label>
        <label>
          Organization <em>optional</em>
          <input name="organization" />
        </label>
      </div>
      <label>
        Research purpose
        <select name="request_subtype" required defaultValue="">
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
      <label>
        Person, family, business, or institution being researched
        <input name="related_name" required placeholder="Name or entity" />
      </label>
      <div className="genealogyFormRow">
        <label>
          Relevant locations <em>optional</em>
          <input name="location" placeholder="Cities, states, or countries" />
        </label>
        <label>
          Approximate years or generations <em>optional</em>
          <input name="audience" placeholder="Example: 1920–present" />
        </label>
      </div>
      <label>
        What needs to be investigated?
        <textarea
          name="message"
          rows={8}
          minLength={20}
          required
          placeholder="Explain the question, what you already know, and the result you are trying to clarify…"
        />
      </label>
      <label>
        Preferred response method
        <select name="response_method">
          <option>Email</option>
          <option>Phone</option>
          <option>Either email or phone</option>
        </select>
      </label>
      <label className="genealogyUpload">
        Supporting records <em>optional</em>
        <input
          name="attachment"
          type="file"
          accept="application/pdf,image/png,image/jpeg,image/webp,.doc,.docx"
        />
        <small>PDF, Word, JPG, PNG, or WEBP up to 10 MB.</small>
      </label>
      <button className="primary" disabled={busy}>
        {busy ? 'Submitting securely…' : 'Submit Research Request →'}
      </button>
      {error && (
        <p className="formError" role="alert">
          {error}
        </p>
      )}
      <small className="genealogyPrivacy">
        Please submit only information you are authorized to share and only for
        lawful, ethical purposes.
      </small>
    </form>
  );
}
