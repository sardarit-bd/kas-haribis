import BottomCTA from '../componnent/BottomCTA';
import { SiteFooter, SiteHeader } from '../shared/site-shell';
import CommonQuestions from './common-questions';

export default function Page() {
  return (
    <main className="min-h-screen bg-[#f7f3ea] text-slate-800 flex flex-col font-sans">
      <SiteHeader />
      <div id="common-questions" className="max-w-[1440px] mx-auto px-4 sm:px-8 py-10 w-full">
        <CommonQuestions />
      </div>




      {/* Bottom CTA Banner */}
      <BottomCTA
        eyebrow={"NEED PERSONAL GUIDANCE?"}
        title={"Your question may depend on details not shown here."}
        discription={"Send the Bais Horaah the parties, amounts, timing, documents, and complete background for review."}
        link="/bais-horaah"
        linktext="Ask the Bais Horaah →"
        link2=""
        link2text=""
      />

      <SiteFooter />
    </main>
  );
}

