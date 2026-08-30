'use client';
import { FormEvent, useEffect, useMemo, useState } from 'react';
declare global {
  interface Window {
    setAccount?: (key: string, name: string, version: string) => void;
    getTokens?: (
      success: () => void,
      error?: () => void,
      timeout?: number,
    ) => void;
  }
}
type Status = { ready: boolean; ifieldsKey?: string };
type Kind = 'donation' | 'heter-iska' | 'bank-report' | 'sefer-pdf';
export default function CheckoutNotice({
  kind,
  amount,
  documentId,
  bankId,
  seferId,
  seferTitle,
}: {
  kind: Kind;
  amount: string;
  documentId?: string;
  bankId?: string;
  seferId?: string;
  seferTitle?: string;
}) {
  const [status, setStatus] = useState<Status | null>(null),
    [customAmount, setCustomAmount] = useState('25'),
    [message, setMessage] = useState(''),
    [working, setWorking] = useState(false),
    [success, setSuccess] = useState<{
      reference: string;
      downloadUrl?: string;
    } | null>(null);
  const total = useMemo(
    () =>
      kind === 'heter-iska'
        ? 25
        : kind === 'bank-report'
          ? 15
          : kind === 'sefer-pdf'
            ? Number(amount.replace(/[^0-9.]/g, ''))
            : Number(customAmount),
    [kind, customAmount, amount],
  );
  useEffect(() => {
    fetch('/api/payment-public-status')
      .then((r) => r.json())
      .then((data: Status) => {
        setStatus(data);
        if (!data.ready || !data.ifieldsKey) return;
        const initialize = () =>
            window.setAccount?.(
              data.ifieldsKey!,
              'Kav Haribis Website',
              '1.0.0',
            ),
          existing = document.querySelector(
            'script[data-cardknox="ifields"]',
          ) as HTMLScriptElement | null;
        if (existing) {
          if (window.setAccount) initialize();
          else existing.addEventListener('load', initialize, { once: true });
          return;
        }
        const script = document.createElement('script');
        script.src =
          'https://cdn.cardknox.com/ifields/3.5.2607.1401/ifields.min.js';
        script.async = true;
        script.dataset.cardknox = 'ifields';
        script.onload = initialize;
        script.onerror = () =>
          setMessage(
            'The secure Cardknox fields could not load. Please refresh the page.',
          );
        document.head.appendChild(script);
      })
      .catch(() => setStatus({ ready: false }));
  }, []);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage('');
    setWorking(true);
    const fields = new FormData(event.currentTarget),
      month = String(fields.get('month') || ''),
      year = String(fields.get('year') || '');
    if (!Number.isFinite(total) || total < 1) {
      setMessage('Please select or enter a valid amount.');
      setWorking(false);
      return;
    }
    if (!month || !year) {
      setMessage('Please select the expiration month and year.');
      setWorking(false);
      return;
    }
    if (!window.getTokens) {
      setMessage(
        'The secure payment fields are still loading. Please wait a moment and try again.',
      );
      setWorking(false);
      return;
    }
    try {
      window.getTokens(
        async () => {
          const cardToken = (
              document.querySelector(
                '[data-ifields-id="card-number-token"]',
              ) as HTMLInputElement
            )?.value,
            cvvToken = (
              document.querySelector(
                '[data-ifields-id="cvv-token"]',
              ) as HTMLInputElement
            )?.value,
            response = await fetch('/api/payments', {
              method: 'POST',
              headers: { 'content-type': 'application/json' },
              body: JSON.stringify({
                kind,
                amount: total,
                documentId,
                bankId,
                seferId,
                name: fields.get('name'),
                email: fields.get('email'),
                dedication: fields.get('dedication'),
                anonymous: fields.get('anonymous') === 'on',
                expiration: `${month}${year}`,
                cardToken,
                cvvToken,
              }),
            }),
            result = (await response.json()) as any;
          if (!response.ok) {
            setMessage(result.error || 'Payment was not approved.');
            setWorking(false);
            return;
          }
          setSuccess({
            reference: result.reference,
            downloadUrl: result.downloadUrl,
          });
          setWorking(false);
        },
        () => {
          setMessage(
            'Please check the card number and security code, then try again.',
          );
          setWorking(false);
        },
        30000,
      );
    } catch {
      setMessage(
        'Cardknox could not secure the card information. Please check the fields and try again.',
      );
      setWorking(false);
    }
  }
  const label =
    kind === 'donation'
      ? 'Donation'
      : kind === 'bank-report'
        ? 'Full bank report access'
        : kind === 'sefer-pdf'
          ? seferTitle || 'PDF book download'
          : 'Heter Iska download';
  if (success)
    return (
      <section className="checkoutArea">
        <div className="paymentSuccess">
          <span>✓</span>
          <h2>Payment approved</h2>
          <p>
            Confirmation: <b>{success.reference}</b>
          </p>
          {success.downloadUrl ? (
            <a className="primary" href={success.downloadUrl}>
              {kind === 'bank-report'
                ? 'View the full bank report'
                : kind === 'sefer-pdf'
                  ? 'Download your PDF book'
                  : 'Download the protected Heter Iska'}
            </a>
          ) : (
            <p>Thank you for supporting Kav Haribis.</p>
          )}
        </div>
      </section>
    );
  return (
    <section className="checkoutArea">
      <div className="checkoutSummary">
        <p className="eyebrow gold">PAYMENT SUMMARY</p>
        <h2>{label}</h2>
        <strong>
          {kind === 'donation'
            ? Number.isFinite(total)
              ? `$${total.toFixed(2)}`
              : 'Custom amount'
            : amount}
        </strong>
        <p>
          Your card number and security code are secured by Cardknox iFields.
          They do not pass through or remain on the Kav Haribis website.
        </p>
        {kind === 'sefer-pdf' && (
          <p>
            <b>One protected download</b> becomes available immediately after
            payment.
          </p>
        )}
      </div>
      <div className="checkoutCard">
        {status?.ready ? (
          <>
            <h2>Secure payment</h2>
            <form className="paymentForm" onSubmit={submit}>
              {kind === 'donation' && (
                <>
                  <label>
                    Donation amount
                    <div className="amountChoices">
                      {[18, 36, 72, 180].map((value) => (
                        <button
                          type="button"
                          className={
                            customAmount === String(value) ? 'selected' : ''
                          }
                          onClick={() => setCustomAmount(String(value))}
                          key={value}
                        >
                          ${value}
                        </button>
                      ))}
                    </div>
                    <span className="moneyInput">
                      $
                      <input
                        aria-label="Custom donation amount"
                        type="number"
                        min="1"
                        max="100000"
                        step="0.01"
                        value={customAmount}
                        onChange={(e) => setCustomAmount(e.target.value)}
                        required
                      />
                    </span>
                  </label>
                </>
              )}
              <div className="twoFields">
                <label>
                  Name
                  <input name="name" autoComplete="name" required />
                </label>
                <label>
                  Email
                  <input
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                  />
                </label>
              </div>
              {kind === 'donation' && (
                <>
                  <label>
                    Dedication or memorial message <small>(optional)</small>
                    <textarea name="dedication" rows={3} />
                  </label>
                  <label className="checkLabel">
                    <input name="anonymous" type="checkbox" /> Show this
                    donation as anonymous
                  </label>
                </>
              )}
              <label>
                Card number
                <iframe
                  title="Secure card number"
                  data-ifields-id="card-number"
                  data-ifields-placeholder="Card number"
                  src="https://cdn.cardknox.com/ifields/3.5.2607.1401/ifield.htm"
                />
                <input type="hidden" data-ifields-id="card-number-token" />
              </label>
              <div className="cardRow">
                <label>
                  Expiration
                  <div className="expiry">
                    <select
                      name="month"
                      aria-label="Expiration month"
                      required
                      defaultValue=""
                    >
                      <option value="" disabled>
                        MM
                      </option>
                      {Array.from({ length: 12 }, (_, i) =>
                        String(i + 1).padStart(2, '0'),
                      ).map((m) => (
                        <option key={m}>{m}</option>
                      ))}
                    </select>
                    <b>/</b>
                    <select
                      name="year"
                      aria-label="Expiration year"
                      required
                      defaultValue=""
                    >
                      <option value="" disabled>
                        YY
                      </option>
                      {Array.from({ length: 12 }, (_, i) =>
                        String(new Date().getFullYear() + i).slice(-2),
                      ).map((y) => (
                        <option key={y}>{y}</option>
                      ))}
                    </select>
                  </div>
                </label>
                <label>
                  Security code
                  <iframe
                    title="Secure card security code"
                    data-ifields-id="cvv"
                    data-ifields-placeholder="CVV"
                    src="https://cdn.cardknox.com/ifields/3.5.2607.1401/ifield.htm"
                  />
                  <input type="hidden" data-ifields-id="cvv-token" />
                </label>
              </div>
              {message && (
                <p className="formError" role="alert">
                  {message}
                </p>
              )}
              <button className="primary paymentButton" disabled={working}>
                {working
                  ? 'PROCESSING SECURELY…'
                  : `PROCESS PAYMENT — $${Number.isFinite(total) ? total.toFixed(2) : '0.00'}`}
              </button>
              <small className="secureNote">
                🔒 Secure payment powered by Cardknox/Sola
              </small>
            </form>
          </>
        ) : status === null ? (
          <p>Loading secure payment…</p>
        ) : (
          <>
            <span className="statusDot" />
            <h2>Payment setup is not complete</h2>
            <p>
              The administrator must add the Cardknox credentials before
              payments can be processed.
            </p>
            <a className="primary" href="/admin/settings">
              Open payment settings
            </a>
          </>
        )}
      </div>
    </section>
  );
}
