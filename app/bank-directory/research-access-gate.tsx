'use client';
import { FormEvent, useEffect, useState } from 'react';

export default function ResearchAccessGate() {
  const [open, setOpen] = useState(false),
    [busy, setBusy] = useState(false),
    [error, setError] = useState('');
  useEffect(() => {
    if (new URLSearchParams(location.search).get('research-access') === '1')
      setOpen(true);
  }, []);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError('');
    const data = Object.fromEntries(
      new FormData(event.currentTarget).entries(),
    );
    try {
      const response = await fetch('/api/bank-research-login', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify(data),
        }),
        json = (await response.json()) as any;
      if (!response.ok) {
        setError(json.error || 'Access could not be verified.');
        return;
      }
      location.href = json.redirect || '/research/lenders';
    } catch {
      setError('Access could not be verified. Please try again.');
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <div className="researchGatewayDock">
        <button
          type="button"
          aria-label="Researcher access"
          onClick={() => {
            setOpen(true);
            setError('');
          }}
        ></button>
      </div>
      {open && (
        <div
          className="researchGatewayBackdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setOpen(false);
          }}
        >
          <section
            className="researchGatewayModal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="research-access-title"
          >
            <button
              className="researchGatewayClose"
              type="button"
              aria-label="Close"
              onClick={() => setOpen(false)}
            >
              ×
            </button>
            <small>PRIVATE RESEARCH WORKSPACE</small>
            <h2 id="research-access-title">Researcher access</h2>
            <p>
              Enter the email address approved by Kav Haribis and the six-digit
              code provided by the administrator.
            </p>
            <form onSubmit={submit}>
              <label>
                Approved email address
                <input
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  placeholder="researcher@example.com"
                />
              </label>
              <label>
                Six-digit access code
                <input
                  name="code"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  pattern="[0-9]{6}"
                  minLength={6}
                  maxLength={6}
                  required
                  placeholder="000000"
                />
              </label>
              <button className="primary" disabled={busy}>
                {busy ? 'Checking…' : 'Open Research Workspace →'}
              </button>
            </form>
            {error && (
              <p className="researchGatewayError" role="alert">
                {error}
              </p>
            )}
          </section>
        </div>
      )}
    </>
  );
}
