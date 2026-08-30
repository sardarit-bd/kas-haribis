'use client';
import { FormEvent, useState } from 'react';

export default function PersonalizedHeterForm() {
  const [discount, setDiscount] = useState(false),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(''),
    [reference, setReference] = useState('');

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError('');
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
        throw new Error(result.error || 'Your request could not be submitted.');
      setReference(result.reference || '');
      form.reset();
      setDiscount(false);
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : 'Your request could not be submitted.',
      );
    } finally {
      setBusy(false);
    }
  }
  if (reference)
    return (
      <div className="personalizedHeterSuccess">
        <span>✓</span>
        <p className="eyebrow gold">REQUEST RECEIVED</p>
        <h2>Thank you</h2>
        <p>Your request was saved in the private Kav Haribis administrator.</p>
        <small>REFERENCE NUMBER</small>
        <strong>{reference}</strong>
        <p>We will contact you using the information provided.</p>
        <button onClick={() => setReference('')}>Submit another request</button>
      </div>
    );
  return (
    <form className="personalizedHeterForm" onSubmit={submit}>
      <div className="personalizedFormHead">
        <small>SECURE REQUEST FORM</small>
        <h2>Tell us about your lending structure</h2>
        <p>
          Please provide enough information for an initial review. Do not
          include account numbers, passwords, or card information.
        </p>
      </div>
      <input
        type="hidden"
        name="topic"
        value="Personalized Heter Iska Request"
      />
      <input
        type="hidden"
        name="request_subtype"
        value={
          discount ? '$120 nonprofit discount requested' : '$250 standard price'
        }
      />
      <div className="personalizedFormRow">
        <label>
          Full name
          <input name="name" required autoComplete="name" />
        </label>
        <label>
          Email address
          <input name="email" type="email" required autoComplete="email" />
        </label>
      </div>
      <div className="personalizedFormRow">
        <label>
          Phone number
          <input name="phone" type="tel" required autoComplete="tel" />
        </label>
        <label>
          Institution or lender name
          <input name="organization" required />
        </label>
      </div>
      <label>
        Type of institution or lending activity
        <select name="related_name" required defaultValue="">
          <option value="" disabled>
            Select one
          </option>
          <option>Bank or financial institution</option>
          <option>Mortgage company</option>
          <option>Private lending company</option>
          <option>Business offering financing</option>
          <option>Investment or partnership structure</option>
          <option>Individual private lender</option>
          <option>Other</option>
        </select>
      </label>
      <label>
        Describe the ownership, products, agreements, and lending structure
        <textarea
          name="message"
          rows={7}
          minLength={20}
          required
          placeholder="Describe who lends, who borrows, the types of loans or financing offered, and any special terms…"
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
      <label className="personalizedUpload">
        Supporting document <em>optional</em>
        <input
          name="attachment"
          type="file"
          accept="application/pdf,image/png,image/jpeg,image/webp,.doc,.docx"
        />
        <small>
          Upload an existing agreement or Heter Iska if helpful. PDF, Word, JPG,
          PNG, or WEBP up to 10 MB.
        </small>
      </label>
      <label className={`discountChoice ${discount ? 'selected' : ''}`}>
        <input
          type="checkbox"
          checked={discount}
          onChange={(event) => setDiscount(event.target.checked)}
        />
        <span>Check this box if you would like the discounted $120 price.</span>
      </label>
      <div className="selectedPrice">
        <span>Requested price</span>
        <strong>{discount ? '$120' : '$250'}</strong>
      </div>
      <button className="primary" disabled={busy}>
        {busy ? 'Submitting…' : 'Submit Personalized Heter Iska Request →'}
      </button>
      {error && (
        <p className="formError" role="alert">
          {error}
        </p>
      )}
    </form>
  );
}
