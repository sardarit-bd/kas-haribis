import { InteriorPage } from '../shared/site-shell';
import AudioLibrary from './audio-library';
import { listAudio } from '../lib/directories';
export const dynamic = 'force-dynamic';
export default async function AudioPage() {
  const { env } = await import('cloudflare:workers');
  const audios = await listAudio(env.DB);
  return (
    <InteriorPage
      eyebrow="SHIURIM & AUDIO"
      title="Kav Haribis Audio Library"
      intro="Listen to short, practical shiurim and discussions about Ribbis and kosher financial conduct. Search by topic or select a language series."
    >
      
      <AudioLibrary
        audios={audios.map((item, index) => ({ ...item, id: index }))}
      />

    </InteriorPage>
  );
}
