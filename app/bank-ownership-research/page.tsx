import type { Metadata } from 'next';
import BankResearchForm from '../bank-directory/bank-research-form';
import { MotionDiv } from '../shared/motion-components';
import { SiteFooter, SiteHeader } from '../shared/site-shell';

export const metadata: Metadata = {
  title: 'Bank Ownership Research | Kav Haribis',
  description:
    'Request research on a commercial bank, mortgage lender, or financial institution for inclusion and review in the Kosher Bank Directory.',
};

export default function BankOwnershipResearchPage() {
  return (
    <main className="min-h-screen bg-[#fbfaf7]">
      <SiteHeader />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#071728] via-[#102a43] to-[#0e304b] text-white">
        <div className="container max-w-[1440px] mx-auto px-4 sm:px-8 py-16 md:py-20 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center relative z-10">
          <MotionDiv
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-7 space-y-6"
          >
            <p className="text-[#c69b46] font-bold text-xs tracking-widest uppercase">
              KOSHER BANK DIRECTORY RESEARCH
            </p>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-white leading-tight">
              Bank Ownership Research
            </h1>
            <p className="text-[#cbd5e1] text-base sm:text-lg leading-relaxed max-w-xl">
              Submit a request for halachic ownership research on a bank, mortgage lender, or financial institution for inclusion and review in the Kosher Bank Directory.
            </p>
            <a
              className="inline-block px-6 py-3.5 bg-[#c69b46] hover:bg-[#b0883b] text-[#102a43] text-md font-semibold transition-all duration-300 hover:scale-105 shadow-md rounded-md"
              href="#bank-research-form"
            >
              Submit Research Request
            </a>
          </MotionDiv>
          <MotionDiv
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1], delay: 0.12 }}
            className="lg:col-span-5 relative overflow-hidden rounded-xl shadow-xl"
          >
            <img
              src="/kav-brand/bank-research.png"
              alt="Bank and lender financial research"
              className="w-full h-72 sm:h-96 object-cover hover:scale-105 transition-transform duration-500"
            />
          </MotionDiv>
        </div>
      </section>

      {/* Overview Cards */}
      <section className="container max-w-[1440px] mx-auto px-4 sm:px-8 my-12 space-y-8 overflow-hidden">
        <MotionDiv
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-20px' }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6 pb-6 py-6"
        >
          <div>
            <p className="text-[#c69b46] font-bold text-xs tracking-widest uppercase">
              HOW RESEARCH WORKS
            </p>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#102a43]">
              Helping strengthen the directory
            </h2>
            <p className="max-w-xl text-md text-[#64748b] leading-relaxed pt-2">
              Every submission is reviewed by our dedicated research team under rabbinical guidance to ensure accurate, up-to-date halachic status determination.
            </p>
          </div>
        </MotionDiv>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pb-6">
          <div className="p-6 bg-white border border-gray-100 space-y-3 rounded-xl shadow-xs">
            <span className="font-mono text-md font-bold text-[#c69b46]">01</span>
            <h3 className="text-xl font-serif pt-2 font-bold text-[#102a43]">
              Request New Research
            </h3>
            <p className="text-md text-[#64748b] leading-relaxed">
              Request research on an unlisted bank, credit union, or mortgage lender for review.
            </p>
          </div>

          <div className="p-6 bg-white border border-gray-100 space-y-3 rounded-xl shadow-xs">
            <span className="font-mono text-md font-bold text-[#c69b46]">02</span>
            <h3 className="text-xl font-serif pt-2 font-bold text-[#102a43]">
              Share Information
            </h3>
            <p className="text-md text-[#64748b] leading-relaxed">
              Securely provide new documents, public filings, or ownership information.
            </p>
          </div>

          <div className="p-6 bg-white border border-gray-100 space-y-3 rounded-xl shadow-xs">
            <span className="font-mono text-md font-bold text-[#c69b46]">03</span>
            <h3 className="text-xl font-serif pt-2 font-bold text-[#102a43]">
              Update an Existing Listing
            </h3>
            <p className="text-md text-[#64748b] leading-relaxed">
              Submit corrections, mergers, acquisitions, or updated policies for listed banks.
            </p>
          </div>
        </div>
      </section>

      {/* Form Section */}
      <section className="container max-w-[1440px] mx-auto pb-16 px-4 sm:px-8 scroll-mt-[120px]" id="bank-research-form">
        <div className="bg-white border border-gray-200/80 rounded-2xl p-6 sm:p-10 shadow-sm">
          <div className="mb-4 border-b border-gray-100 pb-4">
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#102a43]">
              Submit a Bank for Research
            </h2>
            <p className="text-slate-600 text-sm sm:text-base mt-1">
              Complete the form below with the bank or lender details. The Kav Haribis research team will review the information.
            </p>
          </div>
          <BankResearchForm />
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
