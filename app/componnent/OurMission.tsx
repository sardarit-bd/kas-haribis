export default function OurMission() {
  return (
    <section className="py-16 md:py-24 bg-gray-200">
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
            <h3 className="text-2xl sm:text-3xl lg:text-4xl font-semibold text-[#102a43] tracking-tight leading-tight mb-4">
              Making Hilchos Ribbis understandable, accessible, and practical.
            </h3>
            <p className="text-slate-600 text-base sm:text-lg leading-relaxed text-center md:text-left font-normal">
              Modern financial arrangements can involve mortgages, business financing, investments, payment plans, banking products, and partnerships. Each may require careful Halachic consideration.
            </p>
            
            <p className="text-slate-600 text-base sm:text-lg leading-relaxed text-center md:text-left font-normal">
              Kav Haribis combines Torah education with practical research so that questions can be recognized early and addressed responsibly.
            </p>
            <div className="pt-2 flex justify-center md:justify-start">
              <a
                href="/about-us"
                className="inline-flex items-center gap-2.5 px-5 py-3.5 pBG hover:bg-[#173f5f] text-white font-semibold text-sm sm:text-base shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5"
              >
                <span className="text-white">Learn about the organization</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
