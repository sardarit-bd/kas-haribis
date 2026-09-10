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
      <section className="relative overflow-hidden bg-gradient-to-br from-[#071728] via-[#102a43] to-[#0e304b] text-white">
        <div className="container max-w-[1440px] mx-auto px-4 sm:px-8 py-16 md:py-24 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center relative z-10">
          <div className="lg:col-span-7 space-y-6">
            <p className="text-[#c69b46] font-bold text-xs tracking-widest uppercase hidden">KASHRUS OF FINANCIAL SERVICES</p>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-white leading-tight">
              Investment &amp; Lender Certification
            </h1>
            <p className="text-[#cbd5e1] text-base sm:text-lg leading-relaxed max-w-xl">
              A structured review of investments, banks, lending companies,
              agreements, and financial relationships for potential Ribbis
              concerns and practical Halachic compliance.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 pt-2">
              <a className="px-6 py-3.5 bg-[#c69b46] hover:bg-[#b0883b] text-[#102a43] text-md text-center" href="#apply-for-review">
                Apply for review
              </a>
              <a className="px-6 py-3.5 bg-white/10 border border-white/20 hover:bg-white/20 text-white text-md transition-colors text-center" href="/bais-horaah">
                Ask a preliminary question
              </a>
            </div>
          </div>
        </div>
      </section>


      {/* Process Section */}
      <section className="container px-4 sm:px-8p-6 sm:p-10 bg-[#f7f3ea] space-y-6">
        <div>
          <p className="text-[#c69b46] font-bold text-xs tracking-widest uppercase mb-1">HOW IT WORKS</p>
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#102a43]">From application to written determination</h2>
        </div>
        <ol className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 list-none m-0 p-0">
          <li className="p-5 bg-white space-y-2">
            <b className="w-8 h-8 rounded-full bg-[#102a43] text-white flex items-center justify-center text-xs font-mono font-bold">1</b>
            <span className="text-xs text-[#64748b] leading-relaxed block">
              <strong className="text-[#102a43] block text-sm font-serif font-bold mb-1">Submit the structure</strong>
              Describe the institution or opportunity and provide the principal documents.
            </span>
          </li>
          <li className="p-5 bg-white space-y-2">
            <b className="w-8 h-8 rounded-full bg-[#102a43] text-white flex items-center justify-center text-xs font-mono font-bold">2</b>
            <span className="text-xs text-[#64748b] leading-relaxed block">
              <strong className="text-[#102a43] block text-sm font-serif font-bold mb-1">Initial review</strong>
              Kav Haribis determines whether additional information or clarification is required.
            </span>
          </li>
          <li className="p-5 bg-white space-y-2">
            <b className="w-8 h-8 rounded-full bg-[#102a43] text-white flex items-center justify-center text-xs font-mono font-bold">3</b>
            <span className="text-xs text-[#64748b] leading-relaxed block">
              <strong className="text-[#102a43] block text-sm font-serif font-bold mb-1">Halachic analysis</strong>
              The structure and relevant agreements are reviewed for Ribbis concerns.
            </span>
          </li>
          <li className="p-5 bg-white space-y-2">
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
            <p className="text-[#c69b46] font-bold text-xs tracking-widest uppercase hidden mb-1">APPLICATION</p>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#102a43]">Request a certification review</h2>
          </div>
          <p className="text-md text-[#64748b] leading-relaxed">
            Investment sponsors, banks, mortgage companies, direct lenders, and
            other lending companies may submit their structure for an initial
            assessment. Supporting documents are stored privately and can be
            opened only by the authorized Kav Haribis administrator.
          </p>
          <ul className="space-y-2.5 text-md text-[#475569]">
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


      <SiteFooter />
    </main>
  );
}
