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
            {documents.map((item, index) => (
              <article
                className={`p-6 bg-white border border-gray-100 flex flex-col justify-between space-y-5 ${
                  checkoutOpen && selected?.id === item.id ? 'ring-2 ring-[#102a43] border-[#102a43]' : ''
                }`}
                key={item.id}
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-3">
                    <span className="font-mono text-md font-bold text-[#94a3b8]">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <span className="px-2.5 py-0.5 bg-[#e9f4eb] text-[#367448] rounded-full text-[11px] font-bold">Available</span>
                  </div>
                  <div className="flex gap-4 items-start">
                    <div className="w-16 h-20 bg-[#071728] text-white p-2 flex flex-col justify-between items-center shrink-0 shadow-inner">
                      <span className="text-[10px] text-[#c69b46]">בס״ד</span>
                      <b className="font-serif text-xs font-bold text-center leading-tight">היתר עיסקא</b>
                      <small className="text-[7px] text-[#cbd5e1] font-mono">KAV</small>
                    </div>
                    <div className="space-y-1 flex-1 min-w-0">
                      <h2 className="text-lg font-serif font-bold text-[#102a43] leading-snug">{item.title}</h2>
                      <p className="text-md pt-3 text-[#475569] leading-relaxed line-clamp-3">
                        {item.description ||
                          'Review this Heter Iska before purchasing a protected copy.'}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 pt-4 text-md font-meduim">
                  <a
                    className="px-3.5 py-2 bg-white border border-gray-200 text-[#102a43] text-center"
                    href={`/heter-iska/preview?id=${item.id}`}
                  >
                    Preview document
                  </a>
                  <button
                    type="button"
                    className="flex-1 px-3.5 py-2 bg-[#102a43] text-white text-center cursor-pointer"
                    onClick={() => openCheckout(item)}
                  >
                    Continue — $25
                  </button>
                </div>
              </article>
            ))}
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
