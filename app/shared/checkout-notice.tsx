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
      <section className="donateCheckoutWrapper">
        <div className="paymentSuccess" style={{ maxWidth: '800px', margin: '0 auto' }}>
          <span>✓</span>
          <h2>Payment Approved!</h2>
          <p style={{ fontSize: '16px', color: '#334e68', margin: '12px 0 20px' }}>
            Thank you for your generous support to Kav Haribis. Your transaction reference number is: <b style={{ color: '#102a43' }}>{success.reference}</b>
          </p>
          {success.downloadUrl ? (
            <a className="enhancedPayBtn" style={{ display: 'inline-flex', width: 'auto', textDecoration: 'none' }} href={success.downloadUrl}>
              {kind === 'bank-report'
                ? 'View Full Bank Report →'
                : kind === 'sefer-pdf'
                  ? 'Download Your PDF Book →'
                  : 'Download Protected Heter Iska →'}
            </a>
          ) : (
            <div className="taxReceiptBox" style={{ justifyContent: 'center', textAlign: 'left', maxWidth: '500px', margin: '20px auto 0' }}>
              <span className="taxReceiptIcon">📜</span>
              <div className="taxReceiptText">
                <b>Tax-Deductible Receipt Sent</b>
                <p>A confirmation email with your tax-deductible receipt details has been issued.</p>
              </div>
            </div>
          )}
        </div>
      </section>
    );












    useEffect(() => {
    // Cardknox লাইব্রেরি লোড হয়েছে কিনা নিশ্চিত করা
    if (window.setIfieldStyle) {
      const inputStyle = {
        width: '100%',
        height: '44px',
        border: '1px solid #cbd5e1',
        'box-sizing': 'border-box',
        padding: '0 12px',
        'font-size': '16px',
        color: '#333333',
        outline: 'none',
        'border-radius': '4px'
      };

      // data-ifields-id="card-number" এর সাথে মিলিয়ে স্টাইল পাঠানো
      window.setIfieldStyle('card-number', inputStyle);
      window.setIfieldStyle('cvv', inputStyle);

      // যদি CVV থাকে:
      // window.setIfieldStyle('cvv', inputStyle);
    }
  }, []);










  return (
    <section className="donateCheckoutWrapper">
      <div className="enhancedCheckoutArea">
        {/* Left Side: Summary & Trust Info */}
        <div className="enhancedCheckoutSummary">
          <div className="summaryHeader">
            <span className="summaryEyebrow">SECURE CHECKOUT</span>
            <h2 className="summaryTitle">{label}</h2>
            <div className="summaryBigAmount">
              ${Number.isFinite(total) ? total.toFixed(2) : '0.00'}
              {kind === 'donation' && <span>USD</span>}
            </div>
          </div>

          <ul className="summaryFeaturesList">
            <li className="summaryFeatureItem">
              <span className="summaryFeatureIcon">✓</span>
              <div>
                <strong>Direct Halachic & Educational Impact</strong>
                <div style={{ fontSize: '13px', color: '#627d98', marginTop: '2px' }}>
                  Supports Ribis education, pubic lectures, and free halachic guidance worldwide.
                </div>
              </div>
            </li>
            <li className="summaryFeatureItem">
              <span className="summaryFeatureIcon">🔒</span>
              <div>
                <strong>PCI-DSS Compliant Security</strong>
                <div style={{ fontSize: '13px', color: '#627d98', marginTop: '2px' }}>
                  Card details are encrypted via Cardknox iFields and never stored on our server.
                </div>
              </div>
            </li>
            <li className="summaryFeatureItem">
              <span className="summaryFeatureIcon">📜</span>
              <div>
                <strong>Instant Receipt & Confirmation</strong>
                <div style={{ fontSize: '13px', color: '#627d98', marginTop: '2px' }}>
                  Confirmation ID is generated immediately upon successful payment approval.
                </div>
              </div>
            </li>
          </ul>

          <div className="taxReceiptBox">
            <span className="taxReceiptIcon">🏛️</span>
            <div className="taxReceiptText">
              <b>Kav Haribis Educational Fund</b>
              <p>Dedicated to pure Torah scholarship & Ribis compliance.</p>
            </div>
          </div>
        </div>

        {/* Right Side: Payment Form Card */}
        <div className="enhancedCheckoutCard">
          {status?.ready ? (
            <>
              <div className="cardHeaderTitle">
                <span>🔒</span> Payment Details
              </div>
              <p className="cardHeaderSubtitle">
                Please enter your details below to complete your secure payment.
              </p>

              <form className="paymentForm" onSubmit={submit}>
                {kind === 'donation' && (
                  <div className="enhancedFormGroup">
                    <label className="enhancedFormLabel">Select Donation Amount (USD)</label>
                    <div className="presetAmountGrid">
                      {[18, 36, 72, 180, 360, 1000].map((value) => (
                        <button
                          type="button"
                          className={`presetBtn ${customAmount === String(value) ? 'selected' : ''}`}
                          onClick={() => setCustomAmount(String(value))}
                          key={value}
                        >
                          ${value}
                        </button>
                      ))}
                    </div>

                    <div className="customMoneyField">
                      <span className="currencyPrefix">$</span>
                      <input
                        aria-label="Custom donation amount"
                        type="number"
                        min="1"
                        max="100000"
                        step="0.01"
                        className="enhancedFormInput customMoneyInput"
                        placeholder="Other amount"
                        value={customAmount}
                        onChange={(e) => setCustomAmount(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                )}

                <div className="cardSecurityRow" style={{ marginBottom: '0' }}>
                  <div className="enhancedFormGroup">
                    <label className="enhancedFormLabel">Full Name</label>
                    <input
                      name="name"
                      autoComplete="name"
                      className="enhancedFormInput"
                      placeholder="e.g. Moshe Cohen"
                      required
                    />
                  </div>
                  <div className="enhancedFormGroup">
                    <label className="enhancedFormLabel">Email Address</label>
                    <input
                      name="email"
                      type="email"
                      autoComplete="email"
                      className="enhancedFormInput"
                      placeholder="moshe@example.com"
                      required
                    />
                  </div>
                </div>

                {kind === 'donation' && (
                  <div className="enhancedFormGroup">
                    <label className="enhancedFormLabel">
                      Dedication or Memorial Message <small style={{ fontWeight: 400, color: '#627d98' }}>(Optional)</small>
                    </label>
                    <textarea
                      name="dedication"
                      rows={2}
                      className="enhancedFormTextarea"
                      placeholder="In honor of / In memory of..."
                    />
                    <label className="anonymousCheckboxLabel">
                      <input name="anonymous" type="checkbox" />
                      Make this donation anonymous
                    </label>
                  </div>
                )}

                <div className="enhancedFormGroup">
                  <label className="enhancedFormLabel">Card Number</label>
                  <div className="iframeWrapper">
                    <iframe
                      title="Secure card number"
                      data-ifields-id="card-number"
                      data-ifields-placeholder="•••• •••• •••• ••••"
                      src="https://cdn.cardknox.com/ifields/3.5.2607.1401/ifield.htm"
                    />
                  </div>
                  <input type="hidden" data-ifields-id="card-number-token" />
                </div>

                <div className="cardSecurityRow">
                  <div className="enhancedFormGroup">
                    <label className="enhancedFormLabel">Expiration Date</label>
                    <div className="expirySelects">
                      <select
                        name="month"
                        aria-label="Expiration month"
                        className="enhancedFormSelect"
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
                      <span className="expiryDivider">/</span>
                      <select
                        name="year"
                        aria-label="Expiration year"
                        className="enhancedFormSelect"
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
                  </div>

                  <div className="enhancedFormGroup">
                    <label className="enhancedFormLabel">Security Code (CVV)</label>
                    <div className="iframeWrapper">
                      <iframe
                        title="Secure card security code"
                        data-ifields-id="cvv"
                        data-ifields-placeholder="CVC / CVV"
                        src="https://cdn.cardknox.com/ifields/3.5.2607.1401/ifield.htm"
                      />
                    </div>
                    <input type="hidden" data-ifields-id="cvv-token" />
                  </div>
                </div>

                {message && (
                  <p className="formError" role="alert" style={{ color: '#dc2626', background: '#fef2f2', border: '1px solid #fecaca', padding: '10px 14px', borderRadius: '8px', fontSize: '13px', marginTop: '12px' }}>
                    {message}
                  </p>
                )}

                <button className="enhancedPayBtn" disabled={working}>
                  {working ? (
                    <>⏳ PROCESSING SECURELY…</>
                  ) : (
                    <>
                      <span>🔒</span> PROCESS SECURE PAYMENT — ${Number.isFinite(total) ? total.toFixed(2) : '0.00'}
                    </>
                  )}
                </button>

                <div className="securityFooterNote">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-5.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z"/>
                  </svg>
                  256-Bit SSL Encrypted & Powered by Cardknox / Sola
                </div>
              </form>
            </>
          ) : status === null ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: '#627d98' }}>
              <p>Loading secure payment environment...</p>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <span className="statusDot" style={{ margin: '0 auto 16px' }} />
              <h2 style={{ fontFamily: 'Georgia, serif', color: '#102a43', fontSize: '22px' }}>
                Payment Setup Pending
              </h2>
              <p style={{ color: '#627d98', fontSize: '14px', margin: '12px 0 24px' }}>
                The administrator must configure Cardknox API credentials in the settings.
              </p>
              <a className="enhancedPayBtn" style={{ display: 'inline-flex', width: 'auto', textDecoration: 'none' }} href="/admin/settings">
                Open Admin Settings →
              </a>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
