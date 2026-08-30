import { InteriorPage } from '../shared/site-shell';
import ContactForm from './contact-form';

export default function ContactPage() {
  return (
    <InteriorPage
      eyebrow="CONTACT KAV HARIBIS"
      title="We’re here to help"
      intro="Reach out about programs, research, sponsorship opportunities, publications, or ways to support the work of Kav Haribis."
    >
      <section className="contactServiceHub">
        <div>
          <p className="eyebrow gold">ONE PLACE FOR EVERY REQUEST</p>
          <h2>How would you like to connect?</h2>
          <p>
            Choose the appropriate request in the form below. Your submission
            will be routed and organized automatically.
          </p>
        </div>
        <div className="contactServiceCards">
          <article>
            <span>01</span>
            <b>Bank information</b>
            <p>Share new research or request a correction to a bank listing.</p>
          </article>
          <article>
            <span>02</span>
            <b>Programs & speaking</b>
            <p>
              Request a school, business, community, or professional
              presentation.
            </p>
          </article>
          <article>
            <span>03</span>
            <b>Certification</b>
            <p>
              Ask about investment, business, or financial-structure review.
            </p>
          </article>
          <article>
            <span>04</span>
            <b>Community support</b>
            <p>
              Business listings, sponsorships, publications, and general
              inquiries.
            </p>
          </article>
        </div>
      </section>
      <section className="modernContactPage">
        <div className="contactInformation">
          <p className="eyebrow gold">GET IN TOUCH</p>
          <h2>How can we help?</h2>
          <p>
            Choose the most convenient way to contact us. For a personal
            question in Hilchos Ribbis, please use the dedicated Bais Horaah
            form so the correct details reach the rabbinical team.
          </p>
          <div className="contactMethodList">
            <a href="mailto:Kavharibis@gmail.com">
              <span>✉</span>
              <div>
                <small>EMAIL</small>
                <b>Kavharibis@gmail.com</b>
              </div>
              <strong>→</strong>
            </a>
            <a href="tel:7322288558">
              <span>☎</span>
              <div>
                <small>PHONE</small>
                <b>732-228-8558</b>
              </div>
              <strong>→</strong>
            </a>
            <div>
              <span>⌖</span>
              <div>
                <small>LOCATION</small>
                <b>Lakewood, New Jersey 08701</b>
              </div>
            </div>
          </div>
          <aside className="baisHoraahContactCard">
            <div>
              <small>HILCHOS RIBBIS QUESTIONS</small>
              <h3>Need guidance from the Bais Horaah?</h3>
              <p>
                Use the private question form to include the relevant details
                and your preferred response method.
              </p>
            </div>
            <a href="/bais-horaah">Submit a question →</a>
          </aside>
        </div>
        <ContactForm />
      </section>
    </InteriorPage>
  );
}
