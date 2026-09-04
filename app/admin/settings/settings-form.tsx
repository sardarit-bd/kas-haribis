'use client';
import { FormEvent, useEffect, useState } from 'react';
export default function PaymentSettingsForm() {
  const [status, setStatus] = useState<any>(null);
  const [emailStatus, setEmailStatus] = useState<any>(null);
  const [message, setMessage] = useState('');
  const [emailMessage, setEmailMessage] = useState('');
  async function load() {
    const [pRes, eRes] = await Promise.all([
      fetch('/api/payment-settings').then((r) => r.json()),
      fetch('/api/email-settings').then((r) => r.json()),
    ]);
    setStatus(pRes);
    setEmailStatus(eRes);
  }
  useEffect(() => {
    load();
  }, []);
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMessage('Saving securely…');
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());
    const r = await fetch('/api/payment-settings', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(data),
    });
    const out = (await r.json()) as any;
    if (!r.ok) {
      setMessage(out.error || 'Could not save.');
      return;
    }
    form.reset();
    setMessage('Credentials saved and encrypted.');
    await load();
  }
  async function submitEmail(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setEmailMessage('Saving securely…');
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());
    const r = await fetch('/api/email-settings', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(data),
    });
    const out = (await r.json()) as any;
    if (!r.ok) {
      setEmailMessage(out.error || 'Could not save.');
      return;
    }
    form.reset();
    setEmailMessage('Email credentials saved and encrypted.');
    await load();
  }
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div className="settingsCard">
        <div className="connectionStatus">
          <b>
            {status?.ready
              ? 'Checkout credentials configured'
              : 'Checkout needs credentials'}
          </b>
          <span className={status?.ready ? 'ready' : 'notReady'}>
            {status?.ready ? 'Ready' : 'Action required'}
          </span>
        </div>
        <div className="credentialChecks">
          <span>
            Private API key <b>{status?.apiKey ? 'Configured' : 'Missing'}</b>
          </span>
          <span>
            iFields key <b>{status?.ifieldsKey ? 'Configured' : 'Missing'}</b>
          </span>
          <span>
            iFields token{' '}
            <b>{status?.ifieldsToken ? 'Configured' : 'Optional / missing'}</b>
          </span>
        </div>
        <form onSubmit={submit}>
          <label>
            Cardknox/Sola private API key
            <input type="password" name="apiKey" autoComplete="off" />
          </label>
          <label>
            Public iFields key
            <input type="password" name="ifieldsKey" autoComplete="off" />
          </label>
          <label>
            iFields token, if supplied
            <input type="password" name="ifieldsToken" autoComplete="off" />
          </label>
          <button className="primary">Save new credentials securely</button>
          <p>{message}</p>
        </form>
        <small>Leave a field blank to preserve its existing saved value.</small>
      </div>

      <div className="settingsCard">
        <div className="connectionStatus">
          <b>
            {emailStatus?.emailReady
              ? 'Email credentials configured'
              : 'Email sending needs credentials'}
          </b>
          <span className={emailStatus?.emailReady ? 'ready' : 'notReady'}>
            {emailStatus?.emailReady ? 'Ready' : 'Action required'}
          </span>
        </div>
        <div className="credentialChecks">
          <span>
            EMAIL_USER <b>{emailStatus?.emailUser ? 'Configured' : 'Missing'}</b>
          </span>
          <span>
            EMAIL_PASSWORD <b>{emailStatus?.emailPassword ? 'Configured' : 'Missing'}</b>
          </span>
        </div>
        <form onSubmit={submitEmail}>
          <label>
            EMAIL_USER (Sender Email Address)
            <input type="text" name="emailUser" autoComplete="off" placeholder="e.g. user@gmail.com" />
          </label>
          <label>
            EMAIL_PASSWORD (App Password)
            <input type="password" name="emailPassword" autoComplete="off" placeholder="••••••••••••••••" />
          </label>
          <button className="primary">Save email credentials securely</button>
          <p>{emailMessage}</p>
        </form>
        <small>Leave a field blank to preserve its existing saved value.</small>
      </div>
    </div>
  );
}
