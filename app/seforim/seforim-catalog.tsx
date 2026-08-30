'use client';
import { useMemo, useState } from 'react';
import StoreCheckout, { type CartItem } from './store-checkout';
export type Sefer = {
  id: string;
  title: string;
  price: number;
  available: boolean;
  image: string;
  description: string;
  sort_order?: number;
  pdf_available: boolean;
  pdf_price: number;
  pdf_filename: string;
};
export default function SeforimCatalog({ books }: { books: Sefer[] }) {
  const [query, setQuery] = useState(''),
    [format, setFormat] = useState('all'),
    [selected, setSelected] = useState<Sefer | null>(null),
    [cart, setCart] = useState<CartItem[]>([]),
    [cartOpen, setCartOpen] = useState(false),
    [notice, setNotice] = useState('');
  const filtered = useMemo(
      () =>
        books.filter(
          (book) =>
            book.title.toLowerCase().includes(query.toLowerCase()) &&
            (format === 'all' ||
              (format === 'book'
                ? book.available
                : format === 'pdf'
                  ? book.pdf_available
                  : book.available && book.pdf_available)),
        ),
      [books, query, format],
    ),
    count = cart.reduce((n, x) => n + x.quantity, 0);
  function add(book: Sefer, kind: 'book' | 'pdf') {
    setCart((current) => {
      const index = current.findIndex(
        (x) => x.book.id === book.id && x.format === kind,
      );
      if (index < 0) return [...current, { book, format: kind, quantity: 1 }];
      return current.map((x, i) =>
        i === index
          ? {
              ...x,
              quantity: kind === 'pdf' ? 1 : Math.min(10, x.quantity + 1),
            }
          : x,
      );
    });
    setNotice(`${kind === 'pdf' ? 'PDF' : 'Printed book'} added to cart.`);
    setSelected(null);
  }
  return (
    <>
      <section className="seforimSection">
        <div className="storeToolbar">
          <div className="directoryTools">
            <label>
              Search the catalog
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by title…"
              />
            </label>
            <label>
              Format
              <select
                value={format}
                onChange={(e) => setFormat(e.target.value)}
              >
                <option value="all">All formats</option>
                <option value="book">Printed books</option>
                <option value="pdf">PDF downloads</option>
                <option value="both">Book and PDF</option>
              </select>
            </label>
            <b>{filtered.length} titles</b>
          </div>
          <button className="cartButton" onClick={() => setCartOpen(true)}>
            Cart <span>{count}</span>
          </button>
        </div>
        {notice && (
          <p className="cartNotice">
            ✓ {notice}{' '}
            <button onClick={() => setCartOpen(true)}>View cart</button>
          </p>
        )}
        <div className="seforimCatalog">
          {filtered.map((book) => (
            <article key={book.id}>
              <button
                className="seferCover"
                onClick={() => setSelected(book)}
                aria-label={`View ${book.title}`}
              >
                <img
                  src={book.image}
                  alt={`Cover of ${book.title}`}
                  loading="lazy"
                />
              </button>
              <div className="seferInfo" dir="auto">
                <div className="formatBadges">
                  {book.available && (
                    <span className="printBadge">PRINTED BOOK</span>
                  )}
                  {book.pdf_available && (
                    <span className="pdfBadge">PDF DOWNLOAD</span>
                  )}
                </div>
                <h2>{book.title}</h2>
                <div className="formatPrices">
                  {book.available && (
                    <span>
                      <small>Book</small>${book.price.toFixed(2)}
                    </span>
                  )}
                  {book.pdf_available && (
                    <span>
                      <small>PDF</small>${book.pdf_price.toFixed(2)}
                    </span>
                  )}
                </div>
                <p>{book.description}</p>
                <div className="cardCartActions">
                  {book.available && (
                    <button onClick={() => add(book, 'book')}>
                      Add Book to Cart
                    </button>
                  )}
                  {book.pdf_available && (
                    <button onClick={() => add(book, 'pdf')}>
                      Add PDF to Cart
                    </button>
                  )}
                </div>
                <button
                  className="viewOptions"
                  onClick={() => setSelected(book)}
                >
                  View details
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>
      {selected && (
        <div
          className="modalBackdrop"
          role="dialog"
          aria-modal="true"
          onClick={() => setSelected(null)}
        >
          <div
            className="modal seferModal"
            onClick={(e) => e.stopPropagation()}
          >
            <button className="close" onClick={() => setSelected(null)}>
              ×
            </button>
            <img src={selected.image} alt={`Cover of ${selected.title}`} />
            <div dir="auto">
              <p className="eyebrow gold">KAV HARIBIS SEFORIM</p>
              <h2>{selected.title}</h2>
              <div className="formatBadges">
                {selected.available && (
                  <span className="printBadge">PRINTED BOOK</span>
                )}
                {selected.pdf_available && (
                  <span className="pdfBadge">PDF DOWNLOAD</span>
                )}
              </div>
              <p>{selected.description}</p>
              <div className="purchaseChoices">
                {selected.available && (
                  <div>
                    <span>
                      <b>Printed Book</b>
                      <strong>${selected.price.toFixed(2)}</strong>
                    </span>
                    <button
                      className="primary"
                      onClick={() => add(selected, 'book')}
                    >
                      Add Book to Cart
                    </button>
                  </div>
                )}
                {selected.pdf_available && (
                  <div>
                    <span>
                      <b>Protected PDF</b>
                      <strong>${selected.pdf_price.toFixed(2)}</strong>
                    </span>
                    <button
                      className="primary"
                      onClick={() => add(selected, 'pdf')}
                    >
                      Add PDF to Cart
                    </button>
                  </div>
                )}
                {!selected.available && !selected.pdf_available && (
                  <span className="stockNotice">
                    This title is currently unavailable.
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      {cartOpen && (
        <div className="pdfCheckoutBackdrop" role="dialog" aria-modal="true">
          <div className="fullCartModal">
            {cart.length ? (
              <StoreCheckout
                items={cart}
                onClose={() => setCartOpen(false)}
                onQuantity={(i, q) =>
                  setCart((c) =>
                    c.map((x, n) => (n === i ? { ...x, quantity: q } : x)),
                  )
                }
                onRemove={(i) => setCart((c) => c.filter((_, n) => n !== i))}
              />
            ) : (
              <div className="emptyCart">
                <button className="close" onClick={() => setCartOpen(false)}>
                  ×
                </button>
                <span>🛒</span>
                <h2>Your cart is empty</h2>
                <p>Add a printed book or PDF from the catalog.</p>
                <button className="primary" onClick={() => setCartOpen(false)}>
                  Continue shopping
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
