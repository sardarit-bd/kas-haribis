import { InteriorPage } from '../shared/site-shell';
import PersonalizedHeterForm from './request-form';

export default function PersonalizedHeterIskaPage() {
  return (
    <InteriorPage
      eyebrow="PERSONALIZED HETER ISKA SERVICE"
      title="A Heter Iska designed for your actual lending structure"
      intro="For banks, mortgage companies, private lenders, businesses, and institutions whose ownership, products, agreements, or loan terms may not be properly addressed by a standard template."
    >
      <section className="personalizedHeterIntro">
        <div className="personalizedHeterCopy">
          <p className="eyebrow gold">TAILORED REVIEW</p>
          <h2>Request a Personalized Heter Iska</h2>
          <p>
            Tell Kav Haribis about your institution and lending structure. The
            information you provide will help our team understand the
            arrangement and determine what additional documents or details may
            be needed.
          </p>
          <div className="personalizedPriceCard">
            <small>STANDARD SERVICE FEE</small>
            <strong>$250</strong>
            <p>
              As a nonprofit organization, Kav Haribis offers a discounted price
              of <b>$120</b> to anyone who would like it. Simply check the
              discount box in the request form.
            </p>
          </div>
          <ul>
            <li>Institution and ownership information</li>
            <li>Loan products and agreement structure</li>
            <li>Existing Heter Iska or supporting documents</li>
            <li>Direct follow-up from Kav Haribis</li>
          </ul>
          <small className="personalizedNote">
            Submitting this form is a request for service. Payment and any
            additional information will be arranged after the request is
            reviewed.
          </small>
        </div>
        <PersonalizedHeterForm />
      </section>
    </InteriorPage>
  );
}
