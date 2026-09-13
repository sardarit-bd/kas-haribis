'use client';
import { useMemo, useState } from 'react';
import { useCart } from '../shared/cart-context';

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
  const { cart, addToCart, setCartOpen, totalCount } = useCart();
  const [query, setQuery] = useState(''),
    [format, setFormat] = useState('all'),
    [selected, setSelected] = useState<Sefer | null>(null),
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
  );

  function add(book: Sefer, kind: 'book' | 'pdf') {
    addToCart(book, kind);
    setNotice(`${kind === 'pdf' ? 'PDF' : 'Printed book'} added to cart.`);
    setSelected(null);
  }
  return (
    <section className='bg-[#f7f3ea] py-6'>
      <section className="w-full container">
        <div className="bg-white  p-4 sm:p-6 mb-8 flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
          <div className="flex-1 flex flex-col md:flex-row gap-4 items-stretch md:items-center">
            <label className="flex-1 text-xs font-semibold text-slate-500 uppercase tracking-wider flex flex-col gap-1.5">
              Search the catalog
              <input
                className="w-full bg-[#f8fafc] border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 placeholder-slate-400 text-sm focus:outline-none focus:border-[#c69b46]"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by title…"
              />
            </label>
            <label className="w-full md:w-56 text-xs font-semibold text-slate-500 uppercase tracking-wider flex flex-col gap-1.5">
              Format
              <select
                className="w-full bg-[#f8fafc] border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 text-sm font-normal focus:outline-none focus:border-[#c69b46] cursor-pointer"
                value={format}
                onChange={(e) => setFormat(e.target.value)}
              >
                <option value="all">All formats</option>
                <option value="book">Printed books</option>
                <option value="pdf">PDF downloads</option>
                <option value="both">Book and PDF</option>
              </select>
            </label>
          </div>
          <div className="flex items-center justify-between md:justify-end gap-4 shrink-0 pt-2 md:pt-0 hidden">
            <b className="text-slate-600 text-sm font-medium">{filtered.length} titles</b>
            <button className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#102a43] hover:bg-[#102a43]/90 text-white font-bold text-sm transition shadow-sm cursor-pointer" style={{ color: 'white' }} onClick={() => setCartOpen(true)}>
              Cart <span className="bg-[#c69b46] text-[#102a43] text-xs font-bold px-2 py-0.5 rounded-full">{totalCount}</span>
            </button>
          </div>
        </div>
        {notice && (
          <p className="hidden bg-[#102a43] text-white border border-[#c69b46]/50 p-4 rounded-xl mb-6 flex items-center justify-between gap-4 text-sm shadow-sm" style={{ color: 'white' }}>
            <span>✓ {notice}</span>
            <button className="text-[#c69b46] hover:underline font-bold text-xs uppercase cursor-pointer" onClick={() => setCartOpen(true)}>View cart</button>
          </p>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {filtered.map((book) => (
            <article className="bg-white overflow-hidden flex flex-col" key={book.id}>
              <button
                className="w-full bg-white aspect-[4/3] flex items-center justify-center p-4 border-b border-slate-100 overflow-hidden cursor-pointer group"
                onClick={() => setSelected(book)}
                aria-label={`View ${book.title}`}
              >
                <img
                  className="max-h-full max-w-full object-contain group-hover:scale-105 transition duration-300"
                  src={book.image}
                  alt={`Cover of ${book.title}`}
                  loading="lazy"
                />
              </button>
              <div className="p-6 flex-1 flex flex-col justify-between" dir="auto">
                <div>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {book.available && (
                      <span className="bg-[#a37828]/10 border border-[#a37828]/30 text-[#a37828] text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">PRINTED BOOK</span>
                    )}
                    {book.pdf_available && (
                      <span className="bg-sky-50 border border-sky-200 text-sky-700 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">PDF DOWNLOAD</span>
                    )}
                  </div>
                  <h2 className="text-2xl font-serif font-meduim text-[#102a43] mb-2 leading-snug">{book.title}</h2>
                  <div className="flex gap-4 text-base font-semibold text-[#a37828] mb-3">
                    {book.available && (
                      <span className="flex items-center gap-1">
                        <small className="text-slate-500 text-base font-normal">Book</small>${book.price.toFixed(2)}
                      </span>
                    )}
                    {book.pdf_available && (
                      <span className="flex items-center gap-1">
                        <small className="text-slate-500 text-xs font-normal">PDF</small>${book.pdf_price.toFixed(2)}
                      </span>
                    )}
                  </div>
                  <p className="text-slate-600/90 text-base font-meduim mb-6 leading-relaxed line-clamp-3">{book.description}</p>
                </div>
                <div className="flex justify-between gap-2 pt-3">
                  <div className="flex flex-col sm:flex-row gap-2">
                    {book.available && (
                      <button className="flex-1 py-2.5 px-3 bg-black hover:bg-[#8c651f] text-white font-bold text-xs transition cursor-pointer shadow-sm" style={{ color: 'white' }} onClick={() => add(book, 'book')}>
                        Add Book to Cart
                      </button>
                    )}
                    {book.pdf_available && (
                      <button className="flex-1 py-2.5 px-3 bg-[#102a43] hover:bg-[#0d2238] text-white font-bold text-xs transition cursor-pointer shadow-sm" style={{ color: 'white' }} onClick={() => add(book, 'pdf')}>
                        Add PDF to Cart
                      </button>
                    )}
                  </div>
                  <button
                    className="text-slate-500 hover:text-[#102a43] text-xs font-medium py-1 transition cursor-pointer text-center"
                    onClick={() => setSelected(book)}
                  >
                    View details
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
      {selected && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm p-4 sm:p-6 flex items-center justify-center overflow-y-auto"
          role="dialog"
          aria-modal="true"
          onClick={() => setSelected(null)}
        >
          <div
            className="bg-white border border-slate-200 rounded-2xl max-w-2xl w-full p-6 sm:p-8 relative shadow-xl grid md:grid-cols-12 gap-6 my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <button className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 text-xl font-bold flex items-center justify-center transition cursor-pointer" onClick={() => setSelected(null)}>
              ×
            </button>
            <div className="md:col-span-5 flex items-center justify-center bg-[#f8fafc] p-4 rounded-xl border border-slate-100">
              <img className="max-h-64 object-contain" src={selected.image} alt={`Cover of ${selected.title}`} />
            </div>
            <div className="md:col-span-7 flex flex-col justify-between" dir="auto">
              <div>
                <p className="text-[#a37828] text-xs font-bold tracking-widest uppercase mb-1">KAV HARIBIS SEFORIM</p>
                <h2 className="text-2xl font-serif font-bold text-[#102a43] mb-3 leading-snug">{selected.title}</h2>
                <div className="flex flex-wrap gap-2 mb-3">
                  {selected.available && (
                    <span className="bg-[#a37828]/10 border border-[#a37828]/30 text-[#a37828] text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">PRINTED BOOK</span>
                  )}
                  {selected.pdf_available && (
                    <span className="bg-sky-50 border border-sky-200 text-sky-700 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">PDF DOWNLOAD</span>
                  )}
                </div>
                <p className="text-slate-600 text-sm leading-relaxed mb-6">{selected.description}</p>
              </div>
              <div className="flex flex-col gap-3 pt-4 border-t border-slate-100">
                {selected.available && (
                  <div className="flex items-center justify-between gap-4">
                    <span className="flex flex-col">
                      <b className="text-slate-800 text-sm font-semibold">Printed Book</b>
                      <strong className="text-[#a37828] font-mono">${selected.price.toFixed(2)}</strong>
                    </span>
                    <button
                      className="px-4 py-2 rounded-xl bg-[#a37828] hover:bg-[#8c651f] text-white font-bold text-xs transition cursor-pointer shadow-sm"
                      style={{ color: 'white' }}
                      onClick={() => add(selected, 'book')}
                    >
                      Add Book to Cart
                    </button>
                  </div>
                )}
                {selected.pdf_available && (
                  <div className="flex items-center justify-between gap-4">
                    <span className="flex flex-col">
                      <b className="text-slate-800 text-sm font-semibold">Protected PDF</b>
                      <strong className="text-[#a37828] font-mono">${selected.pdf_price.toFixed(2)}</strong>
                    </span>
                    <button
                      className="px-4 py-2 rounded-xl bg-[#102a43] hover:bg-[#0d2238] text-white font-bold text-xs transition cursor-pointer shadow-sm"
                      style={{ color: 'white' }}
                      onClick={() => add(selected, 'pdf')}
                    >
                      Add PDF to Cart
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

