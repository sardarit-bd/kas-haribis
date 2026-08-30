import { SiteFooter, SiteHeader } from '../shared/site-shell';
import BankDirectoryClient from './bank-directory-client';
import BankResearchForm from './bank-research-form';
import BankResearchPopup from './bank-research-popup';
import ResearchAccessGate from './research-access-gate';
import { listBanks } from '../lib/directories';
export const dynamic = 'force-dynamic';

export default async function BankDirectory() {
  const { env } = await import('cloudflare:workers');
  const banks = await listBanks(env.DB);
  return (
    <main>
      <SiteHeader />
      <section className="bankDirectoryHero">
        <div className="bankHeroHeading">
          <p className="eyebrow">KOSHER BANK RESEARCH CENTER</p>
          <h1>Kosher Bank Directory</h1>
          <p>
            Search the Kav Haribis research directory for banks, lenders and
            financial institutions. Review the listed status and open each
            record for additional information.
          </p>
        </div>
        <blockquote className="bankHeroQuote" dir="rtl" lang="he">
          <span aria-hidden="true">״</span>
          <p>
            עוד ראיתי לעורר שמאד נצרך לברר ה״באנק״ השייכין לישראלים ולפרסם
            הרשימות של ה״באנקים״ שיש עליהן חשש רבית למנוע הרבים ממכשול הרבית,
            ומה מאד הי׳ ראוי למנות ע״ז אנשים מוכשרים היודעין לברר ענין זה, ושכרם
            יהי׳ הרבח מאד ובכלל מזכי רבים יחשבו.
          </p>
          <footer>
            <strong>הגאון הרב יחזקאל ראטה זצ״ל</strong>
            <small>Harav Yechezkel Roth zt״l</small>
          </footer>
        </blockquote>
      </section>
      <section
        className="bankResearchVisual"
        aria-label="Kav Haribis financial institution research"
      >
        <img
          src="/kav-brand/bank-research.png"
          alt="Financial institution ownership research and review"
        />
        <div>
          <small>INDEPENDENT RESEARCH</small>
          <b>
            Ownership, structure, and current information—carefully reviewed.
          </b>
        </div>
      </section>
      <section className="bankAuthorityIntro">
        <div className="bankIntroStatement">
          <p className="eyebrow gold">RESEARCH • GUIDANCE • CLARITY</p>
          <h2>Guidelines for the kashrus status of financial institutions</h2>
          <p className="bankIntroLead">
            Kav Haribis has researched financial institutions around the world
            to provide the community with practical guidelines regarding their
            kashrus status.
          </p>
          <div className="bankLeadershipStatement">
            <span aria-hidden="true">״</span>
            <p>
              The Kosher Bank Directory is headed by{' '}
              <strong>Rabbi Yaakov Yitzchok Jacob</strong>, under the guidance
              and with the backing of <strong>Harav Pinchos Vind shlita</strong>
              . Its research is based primarily on the opinions of{' '}
              <strong>Harav Moshe Feinstein zt״l</strong>,{' '}
              <strong>Harav Yosef Shalom Elyashiv zt״l</strong>,{' '}
              <strong>Harav Yisroel Belsky zt״l</strong>, and{' '}
              <strong>Harav Yechezkel Roth zt״l</strong>; and, ybl״c,{' '}
              <strong>Harav Moshe Sternbuch shlita</strong>. The directory has
              also benefited from extensive guidance from{' '}
              <strong>Harav Ari Marburger shlita</strong> and other Rabbanim who
              are experts in this field. The research also considers the
              commonly accepted practice in many kehillos throughout the United
              States.
            </p>
          </div>
        </div>
        <aside className="bankIntroDisclaimers">
          <div>
            <small>HALACHIC TERMINOLOGY</small>
            <h3>How classifications are used</h3>
            <p>
              The terms “problematic” and “not problematic” describe how Kav
              Haribis understands that a financial institution or arrangement
              should be viewed for the relevant halachic analysis. They are not
              general judgments about an institution, its owners, or its
              services.
            </p>
          </div>
          <div>
            <small>INFORMATION DISCLAIMER</small>
            <h3>Independent verification required</h3>
            <p>
              Information concerning entities that are not certified by Kav
              Haribis is provided solely for general informational purposes and
              may be incomplete or outdated. No express or implied warranty is
              made regarding its accuracy, adequacy, completeness, legality,
              reliability, or usefulness. Users are responsible for
              independently verifying all information and obtaining appropriate
              halachic guidance.
            </p>
          </div>
        </aside>
      </section>
      <BankResearchPopup />
      <section
        className="bankStatusGuide"
        aria-labelledby="bank-status-guide-title"
      >
        <div className="bankStatusGuideHeading">
          <span>STATUS GUIDE</span>
          <h2 id="bank-status-guide-title">
            Understand the seven directory levels
          </h2>
          <p>
            These brief labels summarize the current research. Open an
            institution for its specific comments and updated information.
          </p>
        </div>
        <div className="bankStatusLevels">
          <article className="level-mehudar">
            <b>Mehudar</b>
            <small>
              Not problematic; a preferred option based on the current review.
            </small>
          </article>
          <article className="level-kosher">
            <b>Kosher</b>
            <small>
              Not problematic for general use based on the information reviewed.
            </small>
          </article>
          <article className="level-iska">
            <b>Kosher with Heter Iska</b>
            <small>
              Not problematic when the applicable Heter Iska is properly relied
              upon.
            </small>
          </article>
          <article className="level-case">
            <b>Case by case</b>
            <small>
              The status depends on the product, transaction, terms, or
              individual circumstances.
            </small>
          </article>
          <article className="level-question">
            <b>Questionable</b>
            <small>
              A possible concern or uncertainty requires additional guidance.
            </small>
          </article>
          <article className="level-no">
            <b>Not recommended</b>
            <small>
              Problematic for ordinary use unless qualified guidance says
              otherwise.
            </small>
          </article>
          <article className="level-unknown">
            <b>Insufficient information</b>
            <small>
              There is not yet enough reliable information to determine the
              status.
            </small>
          </article>
        </div>
      </section>
      <BankDirectoryClient
        banks={banks.map((bank) => ({ ...bank, source: '' }))}
      />
      <BankResearchForm />
      <SiteFooter />
      <ResearchAccessGate />
    </main>
  );
}
