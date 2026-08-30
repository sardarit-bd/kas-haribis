'use client';
import { FormEvent, useState } from 'react';

export default function BaisHoraahQuestionForm() {
  const [reference, setReference] = useState('');
  const [error, setError] = useState('');
  const [sending, setSending] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setSending(true);
    const form = event.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries()) as Record<
      string,
      string
    >;
    const preferred = data.preferred || 'Email';
    const question = `Preferred response method: ${preferred}\n\n${data.question || ''}`;
    const response = await fetch('/api/questions', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ ...data, question }),
    });
    const result = (await response.json()) as {
      reference?: string;
      error?: string;
    };
    setSending(false);
    if (!response.ok || !result.reference) {
      setError(
        result.error ||
          'The question could not be submitted. Please try again or call the hotline.',
      );
      return;
    }
    setReference(result.reference);
    form.reset();
  }
  if (reference)
    return (
      <div className="horaahSuccess">
        <div>✓</div>
        <h2>Question received</h2>
        <p>Your reference number is:</p>
        <strong>{reference}</strong>
        <p>
          Please keep this number. A member of the Bais Horaah team will review
          your submission.
        </p>
        <button type="button" onClick={() => setReference('')}>
          Submit another question
        </button>
      </div>
    );
  return (
    <form className="horaahQuestionForm" onSubmit={submit}>
      <div className="questionFormHeading">
        <small>PRIVATE QUESTION FORM</small>
        <h2>Ask the Bais Horaah</h2>
        <p>Fields marked with an asterisk are required.</p>
      </div>
      <div className="twoFields">
        <label>
          Full name *
          <input
            name="name"
            autoComplete="name"
            required
            placeholder="Your name"
          />
        </label>
        <label>
          Email address *
          <input
            name="email"
            type="email"
            autoComplete="email"
            required
            placeholder="you@example.com"
          />
        </label>
      </div>
      <div className="twoFields">
        <label>
          Phone number
          <input
            name="phone"
            type="tel"
            autoComplete="tel"
            placeholder="(000) 000-0000"
          />
        </label>
        <label>
          Preferred response
          <select name="preferred">
            <option>Email</option>
            <option>Phone call</option>
            <option>Either email or phone</option>
          </select>
        </label>
      </div>
      <label>
        Question category
        <select name="topic">
          <option>Loan or repayment</option>
          <option>Heter Iska</option>
          <option>Business or partnership</option>
          <option>Banking or mortgage</option>
          <option>Investment</option>
          <option>Sale or payment plan</option>
          <option>Other Ribbis question</option>
        </select>
      </label>
      <label>
        Your question *
        <textarea
          name="question"
          required
          rows={9}
          placeholder="Describe the arrangement, the parties involved, what money or benefit is being given, and any relevant deadlines or documents…"
        />
      </label>
      <label className="questionConfirmation">
        <input type="checkbox" required />
        <span>
          I understand that online information is not a substitute for urgent
          personal guidance, and I have not included passwords, account numbers,
          or card information.
        </span>
      </label>
      {error && (
        <p className="formError" role="alert">
          {error}
        </p>
      )}
      <button className="primary" disabled={sending}>
        {sending ? 'Submitting…' : 'Submit question securely →'}
      </button>
    </form>
  );
}
