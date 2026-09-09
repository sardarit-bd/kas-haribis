import { SiteFooter, SiteHeader } from "../shared/site-shell";
import HeterLibrary from './heter-library';

export default function HeterIska() {
  return (
    <main className="min-h-screen bg-[#fbfaf7]">
      <SiteHeader/>
      <section className="relative overflow-hidden bg-gradient-to-br from-[#071728] via-[#102a43] to-[#0e304b] text-white border-b-2 border-[#c69b46]">
        <div className="container max-w-[1440px] mx-auto px-4 sm:px-8 py-14 md:py-20 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center relative z-10">
          {/* Image & Copy */}
          <div className="lg:col-span-7 space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
              <img
                className="w-28 h-28 object-cover rounded-2xl border-2 border-[#c69b46]/40 shadow-lg shrink-0"
                src="/kav-brand/heter-iska.png"
                alt="A carefully prepared agreement in a professional library setting"
              />
              <div className="space-y-2">
                <p className="text-[#c69b46] font-bold text-xs tracking-widest uppercase">
                  HETER ISKA DOCUMENT LIBRARY · RABBINICALLY GUIDED
                </p>
                <h1 className="text-white font-serif font-bold text-3xl sm:text-4xl md:text-5xl leading-tight">Heter Iska</h1>
              </div>
            </div>
            <p className="text-[#cbd5e1] text-base sm:text-lg leading-relaxed max-w-2xl font-medium">
              Review and choose the right rabbinically approved Heter Iska
              template for your business or personal loan arrangements.
            </p>
            <p className="text-[#94a3b8] text-sm leading-relaxed max-w-xl">
              Preview every document before choosing. When you are ready, purchase
              a protected downloadable copy for $25.
            </p>
          </div>

          {/* Quote Panel */}
          <aside className="lg:col-span-5 p-6 sm:p-8 border border-[#c69b46]/50 rounded-2xl bg-[#071728]/85 backdrop-blur-md shadow-2xl space-y-4">
            <div className="flex items-center gap-3 border-b border-white/10 pb-4" aria-hidden="true">
              <div className="w-10 h-10 rounded-full bg-[#c69b46] text-[#071728] font-serif font-bold text-xs flex items-center justify-center flex-col leading-none">
                <b>היתר</b>
                <span className="text-[9px]">עיסקא</span>
              </div>
              <small className="text-[#c69b46] font-mono font-bold text-[10px] tracking-widest uppercase">KAV HARIBIS</small>
            </div>
            <blockquote dir="rtl" lang="he" className="font-serif text-lg sm:text-xl text-[#f1f5f9] leading-relaxed m-0">
              וזה לשון היערות דבש (דף קכד): ״וכבר מצאו חז״ל נוחי נפש תקנה בעשיית
              שטר עיסקא, אבל צריך להזהר בו ולעשות הכל כדינו כי רבו דיניה ויקצר
              הזמן והיריעה לדורשו ברבים, אבל מ״מ מי האיש החפץ חיים ולקום בתחיית
              המתים ישאל פי חכם בעשותו הלואה כזו״ עכ״ל.
            </blockquote>
          </aside>
        </div>
      </section>

      {/* Custom Heter Advisory Section */}
      <section
        className="container max-w-[1440px] mx-auto px-4 sm:px-8 my-10"
        aria-labelledby="custom-heter-heading"
      >
        <div className="p-6 sm:p-8 bg-[#fff7e5] border border-[#f3e4bc] rounded-2xl shadow-sm flex flex-col md:flex-row items-start gap-6">
          <div className="w-10 h-10 rounded-full bg-[#c69b46] text-[#071728] font-bold text-xl flex items-center justify-center shrink-0" aria-hidden="true">
            !
          </div>
          <div className="flex-1 space-y-2">
            <p className="text-[#876622] font-bold text-xs tracking-widest uppercase">BANKS &amp; PROFESSIONAL LENDERS</p>
            <h2 id="custom-heter-heading" className="text-xl sm:text-2xl font-serif font-bold text-[#102a43]">
              A standard Heter Iska may not be sufficient for your lending
              structure.
            </h2>
            <p className="text-sm text-[#556673] leading-relaxed">
              Standard templates may not address your institution’s ownership,
              products, agreements, or specific loan terms. Kav Haribis strongly
              recommends a personalized Heter Iska designed and reviewed for your
              actual lending structure.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row md:flex-col gap-3 shrink-0 w-full md:w-auto pt-2 md:pt-0">
            <a className="px-5 py-3 bg-[#102a43] hover:bg-[#1a385c] text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-colors text-center shadow-sm" href="/personalized-heter-iska">
              Request a Personalized Heter Iska
            </a>
            <a className="px-5 py-3 bg-white border border-[#cbd5da] hover:bg-[#f8fafc] text-[#102a43] text-xs font-bold uppercase tracking-wider rounded-xl transition-colors text-center" href="#document-library">
              Continue to Standard Templates
            </a>
          </div>
        </div>
      </section>

      <HeterLibrary />
      <SiteFooter/>
    </main>
  );
}
