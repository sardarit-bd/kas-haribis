import CheckoutNotice from '../shared/checkout-notice';
import { SiteFooter, SiteHeader } from '../shared/site-shell';

export default function Donate() {
  return (
    <main className="min-h-screen bg-white">
      <SiteHeader />

      {/* Secure Payment Form */}
      <CheckoutNotice kind="donation" amount="Custom amount" />

      {/* Trust & FAQ Section */}
      <section className="py-16 px-4 sm:px-[5vw] bg-slate-50 border-t border-slate-200">
        <div className="max-w-[900px] mx-auto">
          <div className="text-center mb-10">
            <span className="text-[#c69b46] text-xs font-extrabold tracking-widest uppercase mb-2 block">
              QUESTIONS &amp; ANSWERS
            </span>
            <h2 className="font-serif text-3xl font-bold text-[#102a43]">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 shadow-xs">
              <h3 className="text-base font-bold text-[#102a43] mb-2">Is my donation tax-deductible?</h3>
              <p className="text-sm leading-relaxed text-[#486581]">
                Yes! Kav Haribis is a registered non-profit organization. All contributions are tax-deductible to the fullest extent permitted by law, and an official tax receipt is issued automatically upon payment.
              </p>
            </div>

            <div className="bg-white p-6 shadow-xs">
              <h3 className="text-base font-bold text-[#102a43] mb-2">How is my payment details protected?</h3>
              <p className="text-sm leading-relaxed text-[#486581]">
                Your card details are processed using Cardknox iFields PCI-DSS Level 1 compliant tokenization. Sensitive card numbers never touch or get saved on our servers.
              </p>
            </div>

            <div className="bg-white p-6 shadow-xs">
              <h3 className="text-base font-bold text-[#102a43] mb-2">Can I dedicate my donation?</h3>
              <p className="text-sm leading-relaxed text-[#486581]">
                Absolutely. You can include a dedication (in honor of, in memory of, or for a Refuah Sheleimah) in the dedication field of the payment form.
              </p>
            </div>

            <div className="bg-white p-6 shadow-xs">
              <h3 className="text-base font-bold text-[#102a43] mb-2">Can I donate anonymously?</h3>
              <p className="text-sm leading-relaxed text-[#486581]">
                Yes. Simply check the "Make this donation anonymous" checkbox on the payment form, and your identity will remain private.
              </p>
            </div>
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
