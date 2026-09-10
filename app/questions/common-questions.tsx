'use client';
import { useMemo, useState } from 'react';

const categories = [
  'All questions',
  'Heter Iska',
  'Loans',
  'Business',
  'Everyday situations',
];

const questions = [
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
  {
    category: 'Business',
    question: 'Does every bank or lender need the same Heter Iska?',
    answer:
      'No. Ownership, funding sources, loan products, servicing arrangements, and contract language vary. A document that works for one institution may not properly address another institution’s structure.',
  },
  {
    category: 'Heter Iska',
    question: 'Can I download a standard Heter Iska and use it myself?',
    answer:
      'A standard template can be useful, but it may not fit every transaction. Review the document carefully and consult a qualified Rav when ownership, business entities, guarantees, or unusual payment terms are involved.',
  },
];

export default function CommonQuestions() {
  const [category, setCategory] = useState('All questions');
  const [open, setOpen] = useState(0);

  const visible = useMemo(
    () =>
      questions.filter(
        (item) => category === 'All questions' || item.category === category,
      ),
    [category],
  );

  return (
    <section className="w-full my-6 text-center">
      <div className="max-w-2xl mx-auto mb-8 space-y-3">
        <h2 className="text-3xl sm:text-4xl font-serif font-bold text-[#102a43]">
          Practical questions, clearly organized.
        </h2>
        <p className="text-slate-600 text-base leading-relaxed">
          Begin with a common topic, then contact the Bais Horaah when your
          situation requires an individual review.
        </p>
      </div>

      <div
        className="flex flex-wrap justify-center gap-2 mb-8"
        aria-label="Question categories"
      >
        {categories.map((item) => (
          <button
            className={`px-4 py-2 rounded-full text-xs font-semibold tracking-wide transition cursor-pointer ${
              category === item
                ? 'bg-[#c69b46] text-white shadow-sm'
                : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-50'
            }`}
            onClick={() => setCategory(item)}
            key={item}
          >
            {item}
          </button>
        ))}
      </div>

      <div className="max-w-3xl mx-auto flex flex-col gap-4">
        {visible.map((item) => {
          const active = open === questions.indexOf(item);
          return (
            <article
              className={`border transition duration-200 overflow-hidden shadow-sm text-center ${
                active
                  ? 'bg-white border-2 border-[#c69b46]'
                  : 'bg-white border border-gray-100 hover:border-slate-300'
              }`}
              key={item.question}
            >
              <button
                className="w-full p-5 text-center flex flex-col items-center justify-center gap-1.5 cursor-pointer"
                onClick={() =>
                  setOpen(active ? -1 : questions.indexOf(item))
                }
                aria-expanded={active}
              >
                <small className="text-[#a37828] text-xs font-semibold tracking-wider uppercase">
                  {item.category}
                </small>
                <strong className="text-lg font-serif text-[#102a43] font-bold">
                  {item.question}
                </strong>
              </button>
              {active && (
                <div className="px-6 pb-6 pt-3 border-t border-slate-100 text-center">
                  <p className="text-slate-600 text-sm leading-relaxed mb-4 max-w-xl mx-auto">
                    {item.answer}
                  </p>
                  <a
                    className="inline-flex items-center gap-1 text-[#a37828] hover:text-[#102a43] text-xs font-bold transition"
                    href="/bais-horaah"
                  >
                    Ask about your situation →
                  </a>
                </div>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
}
