import BottomCTA from '../componnent/BottomCTA';
import { listSeforim } from '../lib/seforim';
import { InteriorPage, SiteFooter, SiteHeader } from '../shared/site-shell';
import SeforimCatalog from './seforim-catalog';
export const dynamic = 'force-dynamic';
export default async function SeforimPage() {
  const { env } = await import('cloudflare:workers');
  const books = await listSeforim(env.DB);
  return (
    <>
    <SiteHeader/>
    <InteriorPage
      eyebrow="SEFORIM & PUBLICATIONS"
      title="The Kav Haribis Seforim Collection"
      intro="Browse printed books and protected PDF editions. Every title clearly shows its available format and price."
    />
      <SeforimCatalog books={books} />
      <BottomCTA
        eyebrow="Support Kav Haribis"
        title="Partner with us to spread Torah"
        discription="Your contribution helps us create more seforim and distribute them worldwide."
        link="/contact"
        linktext="Contact Us"
        link2=""
        link2text=""
      />
      <SiteFooter/>
    </>
  );
}
