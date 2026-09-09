import { SiteFooter, SiteHeader } from '../shared/site-shell';
import CommonQuestions from './common-questions';

export default function Page() {
  return (
    <main className="min-h-screen bg-[#f7f3ea] text-slate-800 flex flex-col font-sans">
      <SiteHeader />
      <section className="bg-[#102a43] text-white py-12 md:py-16">
        <div className="container max-w-[1440px] mx-auto px-4 sm:px-8 grid md:grid-cols-12 gap-8 items-center">
          <div className="md:col-span-8">
            <p className="text-[#c69b46] text-xs font-bold tracking-widest uppercase mb-3">COMMON QUESTIONS</p>
            <h1 className="text-4xl sm:text-5xl font-serif text-white font-bold tracking-tight mb-4">Clarity begins with the right question.</h1>
            <p className="text-slate-300 text-lg max-w-2xl mb-8 leading-relaxed">
              Explore practical introductions to frequently encountered situations
              in Hilchos Ribbis. These answers are educational and do not replace
              a personal psak.
            </p>
            <div className="flex flex-wrap gap-4">
              <a style={{ color: 'white' }} className="inline-flex items-center px-6 py-3 rounded-xl bg-[#c69b46] hover:bg-[#b58a35] text-white font-bold text-sm tracking-wide transition shadow-md" href="#common-questions">
                Browse questions ↓
              </a>
              <a style={{ color: 'white' }} className="inline-flex items-center px-6 py-3 rounded-xl text-slate-200 hover:text-white font-medium text-sm transition bg-slate-800/40" href="/bais-horaah">Ask the Bais Horaah →</a>
            </div>
          </div>
          <aside className="md:col-span-4 bg-white/10 backdrop-blur-md border border-white/20 p-6 rounded-2xl text-center shadow-xl">
            <span className="text-3xl font-serif text-[#c69b46] block mb-2">שאלת חכם</span>
            <b className="text-xl font-serif text-white block mb-2 leading-tight">Ask • Understand • Proceed carefully</b>
            <small className="text-slate-300 text-xs tracking-wider uppercase block">Practical awareness for responsible financial decisions</small>
          </aside>
        </div>
      </section>
      <div id="common-questions" className="max-w-[1440px] mx-auto px-4 sm:px-8 py-10 w-full">
        <CommonQuestions />
      </div>
      <SiteFooter />
    </main>
  );
}

