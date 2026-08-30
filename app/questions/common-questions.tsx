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
      <section className="questionExplorer">
        <div className="questionExplorerHead">
          <div>
            <p className="eyebrow gold">EXPLORE THE TOPICS</p>
            <h2>Practical questions, clearly organized.</h2>
            <p>
              Begin with a common topic, then contact the Bais Horaah when your
              situation requires an individual review.
            </p>
          </div>
          <label>
            <span>Search questions</span>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Try: late fees, private loan…"
            />
          </label>
        </div>
        <div className="questionCategories" aria-label="Question categories">
          {categories.map((item) => (
            <button
              className={category === item ? 'active' : ''}
              onClick={() => setCategory(item)}
              key={item}
            >
              {item}
            </button>
          ))}
        </div>
        <div className="questionExperience">
          <aside>
            <span>?</span>
            <small>QUICK GUIDANCE</small>
            <h3>Every detail can matter.</h3>
            <p>
              Ownership, timing, documents, and the actual flow of money may
              change the halachic analysis.
            </p>
            <a href="/bais-horaah">Submit your question →</a>
          </aside>
          <div className="questionAccordion">
            {visible.map((item, index) => {
              const active = open === questions.indexOf(item);
              return (
                <article className={active ? 'open' : ''} key={item.question}>
                  <button
                    onClick={() =>
                      setOpen(active ? -1 : questions.indexOf(item))
                    }
                    aria-expanded={active}
                  >
                    <span>
                      <small>{item.category}</small>
                      <strong>{item.question}</strong>
                    </span>
                    <i>{active ? '−' : '+'}</i>
                  </button>
                  {active && (
                    <div>
                      <p>{item.answer}</p>
                      <a href="/bais-horaah">Ask about your situation →</a>
                    </div>
                  )}
                </article>
              );
            })}
            {visible.length === 0 && (
              <div className="questionNoResults">
                <b>No matching question</b>
                <p>Try a different search or submit your question directly.</p>
              </div>
            )}
          </div>
        </div>
      </section>
      <section className="questionCta">
        <div>
          <p className="eyebrow">NEED PERSONAL GUIDANCE?</p>
          <h2>Your question may depend on details not shown here.</h2>
          <p>
            Send the Bais Horaah the parties, amounts, timing, documents, and
            complete background for review.
          </p>
        </div>
        <a className="primary" href="/bais-horaah">
          Ask the Bais Horaah →
        </a>
      </section>
    </>
  );
}
