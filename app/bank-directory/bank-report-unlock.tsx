'use client';
import { FormEvent, useEffect, useState } from 'react';
import CheckoutNotice from '../shared/checkout-notice';

export default function BankReportUnlock({
  bankId,
  bankName,
  onClose,
}: {
  bankId: string;
  bankName: string;
  onClose: () => void;
}) {
  const [message, setMessage] = useState('');
  const [working, setWorking] = useState(false);
  useEffect(() => {
    fetch('/api/bank-premium-login')
      .then((r) => r.json())
      .then((result) => {
        if (result.authenticated)
          window.location.href = `/bank-directory/full-report?bankId=${encodeURIComponent(bankId)}`;
      })
      .catch(() => {});
  }, [bankId]);
  async function useCode(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setWorking(true);
    setMessage('');
    const code = String(new FormData(event.currentTarget).get('code') || '');
    const response = await fetch('/api/bank-report-access', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ bankId, code }),
    });
    const result = (await response.json()) as {
      error?: string;
      reportUrl?: string;
    };
    if (!response.ok || !result.reportUrl) {
      setMessage(result.error || 'The code could not be accepted.');
      setWorking(false);
      return;
    }
    window.location.href = result.reportUrl;
  }
  async function premiumLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setWorking(true);
    setMessage('');
    const data = Object.fromEntries(
      new FormData(event.currentTarget).entries(),
    );
    const response = await fetch('/api/bank-premium-login', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ ...data, bankId }),
      }),
      result = (await response.json()) as any;
    if (!response.ok || !result.reportUrl) {
      setMessage(result.error || 'Premium login was not accepted.');
      setWorking(false);
      return;
    }
    window.location.href = result.reportUrl;
  }
  return (
    <div
      className="reportUnlockBackdrop"
      role="dialog"
      aria-modal="true"
      aria-label={`Unlock full report for ${bankName}`}
      onClick={onClose}
    >
      <section
        className="reportUnlockModal"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          className="sponsorModalClose"
          onClick={onClose}
          aria-label="Close"
        >
          ×
        </button>
        <div className="reportUnlockHeading">
          <p className="eyebrow gold">PROTECTED RESEARCH</p>
          <h2>{bankName}</h2>
          <p>Choose one of three ways to view the complete report.</p>
        </div>
        <form className="premiumLoginForm" onSubmit={premiumLogin}>
          <div>
            <p className="eyebrow gold">PREMIUM MEMBER</p>
            <h3>Access every bank report</h3>
            <p>
              Want access to all our detailed research? Please{' '}
              <a href="/contact">reach out to Kav Haribis</a> and ask about
              becoming a premium member.
            </p>
          </div>
          <label>
            Email address
            <input name="email" type="email" autoComplete="email" required />
          </label>
          <label>
            Password
            <input
              name="password"
              type="password"
              autoComplete="current-password"
              required
            />
          </label>
          <button className="primary" disabled={working}>
            {working ? 'Checking…' : 'Premium member login →'}
          </button>
        </form>
        <div className="unlockDivider">
          <span>OR USE A REPORT CODE</span>
        </div>
        <form className="reportCodeForm" onSubmit={useCode}>
          <label>
            Have an access code?
            <div>
              <input
                name="code"
                required
                autoCapitalize="characters"
                placeholder="Enter access code"
              />
              <button disabled={working}>
                {working ? 'Checking…' : 'Use code'}
              </button>
            </div>
          </label>
          {message && <p className="formError">{message}</p>}
        </form>
        <div className="unlockDivider">
          <span>OR PAY $15 FOR THIS REPORT</span>
        </div>
        <CheckoutNotice kind="bank-report" amount="$15.00" bankId={bankId} />
      </section>
    </div>
  );
}
