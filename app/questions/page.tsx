import { SiteFooter, SiteHeader } from '../shared/site-shell';
import CommonQuestions from './common-questions';

export default function Page() {
  return (
    <main>
      <SiteHeader />
      <section className="questionsHero">
        <div>
          <p className="eyebrow">COMMON QUESTIONS</p>
          <h1>Clarity begins with the right question.</h1>
          <p>
            Explore practical introductions to frequently encountered situations
            in Hilchos Ribbis. These answers are educational and do not replace
            a personal psak.
          </p>
          <div>
            <a className="primary" href="#common-questions">
              Browse questions ↓
            </a>
            <a href="/bais-horaah">Ask the Bais Horaah →</a>
          </div>
        </div>
        <aside>
          <span>שאלת חכם</span>
          <b>Ask • Understand • Proceed carefully</b>
          <small>Practical awareness for responsible financial decisions</small>
        </aside>
      </section>
      <div id="common-questions">
        <CommonQuestions />
      </div>
      <SiteFooter />
    </main>
  );
}
