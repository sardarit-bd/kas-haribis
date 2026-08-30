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
      <section className="documentCatalog" id="document-library">
        <div className="sectionHead">
          <div>
            <p className="eyebrow gold">AVAILABLE DOCUMENTS</p>
            <h2>Choose a Heter Iska</h2>
          </div>
          <p>
            Compare the available forms below. Previewing is free; payment is
            required only for the protected PDF download.
          </p>
        </div>
        {documents === null ? (
          <p className="catalogLoading">Loading documents…</p>
        ) : documents.length === 0 ? (
          <div className="emptyState">
            <b>Documents are being prepared</b>
            <p>The administrator has not uploaded a Heter Iska PDF yet.</p>
          </div>
        ) : (
          <div className="heterGrid">
            {documents.map((item, index) => (
              <article
                className={
                  checkoutOpen && selected?.id === item.id ? 'selected' : ''
                }
                key={item.id}
              >
                <div className="heterCardTop">
                  <span className="heterNumber">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <span className="heterAvailability">Available</span>
                </div>
                <div className="heterCardBody">
                  <div className="miniDocument">
                    <span>בס״ד</span>
                    <b>היתר עיסקא</b>
                    <small>KAV HARIBIS</small>
                  </div>
                  <div className="heterCardCopy">
                    <h2>{item.title}</h2>
                    <p>
                      {item.description ||
                        'Review this Heter Iska before purchasing a protected copy.'}
                    </p>
                  </div>
                </div>
                <div className="docActions">
                  <a
                    className="viewAction"
                    href={`/heter-iska/preview?id=${item.id}`}
                  >
                    Preview document
                  </a>
                  <button type="button" onClick={() => openCheckout(item)}>
                    Continue to payment — $25
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
          className="heterPurchase"
          tabIndex={-1}
        >
          <div className="selectedDocument">
            <span>Selected document</span>
            <b>{selected.title}</b>
          </div>
          <AccessCodeForm
            key={`code-${selected.id}`}
            documentId={selected.id}
          />
          <div className="heterPaymentDivider">
            <span>OR PAY SECURELY</span>
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
