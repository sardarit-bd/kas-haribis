'use client';
import { FormEvent, useEffect, useState } from 'react';
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
  const [ready, setReady] = useState(false),
    [message, setMessage] = useState(''),
    [working, setWorking] = useState(false),
    [success, setSuccess] = useState<any>(null);
  const total = items.reduce(
      (sum, x) =>
        sum +
        (x.format === 'pdf' ? x.book.pdf_price : x.book.price) * x.quantity,
      0,
    ),
    physical = items.some((x) => x.format === 'book');
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
            ),
          existing = document.querySelector(
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
    const f = new FormData(e.currentTarget),
      month = String(f.get('month') || ''),
      year = String(f.get('year') || '');
    if (!window.getTokens) {
      setMessage('Secure card fields are still loading.');
      setWorking(false);
      return;
    }
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
          r = await fetch('/api/payments', {
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
          }),
          j = (await r.json()) as any;
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
  if (success)
    return (
      <div className="storeCheckoutSuccess">
        <span>✓</span>
        <h2>Payment approved</h2>
        <p>
          Order <b>{success.orderId}</b> has been recorded.
        </p>
        {physical && <p>Your printed books will be prepared for shipping.</p>}
        {success.downloads?.length > 0 && (
          <div className="purchasedDownloads">
            <h3>Your one-time PDF downloads</h3>
            {success.downloads.map((x: any) => (
              <a className="primary" href={x.url} key={x.url}>
                Download {x.title}
              </a>
            ))}
            <small>
              Each PDF link works once. Download and save each file now.
            </small>
          </div>
        )}
        <button onClick={onClose}>Close</button>
      </div>
    );
  return (
    <div className="storeCheckout">
      <button className="close" onClick={onClose} aria-label="Close cart">
        ×
      </button>
      <header>
        <p className="eyebrow gold">YOUR CART</p>
        <h2>Complete your Seforim order</h2>
        <strong>${total.toFixed(2)}</strong>
      </header>
      <div className="storeCheckoutGrid">
        <section className="cartItems">
          {items.map((x, i) => (
            <article key={`${x.book.id}-${x.format}`}>
              <img src={x.book.image} alt="" />
              <div>
                <b>{x.book.title}</b>
                <span>
                  {x.format === 'pdf' ? 'PDF Download' : 'Printed Book'} · $
                  {(x.format === 'pdf'
                    ? x.book.pdf_price
                    : x.book.price
                  ).toFixed(2)}
                </span>
              </div>
              {x.format === 'book' ? (
                <select
                  aria-label={`Quantity for ${x.book.title}`}
                  value={x.quantity}
                  onChange={(e) => onQuantity(i, Number(e.target.value))}
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((q) => (
                    <option key={q}>{q}</option>
                  ))}
                </select>
              ) : (
                <span className="pdfQuantity">1</span>
              )}
              <button onClick={() => onRemove(i)}>Remove</button>
            </article>
          ))}
          <div className="cartTotal">
            <span>Total</span>
            <b>${total.toFixed(2)}</b>
          </div>
        </section>
        <section className="checkoutCard">
          <h2>Customer & payment</h2>
          {ready ? (
            <form className="paymentForm" onSubmit={submit}>
              <div className="twoFields">
                <label>
                  Name
                  <input name="name" required autoComplete="name" />
                </label>
                <label>
                  Email
                  <input
                    name="email"
                    type="email"
                    required
                    autoComplete="email"
                  />
                </label>
              </div>
              <label>
                Phone
                <input name="phone" type="tel" autoComplete="tel" />
              </label>
              {physical && (
                <fieldset>
                  <legend>Shipping address</legend>
                  <label>
                    Street address
                    <input
                      name="address"
                      required
                      autoComplete="street-address"
                    />
                  </label>
                  <div className="shippingRow">
                    <label>
                      City
                      <input name="city" required />
                    </label>
                    <label>
                      State
                      <input name="state" required />
                    </label>
                    <label>
                      ZIP
                      <input name="zip" required inputMode="numeric" />
                    </label>
                  </div>
                </fieldset>
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
                    <select name="month" required defaultValue="">
                      <option value="" disabled>
                        MM
                      </option>
                      {Array.from({ length: 12 }, (_, i) =>
                        String(i + 1).padStart(2, '0'),
                      ).map((x) => (
                        <option key={x}>{x}</option>
                      ))}
                    </select>
                    <b>/</b>
                    <select name="year" required defaultValue="">
                      <option value="" disabled>
                        YY
                      </option>
                      {Array.from({ length: 12 }, (_, i) =>
                        String(new Date().getFullYear() + i).slice(-2),
                      ).map((x) => (
                        <option key={x}>{x}</option>
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
              {message && <p className="formError">{message}</p>}
              <button className="primary paymentButton" disabled={working}>
                {working ? 'PROCESSING…' : `PAY $${total.toFixed(2)}`}
              </button>
              <small className="secureNote">
                🔒 Secure payment powered by Cardknox/Sola
              </small>
            </form>
          ) : (
            <p>Secure checkout is loading or payment setup is unavailable.</p>
          )}
        </section>
      </div>
    </div>
  );
}
