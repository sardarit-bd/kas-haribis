import { notFound, redirect } from 'next/navigation';
import data from '../data/current-site.json';
import { InteriorPage } from '../shared/site-shell';

const aliases: Record<string, string> = {
  audios: '/audio',
  shiurim: '/audio',
  'kosher-high-yield-savings-accounts': '/savings',
  'contact-us': '/contact',
};
const headings: Record<
  string,
  { eyebrow: string; title: string; intro: string; items: string[] }
> = {
  programs: {
    eyebrow: 'EDUCATION & OUTREACH',
    title: 'Our Programs',
    intro:
      'Kav Haribis spreads awareness of Hilchos Ribbis through outreach, shiurim, training and practical institutional research.',
    items: [
      'School and community shiurim',
      'Business and community outreach',
      'Financial-institution research',
      'Rabbinical training',
    ],
  },
  'kosher-loan-service': {
    eyebrow: 'KOSHER LOAN SERVICES',
    title: 'Reliable brokers. Kosher deals.',
    intro:
      'Connect with professionals who understand the importance of halachically appropriate financing structures.',
    items: [
      'ISKA Mortgages LLC — Lakewood',
      'Brokers familiar with Heter Iska requirements',
      'Guidance before entering a loan',
      'Submit a broker for review',
    ],
  },
  'kosher-investment-opportunities': {
    eyebrow: 'INVESTMENT GUIDANCE',
    title: 'Kosher Investment Opportunities',
    intro:
      'Educational guidance for evaluating investments, partnerships and ownership structures under Hilchos Ribbis.',
    items: [
      'Investment-structure review',
      'Ownership and control research',
      'Heter Iska assessment',
      'Ask before investing',
    ],
  },
  'kosher-investment-certification': {
    eyebrow: 'CERTIFICATION',
    title: 'Kosher Investment Certification',
    intro:
      'Kav Haribis reviews investment structures for Ribbis concerns and practical halachic compliance.',
    items: [
      'Business-model review',
      'Contract assessment',
      'Rabbinical guidance',
      'Ongoing compliance',
    ],
  },
  'ribis-alerts': {
    eyebrow: 'COMMUNITY UPDATES',
    title: 'Ribbis Alerts',
    intro:
      'Important notices about common financial arrangements, updated guidance and directory changes.',
    items: [
      'Heter Iska guidelines',
      'Loan-agreement warnings',
      'Directory updates',
      'Submit a community tip',
    ],
  },
  halacha: {
    eyebrow: 'LEARNING CENTER',
    title: 'Halacha',
    intro:
      'Practical introductions to common issues in Hilchos Ribbis. Personal questions should be submitted to the Bais Horaah.',
    items: [
      'Loans and repayment',
      'Ribbis through gifts or services',
      'Business partnerships',
      'Sales and payment plans',
    ],
  },
  'about-us': {
    eyebrow: 'ABOUT KAV HARIBIS',
    title: 'Clarity in the laws of Ribbis',
    intro:
      'Kav Haribis is a halachic center focused on outreach, awareness and practical guidance in Hilchos Ribbis.',
    items: [
      'Guidance connected to leading Rabbanim',
      'Public education and awareness',
      'Research into modern finance',
      'Practical resources for Klal Yisroel',
    ],
  },
  'contact-us': {
    eyebrow: 'CONTACT',
    title: 'Get in touch with Kav Haribis',
    intro:
      'Contact us about programs, research, sponsorships or ways to support the work.',
    items: [
      'Kavharibis@gmail.com',
      '732-228-8558',
      'Lakewood, New Jersey 08701',
      'Questions in Hilchos Ribbis: use the Bais Horaah form',
    ],
  },
  contact: {
    eyebrow: 'CONTACT',
    title: 'Get in touch with Kav Haribis',
    intro:
      'Contact us about programs, research, sponsorships or ways to support the work.',
    items: [
      'Kavharibis@gmail.com',
      '732-228-8558',
      'Lakewood, New Jersey 08701',
      'Questions in Hilchos Ribbis: use the Bais Horaah form',
    ],
  },
  seforim: {
    eyebrow: 'PUBLICATIONS',
    title: 'Seforim and Learning Materials',
    intro:
      'Explore Kav Haribis publications designed to make complex halachos practical and accessible.',
    items: [
      'Bris Pinchos publications',
      'Practical Hilchos Ribbis',
      'Student learning booklets',
      'Business kashrus resources',
    ],
  },
  questions: {
    eyebrow: 'LEARNING CENTER',
    title: 'Common Questions',
    intro:
      'Clear introductions to frequently encountered Ribbis situations. These resources do not replace a personal psak.',
    items: [
      'When is a Heter Iska needed?',
      'Do late fees create a concern?',
      'What should business partners review?',
      'How should private loans be structured?',
    ],
  },
};

export default async function SectionPage({
  params,
}: {
  params: Promise<{ section: string }>;
}) {
  const { section } = await params;
  if (aliases[section]) redirect(aliases[section]);
  const page = headings[section];
  if (!page) notFound();
  const source = data.sourcePages.find((item) => item.slug === section);
  return (
    <InteriorPage eyebrow={page.eyebrow} title={page.title} intro={page.intro}>
      <section className="contentPage">
        <div className="contentLead">
          {source?.summary && <p>{source.summary}</p>}
        </div>
        <div className="innerGrid">
          {page.items.map((item, index) => (
            <article key={item}>
              <span>{String(index + 1).padStart(2, '0')}</span>
              <h2>{item}</h2>
            </article>
          ))}
        </div>
        {section.includes('contact') && (
          <div className="contactActions">
            <a className="primary" href="mailto:Kavharibis@gmail.com">
              Email Kav Haribis
            </a>
            <a href="tel:7322288558">Call 732-228-8558</a>
          </div>
        )}
      </section>
    </InteriorPage>
  );
}
