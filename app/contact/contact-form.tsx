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
      <div className="contactSubmissionSuccess">
        <span>✓</span>
        <small>MESSAGE RECEIVED</small>
        <h2>Thank you for contacting us</h2>
        <p>Your reference number is:</p>
        <strong>{reference}</strong>
        <p>
          Kav Haribis will review your submission and respond using the contact
          information provided.
        </p>
        <button type="button" onClick={() => setReference('')}>
          Send another message
        </button>
      </div>
    );
  return (
    <form className="modernContactForm" onSubmit={submit}>
      <div className="contactFormHeading">
        <small>ONLINE SUBMISSION</small>
        <h2>Tell us what you need</h2>
        <p>
          Your message will be saved securely in the private Kav Haribis
          administrator inbox.
        </p>
      </div>
      <div className="contactFormRow">
        <label>
          Full name
          <input
            name="name"
            autoComplete="name"
            required
            placeholder="Your name"
          />
        </label>
        <label>
          Email address
          <input
            name="email"
            type="email"
            autoComplete="email"
            required
            placeholder="you@example.com"
          />
        </label>
      </div>
      <div className="contactFormRow">
        <label>
          Phone number <em>optional</em>
          <input
            name="phone"
            type="tel"
            autoComplete="tel"
            placeholder="(000) 000-0000"
          />
        </label>
        <label>
          Organization <em>optional</em>
          <input
            name="organization"
            placeholder="Business, school, or organization"
          />
        </label>
      </div>
      <label>
        What is this about?
        <select
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
        <fieldset className="contactConditional">
          <legend>Bank information</legend>
          <div className="contactFormRow">
            <label>
              Bank or institution name
              <input
                name="related_name"
                required
                placeholder="Full institution name"
              />
            </label>
            <label>
              Bank website <em>optional</em>
              <input name="related_url" type="url" placeholder="https://…" />
            </label>
          </div>
          <label>
            Type of request
            <select name="request_subtype">
              <option>Share new information</option>
              <option>Request an update to the listing</option>
              <option>Report an incorrect status or comment</option>
              <option>Submit Heter Iska documentation</option>
            </select>
          </label>
        </fieldset>
      )}
      {topic === 'Program or speaking request' && (
        <fieldset className="contactConditional">
          <legend>Program information</legend>
          <div className="contactFormRow">
            <label>
              School or organization
              <input name="related_name" required />
            </label>
            <label>
              Preferred date <em>optional</em>
              <input name="preferred_date" type="date" />
            </label>
          </div>
          <div className="contactFormRow">
            <label>
              Location
              <input name="location" placeholder="City or online" />
            </label>
            <label>
              Audience
              <input
                name="audience"
                placeholder="Students, business owners, community…"
              />
            </label>
          </div>
        </fieldset>
      )}
      {topic === 'Investment certification request' && (
        <fieldset className="contactConditional">
          <legend>Certification request</legend>
          <div className="contactFormRow">
            <label>
              Business or investment name
              <input name="related_name" required />
            </label>
            <label>
              Website <em>optional</em>
              <input name="related_url" type="url" placeholder="https://…" />
            </label>
          </div>
          <label>
            Structure requiring review
            <input
              name="request_subtype"
              placeholder="Loan, fund, partnership, investment offering…"
            />
          </label>
        </fieldset>
      )}
      {(topic === 'Business directory submission' ||
        topic === 'Sponsorship inquiry') && (
        <fieldset className="contactConditional">
          <legend>
            {topic === 'Sponsorship inquiry'
              ? 'Sponsor information'
              : 'Business information'}
          </legend>
          <div className="contactFormRow">
            <label>
              Business name
              <input name="related_name" required />
            </label>
            <label>
              Website <em>optional</em>
              <input name="related_url" type="url" placeholder="https://…" />
            </label>
          </div>
        </fieldset>
      )}
      <label>
        Your message
        <textarea
          name="message"
          rows={7}
          required
          minLength={10}
          placeholder="Please include the details we will need to respond…"
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
      <label className="contactFileUpload">
        Supporting document <em>optional</em>
        <input
          name="attachment"
          type="file"
          accept="application/pdf,image/png,image/jpeg,image/webp,.doc,.docx"
        />
        <small>PDF, Word document, JPG, PNG, or WEBP up to 10 MB.</small>
      </label>
      <button className="primary" type="submit" disabled={busy}>
        {busy ? 'Submitting…' : 'Submit Message →'}
      </button>
      {notice && (
        <p className="contactFormNotice error" aria-live="polite">
          {notice}
        </p>
      )}
      <small className="contactPrivacy">
        For questions requiring a halachic response, please use the Bais Horaah
        question form. Never submit passwords, card numbers, or account numbers.
      </small>
    </form>
  );
}
