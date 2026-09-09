'use client';
import { useRouter } from 'next/navigation';
import { FormEvent, useEffect, useState } from 'react';
import { MdKeyboardBackspace } from "react-icons/md";
import type { Sefer } from './seforim-catalog';

export type CartItem = {
  book: Sefer;
  format: 'book' | 'pdf';
  quantity: number;
};

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

export default function StoreCheckout({
  items,
  onClose,
  onQuantity,
  onRemove,
}: {
  items: CartItem[];
  onClose: () => void;
  onQuantity: (index: number, q: number) => void;
  onRemove: (index: number) => void;
}) {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [message, setMessage] = useState('');
  const [working, setWorking] = useState(false);
  const [success, setSuccess] = useState<any>(null);

  const total = items.reduce(
    (sum, x) =>
      sum +
      (x.format === 'pdf' ? x.book.pdf_price : x.book.price) * x.quantity,
    0,
  );
  const physical = items.some((x) => x.format === 'book');

  useEffect(() => {
    fetch('/api/payment-public-status')
      .then((r) => r.json())
      .then((data) => {
        setReady(Boolean(data.ready));
        if (!data.ready || !data.ifieldsKey) return;
        const init = () =>
          window.setAccount?.(
            data.ifieldsKey,
            'Kav Haribis Website',
            '1.0.0',
          );
        const existing = document.querySelector(
          'script[data-cardknox="ifields"]',
        ) as HTMLScriptElement | null;
        if (existing) {
          if (window.setAccount) init();
          else existing.addEventListener('load', init, { once: true });
          return;
        }
        const s = document.createElement('script');
        s.src = 'https://cdn.cardknox.com/ifields/3.5.2607.1401/ifields.min.js';
        s.async = true;
        s.dataset.cardknox = 'ifields';
        s.onload = init;
        document.head.appendChild(s);
      });
  }, []);

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setWorking(true);
    setMessage('');
    const f = new FormData(e.currentTarget);
    const month = String(f.get('month') || '');
    const year = String(f.get('year') || '');

    if (!window.getTokens) {
      setMessage('Secure card fields are still loading. Please wait a moment.');
      setWorking(false);
      return;
    }

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

        const r = await fetch('/api/payments', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({
            kind: 'seforim-order',
            amount: total,
            name: f.get('name'),
            email: f.get('email'),
            phone: f.get('phone'),
            address: f.get('address'),
            city: f.get('city'),
            state: f.get('state'),
            zip: f.get('zip'),
            expiration: `${month}${year}`,
            cardToken,
            cvvToken,
            items: items.map((x) => ({
              seferId: x.book.id,
              format: x.format,
              quantity: x.quantity,
            })),
          }),
        });

        const j = (await r.json()) as any;
        if (!r.ok) {
          setMessage(j.error || 'Payment was not approved.');
          setWorking(false);
          return;
        }

        setSuccess(j);
        setWorking(false);
      },
      () => {
        setMessage('Please check the card number and security code.');
        setWorking(false);
      },
      30000,
    );
  }

  const handleIframeLoad = () => {
    const inputStyle = {
      width: '100%',
      height: '44px',
      border: '0px',
      'box-sizing': 'border-box',
      padding: '0 12px',
      'font-size': '15px',
      color: '#1e293b',
      background: 'transparent',
      outline: 'none',
    };

    (window as any).setIfieldStyle?.('card-number', inputStyle);
    (window as any).setIfieldStyle?.('cvv', inputStyle);
  };

  if (success)
    return (
      <div className="bg-white text-slate-800 p-8 sm:p-12 rounded-3xl max-w-xl mx-auto my-8 border border-slate-200 text-center shadow-2xl relative overflow-hidden">
        <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 font-bold text-3xl flex items-center justify-center mx-auto mb-5 border border-emerald-200 shadow-inner">
          ✓
        </div>
        <h2 className="text-3xl font-serif font-bold text-[#102a43] mb-2 tracking-wide">
          Payment Approved
        </h2>
        <p className="text-slate-600 text-base mb-4">
          Order <b className="text-[#c69b46] font-mono tracking-wider">{success.orderId}</b> has been successfully recorded.
        </p>
        {physical && (
          <p className="text-slate-500 text-sm mb-4">
            Your printed books will be prepared for shipping shortly.
          </p>
        )}
        {success.downloads?.length > 0 && (
          <div className="bg-[#f8fafc] border border-slate-200 p-6 rounded-2xl my-6 flex flex-col gap-3.5 text-left shadow-sm">
            <h3 className="text-lg font-serif font-bold text-[#102a43] flex items-center gap-2">
              <span>📄</span> Your One-Time PDF Downloads
            </h3>
            {success.downloads.map((x: any) => (
              <a
                className="inline-flex items-center justify-center px-4 py-3 rounded-xl bg-[#102a43] hover:bg-[#1a385c] text-white font-bold text-sm transition-all shadow-md active:scale-[0.98]"
                href={x.url}
                key={x.url}
              >
                Download {x.title}
              </a>
            ))}
            <small className="text-slate-500 text-xs text-center block mt-1">
              Each PDF download link is single-use. Please download and save each file now.
            </small>
          </div>
        )}
        <button
          className="mt-2 px-8 py-3 rounded-xl border border-slate-300 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-sm transition cursor-pointer shadow-sm"
          onClick={onClose}
        >
          Close &amp; Return
        </button>
      </div>
    );

  return (
    <div className="w-full my-6 text-slate-800">
      {/* Header bar */}
      <header className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6">
        <div className="flex items-center gap-3.5">
          <button
            onClick={() => {
              router.back();
            }}
            className="bg-gray-200 hover:text-white text-[#102a43] p-2.5 transition-all cursor-pointer"
            title="Go Back"
          >
            <MdKeyboardBackspace size={22} />
          </button>
          <div>
            <span className="text-[#a37828] font-mono text-xs font-bold uppercase tracking-widest block mb-0.5 hidden">
              Checkout Process
            </span>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#102a43] mb-0">
              Complete Your Seforim Order
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-2.5 px-5 py-2.5 w-fit">
          <span className="text-slate-500 text-xs uppercase font-medium">Total Due:</span>
          <strong className="text-[#a37828] font-mono text-xl sm:text-2xl">${total.toFixed(2)}</strong>
        </div>
      </header>

      {/* Main Grid Layout */}
      <div className="grid lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Order Summary (STICKY POSITION) */}
        <section className="lg:col-span-5 lg:sticky lg:top-[110px] bg-white border border-slate-200/90 p-6 flex flex-col gap-5 shadow-xl shadow-slate-100">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
            <h3 className="text-lg font-serif font-bold text-[#102a43] flex items-center gap-2">
              <span>🛒</span> Order Summary
            </h3>
            <span className="text-xs text-slate-600 font-medium bg-[#f8fafc] px-3 py-1 rounded-full border border-slate-200">
              {items.length} {items.length === 1 ? 'item' : 'items'}
            </span>
          </div>

          <div className="flex flex-col gap-3.5 max-h-[480px] overflow-y-auto pr-1">
            {items.map((x, i) => (
              <article
                className="bg-[#fcfbf9] border border-slate-200 hover:border-slate-300 p-4 rounded-2xl flex items-center gap-4 transition-all shadow-sm"
                key={`${x.book.id}-${x.format}`}
              >
                <img
                  className="w-14 h-18 object-contain shrink-0 rounded-lg bg-white p-1 border border-slate-200 shadow-sm"
                  src={x.book.image}
                  alt={x.book.title}
                />
                <div className="flex-1 min-w-0">
                  <b className="text-[#102a43] font-serif text-sm block truncate mb-1" title={x.book.title}>
                    {x.book.title}
                  </b>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="inline-block bg-[#102a43]/10 text-[#102a43] text-[11px] font-semibold px-2 py-0.5 rounded-md border border-[#102a43]/15">
                      {x.format === 'pdf' ? '📖 PDF Download' : '📘 Printed Book'}
                    </span>
                    <span className="text-[#a37828] font-mono text-xs font-bold">
                      ${(x.format === 'pdf' ? x.book.pdf_price : x.book.price).toFixed(2)}
                    </span>
                  </div>
                </div>

                {x.format === 'book' ? (
                  <select
                    className="bg-white border border-slate-300 text-slate-800 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:border-[#c69b46] cursor-pointer shadow-sm"
                    aria-label={`Quantity for ${x.book.title}`}
                    value={x.quantity}
                    onChange={(e) => onQuantity(i, Number(e.target.value))}
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((q) => (
                      <option key={q} value={q}>{q}</option>
                    ))}
                  </select>
                ) : (
                  <span className="bg-slate-100 text-slate-600 font-mono text-xs px-2.5 py-1 rounded-lg border border-slate-200">
                    1
                  </span>
                )}

                <button
                  className="text-rose-500 hover:text-rose-700 hover:bg-rose-50 p-1.5 rounded-lg text-xs font-semibold transition cursor-pointer"
                  onClick={() => onRemove(i)}
                  title="Remove item"
                >
                  ✕
                </button>
              </article>
            ))}
          </div>

          <div className="pt-4 border-t border-slate-100 space-y-2 text-sm">
            <div className="flex items-center justify-between text-slate-600">
              <span>Subtotal</span>
              <span className="font-mono text-slate-800 font-semibold">${total.toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between text-slate-600">
              <span>Shipping &amp; Handling</span>
              <span className="text-emerald-600 text-xs font-bold">FREE</span>
            </div>
            <div className="flex items-center justify-between pt-3 border-t border-slate-200 text-lg font-bold">
              <span className="text-[#102a43]">Total</span>
              <b className="text-[#a37828] font-mono text-2xl">${total.toFixed(2)}</b>
            </div>
          </div>
        </section>

        {/* Right Column: Customer & Payment Form (SCROLLABLE) */}
        <section className="lg:col-span-7 bg-white border border-gray-200 p-6 sm:p-8 shadow-xl shadow-slate-100">
          <div className="mb-6 border-b border-slate-100 pb-4">
            <h2 className="text-2xl font-serif font-bold text-[#102a43]">
              Customer &amp; Payment Details
            </h2>
            <p className="text-slate-600 text-sm mt-1">
              Enter your contact, shipping, and card information to finalize your order.
            </p>
          </div>

          {ready ? (
            <form className="flex flex-col gap-6" onSubmit={submit}>
              {/* Step 1: Contact Info */}
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-2.5 mb-1">
                  <span className="w-7 h-7 rounded-full bg-[#102a43] text-white font-bold text-xs flex items-center justify-center shadow-sm">
                    1
                  </span>
                  <h3 className="text-base font-serif font-bold text-[#102a43]">
                    Contact Information
                  </h3>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <label className="flex flex-col gap-1.5 text-xs font-semibold text-slate-700">
                    <span>Full Name <b className="text-rose-500">*</b></span>
                    <input
                      className="bg-[#f8fafc] border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 text-sm focus:outline-none focus:bg-white focus:border-[#c69b46] focus:ring-1 focus:ring-[#c69b46] placeholder-slate-400 transition-all"
                      name="name"
                      required
                      autoComplete="name"
                      placeholder="e.g. John Doe"
                    />
                  </label>

                  <label className="flex flex-col gap-1.5 text-xs font-semibold text-slate-700">
                    <span>Email Address <b className="text-rose-500">*</b></span>
                    <input
                      className="bg-[#f8fafc] border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 text-sm focus:outline-none focus:bg-white focus:border-[#c69b46] focus:ring-1 focus:ring-[#c69b46] placeholder-slate-400 transition-all"
                      name="email"
                      type="email"
                      required
                      autoComplete="email"
                      placeholder="john@example.com"
                    />
                  </label>
                </div>

                <label className="flex flex-col gap-1.5 text-xs font-semibold text-slate-700">
                  <span>Phone Number</span>
                  <input
                    className="bg-[#f8fafc] border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 text-sm focus:outline-none focus:bg-white focus:border-[#c69b46] focus:ring-1 focus:ring-[#c69b46] placeholder-slate-400 transition-all"
                    name="phone"
                    type="tel"
                    autoComplete="tel"
                    placeholder="(555) 000-0000"
                  />
                </label>
              </div>

              {/* Step 2: Shipping Address (only if physical book) */}
              {physical && (
                <div className="flex flex-col gap-4 pt-4 border-t border-slate-100">
                  <div className="flex items-center gap-2.5 mb-1">
                    <span className="w-7 h-7 rounded-full bg-[#102a43] text-white font-bold text-xs flex items-center justify-center shadow-sm">
                      2
                    </span>
                    <h3 className="text-base font-serif font-bold text-[#102a43]">
                      Shipping Address
                    </h3>
                  </div>

                  <label className="flex flex-col gap-1.5 text-xs font-semibold text-slate-700">
                    <span>Street Address <b className="text-rose-500">*</b></span>
                    <input
                      className="bg-[#f8fafc] border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 text-sm focus:outline-none focus:bg-white focus:border-[#c69b46] focus:ring-1 focus:ring-[#c69b46] placeholder-slate-400 transition-all"
                      name="address"
                      required
                      autoComplete="street-address"
                      placeholder="123 Main Street, Apt 4B"
                    />
                  </label>

                  <div className="grid grid-cols-3 gap-3">
                    <label className="flex flex-col gap-1.5 text-xs font-semibold text-slate-700">
                      <span>City <b className="text-rose-500">*</b></span>
                      <input
                        className="bg-[#f8fafc] border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 text-sm focus:outline-none focus:bg-white focus:border-[#c69b46] focus:ring-1 focus:ring-[#c69b46] placeholder-slate-400 transition-all"
                        name="city"
                        required
                        placeholder="New York"
                      />
                    </label>
                    <label className="flex flex-col gap-1.5 text-xs font-semibold text-slate-700">
                      <span>State <b className="text-rose-500">*</b></span>
                      <input
                        className="bg-[#f8fafc] border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 text-sm focus:outline-none focus:bg-white focus:border-[#c69b46] focus:ring-1 focus:ring-[#c69b46] placeholder-slate-400 transition-all"
                        name="state"
                        required
                        placeholder="NY"
                      />
                    </label>
                    <label className="flex flex-col gap-1.5 text-xs font-semibold text-slate-700">
                      <span>ZIP <b className="text-rose-500">*</b></span>
                      <input
                        className="bg-[#f8fafc] border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 text-sm focus:outline-none focus:bg-white focus:border-[#c69b46] focus:ring-1 focus:ring-[#c69b46] placeholder-slate-400 transition-all"
                        name="zip"
                        required
                        inputMode="numeric"
                        placeholder="10001"
                      />
                    </label>
                  </div>
                </div>
              )}

              {/* Step 3 (or 2): Payment Method */}
              <div className="flex flex-col gap-4 pt-4 border-t border-slate-100">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <div className="flex items-center gap-2.5">
                    <span className="w-7 h-7 rounded-full bg-[#102a43] text-white font-bold text-xs flex items-center justify-center shadow-sm">
                      {physical ? '3' : '2'}
                    </span>
                    <h3 className="text-base font-serif font-bold text-[#102a43]">
                      Payment Method
                    </h3>
                  </div>
                  <div className="flex gap-1.5 text-[10px] font-bold text-slate-500">
                    <span className="bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-md">VISA</span>
                    <span className="bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-md">MC</span>
                    <span className="bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-md">AMEX</span>
                    <span className="bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-md">DISC</span>
                  </div>
                </div>

                <label className="flex flex-col gap-1.5 text-xs font-semibold text-slate-700">
                  <span>Card Number <b className="text-rose-500">*</b></span>
                  <div className="bg-[#f8fafc] border border-slate-300 rounded-xl overflow-hidden h-11 focus-within:bg-white focus-within:border-[#c69b46] focus-within:ring-1 focus-within:ring-[#c69b46] transition-all">
                    <iframe
                      className="w-full h-full"
                      title="Secure card number"
                      data-ifields-id="card-number"
                      data-ifields-placeholder="4111 •••• •••• 1111"
                      src="https://cdn.cardknox.com/ifields/3.5.2607.1401/ifield.htm"
                      onLoad={() => handleIframeLoad()}
                    />
                  </div>
                  <input type="hidden" data-ifields-id="card-number-token" />
                </label>

                <div className="grid grid-cols-2 gap-4">
                  <label className="flex flex-col gap-1.5 text-xs font-semibold text-slate-700">
                    <span>Expiration Date <b className="text-rose-500">*</b></span>
                    <div className="flex items-center gap-1.5">
                      <select
                        className="flex-1 bg-[#f8fafc] border border-slate-300 rounded-xl px-2.5 py-2.5 text-slate-900 text-sm focus:outline-none focus:bg-white focus:border-[#c69b46] focus:ring-1 focus:ring-[#c69b46] cursor-pointer"
                        name="month"
                        required
                        defaultValue=""
                      >
                        <option value="" disabled>
                          MM
                        </option>
                        {Array.from({ length: 12 }, (_, i) =>
                          String(i + 1).padStart(2, '0'),
                        ).map((x) => (
                          <option key={x} value={x}>{x}</option>
                        ))}
                      </select>
                      <b className="text-slate-400">/</b>
                      <select
                        className="flex-1 bg-[#f8fafc] border border-slate-300 rounded-xl px-2.5 py-2.5 text-slate-900 text-sm focus:outline-none focus:bg-white focus:border-[#c69b46] focus:ring-1 focus:ring-[#c69b46] cursor-pointer"
                        name="year"
                        required
                        defaultValue=""
                      >
                        <option value="" disabled>
                          YY
                        </option>
                        {Array.from({ length: 12 }, (_, i) =>
                          String(new Date().getFullYear() + i).slice(-2),
                        ).map((x) => (
                          <option key={x} value={x}>{x}</option>
                        ))}
                      </select>
                    </div>
                  </label>

                  <label className="flex flex-col gap-1.5 text-xs font-semibold text-slate-700">
                    <span>Security Code (CVV) <b className="text-rose-500">*</b></span>
                    <div className="bg-[#f8fafc] border border-slate-300 rounded-xl overflow-hidden h-11 focus-within:bg-white focus-within:border-[#c69b46] focus-within:ring-1 focus-within:ring-[#c69b46] transition-all">
                      <iframe
                        className="w-full h-full"
                        title="Secure card security code"
                        data-ifields-id="cvv"
                        data-ifields-placeholder="CVV"
                        src="https://cdn.cardknox.com/ifields/3.5.2607.1401/ifield.htm"
                        onLoad={() => handleIframeLoad()}
                      />
                    </div>
                    <input type="hidden" data-ifields-id="cvv-token" />
                  </label>
                </div>
              </div>

              {message && (
                <p className="bg-rose-50 border border-rose-200 text-rose-700 text-sm p-3.5 rounded-xl flex items-center gap-2">
                  <span>⚠️</span> {message}
                </p>
              )}

              <button
                className="w-full py-3.5 px-6 rounded-xl bg-[#102a43] hover:bg-[#1a385c] text-white font-bold text-sm tracking-wider transition-all shadow-md shadow-[#102a43]/20 cursor-pointer disabled:opacity-50 active:scale-[0.99]"
                disabled={working}
              >
                {working ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                    PROCESSING PAYMENT…
                  </span>
                ) : (
                  `PAY $${total.toFixed(2)} NOW`
                )}
              </button>

              <div className="flex items-center gap-3 bg-[#f8fafc] border border-slate-200 p-4 rounded-2xl text-xs">
                <span className="text-2xl">🔒</span>
                <div>
                  <strong className="text-slate-800 block font-semibold">256-Bit Encrypted Secure Payment</strong>
                  <p className="text-slate-500 text-[11px]">Powered by Cardknox / Sola Merchant Gateway</p>
                </div>
              </div>
            </form>
          ) : (
            <div className="text-center py-12">
              <span className="w-8 h-8 rounded-full border-2 border-[#102a43] border-t-transparent animate-spin inline-block mb-3" />
              <p className="text-slate-500 text-sm">Secure payment form is initializing...</p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

