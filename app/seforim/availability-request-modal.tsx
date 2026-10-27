'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { FormEvent, useEffect, useRef, useState } from 'react';
import type { Sefer } from './seforim-catalog';

export default function AvailabilityRequestModal({
  book,
  onClose,
}: {
  book: Sefer | null;
  onClose: () => void;
}) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [hp, setHp] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [reference, setReference] = useState('');
  const nameInputRef = useRef<HTMLInputElement>(null);

  // Focus name input when modal opens
  useEffect(() => {
    if (book && !reference) {
      setTimeout(() => nameInputRef.current?.focus(), 100);
    }
  }, [book, reference]);

  // Handle ESC key to close modal
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape' && !busy) {
        handleDismiss();
      }
    }
    if (book) {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [book, busy]);

  function handleDismiss() {
    if (busy) return;
    setError('');
    setReference('');
    setName('');
    setEmail('');
    setPhone('');
    setMessage('');
    setHp('');
    onClose();
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (busy || !book) return;

    const trimmedName = name.trim();
    const trimmedEmail = email.trim();

    if (!trimmedName) {
      setError('Please enter your full name.');
      return;
    }

    if (!trimmedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setError('Please enter a valid email address.');
      return;
    }

    setBusy(true);
    setError('');

    try {
      const fd = new FormData();
      fd.append('name', trimmedName);
      fd.append('email', trimmedEmail);
      if (phone.trim()) fd.append('phone', phone.trim());
      fd.append('topic', 'Book Availability Request');
      fd.append('related_name', book.title);
      fd.append('related_url', `/seforim#${encodeURIComponent(book.id)}`);
      if (message.trim()) {
        fd.append('message', message.trim());
      } else {
        fd.append(
          'message',
          `Availability request submitted for "${book.title}".`,
        );
      }
      if (hp) {
        fd.append('website_hp', hp);
      }

      const res = await fetch('/api/contact-submissions', {
        method: 'POST',
        body: fd,
      });

      const data = (await res.json()) as {
        reference?: string;
        error?: string;
      };

      if (!res.ok) {
        throw new Error(
          data.error || 'Failed to submit availability request. Please try again.',
        );
      }

      setReference(data.reference || 'SUBMITTED');
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'An unexpected error occurred. Please try again.',
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <AnimatePresence>
      {book && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm p-4 sm:p-6 flex items-center justify-center overflow-y-auto"
          role="dialog"
          aria-modal="true"
          aria-labelledby="availability-modal-title"
          onClick={handleDismiss}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-6 sm:p-8 relative shadow-xl my-auto text-slate-800"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 text-xl font-bold flex items-center justify-center transition cursor-pointer"
              onClick={handleDismiss}
              aria-label="Close dialog"
              disabled={busy}
            >
              ×
            </button>

            {reference ? (
              <div className="text-center py-4 space-y-4">
                <span className="w-14 h-14 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto text-2xl font-bold">
                  ✓
                </span>
                <p className="text-[10px] font-bold tracking-widest text-[#a37828] uppercase block">
                  REQUEST RECEIVED
                </p>
                <h3
                  id="availability-modal-title"
                  className="text-2xl font-serif font-bold text-[#102a43]"
                >
                  Availability Request Submitted
                </h3>
                <p className="text-slate-600 text-sm">
                  We have received your availability request for{' '}
                  <strong className="text-slate-800" dir="auto">
                    {book.title}
                  </strong>
                  .
                </p>
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 my-3 text-center">
                  <span className="text-xs uppercase text-slate-500 font-semibold block mb-1">
                    Your Reference Number
                  </span>
                  <span className="font-mono text-xl font-bold text-[#102a43]">
                    {reference}
                  </span>
                </div>
                <p className="text-slate-500 text-xs leading-relaxed">
                  Our team will review stock and get back to you at{' '}
                  <strong>{email}</strong> as soon as possible.
                </p>
                <button
                  type="button"
                  className="mt-4 px-6 py-2.5 bg-[#102a43] hover:bg-[#0d2238] text-white font-bold text-xs uppercase tracking-wider rounded-xl transition cursor-pointer shadow-sm"
                  onClick={handleDismiss}
                >
                  Done
                </button>
              </div>
            ) : (
              <div>
                <p className="text-[10px] font-bold tracking-widest text-[#a37828] uppercase mb-1">
                  SEFER AVAILABILITY
                </p>
                <h3
                  id="availability-modal-title"
                  className="text-2xl font-serif font-bold text-[#102a43] mb-3 leading-snug"
                >
                  Submit Request to See Availability
                </h3>

                {/* Selected Book Banner */}
                <div
                  className="flex items-center gap-4 bg-slate-50 border border-slate-200/80 rounded-xl p-3.5 mb-5"
                  dir="auto"
                >
                  {book.image && (
                    <img
                      src={book.image}
                      alt={book.title}
                      className="w-12 h-16 object-contain rounded bg-white p-1 border border-slate-200 shrink-0"
                    />
                  )}
                  <div className="min-w-0 flex-1">
                    <span className="text-[11px] font-bold text-[#a37828] uppercase tracking-wider block">
                      Selected Title
                    </span>
                    <h4 className="font-serif font-bold text-slate-900 text-base truncate">
                      {book.title}
                    </h4>
                    <span className="text-xs text-slate-500 font-medium">
                      Physical Book • Price on request
                    </span>
                  </div>
                </div>

                {error && (
                  <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl p-3.5 mb-4 leading-relaxed">
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Honeypot field (hidden from real users) */}
                  <div
                    style={{
                      position: 'absolute',
                      left: '-9999px',
                      opacity: 0,
                      height: 0,
                      width: 0,
                      overflow: 'hidden',
                    }}
                    aria-hidden="true"
                    tabIndex={-1}
                  >
                    <label htmlFor="availability-website-hp">
                      Leave this empty
                    </label>
                    <input
                      id="availability-website-hp"
                      type="text"
                      name="website_hp"
                      value={hp}
                      onChange={(e) => setHp(e.target.value)}
                      autoComplete="off"
                      tabIndex={-1}
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="availability-name"
                      className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1"
                    >
                      Your Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      id="availability-name"
                      ref={nameInputRef}
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Rabbi / Mr. / Mrs. Full Name"
                      className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl bg-white text-slate-900 text-sm focus:outline-none focus:border-[#c69b46] focus:ring-2 focus:ring-[#c69b46]/20 transition"
                      disabled={busy}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label
                        htmlFor="availability-email"
                        className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1"
                      >
                        Email Address <span className="text-rose-500">*</span>
                      </label>
                      <input
                        id="availability-email"
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="name@example.com"
                        className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl bg-white text-slate-900 text-sm focus:outline-none focus:border-[#c69b46] focus:ring-2 focus:ring-[#c69b46]/20 transition"
                        disabled={busy}
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="availability-phone"
                        className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1"
                      >
                        Phone Number <span className="text-slate-400 font-normal">(optional)</span>
                      </label>
                      <input
                        id="availability-phone"
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="(718) 555-0123"
                        className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl bg-white text-slate-900 text-sm focus:outline-none focus:border-[#c69b46] focus:ring-2 focus:ring-[#c69b46]/20 transition"
                        disabled={busy}
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="availability-message"
                      className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1"
                    >
                      Message / Quantity <span className="text-slate-400 font-normal">(optional)</span>
                    </label>
                    <textarea
                      id="availability-message"
                      rows={3}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="e.g., Number of copies desired, preferred shipping location, or specific questions…"
                      className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl bg-white text-slate-900 text-sm focus:outline-none focus:border-[#c69b46] focus:ring-2 focus:ring-[#c69b46]/20 transition"
                      disabled={busy}
                    />
                  </div>

                  <div className="pt-2 flex flex-col sm:flex-row gap-3">
                    <button
                      type="submit"
                      disabled={busy}
                      className="flex-1 py-3 px-4 bg-[#102a43] hover:bg-[#0d2238] text-white font-bold text-xs uppercase tracking-wider rounded-xl transition cursor-pointer shadow-sm hover:scale-[1.01] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {busy ? 'Sending Request…' : 'Submit Request'}
                    </button>
                    <button
                      type="button"
                      disabled={busy}
                      onClick={handleDismiss}
                      className="py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs uppercase tracking-wider rounded-xl transition cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
