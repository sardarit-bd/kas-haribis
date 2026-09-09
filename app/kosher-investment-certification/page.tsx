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
    <main className="min-h-screen bg-[#fbfaf7]">
      <SiteHeader />
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#071728] via-[#102a43] to-[#0e304b] text-white border-b-2 border-[#c69b46]">
        <div className="container max-w-[1440px] mx-auto px-4 sm:px-8 py-16 md:py-24 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center relative z-10">
          <div className="lg:col-span-7 space-y-6">
            <p className="text-[#c69b46] font-bold text-xs tracking-widest uppercase">KASHRUS OF FINANCIAL SERVICES</p>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-white leading-tight">
              Investment &amp; Lender Certification
            </h1>
            <p className="text-[#cbd5e1] text-base sm:text-lg leading-relaxed max-w-xl">
              A structured review of investments, banks, lending companies,
              agreements, and financial relationships for potential Ribbis
              concerns and practical Halachic compliance.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 pt-2">
              <a className="px-6 py-3.5 bg-[#c69b46] hover:bg-[#b0883b] text-[#102a43] text-xs font-bold uppercase tracking-wider rounded-xl transition-colors shadow-md text-center" href="#apply-for-review">
                Apply for review
              </a>
              <a className="px-6 py-3.5 bg-white/10 border border-white/20 hover:bg-white/20 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-colors text-center" href="/bais-horaah">
                Ask a preliminary question →
              </a>
            </div>
          </div>
          <aside className="lg:col-span-5 p-6 sm:p-8 border border-[#c69b46]/50 rounded-2xl bg-[#071728]/85 backdrop-blur-md shadow-2xl space-y-3 text-center">
            <span className="w-14 h-14 rounded-full bg-[#c69b46] text-[#071728] font-mono font-bold text-xl flex items-center justify-center mx-auto">KH</span>
            <small className="text-[#c69b46] font-mono font-bold text-[10px] tracking-widest uppercase block">REVIEW FRAMEWORK</small>
            <b className="text-white text-base font-serif font-bold block">Structure • Documents • Guidance</b>
          </aside>
        </div>
      </section>

      {/* Intro */}
      <section className="container max-w-[1440px] mx-auto px-4 sm:px-8 my-12 p-6 sm:p-10 bg-[#f7f3ea] rounded-2xl border border-[#e2dacd] grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        <div className="lg:col-span-8 space-y-3">
          <p className="text-[#c69b46] font-bold text-xs tracking-widest uppercase">A CAREFUL PROCESS</p>
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#102a43]">
            Understanding the financial structure before issuing guidance.
          </h2>
          <p className="text-sm text-[#475569] leading-relaxed">
            An investment, bank, or lending company may involve loans, interest,
            profit sharing, preferred returns, guarantees, fees, ownership
            interests, and multiple parties. A meaningful review must consider
            how these parts work together—not simply whether a document is
            titled “Heter Iska.”
          </p>
        </div>
        <aside className="lg:col-span-4 p-5 bg-white border border-[#ded7c9] rounded-xl shadow-sm space-y-1">
          <strong className="text-xs font-bold text-[#102a43] uppercase tracking-wider block">Important</strong>
          <p className="text-xs text-[#64748b] leading-relaxed">
            Submitting an application does not itself create approval or
            certification. No investment or institution should be represented as
            reviewed, approved, or certified by Kav Haribis unless written
            confirmation has been issued.
          </p>
        </aside>
      </section>

      {/* Certified Partner Feature */}
      <section className="container max-w-[1440px] mx-auto px-4 sm:px-8 my-12 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
        <div className="lg:col-span-7 space-y-4">
          <p className="text-[#c69b46] font-bold text-xs tracking-widest uppercase">CERTIFICATION IN PRACTICE</p>
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#102a43]">Certification for banks and lending companies</h2>
          <p className="text-sm text-[#475569] leading-relaxed">
            Kav Haribis reviews banks, mortgage companies, direct lenders, and
            other lending institutions. The review may address ownership,
            funding sources, loan products, agreements, servicing, and whether a
            Heter Iska is required for the institution or transaction.
          </p>
          <a className="inline-block px-5 py-3 bg-[#102a43] hover:bg-[#1a385c] text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-colors shadow-sm" href="#apply-for-review">
            Request institutional certification →
          </a>
        </div>
        <figure className="lg:col-span-5 p-6 bg-white border border-[#e2e8f0] rounded-2xl shadow-md space-y-3 text-center">
          <img
            src="/kav-brand/rate-certified.png"
            alt="Rate home financing — Kav Haribis certified"
            className="max-h-48 mx-auto object-contain"
          />
          <figcaption className="text-xs text-[#64748b]">
            Example of a Kav Haribis-certified lending company.
          </figcaption>
        </figure>
      </section>

      {/* Review Items Grid */}
      <section className="container max-w-[1440px] mx-auto px-4 sm:px-8 my-12 space-y-8">
        <div className="border-b border-[#e2e8f0] pb-6">
          <p className="text-[#c69b46] font-bold text-xs tracking-widest uppercase mb-1">WHAT WE REVIEW</p>
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#102a43]">A practical Halachic assessment</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {reviewItems.map(([n, t, d]) => (
            <article key={n} className="p-6 bg-white border border-[#e2e8f0] rounded-2xl shadow-sm space-y-2">
              <span className="font-mono text-xs font-bold text-[#c69b46]">{n}</span>
              <h3 className="text-lg font-serif font-bold text-[#102a43]">{t}</h3>
              <p className="text-xs text-[#64748b] leading-relaxed">{d}</p>
            </article>
          ))}
        </div>
      </section>

      {/* Process Section */}
      <section className="container max-w-[1440px] mx-auto px-4 sm:px-8 my-12 p-6 sm:p-10 bg-[#f7f3ea] rounded-2xl border border-[#e2dacd] space-y-6">
        <div>
          <p className="text-[#c69b46] font-bold text-xs tracking-widest uppercase mb-1">HOW IT WORKS</p>
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#102a43]">From application to written determination</h2>
        </div>
        <ol className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 list-none m-0 p-0">
          <li className="p-5 bg-white border border-[#ded7c9] rounded-xl space-y-2">
            <b className="w-8 h-8 rounded-full bg-[#102a43] text-white flex items-center justify-center text-xs font-mono font-bold">1</b>
            <span className="text-xs text-[#64748b] leading-relaxed block">
              <strong className="text-[#102a43] block text-sm font-serif font-bold mb-1">Submit the structure</strong>
              Describe the institution or opportunity and provide the principal documents.
            </span>
          </li>
          <li className="p-5 bg-white border border-[#ded7c9] rounded-xl space-y-2">
            <b className="w-8 h-8 rounded-full bg-[#102a43] text-white flex items-center justify-center text-xs font-mono font-bold">2</b>
            <span className="text-xs text-[#64748b] leading-relaxed block">
              <strong className="text-[#102a43] block text-sm font-serif font-bold mb-1">Initial review</strong>
              Kav Haribis determines whether additional information or clarification is required.
            </span>
          </li>
          <li className="p-5 bg-white border border-[#ded7c9] rounded-xl space-y-2">
            <b className="w-8 h-8 rounded-full bg-[#102a43] text-white flex items-center justify-center text-xs font-mono font-bold">3</b>
            <span className="text-xs text-[#64748b] leading-relaxed block">
              <strong className="text-[#102a43] block text-sm font-serif font-bold mb-1">Halachic analysis</strong>
              The structure and relevant agreements are reviewed for Ribbis concerns.
            </span>
          </li>
          <li className="p-5 bg-white border border-[#ded7c9] rounded-xl space-y-2">
            <b className="w-8 h-8 rounded-full bg-[#102a43] text-white flex items-center justify-center text-xs font-mono font-bold">4</b>
            <span className="text-xs text-[#64748b] leading-relaxed block">
              <strong className="text-[#102a43] block text-sm font-serif font-bold mb-1">Written outcome</strong>
              You receive an approval, conditional approval, request for changes, or other determination.
            </span>
          </li>
        </ol>
      </section>

      {/* Application Form Grid */}
      <section className="container max-w-[1440px] mx-auto px-4 sm:px-8 my-12 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start" id="apply-for-review">
        <div className="lg:col-span-5 space-y-6">
          <div>
            <p className="text-[#c69b46] font-bold text-xs tracking-widest uppercase mb-1">APPLICATION</p>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#102a43]">Request a certification review</h2>
          </div>
          <p className="text-sm text-[#64748b] leading-relaxed">
            Investment sponsors, banks, mortgage companies, direct lenders, and
            other lending companies may submit their structure for an initial
            assessment. Supporting documents are stored privately and can be
            opened only by the authorized Kav Haribis administrator.
          </p>
          <ul className="space-y-2.5 text-xs text-[#475569]">
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#c69b46]"></span>
              Investment, bank, or lending-company information
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#c69b46]"></span>
              Ownership and funding sources
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#c69b46]"></span>
              Economic and legal structure
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#c69b46]"></span>
              Current Heter Iska status
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#c69b46]"></span>
              Supporting document upload
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#c69b46]"></span>
              Reference number after submission
            </li>
          </ul>
        </div>
        <div className="lg:col-span-7">
          <CertificationForm />
        </div>
      </section>

      {/* Disclaimer */}
      <section className="container max-w-[1440px] mx-auto px-4 sm:px-8 my-12 p-6 sm:p-8 bg-[#fff7e5] border border-[#f3e4bc] rounded-2xl space-y-2">
        <p className="text-[#876622] font-bold text-xs tracking-widest uppercase">SCOPE &amp; LIMITATIONS</p>
        <h2 className="text-xl font-serif font-bold text-[#102a43]">Certification is specific to the reviewed structure.</h2>
        <p className="text-xs text-[#64748b] leading-relaxed">
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
