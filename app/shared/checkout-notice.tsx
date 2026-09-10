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
  const [status, setStatus] = useState<Status | null>(null);
  const [customAmount, setCustomAmount] = useState('25');
  const [message, setMessage] = useState('');
  const [working, setWorking] = useState(false);
  const [success, setSuccess] = useState<{
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
          );
        const existing = document.querySelector(
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
    const fields = new FormData(event.currentTarget);
    const month = String(fields.get('month') || '');
    const year = String(fields.get('year') || '');

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
          )?.value;
          const cvvToken = (
            document.querySelector(
              '[data-ifields-id="cvv-token"]',
            ) as HTMLInputElement
          )?.value;
          const response = await fetch('/api/payments', {
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
          });
          const result = (await response.json()) as any;
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

  const handleIframeLoad = () => {
    const inputStyle = {
      width: '100%',
      height: '44px',
      border: '1px solid #cbd5e1',
      'box-sizing': 'border-box',
      padding: '0 12px',
      'font-size': '16px',
      color: '#333333',
      outline: 'none',
      'border-radius': '4px',
    };

    (window as any).setIfieldStyle?.('card-number', inputStyle);
    (window as any).setIfieldStyle?.('cvv', inputStyle);
  };

  if (success) {
    return (
      <section className="py-[70px] px-[5vw] bg-white">
        <div className="bg-white border border-[#e2e8f0] rounded-2xl p-8 sm:p-10 text-center shadow-md max-w-[800px] mx-auto space-y-4">
          <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center text-2xl font-bold mx-auto border border-emerald-100">
            ✓
          </div>
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#102a43]">
            Payment Approved!
          </h2>
          <p className="text-base text-[#334e68] my-3">
            Thank you for your generous support to Kav Haribis. Your transaction reference number is:{' '}
            <b className="text-[#102a43]">{success.reference}</b>
          </p>
          {success.downloadUrl ? (
            <a
              className="inline-flex w-auto py-4 px-6 bg-gradient-to-r from-[#102a43] to-[#173f5f] text-white rounded-xl text-base font-extrabold tracking-wide no-underline hover:from-[#173f5f] hover:to-[#0b1d30] shadow-md transition-all"
              href={success.downloadUrl}
            >
              {kind === 'bank-report'
                ? 'View Full Bank Report →'
                : kind === 'sefer-pdf'
                  ? 'Download Your PDF Book →'
                  : 'Download Protected Heter Iska →'}
            </a>
          ) : (
            <div className="mt-5 p-5 bg-white border border-dashed border-[#cbd5e1] rounded-xl flex items-center justify-center gap-3.5 text-left max-w-[500px] mx-auto">
              <span className="text-2xl sm:text-[28px] shrink-0">📜</span>
              <div>
                <b className="block text-sm font-bold text-[#102a43]">Tax-Deductible Receipt Sent</b>
                <p className="text-xs text-[#627d98] mt-0.5 leading-normal">
                  A confirmation email with your tax-deductible receipt details has been issued.
                </p>
              </div>
            </div>
          )}
        </div>
      </section>
    );
  }

  return (
    <section className="py-[70px] px-[5vw] bg-white">
      <div className="container grid grid-cols-1 lg:grid-cols-[1fr_1.15fr] gap-8 lg:gap-12 items-start">
        {/* Left Side: Summary & Trust Info */}
        <div className="bg-gradient-to-b from-[#f8fafc] to-[#f1f5f9] p-6 sm:p-10 lg:sticky lg:top-[110px] z-10">
          <div className="border-b border-[#e2e8f0] pb-6 mb-7">
            <span className="text-[#c69b46] text-xs font-extrabold tracking-[0.08em] uppercase mb-2 block">
              SECURE CHECKOUT
            </span>
            <h2 className="font-serif text-2xl sm:text-[28px] text-[#102a43] font-bold mb-3">
              {label}
            </h2>
            <div className="font-serif text-[52px] font-extrabold text-[#c69b46] leading-none my-4 mb-2 flex items-baseline gap-1">
              ${Number.isFinite(total) ? total.toFixed(2) : '0.00'}
              {kind === 'donation' && <span className="text-xl font-semibold text-[#627d98]">USD</span>}
            </div>
          </div>

          <ul className="list-none p-0 mt-6 flex flex-col gap-4">
            <li className="flex items-start gap-3 text-sm leading-snug text-[#334e68]">
              <span className="w-[22px] h-[22px] rounded-full bg-[#c69b46]/15 text-[#c69b46] grid place-items-center text-xs font-extrabold shrink-0 mt-0.5">
                ✓
              </span>
              <div>
                <strong className="font-bold text-[#102a43]">Direct Halachic &amp; Educational Impact</strong>
                <div className="text-xs text-[#627d98] mt-0.5">
                  Supports Ribis education, public lectures, and free halachic guidance worldwide.
                </div>
              </div>
            </li>
            <li className="flex items-start gap-3 text-sm leading-snug text-[#334e68]">
              <span className="w-[22px] h-[22px] rounded-full bg-[#c69b46]/15 text-[#c69b46] grid place-items-center text-xs font-extrabold shrink-0 mt-0.5">
                🔒
              </span>
              <div>
                <strong className="font-bold text-[#102a43]">PCI-DSS Compliant Security</strong>
                <div className="text-xs text-[#627d98] mt-0.5">
                  Card details are encrypted via Cardknox iFields and never stored on our server.
                </div>
              </div>
            </li>
            <li className="flex items-start gap-3 text-sm leading-snug text-[#334e68]">
              <span className="w-[22px] h-[22px] rounded-full bg-[#c69b46]/15 text-[#c69b46] grid place-items-center text-xs font-extrabold shrink-0 mt-0.5">
                📜
              </span>
              <div>
                <strong className="font-bold text-[#102a43]">Instant Receipt &amp; Confirmation</strong>
                <div className="text-xs text-[#627d98] mt-0.5">
                  Confirmation ID is generated immediately upon successful payment approval.
                </div>
              </div>
            </li>
          </ul>

          <div className="mt-8 p-5 bg-white border border-dashed border-[#cbd5e1] rounded-xl flex items-center gap-3.5">
            <span className="text-2xl sm:text-[28px] shrink-0">🏛️</span>
            <div>
              <b className="block text-sm font-bold text-[#102a43]">Kav Haribis Educational Fund</b>
              <p className="text-xs text-[#627d98] mt-0.5 leading-normal">
                Dedicated to pure Torah scholarship &amp; Ribis compliance.
              </p>
            </div>
          </div>
        </div>

        {/* Right Side: Payment Form Card */}
        <div className="bg-white p-6 sm:p-10 bg-gradient-to-b from-[#f8fafc] to-[#f1f5f9]  relative">
          {status?.ready ? (
            <>
              <div className="font-serif text-2xl text-[#102a43] font-bold mb-1.5 flex items-center gap-2.5">
                <span>🔒</span> Payment Details
              </div>
              <p className="text-xs sm:text-sm text-[#627d98] mb-7">
                Please enter your details below to complete your secure payment.
              </p>

              <form className="space-y-5" onSubmit={submit}>
                {kind === 'donation' && (
                  <div className="space-y-1.5">
                    <label className="block text-xs sm:text-sm font-bold text-[#334e68] mb-1.5">
                      Select Donation Amount (USD)
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-2.5 mb-4">
                      {[18, 36, 72, 180, 360, 1000].map((value) => (
                        <button
                          type="button"
                          className={`py-3 px-2 border-[1.5px] rounded-lg font-bold text-base cursor-pointer transition-all text-center ${
                            customAmount === String(value)
                              ? 'bg-[#102a43] text-white border-[#102a43] shadow-[0_4px_12px_rgba(16,42,67,0.2)]'
                              : 'border-[#cbd5e1] bg-white text-[#102a43] hover:border-[#c69b46] hover:text-[#c69b46] hover:bg-[#fffdf9]'
                          }`}
                          onClick={() => setCustomAmount(String(value))}
                          key={value}
                        >
                          ${value}
                        </button>
                      ))}
                    </div>

                    <div className="relative flex items-center">
                      <span className="absolute left-4 text-lg font-bold text-[#c69b46] pointer-events-none">
                        $
                      </span>
                      <input
                        aria-label="Custom donation amount"
                        type="number"
                        min="1"
                        max="100000"
                        step="0.01"
                        className="w-full border-[1.5px] border-[#cbd5e1] rounded-lg py-3 pr-4 pl-9 text-lg font-bold text-[#102a43] bg-white transition-all outline-none focus:border-[#c69b46] focus:ring-2 focus:ring-[#c69b46]/15"
                        placeholder="Other amount"
                        value={customAmount}
                        onChange={(e) => setCustomAmount(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-xs sm:text-sm font-bold text-[#334e68] mb-1.5">
                      Full Name
                    </label>
                    <input
                      name="name"
                      autoComplete="name"
                      className="w-full border-[1.5px] border-[#cbd5e1] rounded-lg px-4 py-3 text-sm text-[#102a43] bg-white transition-all outline-none focus:border-[#c69b46] focus:ring-2 focus:ring-[#c69b46]/15"
                      placeholder="e.g. Moshe Cohen"
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-xs sm:text-sm font-bold text-[#334e68] mb-1.5">
                      Email Address
                    </label>
                    <input
                      name="email"
                      type="email"
                      autoComplete="email"
                      className="w-full border-[1.5px] border-[#cbd5e1] rounded-lg px-4 py-3 text-sm text-[#102a43] bg-white transition-all outline-none focus:border-[#c69b46] focus:ring-2 focus:ring-[#c69b46]/15"
                      placeholder="moshe@example.com"
                      required
                    />
                  </div>
                </div>

                {kind === 'donation' && (
                  <div className="space-y-1.5">
                    <label className="block text-xs sm:text-sm font-bold text-[#334e68] mb-1.5">
                      Dedication or Memorial Message{' '}
                      <small className="font-normal text-[#627d98]">(Optional)</small>
                    </label>
                    <textarea
                      name="dedication"
                      rows={2}
                      className="w-full border-[1.5px] border-[#cbd5e1] rounded-lg px-4 py-3 text-sm text-[#102a43] bg-white transition-all outline-none focus:border-[#c69b46] focus:ring-2 focus:ring-[#c69b46]/15"
                      placeholder="In honor of / In memory of..."
                    />
                    <label className="flex items-center gap-2.5 cursor-pointer text-sm text-[#334e68] font-medium select-none mt-3">
                      <input
                        name="anonymous"
                        type="checkbox"
                        className="w-4.5 h-4.5 accent-[#102a43] cursor-pointer"
                      />
                      Make this donation anonymous
                    </label>
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="block text-xs sm:text-sm font-bold text-[#334e68] mb-1.5">
                    Card Number
                  </label>
                  <div className="rounded-lg bg-white border-[1.5px] border-[#cbd5e1] focus-within:border-[#c69b46] focus-within:ring-2 focus-within:ring-[#c69b46]/15 transition-all overflow-hidden">
                    <iframe
                      title="Secure card number"
                      data-ifields-id="card-number"
                      data-ifields-placeholder="•••• •••• •••• ••••"
                      src="https://cdn.cardknox.com/ifields/3.5.2607.1401/ifield.htm"
                      className="w-full h-[44px] border-none block"
                      onLoad={() => handleIframeLoad()}
                    />
                  </div>
                  <input type="hidden" data-ifields-id="card-number-token" />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-xs sm:text-sm font-bold text-[#334e68] mb-1.5">
                      Expiration Date
                    </label>
                    <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
                      <select
                        name="month"
                        aria-label="Expiration month"
                        className="w-full border-[1.5px] border-[#cbd5e1] rounded-lg px-4 py-3 text-sm text-[#102a43] bg-white transition-all outline-none focus:border-[#c69b46] focus:ring-2 focus:ring-[#c69b46]/15 cursor-pointer"
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
                      <span className="text-[#94a3b8] font-bold text-center">/</span>
                      <select
                        name="year"
                        aria-label="Expiration year"
                        className="w-full border-[1.5px] border-[#cbd5e1] rounded-lg px-4 py-3 text-sm text-[#102a43] bg-white transition-all outline-none focus:border-[#c69b46] focus:ring-2 focus:ring-[#c69b46]/15 cursor-pointer"
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

                  <div className="space-y-1.5">
                    <label className="block text-xs sm:text-sm font-bold text-[#334e68] mb-1.5">
                      Security Code (CVV)
                    </label>
                    <div className="rounded-lg bg-white border-[1.5px] border-[#cbd5e1] focus-within:border-[#c69b46] focus-within:ring-2 focus-within:ring-[#c69b46]/15 transition-all overflow-hidden">
                      <iframe
                        title="Secure card security code"
                        data-ifields-id="cvv"
                        data-ifields-placeholder="CVC / CVV"
                        src="https://cdn.cardknox.com/ifields/3.5.2607.1401/ifield.htm"
                        className="w-full h-[44px] border-none block"
                        onLoad={() => handleIframeLoad()}
                      />
                    </div>
                    <input type="hidden" data-ifields-id="cvv-token" />
                  </div>
                </div>

                {message && (
                  <p
                    className="text-xs text-red-600 bg-red-50 border border-red-200 p-3 rounded-lg font-medium mt-3"
                    role="alert"
                  >
                    {message}
                  </p>
                )}

                <button
                  type="submit"
                  className="w-full py-4 px-6 bg-gradient-to-r from-[#102a43] to-[#173f5f] text-white border-none rounded-xl text-base font-extrabold tracking-wide cursor-pointer transition-all shadow-[0_8px_20px_rgba(16,42,67,0.25)] hover:enabled:from-[#173f5f] hover:enabled:to-[#0b1d30] hover:enabled:shadow-[0_12px_28px_rgba(16,42,67,0.35)] hover:enabled:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2.5 mt-6"
                  disabled={working}
                >
                  {working ? (
                    <>⏳ PROCESSING SECURELY…</>
                  ) : (
                    <>
                      <span>🔒</span> PROCESS SECURE PAYMENT — ${Number.isFinite(total) ? total.toFixed(2) : '0.00'}
                    </>
                  )}
                </button>

                <div className="flex items-center justify-center gap-2 mt-4 text-xs text-[#627d98] font-medium">
                  <svg className="w-3.5 h-3.5 text-emerald-500 fill-current" viewBox="0 0 24 24">
                    <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-5.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z" />
                  </svg>
                  256-Bit SSL Encrypted &amp; Powered by Cardknox / Sola
                </div>
              </form>
            </>
          ) : status === null ? (
            <div className="text-center py-10 text-[#627d98]">
              <p>Loading secure payment environment...</p>
            </div>
          ) : (
            <div className="text-center py-5">
              <span className="w-3 h-3 bg-amber-400 rounded-full block mx-auto mb-4" />
              <h2 className="font-serif text-[#102a43] text-2xl font-bold">
                Payment Setup Pending
              </h2>
              <p className="text-[#627d98] text-sm my-3 mb-6">
                The administrator must configure Cardknox API credentials in the settings.
              </p>
              <a
                className="inline-flex w-auto py-3.5 px-6 bg-[#102a43] hover:bg-[#1a385c] text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-sm no-underline"
                href="/admin/settings"
              >
                Open Admin Settings →
              </a>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
