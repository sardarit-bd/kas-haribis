'use client';
import { FormEvent, useState } from 'react';
export default function SubscriptionForm() {
  const [state, setState] = useState(''),
    [busy, setBusy] = useState(false);
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    const f = e.currentTarget,
      r = await fetch('/api/alert-subscriptions', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(Object.fromEntries(new FormData(f).entries())),
      }),
      j = (await r.json()) as any;
    if (r.ok) {
      setState('You are subscribed to Ribbis Alerts.');
      f.reset();
    } else setState(j.error || 'Could not subscribe.');
    setBusy(false);
  }
  return (
    <form className="alertSubscribeForm" onSubmit={submit}>
      <div>
        <p className="eyebrow gold">RIBBIS ALERTS BY EMAIL</p>
        <h2>Receive important updates</h2>
        <p>
          Get new Kav Haribis alerts and important directory updates sent to
          your inbox.
        </p>
      </div>
      <div>
        <input name="name" placeholder="Name (optional)" />
        <input type="email" name="email" required placeholder="Email address" />
        <button className="primary" disabled={busy}>
          {busy ? 'Subscribing…' : 'Subscribe'}
        </button>
        {state && <small>{state}</small>}
      </div>
    </form>
  );
}
