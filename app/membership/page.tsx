import { SiteFooter, SiteHeader } from '../shared/site-shell';
const benefits = [
  {
    mark: '01',
    title: 'Free membership',
    text: 'Create a free Kav Haribis account and keep your information organized in one place.',
  },
  {
    mark: '02',
    title: 'Newsletters & alerts',
    text: 'Choose the Kav Haribis publications and important Ribbis updates you would like to receive.',
  },
  {
    mark: '03',
    title: 'Member-only notices',
    text: 'Optionally receive announcements about Kav Haribis service discounts and special opportunities.',
  },
  {
    mark: '04',
    title: 'Personal dashboard',
    text: 'Manage your member information and communication preferences from your private Kav Haribis account.',
  },
  {
    mark: '05',
    title: 'Book-order history',
    text: 'Future Kav Haribis seforim purchases can appear in your organized order-history section.',
  },
  {
    mark: '06',
    title: 'Built for the future',
    text: 'Your Kav Haribis member record is ready to preserve future orders and support expanding member services.',
  },
];
export default function MembershipPage() {
  return (
    <main className="readingCirclePage">
      <SiteHeader />
      <section className="readingCircleHero">
        <div className="readingCircleGlow one" />
        <div className="readingCircleGlow two" />
        <div className="readingCircleHeroCopy">
          <p className="eyebrow">KAV HARIBIS MEMBERSHIP</p>
          <h1>
            Stay connected.
            <br />
            <em>Keep learning.</em>
          </h1>
          <p>
            A free Kav Haribis membership for publications, alerts, account
            preferences, and future book orders—all organized in one secure
            place.
          </p>
          <div>
            <a className="primary" href="/membership/account">
              Join Kav Haribis →
            </a>
            <a href="/membership/account">Member login →</a>
          </div>
          <small>
            This membership belongs exclusively to the Kav Haribis organization.
          </small>
        </div>
        <aside className="readingCircleCard">
          <div className="readingCircleSeal">
            <span>KH</span>
            <i>MEMBERSHIP</i>
          </div>
          <p>MEMBER No.</p>
          <strong>0001</strong>
          <div>
            <span>READ</span>
            <span>LEARN</span>
            <span>CONNECT</span>
          </div>
        </aside>
      </section>
      <section className="readingCircleIntro">
        <div>
          <p className="eyebrow gold">A BETTER WAY TO STAY CONNECTED</p>
          <h2>Your Kav Haribis member home</h2>
        </div>
        <p>
          Kav Haribis Membership brings communication preferences, publications,
          and purchasing records together in a private account. New members can
          register at no charge, and existing members can return to manage their
          information.
        </p>
      </section>
      <section className="readingCircleBenefits">
        <div className="readingCircleSectionHead">
          <div>
            <p className="eyebrow gold">MEMBERSHIP BENEFITS</p>
            <h2>Everything in one place</h2>
          </div>
          <p>
            You control what you receive. Newsletter, Ribbis Alert, and discount
            notifications can be selected according to your preferences.
          </p>
        </div>
        <div className="readingCircleGrid">
          {benefits.map((item) => (
            <article key={item.mark}>
              <span>{item.mark}</span>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </article>
          ))}
        </div>
      </section>
      <section className="readingCircleOrders">
        <div>
          <p className="eyebrow">ORDER HISTORY</p>
          <h2>Ready for every future sefer order</h2>
          <p>
            Your Kav Haribis member account includes a dedicated book-order
            history. If no orders are connected yet, the dashboard displays a
            clear empty message and remains ready for future purchases.
          </p>
        </div>
        <aside>
          <span>YOUR KAV HARIBIS LIBRARY</span>
          <div className="bookSpine one" />
          <div className="bookSpine two" />
          <div className="bookSpine three" />
          <small>Future orders, neatly organized.</small>
        </aside>
      </section>
      <section className="readingCircleCta">
        <div>
          <p className="eyebrow gold">FREE TO JOIN</p>
          <h2>Become a Kav Haribis member</h2>
          <p>
            Register, choose your preferences, and begin building your Kav
            Haribis member history.
          </p>
        </div>
        <a className="primary" href="/membership/account">
          Create or open your account →
        </a>
      </section>
      <SiteFooter />
    </main>
  );
}
