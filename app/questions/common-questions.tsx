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
  const [category, setCategory] = useState('All questions'),
    [query, setQuery] = useState(''),
    [open, setOpen] = useState(0);
  const visible = useMemo(
    () =>
      questions.filter(
        (item) =>
          (category === 'All questions' || item.category === category) &&
          (item.question + item.answer)
            .toLowerCase()
            .includes(query.toLowerCase()),
      ),
    [category, query],
  );
  return (
    <>
      <section className="w-full my-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8">
          <div>
            <p className="text-[#a37828] text-xs font-bold tracking-widest uppercase mb-2">EXPLORE THE TOPICS</p>
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-[#102a43]">Practical questions, clearly organized.</h2>
            <p className="text-slate-600 text-base max-w-xl mt-2">
              Begin with a common topic, then contact the Bais Horaah when your
              situation requires an individual review.
            </p>
          </div>
          <label className="w-full md:w-80 flex flex-col gap-1.5">
            <span className="text-xs font-bold text-[#102a43] uppercase tracking-wider">Search questions</span>
            <input
              className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-slate-800 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-[#102a43]/15 focus:border-[#102a43] shadow-sm transition-all"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Try: late fees, private loan…"
            />
          </label>
        </div>

        <div className="flex flex-wrap gap-2 mb-8" aria-label="Question categories">
          {categories.map((item) => (
            <button
              className={`px-4 py-2 rounded-full text-xs font-semibold tracking-wide transition cursor-pointer ${category === item ? 'bg-[#c69b46] text-white shadow-sm' : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-50'}`}
              onClick={() => setCategory(item)}
              key={item}
            >
              {item}
            </button>
          ))}
        </div>

        <div className="grid md:grid-cols-12 gap-8 items-start">
          <aside className="md:col-span-4 bg-white border border-slate-200/90 p-6 rounded-2xl shadow-sm">
            <span className="text-3xl font-serif text-[#a37828] block mb-2">?</span>
            <small className="text-[#a37828] text-xs font-bold tracking-widest uppercase block mb-1">QUICK GUIDANCE</small>
            <h3 className="text-xl font-serif font-bold text-[#102a43] mb-2">Every detail can matter.</h3>
            <p className="text-slate-600 text-sm leading-relaxed mb-6">
              Ownership, timing, documents, and the actual flow of money may
              change the halachic analysis.
            </p>
            <a className="inline-flex items-center gap-1.5 text-[#a37828] hover:text-[#102a43] font-bold text-sm transition" href="/bais-horaah">Submit your question →</a>
          </aside>

          <div className="md:col-span-8 flex flex-col gap-3.5">
            {visible.map((item, index) => {
              const active = open === questions.indexOf(item);
              return (
                <article className={`border rounded-2xl transition duration-200 overflow-hidden shadow-sm ${active ? 'bg-white border-2 border-[#c69b46]' : 'bg-white border-slate-200/90 hover:border-slate-300'}`} key={item.question}>
                  <button
                    className="w-full p-5 text-left flex items-center justify-between gap-4 cursor-pointer"
                    onClick={() =>
                      setOpen(active ? -1 : questions.indexOf(item))
                    }
                    aria-expanded={active}
                  >
                    <span className="flex flex-col items-start gap-1">
                      <small className="text-[#a37828] text-xs font-bold tracking-wider uppercase">{item.category}</small>
                      <strong className="text-lg font-serif text-[#102a43] font-bold">{item.question}</strong>
                    </span>
                    <i className="not-italic text-xl text-[#a37828] font-bold shrink-0">{active ? '−' : '+'}</i>
                  </button>
                  {active && (
                    <div className="px-5 pb-5 pt-1 border-t border-slate-100">
                      <p className="text-slate-600 text-sm leading-relaxed mb-4">{item.answer}</p>
                      <a className="inline-flex items-center gap-1 text-[#a37828] hover:text-[#102a43] text-xs font-bold transition" href="/bais-horaah">Ask about your situation →</a>
                    </div>
                  )}
                </article>
              );
            })}
            {visible.length === 0 && (
              <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center shadow-sm">
                <b className="text-lg font-serif text-[#102a43] block mb-2">No matching question</b>
                <p className="text-slate-500 text-sm max-w-md mx-auto mb-4">
                  Try searching for another topic or submit your question directly to the Bais Horaah.
                </p>
                <a className="inline-block px-5 py-2.5 rounded-xl bg-[#102a43] text-white font-bold text-xs" href="/bais-horaah">
                  Ask Bais Horaah →
                </a>
              </div>
            )}
          </div>
        </div>
      </section>
      <section className="bg-white border border-slate-200/90 p-8 sm:p-10 rounded-2xl my-12 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-sm">
        <div>
          <p className="text-[#a37828] text-xs font-bold tracking-widest uppercase mb-2">NEED PERSONAL GUIDANCE?</p>
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#102a43] mb-2">Your question may depend on details not shown here.</h2>
          <p className="text-slate-600 text-sm max-w-2xl">
            Send the Bais Horaah the parties, amounts, timing, documents, and
            complete background for review.
          </p>
        </div>
        <a className="inline-flex items-center px-6 py-3 rounded-xl bg-[#102a43] hover:bg-[#102a43]/90 text-white font-bold text-sm tracking-wide transition shrink-0 shadow-sm" style={{ color: 'white' }} href="/bais-horaah">
          Ask the Bais Horaah →
        </a>
      </section>
    </>
  );
}

