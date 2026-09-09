const BottomCTA = ({ eyebrow, title, discription, link, linktext, link2, link2text }) => {
  return (
    <section className="container max-w-[1440px] mx-auto px-4 sm:px-8">
      <div className="bg-[#102a43] text-white p-8 sm:p-12 md:p-[50px] flex flex-col items-center justify-between text-center gap-8 md:gap-[50px] my-10">
        <div className="max-w-[880px] mx-auto">
          {eyebrow && (
            <p className="text-[#c69b46] font-bold text-xs tracking-widest uppercase mb-3">
              {eyebrow}
            </p>
          )}
          {title && (
            <h2 className="text-white text-2xl sm:text-4xl font-bold mb-4">
              {title}
            </h2>
          )}
          {discription && (
            <p className="text-[#d0dce3] text-sm sm:text-base leading-[1.75]">
              {discription}
            </p>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-5">
          {link && (
            <a
              href={link}
              className="px-5 py-3.5 bg-[#c69b46] hover:bg-[#b08738] text-white font-extrabold text-sm text-center transition-colors shadow-sm"
            >
              {linktext}
            </a>
          )}

          {link2 && (
            <a
              href={link2}
              className="px-5 py-3.5 text-[#e9e9e9] hover:text-white border border-[#747474] hover:border-slate-400 font-extrabold text-sm text-center transition-colors"
            >
              {link2text}
            </a>
          )}
        </div>
      </div>
    </section>
  );
};

export default BottomCTA;