import { SiteFooter, SiteHeader } from '../shared/site-shell';
import GenealogyRequestForm from './request-form';

export default function GenealogyServicesPage() {
  return (
    <main className="min-h-screen bg-[#fbfaf7]">
      <SiteHeader />
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#071728] via-[#102a43] to-[#0e304b] text-white">
        <div className="container max-w-[1440px] mx-auto px-4 sm:px-8 py-16 md:py-20 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center relative z-10">
          <div className="lg:col-span-7 space-y-6">
            <p className="text-[#c69b46] font-bold text-xs tracking-widest uppercase hidden">GENEALOGY &amp; OWNERSHIP RESEARCH</p>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-white leading-tight">
              Clarity begins with knowing the full story.
            </h1>
            <p className="text-[#cbd5e1] text-base sm:text-lg leading-relaxed max-w-xl">
              Kav Haribis has partnered with experienced genealogists to help
              investigate and clarify potentially problematic ownership.
            </p>
            <a className="inline-block px-6 py-3.5 bg-[#c69b46] hover:bg-[#b0883b] text-[#102a43] text-md font-meduim transition-colors shadow-md" href="#genealogy-request">
              Request Research
            </a>
          </div>
          <div className="lg:col-span-5 relative overflow-hidden">
            <img
              src="/genealogy-hero.png"
              alt="Historical family records, a family tree, and archival genealogy research materials"
              className="w-full h-72 sm:h-96 object-cover"
            />
          </div>
        </div>
      </section>


      {/* Uses / Services Grid */}
      <section className="container max-w-[1440px] mx-auto px-4 sm:px-8 my-12 space-y-8">
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6 pb-6">
          <div>
            <p className="text-[#c69b46] font-bold text-xs tracking-widest uppercase hidden">HOW WE MAY HELP</p>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#102a43]">Research built around your question</h2>
            <p className="max-w-xl text-md text-[#64748b] leading-relaxed pt-4">
            Every matter is different. We will first review your request,
            determine whether the research is appropriate, and discuss pricing
            before work begins.
          </p>
          </div>
          
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <article className="p-6 bg-white border border-gray-100 space-y-3">
            <span className="font-mono text-md font-bold text-[#c69b46]">01</span>
            <h3 className="text-xl font-serif pt-3 font-bold text-[#102a43]">Ownership clarification</h3>
            <p className="text-md text-[#64748b] leading-relaxed">
              Investigate individuals, families, trusts, parent companies, and
              other relationships that may affect how an entity is understood.
            </p>
          </article>
          <article className="p-6 bg-white border border-gray-100 space-y-3">
            <span className="font-mono text-md font-bold text-[#c69b46]">02</span>
            <h3 className="text-xl font-serif pt-3 font-bold text-[#102a43]">Historical records</h3>
            <p className="text-md text-[#64748b] leading-relaxed">
              Trace names, family connections, locations, and historical records
              when older information may help clarify the present situation.
            </p>
          </article>
          <article className="p-6 bg-white border border-gray-100 space-y-3">
            <span className="font-mono text-md font-bold text-[#c69b46]">03</span>
            <h3 className="text-xl font-serif pt-3 font-bold text-[#102a43]">Ethical research needs</h3>
            <p className="text-md text-[#64748b] leading-relaxed">
              Our research may also assist with other legitimate and ethical
              genealogy purposes. Contact us to ask whether we can help.
            </p>
          </article>
        </div>
      </section>


      {/* Request Form Container */}
      <section className="container bg-gray-200 py-12 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start" id="genealogy-request">
        <div className="lg:col-span-5 space-y-6">
          <div>
            <p className="text-[#c69b46] font-bold text-xs tracking-widest uppercase mb-1 hidden">REQUEST GENEALOGY RESEARCH</p>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#102a43]">Tell us what you need investigated</h2>
          </div>
          <p className="text-md text-[#64748b] leading-relaxed">
            Include as much helpful background as possible. Do not submit Social
            Security numbers, account numbers, passwords, or other highly
            sensitive personal information.
          </p>
          <div className="p-4 bg-[#f8fafc] border-l-4 border-[#102a43] rounded-r-xl space-y-1">
            <b className="text-md font-bold text-[#102a43] block">Pricing is determined after review.</b>
            <span className="text-md text-[#64748b] block">Submitting this form does not obligate you to proceed.</span>
          </div>
        </div>
        <div className="lg:col-span-7">
          <GenealogyRequestForm />
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}
