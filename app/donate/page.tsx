import CheckoutNotice from '../shared/checkout-notice';
import { MotionDiv } from '../shared/motion-components';
import { SiteFooter, SiteHeader } from '../shared/site-shell';

export default function Donate() {
  return (
    <main className="min-h-screen bg-white">
      <SiteHeader />

      {/* Secure Payment Form */}
      <CheckoutNotice kind="donation" amount="Custom amount" />

      {/* Other Ways to Give Section */}
      <section className="py-16 px-4 sm:px-[5vw] bg-white border-t border-slate-200 overflow-hidden">
        <div className="max-w-[900px] mx-auto">
          <MotionDiv
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-20px' }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            className="text-center mb-10"
          >
            <span className="text-[#c69b46] text-xs font-extrabold tracking-widest uppercase mb-2 block">
              ADDITIONAL WAYS TO CONTRIBUTE
            </span>
            <h2 className="font-serif text-3xl font-bold text-[#102a43]">
              Other Ways to Give
            </h2>
            <p className="text-sm sm:text-base text-[#627d98] max-w-xl mx-auto mt-2">
              In addition to credit card donations, you can support Kav Haribis directly through Zelle or via The Donors Fund.
            </p>
          </MotionDiv>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Zelle Card */}
            <MotionDiv
              initial={{ opacity: 0, y: 15, scale: 0.95 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, margin: '-20px' }}
              transition={{ duration: 0.8, delay: 0.05, ease: "easeInOut" }}
              className="bg-[#f8fafc] border border-slate-200/90 rounded-2xl p-6 sm:p-8 flex flex-col justify-between shadow-xs hover:shadow-md hover:border-[#c69b46] transition-all"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-mono font-bold tracking-widest uppercase text-[#c69b46] bg-[#c69b46]/10 px-3 py-1 rounded-full">
                    Direct Transfer
                  </span>
                  <span className="text-2xl">⚡</span>
                </div>
                <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#102a43] mb-2">
                  Zelle
                </h3>
                <p className="text-xs sm:text-sm text-[#486581] leading-relaxed mb-6">
                  Send your donation directly through your banking app with no processing fees.
                </p>

                <dl className="space-y-3 text-sm">
                  <div className="bg-white p-3 rounded-lg border border-slate-100">
                    <dt className="text-xs font-bold uppercase tracking-wider text-[#94a3b8] mb-0.5">
                      Recipient
                    </dt>
                    <dd className="font-bold text-[#102a43]">
                      Congregation Kav Haribis Inc.
                    </dd>
                  </div>

                  <div className="bg-white p-3 rounded-lg border border-slate-100">
                    <dt className="text-xs font-bold uppercase tracking-wider text-[#94a3b8] mb-0.5">
                      Email
                    </dt>
                    <dd>
                      <a
                        href="mailto:kavharibis@gmail.com"
                        className="font-bold text-[#102a43] hover:text-[#c69b46] transition-colors underline break-all"
                      >
                        kavharibis@gmail.com
                      </a>
                    </dd>
                  </div>

                  <div className="bg-white p-3 rounded-lg border border-slate-100">
                    <dt className="text-xs font-bold uppercase tracking-wider text-[#94a3b8] mb-0.5">
                      Phone
                    </dt>
                    <dd>
                      <a
                        href="tel:7326067923"
                        className="font-bold text-[#102a43] hover:text-[#c69b46] transition-colors underline"
                      >
                        7326067923
                      </a>
                    </dd>
                  </div>
                </dl>
              </div>
            </MotionDiv>

            {/* Donors Fund Card */}
            <MotionDiv
              initial={{ opacity: 0, y: 15, scale: 0.95 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, margin: '-20px' }}
              transition={{ duration: 0.8, delay: 0.12, ease: "easeInOut" }}
              className="bg-[#f8fafc] border border-slate-200/90 rounded-2xl p-6 sm:p-8 flex flex-col justify-between shadow-xs hover:shadow-md hover:border-[#c69b46] transition-all"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-mono font-bold tracking-widest uppercase text-[#c69b46] bg-[#c69b46]/10 px-3 py-1 rounded-full">
                    Donor-Advised Fund
                  </span>
                  <span className="text-2xl">🏛️</span>
                </div>
                <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#102a43] mb-2">
                  Donors Fund
                </h3>
                <p className="text-xs sm:text-sm text-[#486581] leading-relaxed mb-6">
                  Recommend a grant through The Donors Fund or your philanthropic charitable account.
                </p>

                <dl className="space-y-3 text-sm">
                  <div className="bg-white p-3 rounded-lg border border-slate-100">
                    <dt className="text-xs font-bold uppercase tracking-wider text-[#94a3b8] mb-0.5">
                      Name
                    </dt>
                    <dd className="font-bold text-[#102a43]">
                      Donors Fund at Congregation Kay Haribis
                    </dd>
                  </div>

                  <div className="bg-white p-3 rounded-lg border border-slate-100">
                    <dt className="text-xs font-bold uppercase tracking-wider text-[#94a3b8] mb-0.5">
                      EIN
                    </dt>
                    <dd className="font-mono font-bold text-base text-[#102a43] tracking-wide">
                      333357711
                    </dd>
                  </div>
                </dl>
              </div>
            </MotionDiv>
          </div>
        </div>
      </section>

      {/* Trust & FAQ Section */}
      <section className="py-16 px-4 sm:px-[5vw] bg-slate-50 border-t border-slate-200 overflow-hidden">
        <div className="max-w-[900px] mx-auto">
          <MotionDiv
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-20px' }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            className="text-center mb-10"
          >
            <span className="text-[#c69b46] text-xs font-extrabold tracking-widest uppercase mb-2 block">
              QUESTIONS &amp; ANSWERS
            </span>
            <h2 className="font-serif text-3xl font-bold text-[#102a43]">
              Frequently Asked Questions
            </h2>
          </MotionDiv>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <MotionDiv
              initial={{ opacity: 0, y: 15, scale: 0.9 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, margin: '-20px' }}
              transition={{ duration: 0.8, delay: 0.05, ease: "easeInOut" }}
              className="bg-white p-6 shadow-xs transition-shadow duration-300 hover:shadow-md"
            >
              <h3 className="text-base font-bold text-[#102a43] mb-2">Is my donation tax-deductible?</h3>
              <p className="text-sm leading-relaxed text-[#486581]">
                Yes! Kav Haribis is a registered non-profit organization. All contributions are tax-deductible to the fullest extent permitted by law, and an official tax receipt is issued automatically upon payment.
              </p>
            </MotionDiv>

            <MotionDiv
              initial={{ opacity: 0, y: 15, scale: 0.9 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, margin: '-20px' }}
              transition={{ duration: 0.8, delay: 0.12, ease: "easeInOut" }}
              className="bg-white p-6 shadow-xs transition-shadow duration-300 hover:shadow-md"
            >
              <h3 className="text-base font-bold text-[#102a43] mb-2">How is my payment details protected?</h3>
              <p className="text-sm leading-relaxed text-[#486581]">
                Your card details are processed using Cardknox iFields PCI-DSS Level 1 compliant tokenization. Sensitive card numbers never touch or get saved on our servers.
              </p>
            </MotionDiv>

            <MotionDiv
              initial={{ opacity: 0, y: 15, scale: 0.9 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, margin: '-20px' }}
              transition={{ duration: 0.8, delay: 0.19, ease: "easeInOut" }}
              className="bg-white p-6 shadow-xs transition-shadow duration-300 hover:shadow-md"
            >
              <h3 className="text-base font-bold text-[#102a43] mb-2">Can I dedicate my donation?</h3>
              <p className="text-sm leading-relaxed text-[#486581]">
                Absolutely. You can include a dedication (in honor of, in memory of, or for a Refuah Sheleimah) in the dedication field of the payment form.
              </p>
            </MotionDiv>

            <MotionDiv
              initial={{ opacity: 0, y: 15, scale: 0.9 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, margin: '-20px' }}
              transition={{ duration: 0.8, delay: 0.26, ease: "easeInOut" }}
              className="bg-white p-6 shadow-xs transition-shadow duration-300 hover:shadow-md"
            >
              <h3 className="text-base font-bold text-[#102a43] mb-2">Can I donate anonymously?</h3>
              <p className="text-sm leading-relaxed text-[#486581]">
                Yes. Simply check the &quot;Make this donation anonymous&quot; checkbox on the payment form, and your identity will remain private.
              </p>
            </MotionDiv>
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
