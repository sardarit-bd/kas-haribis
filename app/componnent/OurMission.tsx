export default function OurMission() {
  return (
    <section className="py-16 md:py-24 bg-[#f7f3ea]">
      <div className="container max-w-[1440px] mx-auto px-4 sm:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="overflow-hidden shadow-xl border border-slate-200/80">
            <img
              className="w-full h-auto object-cover"
              src="/kav-brand/mission-visual-v2.png"
              alt="A traditional library passage opening toward a modern financial district"
            />
          </div>

          <div className="flex flex-col gap-5 text-[#172431]">
            <span className="text-[#c69b46] font-bold text-xs tracking-widest uppercase hidden">
              OUR MISSION
            </span>
            <h2 className="text-3xl sm:text-5xl font-meduim text-[#102a43] leading-tight text-center md:text-left">
              Making Hilchos Ribbis understandable, accessible, and practical.
            </h2>
            <p className="text-slate-600 text-sm sm:text-lg leading-relaxed text-center md:text-left">
              Modern financial arrangements can involve mortgages, business financing, investments, payment plans, banking products, and partnerships. Each may require careful Halachic consideration.
            </p>
            <p className="text-slate-600 text-sm sm:text-lg leading-relaxed text-center md:text-left">
              Kav Haribis combines Torah education with practical research so that questions can be recognized early and addressed responsibly.
            </p>
            <div className="pt-2 flex justify-center md:justify-start">
              <a
                href="/about-us"
                className="inline-flex items-center gap-2 px-6 py-2.5 sm:px-8 sm:py-3 bg-[#102a43] hover:bg-[#173f5f] text-white font-bold text-xs sm:text-sm  shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5"
              >
                <span className="text-white font-meduim">Learn about the organization</span>
                <span className="text-white">→</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
