'use client';
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
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6 mb-10 pb-6 border-b border-[#e2e8f0] hidden">
          <div className="space-y-2">
            <p className="text-[#c69b46] font-bold text-xs tracking-widest uppercase">AVAILABLE DOCUMENTS</p>
            <h2 className="text-[#102a43] font-serif font-bold text-3xl sm:text-4xl">Choose a Heter Iska</h2>
          </div>
          <p className="max-w-md text-xs sm:text-sm text-[#64748b] leading-relaxed">
            Compare the available forms below. Previewing is free; payment is
            required only for the protected PDF download.
          </p>
        </div>
        {documents === null ? (
          <p className="text-center py-12 text-sm text-[#64748b]">Loading documents…</p>
        ) : documents.length === 0 ? (
          <div className="p-12 text-center bg-white border border-dashed border-[#cbd5e1] max-w-md mx-auto space-y-2">
            <b className="text-lg font-serif font-bold text-[#102a43] block">Documents are being prepared</b>
            <p className="text-sm text-[#64748b]">The administrator has not uploaded a Heter Iska PDF yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {documents.map((item, index) => {
              const isSelected = checkoutOpen && selected?.id === item.id;
              return (
                <article
                  key={item.id}
                  className={`p-6 bg-[#172036] text-white border flex flex-col justify-between space-y-6 shadow-xl transition-all duration-300 relative overflow-hidden ${
                    isSelected
                      ? 'border-[#c69b46] ring-2 ring-[#c69b46] bg-[#0F2538]'
                      : 'border-slate-800'
                  }`}
                >
                  <div className="space-y-5">
              
                    {/* Document Icon / Emblem */}
                    <div className="flex flex-col items-center pt-2">
                      <div className="relative w-32 h-32 mb-5 bg-gradient-to-b from-slate-800/90 to-slate-900 border border-slate-700/80 rounded-xl p-2.5 flex flex-col justify-between items-center shrink-0 shadow-lg group-hover:border-[#c69b46]/80 transition-colors">
                        <img src={'/agreement (1).webp'} alt='icon'/>
                      </div>

                      {/* Title & Description */}
                      <h2 className="text-xl font-serif font-bold text-white text-center leading-snug group-hover:text-[#c69b46] transition-colors">
                        {item.title}
                      </h2>
                      <p className="text-sm text-slate-300 text-center leading-relaxed line-clamp-3 mt-2">
                        {item.description ||
                          'Review this Heter Iska before purchasing a protected copy.'}
                      </p>
                    </div>
                  </div>

                  {/* Actions Footer */}
                  <div className="flex items-center gap-2.5 pt-4 border-t border-slate-800/80">
                    <a
                      className="flex-1 px-3 py-2.5 bg-slate-800/90 hover:bg-slate-700 border border-slate-700 text-slate-200 hover:text-white text-xs font-bold transition-all text-center"
                      href={`/heter-iska/preview?id=${item.id}`}
                    >
                      Preview document
                    </a>
                    <button
                      type="button"
                      className="flex-1 text-white px-3 py-2.5 bg-[#c69b46] hover:bg-[#b0883b] text-[#0B1C2C] text-xs font-bold transition-all shadow-md text-center cursor-pointer hover:shadow-lg"
                      onClick={() => openCheckout(item)}
                    >
                      Continue — $25
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
      {checkoutOpen && selected && (
        <div
          id="purchase"
          ref={checkoutRef}
          className="container max-w-4xl mx-auto px-4 sm:px-8 my-10 p-6 sm:p-8 bg-[#f7f3ea] border border-[#e2dacd] rounded-2xl space-y-6 shadow-md"
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
      )}
    </>
  );
}
