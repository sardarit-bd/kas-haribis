'use client';
import { motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import CheckoutNotice from '../shared/checkout-notice';
import AccessCodeForm from './access-code-form';

type DocumentRow = {
  id: string;
  title: string;
  description: string;
  filename: string;
};

export default function HeterLibrary() {
  const [documents, setDocuments] = useState<DocumentRow[] | null>(null);
  const [selected, setSelected] = useState<DocumentRow | null>(null);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const checkoutRef = useRef<HTMLDivElement | null>(null);
  

  useEffect(() => {
    fetch('/api/heter-documents')
      .then((r) => r.json())
      .then((data) => {
        const rows = Array.isArray(data.documents) ? data.documents : [];
        setDocuments(rows);
        const requested = new URLSearchParams(window.location.search).get(
          'document',
        );
        const requestedDocument =
          rows.find((item: DocumentRow) => item.id === requested) || null;
        setSelected(requestedDocument || rows[0] || null);
        if (requestedDocument) setCheckoutOpen(true);
      })
      .catch(() => setDocuments([]));
  }, []);

  useEffect(() => {
    if (!checkoutOpen || !selected) return;
    const frame = window.requestAnimationFrame(() =>
      checkoutRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      }),
    );
    return () => window.cancelAnimationFrame(frame);
  }, [checkoutOpen, selected]);

  function openCheckout(item: DocumentRow) {
    setSelected(item);
    setCheckoutOpen(true);
  }

  return (
    <>
      <section className="container max-w-[1440px] mx-auto px-4 sm:px-8 py-10 md:py-14" id="document-library">
        {documents === null ? (
          <p className="text-center py-12 text-sm text-[#64748b]">Loading documents…</p>
        ) : documents.length === 0 ? (
          <div className="p-12 text-center bg-white border border-dashed border-[#cbd5e1] max-w-md mx-auto space-y-2 rounded-xl">
            <b className="text-lg font-serif font-bold text-[#102a43] block">Documents are being prepared</b>
            <p className="text-sm text-[#64748b]">The administrator has not uploaded a Heter Iska PDF yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {documents.map((item, index) => {
              const isSelected = checkoutOpen && selected?.id === item.id;
              return (
                <motion.article
                  key={item.id}
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  whileInView={{ opacity: 1, scale: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: (index % 3) * 0.08 }}
                  whileHover={{ y: -6 }}
                  className={`p-6 bg-white text-white flex flex-col justify-between space-y-6 shadow-xl relative overflow-hidden rounded-xl ${
                    isSelected
                      ? 'border-[#c69b46] ring-2 ring-[#c69b46] bg-[#0F2538]'
                      : 'border-slate-800'
                  }`}
                >
                  <div className="space-y-5">
              
                    {/* Document Icon / Emblem */}
                    <div className="flex flex-col items-center pt-2">
                      <motion.div
                        whileHover={{ scale: 1.08, rotate: 2 }}
                        transition={{ duration: 0.3 }}
                        className="relative w-32 h-32 mb-5 bg-gradient-to-b from-slate-800/90 to-slate-900 border border-slate-700/80 rounded-xl p-2.5 flex flex-col justify-between items-center shrink-0 shadow-lg group-hover:border-[#c69b46]/80 transition-colors"
                      >
                        <img src={'/agreement (1).webp'} alt='icon'/>
                      </motion.div>

                      {/* Title & Description */}
                      <h2 className="text-xl font-serif font-bold text-black text-center leading-snug group-hover:text-[#c69b46] transition-colors">
                        {item.title}
                      </h2>
                      <p className="text-sm text-slate-700 text-center leading-relaxed line-clamp-3 mt-2">
                        {item.description ||
                          'Review this Heter Iska before purchasing a protected copy.'}
                      </p>
                    </div>
                  </div>

                  {/* Actions Footer */}
                  <div className="flex items-center gap-2.5 pt-4">
                    <a
                      className="flex-1 px-3 py-2.5 bg-slate-800/90 hover:bg-slate-700 border border-slate-700 text-slate-200 hover:text-white text-xs font-bold transition-all text-center rounded-md"
                      href={`/heter-iska/preview?id=${item.id}`}
                    >
                      Preview document
                    </a>
                    <button
                      type="button"
                      className="flex-1 text-white px-3 py-2.5 bg-[#c69b46] hover:bg-[#b0883b] text-[#0B1C2C] text-xs font-bold transition-all shadow-md text-center cursor-pointer hover:shadow-lg rounded-md"
                      onClick={() => openCheckout(item)}
                    >
                      Continue — $25
                    </button>
                  </div>
                </motion.article>
              );
            })}
          </div>
        )}
      </section>
      {checkoutOpen && selected && (
        <motion.section
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className='container px-8'
        >
          <div
            id="purchase"
            ref={checkoutRef}
            className=" px-4 sm:px-8 my-10 p-6 sm:p-8 bg-[#f7f3ea] border border-[#e2dacd] space-y-6 shadow-md rounded-2xl"
            tabIndex={-1}
          >
            <div className="p-4 bg-white border border-[#ded7c9] rounded-xl flex items-center justify-between gap-4">
              <span className="text-xs font-bold text-[#c69b46] uppercase tracking-wider block">Selected document</span>
              <b className="text-lg font-serif font-bold text-[#102a43]">{selected.title}</b>
            </div>
            <AccessCodeForm
              key={`code-${selected.id}`}
              documentId={selected.id}
            />
            <div className="relative text-center my-4">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-[#e2dacd]"></div></div>
              <span className="relative px-4 bg-[#f7f3ea] text-[11px] font-bold text-[#64748b] tracking-wider uppercase">OR PAY SECURELY</span>
            </div>
            <CheckoutNotice
              key={selected.id}
              kind="heter-iska"
              amount="$25.00"
              documentId={selected.id}
            />
          </div>
        </motion.section>
      )}
    </>
  );
}

