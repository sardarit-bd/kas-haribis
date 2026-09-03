import CheckoutNotice from '../shared/checkout-notice';
import { SiteFooter, SiteHeader } from '../shared/site-shell';

export default function Donate() {
  return (
    <main>
      <SiteHeader />

      {/* Secure Payment Form */}
      <CheckoutNotice kind="donation" amount="Custom amount" />

      {/* Trust & FAQ Section */}
      <section className="donateFaqSection">
        <div className="faqContainer">
          <div className="faqHeader">
            <span className="impactEyebrow">QUESTIONS & ANSWERS</span>
            <h2 className="impactTitle">Frequently Asked Questions</h2>
          </div>

          <div className="faqGrid">
            <div className="faqItem">
              <h3 className="faqQuestion">Is my donation tax-deductible?</h3>
              <p className="faqAnswer">
                Yes! Kav Haribis is a registered non-profit organization. All contributions are tax-deductible to the fullest extent permitted by law, and an official tax receipt is issued automatically upon payment.
              </p>
            </div>

            <div className="faqItem">
              <h3 className="faqQuestion">How is my payment details protected?</h3>
              <p className="faqAnswer">
                Your card details are processed using Cardknox iFields PCI-DSS Level 1 compliant tokenization. Sensitive card numbers never touch or get saved on our servers.
              </p>
            </div>

            <div className="faqItem">
              <h3 className="faqQuestion">Can I dedicate my donation?</h3>
              <p className="faqAnswer">
                Absolutely. You can include a dedication (in honor of, in memory of, or for a Refuah Sheleimah) in the dedication field of the payment form.
              </p>
            </div>

            <div className="faqItem">
              <h3 className="faqQuestion">Can I donate anonymously?</h3>
              <p className="faqAnswer">
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
