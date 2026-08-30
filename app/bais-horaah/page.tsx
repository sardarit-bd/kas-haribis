import { InteriorPage } from '../shared/site-shell';
import BaisHoraahQuestionForm from './question-form';

export default function BaisHoraahPage() {
  return (
    <InteriorPage
      eyebrow="BAIS HORAAH · RIBBIS GUIDANCE HOTLINE"
      title="Direct halachic guidance at your fingertips"
      intro="Our dedicated Rabbanim are available to help with questions relating to Ribbis and financial halacha—from everyday loan arrangements to complex business transactions."
    >
      <section className="baisHoraahIntro">
        <div className="baisHoraahLead">
          <p className="eyebrow gold">SPEAK TO A RAV</p>
          <h2>Clarity before you sign, borrow, lend, or invest</h2>
          <p>
            Whether you are reviewing a loan agreement, need guidance about a
            Heter Iska, or are dealing with a complicated financial arrangement,
            the Bais Horaah is here to help you keep the transaction fully
            aligned with halacha.
          </p>
          <div className="hotlineActions">
            <a className="primary" href="tel:7322288558">
              <span>☎</span>
              <div>
                <small>RIBBIS HOTLINE</small>
                <b>732-228-8558</b>
              </div>
            </a>
            <a href="mailto:kavharibis@gmail.com">
              <span>✉</span>
              <div>
                <small>EMAIL A QUESTION</small>
                <b>kavharibis@gmail.com</b>
              </div>
            </a>
          </div>
          <small className="hotlineNote">
            For urgent or time-sensitive matters, please call. Never include
            account numbers, card numbers, passwords, or other sensitive
            financial information.
          </small>
        </div>
        <div className="horaahVisual">
          <img
            src="/kav-brand/bais-horaah.png"
            alt="A quiet rabbinical study prepared for confidential questions"
          />
          <div>
            <span>בית הוראה</span>
            <b>Confidential. Practical. Grounded in Halacha.</b>
          </div>
        </div>
      </section>
      <section className="horaahHelpSection">
        <div className="sectionHead">
          <div>
            <p className="eyebrow gold">HOW WE CAN HELP</p>
            <h2>Questions we regularly address</h2>
          </div>
          <p>
            Ask before completing the transaction whenever possible. Include the
            full arrangement so the Rav can understand who is giving, receiving,
            guaranteeing, and benefiting.
          </p>
        </div>
        <div className="horaahTopicGrid">
          <article>
            <span>01</span>
            <h3>Loans & repayment</h3>
            <p>
              Personal loans, business loans, late fees, guarantees, repayment
              benefits, and extensions.
            </p>
          </article>
          <article>
            <span>02</span>
            <h3>Heter Iska guidance</h3>
            <p>
              Whether one is needed, which document is appropriate, and how it
              must be completed or signed.
            </p>
          </article>
          <article>
            <span>03</span>
            <h3>Business arrangements</h3>
            <p>
              Partnerships, investments, seller financing, merchant advances,
              and profit-sharing agreements.
            </p>
          </article>
          <article>
            <span>04</span>
            <h3>Banking & finance</h3>
            <p>
              Mortgages, credit products, savings accounts, refinancing, and
              financial-institution questions.
            </p>
          </article>
        </div>
      </section>
      <section className="horaahSubmitSection" id="submit-question">
        <div className="horaahSubmitCopy">
          <p className="eyebrow">SUBMIT YOUR QUESTION</p>
          <h2>Send the details securely</h2>
          <p>
            Your submission is saved in the private Bais Horaah administrator
            inbox. You will receive a reference number immediately.
          </p>
          <ul>
            <li>Describe the complete arrangement</li>
            <li>Identify all relevant parties and their roles</li>
            <li>Mention any deadlines or documents already signed</li>
            <li>Select how you prefer to receive a response</li>
          </ul>
          <aside>
            <b>This form is for halachic questions.</b>
            <span>
              For programs, sponsorships, seforim, or general inquiries, please
              use the <a href="/contact">Contact page</a>.
            </span>
          </aside>
        </div>
        <BaisHoraahQuestionForm />
      </section>
      <section className="horaahProcess">
        <p className="eyebrow gold">WHAT HAPPENS NEXT</p>
        <h2>A clear, confidential process</h2>
        <div>
          <article>
            <b>1</b>
            <h3>Submit the facts</h3>
            <p>Send the relevant details and your preferred contact method.</p>
          </article>
          <article>
            <b>2</b>
            <h3>Rabbinical review</h3>
            <p>
              The question is reviewed and may require follow-up information.
            </p>
          </article>
          <article>
            <b>3</b>
            <h3>Receive guidance</h3>
            <p>
              A response is provided through the selected contact method when
              possible.
            </p>
          </article>
        </div>
      </section>
    </InteriorPage>
  );
}
