import { SiteFooter, SiteHeader } from '../shared/site-shell';
import GenealogyRequestForm from './request-form';

export default function GenealogyServicesPage() {
  return (
    <main className="genealogyPage">
      <SiteHeader />
      <section className="genealogyHero">
        <img
          src="/genealogy-hero.png"
          alt="Historical family records, a family tree, and archival genealogy research materials"
        />
        <div className="genealogyHeroShade" />
        <div className="genealogyHeroCopy">
          <p className="eyebrow">GENEALOGY &amp; OWNERSHIP RESEARCH</p>
          <h1>Clarity begins with knowing the full story.</h1>
          <p>
            Kav Haribis has partnered with experienced genealogists to help
            investigate and clarify potentially problematic ownership.
          </p>
          <a className="primary" href="#genealogy-request">
            Request Research →
          </a>
        </div>
      </section>

      <section className="genealogyIntroduction">
        <div>
          <p className="eyebrow gold">EXPERIENCED RESEARCH SUPPORT</p>
          <h2>Careful research for complex ownership questions</h2>
          <p>
            Determining the ownership of a financial institution, business,
            trust, or investment can require more than a simple online search.
            Corporate records, family relationships, historical documents, and
            changes in control may all be relevant.
          </p>
          <p>
            Through experienced genealogy researchers, Kav Haribis can help
            organize and investigate these details so that the appropriate
            questions can be presented clearly for further review.
          </p>
        </div>
        <aside>
          <span>KH</span>
          <p>
            This research service helps gather and clarify facts. It does not
            itself provide a halachic ruling, legal opinion, or guarantee of
            ownership.
          </p>
        </aside>
      </section>

      <section className="genealogyUses">
        <div className="sectionHead">
          <div>
            <p className="eyebrow gold">HOW WE MAY HELP</p>
            <h2>Research built around your question</h2>
          </div>
          <p>
            Every matter is different. We will first review your request,
            determine whether the research is appropriate, and discuss pricing
            before work begins.
          </p>
        </div>
        <div className="genealogyUseGrid">
          <article>
            <span>01</span>
            <h3>Ownership clarification</h3>
            <p>
              Investigate individuals, families, trusts, parent companies, and
              other relationships that may affect how an entity is understood.
            </p>
          </article>
          <article>
            <span>02</span>
            <h3>Historical records</h3>
            <p>
              Trace names, family connections, locations, and historical records
              when older information may help clarify the present situation.
            </p>
          </article>
          <article>
            <span>03</span>
            <h3>Ethical research needs</h3>
            <p>
              Our research may also assist with other legitimate and ethical
              genealogy purposes. Contact us to ask whether we can help.
            </p>
          </article>
        </div>
      </section>

      <section className="genealogyProcess">
        <div>
          <p className="eyebrow">A CLEAR PROCESS</p>
          <h2>What happens after you submit?</h2>
        </div>
        <ol>
          <li>
            <b>Share the question</b>
            <span>
              Tell us what you need clarified and provide the information you
              already have.
            </span>
          </li>
          <li>
            <b>Scope and pricing</b>
            <span>
              We will determine what research may be possible and contact you
              about timing and pricing.
            </span>
          </li>
          <li>
            <b>Research and findings</b>
            <span>
              An experienced researcher will examine appropriate records and
              organize the relevant findings.
            </span>
          </li>
        </ol>
      </section>

      <section className="genealogyRequest" id="genealogy-request">
        <div className="genealogyRequestCopy">
          <p className="eyebrow gold">REQUEST GENEALOGY RESEARCH</p>
          <h2>Tell us what you need investigated</h2>
          <p>
            Include as much helpful background as possible. Do not submit Social
            Security numbers, account numbers, passwords, or other highly
            sensitive personal information.
          </p>
          <div className="genealogyContactNote">
            <b>Pricing is determined after review.</b>
            <span>Submitting this form does not obligate you to proceed.</span>
          </div>
        </div>
        <GenealogyRequestForm />
      </section>
      <SiteFooter />
    </main>
  );
}
