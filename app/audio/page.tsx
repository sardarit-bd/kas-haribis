import BottomCTA from '../componnent/BottomCTA';
import { listAudio } from '../lib/directories';
import { InteriorPage } from '../shared/site-shell';
import AudioLibrary from './audio-library';
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

      {/* CTA Section Banner */}
      <BottomCTA eyebrow={"SCHOOLS AND EDUCATORS"} title={"Want a Ribbis curriculum for your school?"} discription={"Reach out and see what we can do for you. We can explore age-appropriate lessons, workshops, and educational materials designed for your students."} link="/bais-horaah" linktext="Start a conversation →" link2="" link2text=""/>

    </InteriorPage>
  );
}
