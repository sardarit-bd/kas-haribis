'use client';
import { FormEvent, useEffect, useState } from 'react';
export default function PaymentSettingsForm() {
  const [status, setStatus] = useState<any>(null);
  const [message, setMessage] = useState('');
  async function load() {
    const r = await fetch('/api/payment-settings');
    setStatus(await r.json());
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
  return (
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
  );
}
