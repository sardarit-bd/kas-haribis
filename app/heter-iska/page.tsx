import { InteriorPage, SiteFooter, SiteHeader } from "../shared/site-shell";
import HeterLibrary from './heter-library';

export default function HeterIska() {
  return (
    <main className="min-h-screen bg-[#fbfaf7]">
      <SiteHeader/>
      <InteriorPage
      eyebrow="AVAILABLE DOCUMENTS"
      title="Choose a Heter Iska"
      intro=" Compare the available forms below. Previewing is free; payment is
            required only for the protected PDF download."
      />
      <section className="relative overflow-hidden bg-red-800 text-white shadow-lg">
        <div className="container py-12 lg:py-16 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8 lg:gap-12 relative z-10">
          <div className="max-w-[820px]">
            <span className="text-[#e7c272] text-xs sm:text-[13px] font-bold tracking-[0.15em] uppercase block mb-2">
              BANKS &amp; PROFESSIONAL LENDERS
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-[34px] font-serif font-medium text-white leading-tight mb-3.5">
              A standard Heter Iska may not be sufficient for your lending structure.
            </h2>
            <p className="text-[#d7e2e8] text-base sm:text-lg leading-relaxed font-normal">
              Standard templates may not address your institution’s ownership, products, agreements, or specific loan terms. Kav Haribis strongly recommends a personalized Heter Iska designed and reviewed for your actual lending structure.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row lg:flex-col gap-3.5 w-full lg:w-auto shrink-0">
            <a style={{color: "#000000"}} href="/personalized-heter-iska" className="inline-flex items-center justify-center w-full lg:w-[310px] h-[52px] px-6 bg-white hover:bg-gray-100 text-black font-bold shadow-md transition-all text-base text-center">
              Request a Personalized Heter Iska
            </a>
            <a href="/heter-iska#targetid" className="inline-flex items-center justify-center w-full lg:w-[310px] h-[52px] px-6 border border-white/40 hover:border-white hover:bg-white/10 text-white font-semibold transition-all text-base text-center">
              Continue to Standard Templates
            </a>
          </div>
        </div>
      </section>
      <section id="targetid">
        <HeterLibrary />
      </section>
      <SiteFooter/>
    </main>
  );
}
