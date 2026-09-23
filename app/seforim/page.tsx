import BottomCTA from '../componnent/BottomCTA';
import { listSeforim } from '../lib/seforim';
import { MotionDiv } from '../shared/motion-components';
import { InteriorPage, SiteFooter, SiteHeader } from '../shared/site-shell';
import SeforimCatalog from './seforim-catalog';
export const dynamic = 'force-dynamic';
export default async function SeforimPage() {
  const { env } = await import('cloudflare:workers');
  const books = await listSeforim(env.DB);
  return (
    <>
      <SiteHeader/>
      <MotionDiv
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      >
        <InteriorPage
          eyebrow="SEFORIM & PUBLICATIONS"
          title="The Kav Haribis Seforim Collection"
          intro="Browse printed books and protected PDF editions. Every title clearly shows its available format and price."
        />
      </MotionDiv>
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

