'use client';
import { FormEvent, useEffect, useState } from 'react';
export default function PaymentSettingsForm() {
  const [status, setStatus] = useState<any>(null);
  const [emailStatus, setEmailStatus] = useState<any>(null);
  const [message, setMessage] = useState('');
  const [emailMessage, setEmailMessage] = useState('');
  const [deliveryPrice, setDeliveryPrice] = useState('0.00');
  const [deliveryMessage, setDeliveryMessage] = useState('');
  const [deliveryBusy, setDeliveryBusy] = useState(false);

  async function load() {
    const [pRes, eRes, dRes] = await Promise.all([
      fetch('/api/payment-settings').then((r) => r.json()),
      fetch('/api/email-settings').then((r) => r.json()),
      fetch('/api/seforim/delivery-pricing')
        .then((r) => r.json())
        .catch(() => ({ deliveryPrice: 0 })),
    ]);
    setStatus(pRes);
    setEmailStatus(eRes);
    if (typeof dRes?.deliveryPrice === 'number') {
      setDeliveryPrice(dRes.deliveryPrice.toFixed(2));
    }
  }
  useEffect(() => {
    load();
  }, []);
  async function submitDelivery(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setDeliveryBusy(true);
    setDeliveryMessage('Saving delivery price…');
    const r = await fetch('/api/seforim/delivery-pricing', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ deliveryPrice: Number(deliveryPrice) }),
    });
    const out = (await r.json()) as any;
    if (!r.ok) {
      setDeliveryMessage(out.error || 'Could not save.');
      setDeliveryBusy(false);
      return;
    }
    setDeliveryMessage('Global delivery price saved.');
    setDeliveryBusy(false);
    await load();
  }
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

      <div className="settingsCard">
        <div className="connectionStatus">
          <b>Seforim Store Delivery Settings</b>
          <span className="ready">
            {Number(deliveryPrice) > 0
              ? `$${Number(deliveryPrice).toFixed(2)} Flat Rate`
              : 'Free Delivery'}
          </span>
        </div>
        <form onSubmit={submitDelivery}>
          <label>
            Global Delivery Price ($)
            <input
              type="number"
              min="0"
              max="1000"
              step="0.01"
              value={deliveryPrice}
              onChange={(e) => setDeliveryPrice(e.target.value)}
              placeholder="0.00"
              required
            />
            <small>
              Flat delivery fee applied once per order containing physical books. Set to 0.00 for Free Delivery. PDF downloads are never charged delivery.
            </small>
          </label>
          <button className="primary" disabled={deliveryBusy}>
            {deliveryBusy ? 'Saving…' : 'Save Delivery Price'}
          </button>
          {deliveryMessage && <p>{deliveryMessage}</p>}
        </form>
      </div>
    </div>
  );
}
