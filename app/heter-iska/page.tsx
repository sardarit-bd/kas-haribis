import HeterLibrary from './heter-library';

export default function HeterIska() {
  return (
    <main className="heterPage">
      <header className="innerHeader">
        <a className="brand" href="/">
          <span className="brandMark">KH</span>
          <span>
            <b>Kav Haribis</b>
            <small>קו הריבית</small>
          </span>
        </a>
        <a href="/">← Return home</a>
      </header>
      <section className="innerHero heterHero">
        <img
          className="heterHeroImage"
          src="/kav-brand/heter-iska.png"
          alt="A carefully prepared agreement in a professional library setting"
        />
        <div className="heterHeroCopy">
          <p className="eyebrow">
            HETER ISKA DOCUMENT LIBRARY · RABBINICALLY GUIDED
          </p>
          <h1>Heter Iska</h1>
          <p className="heterHeroLead">
            Review and choose the right rabbinically approved Heter Iska
            template for your business or personal loan arrangements.
          </p>
          <p>
            Preview every document before choosing. When you are ready, purchase
            a protected downloadable copy for $25.
          </p>
        </div>
        <aside className="heterQuotePanel">
          <div className="heterHeroSeal" aria-hidden="true">
            <b>היתר</b>
            <span>עיסקא</span>
            <small>KAV HARIBIS</small>
          </div>
          <blockquote dir="rtl" lang="he">
            וזה לשון היערות דבש (דף קכד): ״וכבר מצאו חז״ל נוחי נפש תקנה בעשיית
            שטר עיסקא, אבל צריך להזהר בו ולעשות הכל כדינו כי רבו דיניה ויקצר
            הזמן והיריעה לדורשו ברבים, אבל מ״מ מי האיש החפץ חיים ולקום בתחיית
            המתים ישאל פי חכם בעשותו הלואה כזו״ עכ״ל.
          </blockquote>
        </aside>
      </section>
      <section
        className="customHeterAdvisory"
        aria-labelledby="custom-heter-heading"
      >
        <div className="customHeterIcon" aria-hidden="true">
          !
        </div>
        <div className="customHeterCopy">
          <p>BANKS &amp; PROFESSIONAL LENDERS</p>
          <h2 id="custom-heter-heading">
            A standard Heter Iska may not be sufficient for your lending
            structure.
          </h2>
          <p>
            Standard templates may not address your institution’s ownership,
            products, agreements, or specific loan terms. Kav Haribis strongly
            recommends a personalized Heter Iska designed and reviewed for your
            actual lending structure.
          </p>
        </div>
        <div className="customHeterActions">
          <a className="customHeterPrimary" href="/personalized-heter-iska">
            Request a Personalized Heter Iska
          </a>
          <a className="customHeterSecondary" href="#document-library">
            Continue to Standard Templates
          </a>
        </div>
      </section>
      <HeterLibrary />
      <footer>
        <div className="brand light">
          <span className="brandMark">KH</span>
          <span>
            <b>Kav Haribis</b>
            <small>קו הריבית</small>
          </span>
        </div>
        <a href="/">Return home</a>
      </footer>
    </main>
  );
}
