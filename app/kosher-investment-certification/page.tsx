import { MotionDiv } from '../shared/motion-components';
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
        <div className="container px-4 sm:px-8 py-16 md:py-24 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center relative z-10">
          <MotionDiv
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-7 space-y-6"
          >
            <p className="text-[#c69b46] font-bold text-xs tracking-widest uppercase hidden">KASHRUS OF FINANCIAL SERVICES</p>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-white leading-tight">
              Investment, Lender &amp; Broker Certification
            </h1>
            <p className="text-[#cbd5e1] text-base sm:text-lg leading-relaxed max-w-xl">
              A structured review of investments, banks, lending companies,
              agreements, and financial relationships for potential Ribbis
              concerns and practical Halachic compliance.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 pt-2">
              <a className="px-6 py-3.5 bg-[#c69b46] hover:bg-[#b0883b] text-[#102a43] text-md text-center font-bold transition-all duration-300 hover:scale-105 rounded-md shadow-sm" href="#apply-for-review">
                Apply for review
              </a>
              <a className="px-6 py-3.5 bg-white/10 border border-white/20 hover:bg-white/20 text-white text-md transition-all duration-300 hover:scale-105 text-center rounded-md" href="/bais-horaah">
                Ask a preliminary question
              </a>
            </div>
          </MotionDiv>
          <MotionDiv
            initial={{ opacity: 0, scale: .9}}
            animate={{ opacity: 1, scale: 1}}
            transition={{ duration: 0.3, delay: 0.45 }}
            className="w-full flex items-center justify-center lg:justify-end lg:col-span-5">
            <img className="object-contain h-[350px] w-[350px] bg-white rounded-full" src="/klc-sticker.png" alt="affiliate" />
          </MotionDiv>
        </div>
      </section>


      {/* What We Review Section */}
      <section className="bg-[#f7f3ea]/60 py-16 md:py-24 overflow-hidden">
        <div className="container max-w-[1440px] mx-auto px-4 sm:px-8">
          <MotionDiv
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-20px' }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="mb-10 sm:mb-14"
          >
            <p className="text-[#c69b46] font-bold text-sm tracking-widest mb-3">
              What We Review
            </p>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-[#102a43]">
              A practical Halachic assessment
            </h2>
          </MotionDiv>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {reviewItems.map(([num, title, text], idx) => (
              <MotionDiv
                key={num}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-20px' }}
                transition={{ duration: 0.8, delay: (idx % 3) * 0.07, ease: [0.16, 1, 0.3, 1] }}
                whileHover={{ y: -4, transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] } }}
                className="p-6 sm:p-8 bg-white border border-[#e2d9c8]/70 shadow-xs hover:shadow-md flex flex-col justify-between rounded-xl transition-all"
              >
                <div>
                  <span className="text-[#c69b46] font-bold text-lg sm:text-xl font-serif block mb-2">
                    {num}
                  </span>
                  <h3 className="text-xl sm:text-2xl font-serif font-bold text-[#102a43] mb-3">
                    {title}
                  </h3>
                  <p className="text-[#64748b] text-sm sm:text-base leading-relaxed">
                    {text}
                  </p>
                </div>
              </MotionDiv>
            ))}
          </div>
        </div>
      </section>

      {/* Certification in Practice Section */}
      <section className="py-16 md:py-24 bg-[#fbfaf7] overflow-hidden">
        <div className="container max-w-[1440px] mx-auto px-4 sm:px-8 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          <MotionDiv
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-20px' }}
            transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-6 space-y-6"
          >
            <div>
              <p className="text-[#c69b46] font-bold text-xs tracking-widest mb-3">
                CERTIFICATION IN PRACTICE
              </p>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-[#102a43] leading-tight">
                Certification for banks and lending companies
              </h2>
            </div>
            <p className="text-[#64748b] text-base sm:text-lg leading-relaxed">
              Kav Haribis reviews banks, mortgage companies, direct lenders, and other lending institutions. The review may address ownership, funding sources, loan products, agreements, servicing, and whether a Heter Iska is required for the institution or transaction.
            </p>
            <div className="pt-2">
              <a
                style={{color:'white'}}
                href="#apply-for-review"
                className="inline-block px-6 py-3.5 bg-[#c69b46] hover:bg-[#b0883b] text-[#102a43] font-semibold text-sm sm:text-base transition-all duration-300 hover:scale-105 shadow-sm rounded-md"
              >
                Request institutional certification
              </a>
            </div>
          </MotionDiv>
          <MotionDiv
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-20px' }}
            transition={{ duration: 0.85, delay: 0.12, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-6"
          >
            <div className="bg-[#f7f3ea]/50 border border-[#e2d9c8]/70 p-3 sm:p-4 rounded-xl shadow-sm">
              <img
                src="/kav-brand/rate-certified.png"
                alt="Example of a Kav Haribis-certified lending company"
                className="w-full h-auto rounded-lg border border-[#e2d9c8]/40 shadow-sm hover:scale-[1.02] transition-transform duration-500"
              />
              <p className="text-xs text-[#64748b] mt-3 pl-1 font-sans">
                Example of a Kav Haribis-certified lending company.
              </p>
            </div>
          </MotionDiv>
        </div>
      </section>

      {/* Application Form Grid */}
      <section className='bg-gray-100 py-12 overflow-hidden'>
        <MotionDiv
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-20px' }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="container max-w-[1440px] mx-auto px-4 sm:px-8 my-12 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start scroll-mt-[140px]"
          id="apply-for-review"
        >
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
        </MotionDiv>
      </section>

      {/* Process Section */}
      <section className='container overflow-hidden'>
        <section className="px-4 sm:px-8 p-6 sm:p-10 bg-[#f7f3ea] space-y-6 my-12 rounded-2xl">
          <MotionDiv
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-20px' }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            <p className="text-[#c69b46] font-bold text-sm tracking-widest mb-1">How it Works</p>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#102a43]">From application to written determination</h2>
          </MotionDiv>
          <ol className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 list-none m-0 p-0">
            {[
              {
                num: '1',
                title: 'Submit the structure',
                desc: 'Describe the institution or opportunity and provide the principal documents.',
              },
              {
                num: '2',
                title: 'Initial review',
                desc: 'Kav Haribis determines whether additional information or clarification is required.',
              },
              {
                num: '3',
                title: 'Halachic analysis',
                desc: 'The structure and relevant agreements are reviewed for Ribbis concerns.',
              },
              {
                num: '4',
                title: 'Written outcome',
                desc: 'You receive an approval, conditional approval, request for changes, or other determination.',
              },
            ].map((step, idx) => (
              <MotionDiv
                key={step.num}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-20px' }}
                transition={{ duration: 0.8, delay: idx * 0.07, ease: [0.16, 1, 0.3, 1] }}
                whileHover={{ y: -4, transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] } }}
                className="p-5 bg-white space-y-2 rounded-xl shadow-xs hover:shadow-md transition-all"
              >
                <b className="w-8 h-8 rounded-full bg-[#102a43] text-white flex items-center justify-center text-xs font-mono font-bold">{step.num}</b>
                <span className="text-xs text-[#64748b] leading-relaxed block">
                  <strong className="text-[#102a43] block text-sm font-serif font-bold mb-1">{step.title}</strong>
                  {step.desc}
                </span>
              </MotionDiv>
            ))}
          </ol>
        </section>
      </section>

      {/* Featured Educational Article Section */}
      <section className="bg-white py-16 md:py-24 border-t border-[#e2d9c8]/70 overflow-hidden" id="mortgage-hashgacha-article">
        <div className="container max-w-[1200px] mx-auto px-4 sm:px-8">
          <MotionDiv
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-20px' }}
            transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-12"
          >
            {/* Article Header */}
            <div className="border-b border-gray-200 pb-8 text-center max-w-3xl mx-auto space-y-4">
              <span className="text-[#c69b46] font-bold text-xs sm:text-sm tracking-widest uppercase block">
                HALACHIC PERSPECTIVES &amp; MORTGAGE GUIDANCE
              </span>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-[#102a43] leading-tight">
                The Hidden Ribis Questions Behind Your Mortgage
              </h2>
              <p className="text-xl sm:text-2xl text-[#102a43] font-serif font-medium">
                Why Hashgacha on Mortgage Brokers Matters
              </p>
              <div className="pt-2 flex items-center justify-center gap-4 text-xs text-[#64748b]">
                <span>Educational Guidance</span>
                <span>•</span>
                <span>Hilchos Ribbis in Modern Finance</span>
                <span>•</span>
                <a
                  href="/article-pdfs/hidden-ribis-mortgage-article.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#c69b46] font-semibold hover:underline"
                >
                  Download PDF ↗
                </a>
              </div>
            </div>

            {/* Article Lead */}
            <div className="max-w-4xl mx-auto space-y-4 text-base sm:text-lg text-slate-700 leading-relaxed">
              <p>
                For many homebuyers, obtaining a mortgage is one of the largest financial transactions they will ever undertake.
              </p>
              <p>
                Yet while borrowers often focus on the interest rate, closing costs, and monthly payment, many may overlook another important issue: potential ribis concerns in the mortgage transaction.
              </p>
            </div>

            {/* Part 1: The Potential Ribis Issues */}
            <div className="max-w-4xl mx-auto space-y-8">
              <div className="border-l-4 border-[#c69b46] pl-4">
                <h3 className="text-2xl sm:text-3xl font-serif font-bold text-[#102a43]">
                  The Potential Ribis Issues
                </h3>
              </div>

              <div className="space-y-6">
                {/* Issue 1 */}
                <div className="bg-[#fbfaf7] border border-[#e2d9c8]/70 rounded-xl p-6 sm:p-8 space-y-3">
                  <h4 className="text-xl font-serif font-bold text-[#102a43] flex items-center gap-2">
                    <span className="w-8 h-8 rounded-full bg-[#102a43] text-white flex items-center justify-center text-xs font-mono font-bold shrink-0">1</span>
                    The lender may have Jewish ownership or partnership
                  </h4>
                  <div className="space-y-3 text-sm sm:text-base text-slate-700 leading-relaxed pl-10">
                    <p>
                      A borrower may assume that he is simply borrowing from a large bank or mortgage company and that there is no halachic concern. However, determining whether a financial institution has Jewish ownership or a Jewish partnership can sometimes be complicated.
                    </p>
                    <p>
                      A company may be privately owned, publicly traded, controlled through another corporation, or have various investors or ownership interests. Even when a borrower understands that Jewish ownership may be relevant, he may not know what level or type of ownership creates a halachic concern.
                    </p>
                    <p>
                      Determining whether a particular ownership structure constitutes a halachically significant Jewish partnership may require detailed research and appropriate halachic guidance. This is one reason why simply asking whether a bank has “Jewish owners” may not be enough to determine whether the lender is permissible from a halachic perspective.
                    </p>
                    <p>
                      Furthermore, the time and money one needs to spend researching ownership is also unclear and may vary by circumstance.
                    </p>
                  </div>
                </div>

                {/* Issue 2 */}
                <div className="bg-[#fbfaf7] border border-[#e2d9c8]/70 rounded-xl p-6 sm:p-8 space-y-3">
                  <h4 className="text-xl font-serif font-bold text-[#102a43] flex items-center gap-2">
                    <span className="w-8 h-8 rounded-full bg-[#102a43] text-white flex items-center justify-center text-xs font-mono font-bold shrink-0">2</span>
                    The mortgage broker may initially fund the loan
                  </h4>
                  <div className="space-y-3 text-sm sm:text-base text-slate-700 leading-relaxed pl-10">
                    <p>
                      In some transactions, a Jewish mortgage broker or lender may initially advance its own funds to the borrower and then sell the loan shortly afterward to a non-Jewish financial institution.
                    </p>
                    <p>
                      From a halachic perspective, the fact that the loan is quickly sold does not eliminate the concern regarding the initial transaction. The broker may have effectively been the lender at the time the loan was originated.
                    </p>
                    <p>
                      If such a structure is being used, the transaction may therefore require a properly structured and halachically acceptable heter iska.
                    </p>
                  </div>
                </div>

                {/* Issue 3 */}
                <div className="bg-[#fbfaf7] border border-[#e2d9c8]/70 rounded-xl p-6 sm:p-8 space-y-3">
                  <h4 className="text-xl font-serif font-bold text-[#102a43] flex items-center gap-2">
                    <span className="w-8 h-8 rounded-full bg-[#102a43] text-white flex items-center justify-center text-xs font-mono font-bold shrink-0">3</span>
                    The loan may later be sold to a problematic lender or investor
                  </h4>
                  <div className="space-y-3 text-sm sm:text-base text-slate-700 leading-relaxed pl-10">
                    <p>
                      Even when the original lender is not Jewish-owned, mortgage loans are frequently sold after origination. The ultimate owner of the loan may therefore be different from the institution that originally closed the mortgage.
                    </p>
                    <p>
                      Another bank, investment group, fund, or other entity with Jewish ownership or participation could purchase the loan.
                    </p>
                    <p>
                      For this reason, checking only the original lender may not always be sufficient. Where possible, the broker should have procedures in place to determine whether the loan is expected to be sold to another institution that could create a halachic concern.
                    </p>
                  </div>
                </div>

                {/* Issue 4 */}
                <div className="bg-[#fbfaf7] border border-[#e2d9c8]/70 rounded-xl p-6 sm:p-8 space-y-3">
                  <h4 className="text-xl font-serif font-bold text-[#102a43] flex items-center gap-2">
                    <span className="w-8 h-8 rounded-full bg-[#102a43] text-white flex items-center justify-center text-xs font-mono font-bold shrink-0">4</span>
                    Not every heter iska is necessarily sufficient
                  </h4>
                  <div className="space-y-3 text-sm sm:text-base text-slate-700 leading-relaxed pl-10">
                    <p>
                      Another misconception is that simply having a document called a “heter iska” automatically resolves the issue.
                    </p>
                    <p>
                      Many different forms of heter iskas are in use today, and they are not necessarily identical in their halachic structure. Some may be considered unacceptable in every situation, some may be unacceptable for a particular transaction, and a halachic authority may view others as weaker or less appropriate than preferred alternatives. Even when it's a good Heter Iska, if it's not signed and added properly to the loan documents, it may still be deemed no good depending on the circumstances.
                    </p>
                    <p>
                      Accordingly, when a heter iska is required, it is important that a qualified halachic authority review and approve the specific heter iska being used for the transaction in question.
                    </p>
                  </div>
                </div>

                {/* Issue 5 */}
                <div className="bg-[#fbfaf7] border border-[#e2d9c8]/70 rounded-xl p-6 sm:p-8 space-y-3">
                  <h4 className="text-xl font-serif font-bold text-[#102a43] flex items-center gap-2">
                    <span className="w-8 h-8 rounded-full bg-[#102a43] text-white flex items-center justify-center text-xs font-mono font-bold shrink-0">5</span>
                    A Jewish co-signer can create an additional issue
                  </h4>
                  <div className="space-y-3 text-sm sm:text-base text-slate-700 leading-relaxed pl-10">
                    <p>
                      Many borrowers are unaware of another issue.
                    </p>
                    <p>
                      Even when the actual lender is entirely non-Jewish, there can be a halachic concern when a Jewish person agrees to serve as a co-signer or guarantor for a Jew on an interest-bearing loan.
                    </p>
                    <p>
                      A proper heter iska may therefore be necessary between the borrower and the Jewish co-signer or guarantor, depending on the transaction structure.
                    </p>
                    <p>
                      This issue can easily be overlooked because the borrower may correctly determine that the bank itself is not Jewish-owned, while failing to consider the guarantor's separate halachic status.
                    </p>
                  </div>
                </div>

                {/* Issue 6 */}
                <div className="bg-[#fbfaf7] border border-[#e2d9c8]/70 rounded-xl p-6 sm:p-8 space-y-3">
                  <h4 className="text-xl font-serif font-bold text-[#102a43] flex items-center gap-2">
                    <span className="w-8 h-8 rounded-full bg-[#102a43] text-white flex items-center justify-center text-xs font-mono font-bold shrink-0">6</span>
                    Taking a mortgage in someone else’s name
                  </h4>
                  <div className="space-y-3 text-sm sm:text-base text-slate-700 leading-relaxed pl-10">
                    <p>
                      In some situations, a person may be unable to qualify for a mortgage in his own name and may therefore arrange for another individual to take out the mortgage on his behalf.
                    </p>
                    <p>
                      This structure can present a particularly serious ribis concern.
                    </p>
                    <p>
                      According to the approach of leading poskim, the transaction may be viewed halachically as though the individual whose name appears on the mortgage borrowed the money from the bank and then lent those funds with interest to the actual home purchaser.
                    </p>
                    <p>
                      This constitutes a loan between two Jews with interest—even if the person whose name appears on the mortgage does not personally make any profit from the arrangement.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Part 2: How Hashgacha Addresses These Issues */}
            <div className="max-w-4xl mx-auto bg-[#f7f3ea] border border-[#e2d9c8] rounded-2xl p-6 sm:p-10 space-y-4">
              <h3 className="text-2xl sm:text-3xl font-serif font-bold text-[#102a43]">
                How does Hashgacha address these issues?
              </h3>
              <div className="space-y-4 text-sm sm:text-base text-slate-700 leading-relaxed">
                <p>
                  Because of these complexities, the concept of hashgacha on a mortgage broker was developed.
                </p>
                <p>
                  The idea is straightforward: instead of expecting every individual borrower to independently research lender ownership, understand the secondary mortgage market, review heter iska documents, and identify potential ribis concerns, the mortgage broker agrees in advance to operate under established halachic guidelines.
                </p>
                <p>
                  The hashgacha gives the borrower an additional level of oversight and confidence that the broker has procedures designed to identify and address potential ribis concerns.
                </p>
                <p>
                  It is important to understand the limits of such oversight. A hashgacha cannot necessarily control every event that may occur after a loan closes, particularly developments involving the future sale or transfer of a loan that may be outside the broker’s control.
                </p>
                <p>
                  The objective is therefore to minimize potential ribis issues through careful oversight and established procedures, rather than to guarantee every conceivable future circumstance.
                </p>
              </div>
            </div>

            {/* Part 3: What Does an Approved Mortgage Broker Commit To? */}
            <div className="max-w-4xl mx-auto space-y-6">
              <div className="border-l-4 border-[#c69b46] pl-4">
                <h3 className="text-2xl sm:text-3xl font-serif font-bold text-[#102a43]">
                  What Does an Approved Mortgage Broker Commit To?
                </h3>
              </div>
              <p className="text-sm sm:text-base text-slate-700 leading-relaxed">
                A mortgage broker seeking hashgacha must commit to a defined set of guidelines. Among the principal requirements are the following:
              </p>

              <div className="grid grid-cols-1 gap-4">
                <div className="p-5 bg-white border border-[#e2d9c8] rounded-xl shadow-xs space-y-2">
                  <h4 className="text-lg font-serif font-bold text-[#102a43] flex items-center gap-2">
                    <span className="font-mono text-sm font-bold text-[#c69b46]">01</span>
                    Approved lenders
                  </h4>
                  <p className="text-sm sm:text-base text-slate-600 leading-relaxed pl-6">
                    The hashgacha must review and approve all lenders the broker uses, based on available research and appropriate halachic considerations, so there is no need to assume they have problematic Jewish ownership or partnership.
                  </p>
                </div>

                <div className="p-5 bg-white border border-[#e2d9c8] rounded-xl shadow-xs space-y-2">
                  <h4 className="text-lg font-serif font-bold text-[#102a43] flex items-center gap-2">
                    <span className="font-mono text-sm font-bold text-[#c69b46]">02</span>
                    Approved heter iska arrangements
                  </h4>
                  <p className="text-sm sm:text-base text-slate-600 leading-relaxed pl-6">
                    Whenever a transaction requires a heter iska, the heter iska being used must be reviewed and certified as halachically acceptable. This is particularly important when the mortgage broker itself initially advances the funds and subsequently sells the loan to another institution. In such a case, the heter iska used by the broker must specifically address that structure.
                  </p>
                </div>

                <div className="p-5 bg-white border border-[#e2d9c8] rounded-xl shadow-xs space-y-2">
                  <h4 className="text-lg font-serif font-bold text-[#102a43] flex items-center gap-2">
                    <span className="font-mono text-sm font-bold text-[#c69b46]">03</span>
                    Monitoring the sale of loans
                  </h4>
                  <p className="text-sm sm:text-base text-slate-600 leading-relaxed pl-6">
                    The broker must make reasonable efforts, based on the information available to it, to determine that loans will not be sold to lenders or investment entities that have been identified as problematic. Because mortgages are frequently transferred in the secondary market, this is an important component of the oversight.
                  </p>
                </div>

                <div className="p-5 bg-white border border-[#e2d9c8] rounded-xl shadow-xs space-y-2">
                  <h4 className="text-lg font-serif font-bold text-[#102a43] flex items-center gap-2">
                    <span className="font-mono text-sm font-bold text-[#c69b46]">04</span>
                    Co-signers and guarantors
                  </h4>
                  <p className="text-sm sm:text-base text-slate-600 leading-relaxed pl-6">
                    Whenever a Jewish co-signer or guarantor is required, the borrower must be informed that a heter iska may be necessary to address the halachic concerns associated with the guarantee.
                  </p>
                </div>

                <div className="p-5 bg-white border border-[#e2d9c8] rounded-xl shadow-xs space-y-2">
                  <h4 className="text-lg font-serif font-bold text-[#102a43] flex items-center gap-2">
                    <span className="font-mono text-sm font-bold text-[#c69b46]">05</span>
                    Mortgages taken in someone else’s name
                  </h4>
                  <p className="text-sm sm:text-base text-slate-600 leading-relaxed pl-6">
                    If a mortgage is being taken out under another person’s name for the benefit of the actual purchaser, the broker must inform the parties that the arrangement requires appropriate halachic review and, where applicable, a properly structured heter iska.
                  </p>
                </div>
              </div>
            </div>

            {/* Part 4: A Practical Safeguard for Borrowers */}
            <div className="max-w-4xl mx-auto bg-[#102a43] text-white rounded-2xl p-6 sm:p-10 space-y-4">
              <span className="text-[#c69b46] font-bold text-xs tracking-widest uppercase block">
                CONCLUSION
              </span>
              <h3 className="text-2xl sm:text-3xl font-serif font-bold text-white">
                A Practical Safeguard for Borrowers
              </h3>
              <div className="space-y-4 text-sm sm:text-base text-slate-200 leading-relaxed">
                <p>
                  The modern mortgage industry is complex. A mortgage that appears to be a straightforward transaction between a borrower and a non-Jewish bank may involve a broker, an initial funding source, a secondary purchaser, an investment fund, a guarantor, and multiple transfers of ownership.
                </p>
                <p>
                  For a borrower seeking to avoid ribis concerns, understanding all of these layers can be extremely difficult.
                </p>
                <p>
                  A hashgacha on the mortgage broker is intended to provide an additional safeguard by requiring the broker to follow established halachic procedures and by bringing professional mortgage expertise together with appropriate halachic oversight.
                </p>
                <p className="pt-2 border-t border-white/20 text-slate-300">
                  Ultimately, borrowers should consult with a qualified halachic authority regarding their individual circumstances. However, having a mortgage broker operate under formal hashgacha can significantly reduce the burden on the individual borrower and help ensure potential ribis issues are identified before the mortgage closes, rather than after the fact.
                </p>
              </div>
            </div>
          </MotionDiv>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}

