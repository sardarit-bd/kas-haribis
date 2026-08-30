import CheckoutNotice from '../shared/checkout-notice';
export default function Donate() {
  return (
    <main>
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
      <section className="innerHero">
        <p className="eyebrow">SECURE DONATION</p>
        <h1>Partner in the work of Kav Haribis.</h1>
        <p>
          Support Torah education, research, publications and access to reliable
          guidance.
        </p>
      </section>
      <CheckoutNotice kind="donation" amount="Custom amount" />
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
