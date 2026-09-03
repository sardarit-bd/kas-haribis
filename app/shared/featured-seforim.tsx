'use client';

import { useCart } from './cart-context';
import type { Sefer } from '../seforim/seforim-catalog';

const featuredBooks: Sefer[] = [
  {
    id: '1209',
    title: 'כסף פורח',
    price: 40,
    available: true,
    image: '/seforim/book-04.webp',
    description: 'A Kav Haribis publication addressing practical financial halacha.',
    pdf_available: false,
    pdf_price: 0,
    pdf_filename: '',
  },
  {
    id: '1203',
    title: 'חבילת ריבית הלכה למעשה',
    price: 20,
    available: true,
    image: '/seforim/book-07.webp',
    description: 'A bundled practical learning set covering core areas of Hilchos Ribbis.',
    pdf_available: false,
    pdf_price: 0,
    pdf_filename: '',
  },
  {
    id: '1195',
    title: 'עומק הריבית – ברית פנחס',
    price: 20,
    available: true,
    image: '/seforim/book-11.webp',
    description: 'In-depth learning in Hilchos Ribbis from the Bris Pinchos series.',
    pdf_available: false,
    pdf_price: 0,
    pdf_filename: '',
  },
  {
    id: '874',
    title: 'ברית פנחס – הלכה למעשה',
    price: 20,
    available: true,
    image: '/seforim/book-13.webp',
    description: 'Practical guidance in Hilchos Ribbis from the Bris Pinchos series.',
    pdf_available: false,
    pdf_price: 0,
    pdf_filename: '',
  },
];

export default function FeaturedSeforim() {
  const { addToCart } = useCart();

  return (
    <section className="py-16 bg-[#ffffff] border-t border-[#e2e8f0]">
      <div className="container max-w-7xl mx-auto px-4">
        {/* Centered Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <p className="eyebrow gold mb-1.5">SEFORIM &amp; PUBLICATIONS</p>
          <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-[#102a43]">
            Featured Torah Seforim &amp; Guides
          </h2>
        </div>

        {/* 4-Column Book Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredBooks.map((book) => (
            <article
              key={book.id}
              className="bg-[#fcfaf7] rounded-2xl border border-[#e8e2d5] p-5 flex flex-col justify-between hover:shadow-xl hover:border-[#c69b46] transition-all duration-300 group"
            >
              <div>
                {/* Book Cover Image */}
                <div className="h-56 w-full rounded-xl overflow-hidden bg-white p-3 mb-4 border border-[#eee8dc] flex items-center justify-center shadow-xs group-hover:scale-102 transition duration-300">
                  <img
                    src={book.image}
                    alt={book.title}
                    className="max-h-full max-w-full object-contain drop-shadow-md"
                  />
                </div>

                {/* Title & Description */}
                <h3 className="font-serif text-lg font-bold text-[#102a43] mb-1.5 line-clamp-1">
                  {book.title}
                </h3>
                <p className="text-xs text-slate-600 line-clamp-2 mb-4 leading-relaxed">
                  {book.description}
                </p>
              </div>

              {/* Price & Add to Cart */}
              <div className="pt-3 border-t border-[#eee8dc] flex items-center justify-between gap-2">
                <div>
                  <span className="text-xs text-slate-400 block font-medium">Price</span>
                  <span className="font-bold text-lg text-[#102a43]">${book.price}</span>
                </div>
                <button
                  onClick={() => addToCart(book, 'book')}
                  className="bg-[#102a43] hover:bg-[#c69b46] text-white hover:text-[#071d31] font-bold text-xs px-4 py-2.5 rounded-xl transition duration-200 flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <span>🛒 Add to Cart</span>
                </button>
              </div>
            </article>
          ))}
        </div>

        {/* Centered Action Button with Styled Background */}
        <div className="mt-12 text-center">
          <a
            href="/seforim"
            style={{ color: 'white' }}
            className="inline-flex items-center gap-2 bg-[#102a43] hover:bg-[#173f5f] text-white font-bold py-3.5 px-8 rounded-xl text-sm transition shadow-lg hover:shadow-xl border border-[#c69b46]/30"
          >
            <span>View Full Catalog</span>
            <span className="text-base font-bold">→</span>
          </a>
        </div>
      </div>
    </section>
  );
}
