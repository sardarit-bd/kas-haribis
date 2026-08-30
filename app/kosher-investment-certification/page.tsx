import { SiteFooter, SiteHeader } from '../shared/site-shell';
import CertificationForm from './certification-form';

const reviewItems = [
  [
    '01',
    'Ownership & parties',
    'Who is investing, borrowing, managing, guaranteeing, lending, and receiving funds.',
  ],
  [
    '02',
    'Economic structure',
    'How returns, interest, losses, fees, distributions, and repayment obligations operate.',
  ],
  [
    '03',
    'Agreements & disclosures',
    'Operating agreements, loan documents, notes, guarantees, disclosures, and investor materials.',
  ],
  [
    '04',
    'Heter Iska framework',
    'Whether an appropriate document is required and how it applies to the actual institution or transaction.',
  ],
  [
    '05',
    'Ongoing compliance',
    'Whether products, marketing, administration, amendments, or later activity could change the analysis.',
  ],
  [
    '06',
    'Required conditions',
    'Practical conditions, limitations, or corrections needed before written approval.',
  ],
];

export default function Page() {
  return (
    <main>
      <SiteHeader />
      <section className="certHero">
        <div>
          <p className="eyebrow">KASHRUS OF FINANCIAL SERVICES</p>
          <h1>Investment &amp; Lender Certification</h1>
          <p>
            A structured review of investments, banks, lending companies,
            agreements, and financial relationships for potential Ribbis
            concerns and practical Halachic compliance.
          </p>
          <div>
            <a className="primary" href="#apply-for-review">
              Apply for review
            </a>
            <a href="/bais-horaah">Ask a preliminary question →</a>
          </div>
        </div>
        <aside>
          <span>KH</span>
          <small>REVIEW FRAMEWORK</small>
          <b>Structure • Documents • Guidance</b>
        </aside>
      </section>
      <section className="certIntro">
        <div>
          <p className="eyebrow gold">A CAREFUL PROCESS</p>
          <h2>
            Understanding the financial structure before issuing guidance.
          </h2>
          <p>
            An investment, bank, or lending company may involve loans, interest,
            profit sharing, preferred returns, guarantees, fees, ownership
            interests, and multiple parties. A meaningful review must consider
            how these parts work together—not simply whether a document is
            titled “Heter Iska.”
          </p>
        </div>
        <aside>
          <strong>Important</strong>
          <p>
            Submitting an application does not itself create approval or
            certification. No investment or institution should be represented as
            reviewed, approved, or certified by Kav Haribis unless written
            confirmation has been issued.
          </p>
        </aside>
      </section>
      <section className="certifiedPartnerFeature">
        <div>
          <p className="eyebrow gold">CERTIFICATION IN PRACTICE</p>
          <h2>Certification for banks and lending companies</h2>
          <p>
            Kav Haribis reviews banks, mortgage companies, direct lenders, and
            other lending institutions. The review may address ownership,
            funding sources, loan products, agreements, servicing, and whether a
            Heter Iska is required for the institution or transaction.
          </p>
          <a className="primary" href="#apply-for-review">
            Request institutional certification →
          </a>
        </div>
        <figure>
          <img
            src="/kav-brand/rate-certified.png"
            alt="Rate home financing — Kav Haribis certified"
          />
          <figcaption>
            Example of a Kav Haribis-certified lending company.
          </figcaption>
        </figure>
      </section>
      <section className="certReview">
        <div className="certHeading">
          <p className="eyebrow gold">WHAT WE REVIEW</p>
          <h2>A practical Halachic assessment</h2>
        </div>
        <div>
          {reviewItems.map(([n, t, d]) => (
            <article key={n}>
              <span>{n}</span>
              <h3>{t}</h3>
              <p>{d}</p>
            </article>
          ))}
        </div>
      </section>
      <section className="certProcess">
        <div>
          <p className="eyebrow">HOW IT WORKS</p>
          <h2>From application to written determination</h2>
        </div>
        <ol>
          <li>
            <b>1</b>
            <span>
              <strong>Submit the structure</strong>Describe the institution or
              opportunity and provide the principal documents.
            </span>
          </li>
          <li>
            <b>2</b>
            <span>
              <strong>Initial review</strong>Kav Haribis determines whether
              additional information or clarification is required.
            </span>
          </li>
          <li>
            <b>3</b>
            <span>
              <strong>Halachic analysis</strong>The structure and relevant
              agreements are reviewed for Ribbis concerns.
            </span>
          </li>
          <li>
            <b>4</b>
            <span>
              <strong>Written outcome</strong>You receive an approval,
              conditional approval, request for changes, or other determination.
            </span>
          </li>
        </ol>
      </section>
      <section className="certApplication" id="apply-for-review">
        <div className="certApplicationCopy">
          <p className="eyebrow">APPLICATION</p>
          <h2>Request a certification review</h2>
          <p>
            Investment sponsors, banks, mortgage companies, direct lenders, and
            other lending companies may submit their structure for an initial
            assessment. Supporting documents are stored privately and can be
            opened only by the authorized Kav Haribis administrator.
          </p>
          <ul>
            <li>Investment, bank, or lending-company information</li>
            <li>Ownership and funding sources</li>
            <li>Economic and legal structure</li>
            <li>Current Heter Iska status</li>
            <li>Supporting document upload</li>
            <li>Reference number after submission</li>
          </ul>
        </div>
        <CertificationForm />
      </section>
      <section className="certDisclaimer">
        <div>
          <p className="eyebrow gold">SCOPE &amp; LIMITATIONS</p>
          <h2>Certification is specific to the reviewed structure.</h2>
        </div>
        <p>
          A review addresses the documents and facts supplied at that time. It
          is not financial, tax, legal, or investment advice; it is not a
          recommendation of investment quality; and it is not a guarantee
          against loss. Material changes may require a new review. Personal
          circumstances may also require individual guidance from a qualified
          Rav.
        </p>
      </section>
      <SiteFooter />
    </main>
  );
}
