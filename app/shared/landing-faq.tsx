'use client';

import { useState } from 'react';

const landingFaqs = [
  {
    category: 'Heter Iska',
    question: 'When is a Heter Iska needed?',
    answer:
      'A Heter Iska may be needed when a financial arrangement could create a prohibited lender-borrower relationship involving Ribbis. Whether a standard form is sufficient depends on the parties, ownership, transaction, and way the agreement is actually used.',
  },
  {
    category: 'Loans',
    question: 'Do late fees create a Ribbis concern?',
    answer:
      'A charge that increases because payment is delayed can raise a serious Ribbis concern. The exact wording, purpose of the charge, and relationship between the parties must be reviewed before relying on it.',
  },
  {
    category: 'Business',
    question: 'What should business partners review?',
    answer:
      'Partners should clarify how capital, profits, losses, guaranteed returns, management payments, and withdrawals are structured. The documents and actual business practice must agree with one another.',
  },
  {
    category: 'Loans',
    question: 'How should a private loan be structured?',
    answer:
      'A private loan should clearly state the principal, repayment schedule, security, fees, and any other benefit received by the lender. If a Heter Iska is required, it must be appropriate for the specific arrangement and signed correctly.',
  },
  {
    category: 'Everyday situations',
    question: 'May a borrower give the lender a gift?',
    answer:
      'A gift given because of a loan can be problematic even when it was not written into the agreement. Timing, normal practice, the relationship between the parties, and the reason for the gift all matter.',
  },
  {
    category: 'Everyday situations',
    question: 'Can a store charge more for a payment plan?',
    answer:
      'Different cash and credit prices can involve detailed halachos. The prices, timing, and customer’s commitment must be presented correctly before the sale is completed.',
  },
];

export default function LandingFaq() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section className="py-16 bg-[#ffffff] border-t border-[#e2e8f0]">
      <div className="max-w-4xl mx-auto px-4">
        {/* Centered Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <p className="eyebrow gold mb-1.5">COMMON QUESTIONS &amp; HALACHA</p>
          <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-[#102a43] mb-3">
            Frequently Asked Questions About Hilchos Ribbis
          </h2>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
            Practical introductions to common questions. These answers are educational and do not replace a personal psak from the Bais Horaah.
          </p>
        </div>

        {/* FAQ Accordion List */}
        <div className="space-y-3.5">
          {landingFaqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={faq.question}
                className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                  isOpen
                    ? 'border-[#c69b46] bg-[#fcfaf6] shadow-md'
                    : 'border-slate-200/90 bg-white hover:border-slate-300'
                }`}
              >
                <button
                  type="button"
                  onClick={() => toggle(idx)}
                  className="w-full text-left px-5 py-4 sm:px-6 sm:py-5 flex items-center justify-between gap-4 cursor-pointer"
                  aria-expanded={isOpen}
                >
                  <div className="space-y-1">
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#946e28] block">
                      {faq.category}
                    </span>
                    <h3 className="font-serif text-base sm:text-lg font-bold text-[#102a43] leading-snug">
                      {faq.question}
                    </h3>
                  </div>
                  <span
                    className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shrink-0 transition-transform duration-200 ${
                      isOpen
                        ? 'bg-[#102a43] text-white rotate-180'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {isOpen ? '−' : '+'}
                  </span>
                </button>

                {isOpen && (
                  <div className="px-5 pb-5 sm:px-6 sm:pb-6 text-sm text-slate-600 leading-relaxed border-t border-[#eee7d8] pt-4 space-y-3">
                    <p>{faq.answer}</p>
                    <div className="pt-1 flex items-center gap-4 text-xs font-bold">
                      <a
                        href="/bais-horaah"
                        className="text-[#c69b46] hover:text-[#946e28] underline underline-offset-3"
                      >
                        Ask Bais Horaah about your situation →
                      </a>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* View All Questions Button */}
        <div className="mt-10 text-center">
          <a
            href="/questions"
            style={{ color: 'white' }}
            className="inline-flex items-center gap-2 bg-[#102a43] hover:bg-[#173f5f] text-white font-bold py-3.5 px-8 rounded-xl text-sm transition shadow-md border border-[#c69b46]/30"
          >
            <span>View All Common Questions</span>
            <span className="text-base font-bold">→</span>
          </a>
        </div>
      </div>
    </section>
  );
}
