import { InteriorPage } from '../shared/site-shell';
import SeforimCatalog from './seforim-catalog';
import { listSeforim } from '../lib/seforim';
export const dynamic = 'force-dynamic';
export default async function SeforimPage() {
  const { env } = await import('cloudflare:workers');
  const books = await listSeforim(env.DB);
  return (
    <InteriorPage
      eyebrow="SEFORIM & PUBLICATIONS"
      title="The Kav Haribis Seforim Collection"
      intro="Browse printed books and protected PDF editions. Every title clearly shows its available format and price."
    >
      <SeforimCatalog books={books} />
    </InteriorPage>
  );
}
