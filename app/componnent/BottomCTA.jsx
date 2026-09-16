const BottomCTA = ({ eyebrow, title, discription, link, linktext, link2, link2text }) => {
  return (
    <section className="bg-gray-200 py-12">
    <section className="container max-w-[1440px] mx-auto px-4 sm:px-8">
      <div className="bg-[#102a43] text-white p-8 sm:p-12 md:p-[50px] flex flex-col items-center justify-between text-center gap-8 md:gap-[50px]">
        <div className="max-w-[880px] mx-auto">
          {title && (
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-semibold text-white leading-tight mb-4 tracking-tight">
              {title}
            </h2>
          )}
          {discription && (
            <p className="text-slate-200 text-base sm:text-lg leading-relaxed font-normal">
              {discription}
            </p>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-5">
          {link && (
            <a
              href={link}
              style={{ color: 'black' }}
              className="inline-flex items-center gap-2.5 px-6 py-3.5 bg-white text-black font-semibold text-sm sm:text-base shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5"
            >
              <span>{linktext}</span>
            </a>
          )}

          {link2 && link2 !== link && (
            <a
              href={link2}
              className="inline-flex items-center gap-2.5 px-6 py-3.5 bg-white/10 hover:bg-white/20 text-white font-semibold text-sm sm:text-base border border-white/20 transition-all duration-300"
            >
              <span>{link2text}</span>
            </a>
          )}
        </div>
      </div>
    </section>
    </section>
  );
};

export default BottomCTA;