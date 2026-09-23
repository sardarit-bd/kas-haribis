'use client';

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import type { Sefer } from '../seforim/seforim-catalog';
import { useCart } from './cart-context';

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

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 15,scale:0.9 },
  visible: {
    opacity: 1,
    y: 0,
    scale:1,
    transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] },
  },
};

export default function FeaturedSeforim() {

  const { addToCart } = useCart();
  const router = useRouter();

  return (
    <section className="py-16 bg-gray-200">
      <div className="container max-w-7xl mx-auto px-8">
        {/* Centered Header */}
        <div className="text-center max-w-2xl mx-auto mb-12 hidden">
          <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-semibold text-[#102a43]/80">
            Featured Torah Seforim &amp; Guides
          </h2>
        </div>

        {/* 4-Column Book Cards Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-20px' }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {featuredBooks.map((book) => (
            <motion.article
              variants={cardVariants}
              whileHover={{ y: -4, transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] } }}
              onClick={() => { router.push('/seforim'); }}
              key={book.id}
              className="bg-white p-5 flex flex-col justify-between transition-shadow duration-300 group border border-slate-200/60 hover:shadow-lg cursor-pointer"
            >
              <div>
                {/* Book Cover Image */}
                <div className="h-60 w-full overflow-hidden bg-white mb-4 flex items-center justify-center group-hover:scale-105 transition duration-300">
                  <img
                    src={book.image}
                    alt={book.title}
                    className="max-h-full max-w-full object-contain"
                  />
                </div>

                {/* Title & Description */}
                <h3 className="pt-4 text-xl font-semibold text-[#102a43] mb-1.5 line-clamp-1 tracking-tight">
                  {book.title}
                </h3>
                <p className="text-base font-normal text-slate-500 line-clamp-2 mb-4 leading-relaxed">
                  {book.description}
                </p>
              </div>

              {/* Price & Add to Cart */}
              <div className="pt-3 flex items-center justify-between gap-2">
                <div>
                  <span className="text-xs text-slate-400 block font-normal hidden">Price</span>
                  <span className="font-semibold text-xl text-[#102a43]">${book.price}</span>
                </div>
                <button
                  onClick={() => addToCart(book, 'book')}
                  className="bg-[#102a43] hover:bg-[#c69b46] text-white hover:text-[#071d31] font-semibold text-xs px-4 py-2.5 transition duration-200 flex items-center gap-1.5 cursor-pointer shadow-xs hidden"
                >
                  <span>🛒 Add to Cart</span>
                </button>
              </div>
            </motion.article>
          ))}
        </motion.div>

        {/* Centered Action Button with Styled Background */}
        <div className="mt-12 text-center">
          <motion.a
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.98 }}
            href="/seforim"
            className="inline-flex items-center gap-2 pBG text-white font-semibold py-3.5 px-8 text-sm sm:text-base transition shadow-md hover:shadow-lg"
          >
            <span className='text-white'>View Full Catalog</span>
          </motion.a>
        </div>
      </div>
    </section>
  );
}

