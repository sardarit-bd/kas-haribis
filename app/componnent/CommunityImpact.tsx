const impactGalleryItems = [
  {
    title: 'Student Education',
    subtitle: 'Torah Lectures & Kehilla Seminars',
    src: '/kav-impact/student-shiur.jpg',
    category: 'Shiurim & Classes',
    link: '/programs',
  },
  {
    title: 'Business Outreach',
    subtitle: 'Halachic Guidance for Modern Enterprise',
    src: '/kav-impact/heter-iska-presentation.jpg',
    category: 'Commercial Advisory',
    link: '/programs',
  },
  {
    title: 'Financial Education',
    subtitle: 'Responsible Commerce & Observance',
    src: '/kav-impact/financial-outreach.jpg',
    category: 'Education',
    link: '/programs',
  },
  {
    title: 'Community Outreach',
    subtitle: 'Raising Awareness on Hilchos Ribbis',
    src: '/kav-impact/community-event.jpg',
    category: 'Community',
    link: '/programs',
  },
  {
    title: 'Commercial Advisory',
    subtitle: 'Structuring Kosher Financial Contracts',
    src: '/kav-impact/business-visit.jpg',
    category: 'Heter Iska',
    link: '/programs',
  },
  {
    title: 'Rabbinic Recognition',
    subtitle: 'Bais Horaah Endorsements & Conferences',
    src: '/kav-impact/recognition-event.jpg',
    category: 'Rabbinical Advisory',
    link: '/programs',
  },
  {
    title: 'Heter Iska Advisory',
    subtitle: 'Custom Agreements & Legal Frameworks',
    src: '/kav-impact/heter-iska-presentation-2.jpg',
    category: 'Legal & Halacha',
    link: '/programs',
  },
  {
    title: 'Educational Shiurim',
    subtitle: 'Practical Guidance for Daily Life',
    src: '/kav-impact/student-shiur.jpg',
    category: 'Learning',
    link: '/programs',
  },
];

export default function CommunityImpact() {
  return (
    <section className="py-16 md:py-16 bg-slate-50">
      <div className="container max-w-[1440px] mx-auto px-4 sm:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <p className="text-[#c69b46] font-bold text-xs tracking-widest uppercase mb-2 hidden">
            KAV HARIBIS IN ACTION
          </p>
          <h2 className="text-3xl sm:text-4xl font-semibold text-[#102a43] mb-3">
            Community Impact &amp; Gallery
          </h2>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
            Promoting Hilchos Ribbis education, commercial advisory, and rabbinical guidance across kehillos and businesses worldwide.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {impactGalleryItems.map((item, idx) => (
            <a
              href={item.link}
              className="bg-white overflow-hidden transition-all duration-300 group flex flex-col"
              key={idx}
            >
              <div className="h-48 overflow-hidden relative">
                <img
                  src={item.src}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="p-5 flex flex-col flex-1 justify-between gap-3">
                <div>
                  <h3 className="font-bold text-[#102a43] text-base">
                    {item.title}
                  </h3>
                  <p className="text-sm text-slate-500 mt-1">{item.subtitle}</p>
                </div>
                <span className="text-sm font-semibold text-gray-500 pt-2 flex items-center gap-1 group-hover:gap-2 transition-all">
                  <span className="">Explore program</span>
                  <span className="">→</span>
                </span>
              </div>
            </a>
          ))}
        </div>

        <div className="text-center">
          <a
            href="/contact"
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-[#102a43] hover:bg-[#173f5f] text-white font-bold text-sm shadow-md transition-colors"
          >
            <span className="text-white">Request a Program</span>
            <span className="text-white">→</span>
          </a>
        </div>
      </div>
    </section>
  );
}
