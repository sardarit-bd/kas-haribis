import { SiteFooter, SiteHeader } from '../shared/site-shell';
import GenealogyRequestForm from './request-form';

export default function GenealogyServicesPage() {
  return (
    <main className="min-h-screen bg-[#fbfaf7]">
      <SiteHeader />
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#071728] via-[#102a43] to-[#0e304b] text-white border-b-2 border-[#c69b46]">
        <div className="container max-w-[1440px] mx-auto px-4 sm:px-8 py-16 md:py-24 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center relative z-10">
          <div className="lg:col-span-7 space-y-6">
            <p className="text-[#c69b46] font-bold text-xs tracking-widest uppercase">GENEALOGY &amp; OWNERSHIP RESEARCH</p>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-white leading-tight">
              Clarity begins with knowing the full story.
            </h1>
            <p className="text-[#cbd5e1] text-base sm:text-lg leading-relaxed max-w-xl">
              Kav Haribis has partnered with experienced genealogists to help
              investigate and clarify potentially problematic ownership.
            </p>
            <a className="inline-block px-6 py-3.5 bg-[#c69b46] hover:bg-[#b0883b] text-[#102a43] text-xs font-bold uppercase tracking-wider rounded-xl transition-colors shadow-md" href="#genealogy-request">
              Request Research →
            </a>
          </div>
          <div className="lg:col-span-5 relative rounded-2xl overflow-hidden shadow-2xl border-2 border-[#c69b46]/40">
            <img
              src="/genealogy-hero.png"
              alt="Historical family records, a family tree, and archival genealogy research materials"
              className="w-full h-72 sm:h-96 object-cover"
            />
          </div>
        </div>
      </section>

      {/* Introduction Section */}
      <section className="container max-w-[1440px] mx-auto px-4 sm:px-8 my-12 p-6 sm:p-10 bg-[#f7f3ea] rounded-2xl border border-[#e2dacd] grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        <div className="lg:col-span-8 space-y-4">
          <p className="text-[#c69b46] font-bold text-xs tracking-widest uppercase">EXPERIENCED RESEARCH SUPPORT</p>
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#102a43]">Careful research for complex ownership questions</h2>
          <p className="text-sm text-[#475569] leading-relaxed">
            Determining the ownership of a financial institution, business,
            trust, or investment can require more than a simple online search.
            Corporate records, family relationships, historical documents, and
            changes in control may all be relevant.
          </p>
          <p className="text-sm text-[#475569] leading-relaxed">
            Through experienced genealogy researchers, Kav Haribis can help
            organize and investigate these details so that the appropriate
            questions can be presented clearly for further review.
          </p>
        </div>
        <aside className="lg:col-span-4 p-6 bg-white border border-[#ded7c9] rounded-xl shadow-sm text-center space-y-3">
          <span className="w-12 h-12 rounded-full bg-[#102a43] text-[#c69b46] font-mono font-bold text-lg flex items-center justify-center mx-auto">KH</span>
          <p className="text-xs text-[#64748b] leading-relaxed">
            This research service helps gather and clarify facts. It does not
            itself provide a halachic ruling, legal opinion, or guarantee of
            ownership.
          </p>
        </aside>
      </section>

      {/* Uses / Services Grid */}
      <section className="container max-w-[1440px] mx-auto px-4 sm:px-8 my-12 space-y-8">
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6 pb-6 border-b border-[#e2e8f0]">
          <div>
            <p className="text-[#c69b46] font-bold text-xs tracking-widest uppercase">HOW WE MAY HELP</p>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#102a43]">Research built around your question</h2>
          </div>
          <p className="max-w-md text-xs sm:text-sm text-[#64748b] leading-relaxed">
            Every matter is different. We will first review your request,
            determine whether the research is appropriate, and discuss pricing
            before work begins.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <article className="p-6 bg-white border border-[#e2e8f0] rounded-2xl shadow-sm space-y-3">
            <span className="font-mono text-xs font-bold text-[#c69b46]">01</span>
            <h3 className="text-xl font-serif font-bold text-[#102a43]">Ownership clarification</h3>
            <p className="text-xs text-[#64748b] leading-relaxed">
              Investigate individuals, families, trusts, parent companies, and
              other relationships that may affect how an entity is understood.
            </p>
          </article>
          <article className="p-6 bg-white border border-[#e2e8f0] rounded-2xl shadow-sm space-y-3">
            <span className="font-mono text-xs font-bold text-[#c69b46]">02</span>
            <h3 className="text-xl font-serif font-bold text-[#102a43]">Historical records</h3>
            <p className="text-xs text-[#64748b] leading-relaxed">
              Trace names, family connections, locations, and historical records
              when older information may help clarify the present situation.
            </p>
          </article>
          <article className="p-6 bg-white border border-[#e2e8f0] rounded-2xl shadow-sm space-y-3">
            <span className="font-mono text-xs font-bold text-[#c69b46]">03</span>
            <h3 className="text-xl font-serif font-bold text-[#102a43]">Ethical research needs</h3>
            <p className="text-xs text-[#64748b] leading-relaxed">
              Our research may also assist with other legitimate and ethical
              genealogy purposes. Contact us to ask whether we can help.
            </p>
          </article>
        </div>
      </section>

      {/* Process Section */}
      <section className="container max-w-[1440px] mx-auto px-4 sm:px-8 my-12 p-6 sm:p-10 bg-[#f7f3ea] rounded-2xl border border-[#e2dacd] space-y-6">
        <div>
          <p className="text-[#c69b46] font-bold text-xs tracking-widest uppercase mb-1">A CLEAR PROCESS</p>
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#102a43]">What happens after you submit?</h2>
        </div>
        <ol className="grid grid-cols-1 md:grid-cols-3 gap-6 list-none m-0 p-0">
          <li className="p-5 bg-white border border-[#ded7c9] rounded-xl space-y-1">
            <b className="text-sm font-serif font-bold text-[#102a43] block">Share the question</b>
            <span className="text-xs text-[#64748b] leading-relaxed block">
              Tell us what you need clarified and provide the information you
              already have.
            </span>
          </li>
          <li className="p-5 bg-white border border-[#ded7c9] rounded-xl space-y-1">
            <b className="text-sm font-serif font-bold text-[#102a43] block">Scope and pricing</b>
            <span className="text-xs text-[#64748b] leading-relaxed block">
              We will determine what research may be possible and contact you
              about timing and pricing.
            </span>
          </li>
          <li className="p-5 bg-white border border-[#ded7c9] rounded-xl space-y-1">
            <b className="text-sm font-serif font-bold text-[#102a43] block">Research and findings</b>
            <span className="text-xs text-[#64748b] leading-relaxed block">
              An experienced researcher will examine appropriate records and
              organize the relevant findings.
            </span>
          </li>
        </ol>
      </section>

      {/* Request Form Container */}
      <section className="container max-w-[1440px] mx-auto px-4 sm:px-8 my-12 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start" id="genealogy-request">
        <div className="lg:col-span-5 space-y-6">
          <div>
            <p className="text-[#c69b46] font-bold text-xs tracking-widest uppercase mb-1">REQUEST GENEALOGY RESEARCH</p>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#102a43]">Tell us what you need investigated</h2>
          </div>
          <p className="text-sm text-[#64748b] leading-relaxed">
            Include as much helpful background as possible. Do not submit Social
            Security numbers, account numbers, passwords, or other highly
            sensitive personal information.
          </p>
          <div className="p-4 bg-[#f8fafc] border-l-4 border-[#102a43] rounded-r-xl space-y-1">
            <b className="text-xs font-bold text-[#102a43] block">Pricing is determined after review.</b>
            <span className="text-xs text-[#64748b] block">Submitting this form does not obligate you to proceed.</span>
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
