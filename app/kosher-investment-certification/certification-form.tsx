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
      <div className="certSuccess">
        <span>✓</span>
        <small>APPLICATION RECEIVED</small>
        <h3>Thank you</h3>
        <p>Your reference number is:</p>
        <strong>{reference}</strong>
        <p>
          Kav Haribis will review the initial information and contact you if
          additional documents are required.
        </p>
        <button onClick={() => setReference('')}>
          Submit another application
        </button>
      </div>
    );
  return (
    <form className="certForm" onSubmit={submit}>
      <div>
        <small>CONFIDENTIAL INITIAL APPLICATION</small>
        <h3>Institution or investment details</h3>
      </div>
      <div className="certFormRow">
        <label>
          Company, bank, or sponsor name
          <input name="company_name" required />
        </label>
        <label>
          Offering, product, or institution name
          <input name="offering_name" />
        </label>
      </div>
      <div className="certFormRow">
        <label>
          Review type
          <select name="investment_type">
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
        <label>
          Minimum investment or loan amount
          <input name="minimum_investment" placeholder="If applicable" />
        </label>
      </div>
      <label>
        Website <em>optional</em>
        <input name="website" type="url" placeholder="https://…" />
      </label>
      <label>
        Describe the complete financial structure
        <textarea
          name="structure_details"
          minLength={20}
          rows={8}
          required
          placeholder="Explain ownership, funding sources, products or investments, returns or interest, repayment, guarantees, fees, distributions, and all parties involved…"
        />
      </label>
      <label>
        Who are the intended investors or borrowers?
        <textarea
          name="investor_profile"
          rows={3}
          placeholder="Individuals, businesses, accredited investors, institutions, homeowners…"
        />
      </label>
      <div className="certFormRow">
        <label>
          Current Heter Iska
          <select name="current_heter_iska">
            <option>No Heter Iska yet</option>
            <option>Existing Heter Iska available</option>
            <option>Not sure</option>
          </select>
        </label>
        <label>
          Desired timeline
          <input
            name="desired_timeline"
            placeholder="Example: before September launch"
          />
        </label>
      </div>
      <label className="certUpload">
        Principal agreement or supporting document <em>optional</em>
        <input
          name="attachment"
          type="file"
          accept="application/pdf,image/png,image/jpeg,image/webp,.doc,.docx"
        />
        <small>PDF, Word, JPG, PNG, or WEBP up to 15 MB.</small>
      </label>
      <fieldset>
        <legend>Contact information</legend>
        <div className="certFormRow">
          <label>
            Contact name
            <input name="contact_name" required />
          </label>
          <label>
            Email
            <input name="email" type="email" required />
          </label>
        </div>
        <div className="certFormRow">
          <label>
            Phone
            <input name="phone" type="tel" />
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
      </fieldset>
      <label className="certAcknowledgement">
        <input type="checkbox" required />
        <span>
          I understand that submitting this form is not certification or
          approval, and that Kav Haribis may require additional information.
        </span>
      </label>
      <button className="primary" disabled={busy}>
        {busy ? 'Submitting securely…' : 'Submit Application →'}
      </button>
      {error && <p className="formError">{error}</p>}
    </form>
  );
}
