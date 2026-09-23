import BottomCTA from '../componnent/BottomCTA';
import { listAudio } from '../lib/directories';
import { MotionDiv } from '../shared/motion-components';
import { InteriorPage, SiteFooter, SiteHeader } from '../shared/site-shell';
import AudioLibrary from './audio-library';
export const dynamic = 'force-dynamic';
export default async function AudioPage() {
  const { env } = await import('cloudflare:workers');
  const audios = await listAudio(env.DB);
  return (
    <>
      <SiteHeader/>
      <MotionDiv
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      >
        <InteriorPage
          eyebrow="SHIURIM & AUDIO"
          title="Kav Haribis Audio Library"
          intro="Explore our collection of insightful audio shiurim and discussions on ribbis and kosher banking. Featuring expert guidance from leading Rabbanim, these recordings are here to help you stay informed, inspired, and educated—wherever you are. "
        />
      </MotionDiv>

      <AudioLibrary
        audios={audios.map((item, index) => ({ ...item, id: index }))}
      />

      {/* CTA Section Banner */}
      <BottomCTA eyebrow={"SCHOOLS AND EDUCATORS"} title={"Want a Ribbis curriculum for your school?"} discription={"Reach out and see what we can do for you. We can explore age-appropriate lessons, workshops, and educational materials designed for your students."} link="/bais-horaah" linktext="Start a conversation" link2="" link2text=""/>

      <SiteFooter/>
    </>
  );
}

