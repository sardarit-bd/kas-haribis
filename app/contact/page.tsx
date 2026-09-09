import { InteriorPage, SiteFooter, SiteHeader } from '../shared/site-shell';
import ContactForm from './contact-form';

export default function ContactPage() {
  return (
    <>
    <SiteHeader/>
    <InteriorPage
      eyebrow="CONTACT KAV HARIBIS"
      title="We’re here to help"
      intro="Reach out about programs, research, sponsorship opportunities, publications, or ways to support the work of Kav Haribis."
    />
      <section className="w-full bg-[#f7f3ea] py-12 md:py-20">
        <div className="container px-4 sm:px-8 lg:px-12 grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-16 items-start">
          <div className="md:col-span-5 space-y-6">
            <p className="text-[#a37828] text-xs font-bold tracking-widest uppercase mb-1 hidden">GET IN TOUCH</p>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-[#102a43] leading-tight">How can we help?</h2>
            <p className="text-slate-600 text-base leading-relaxed">
              Choose the most convenient way to contact us. For a personal
              question in Hilchos Ribbis, please use the dedicated Bais Horaah
              form so the correct details reach the rabbinical team.
            </p>
            <div className="space-y-3.5 my-8">
              <a className="min-h-[82px] flex items-center gap-4 border border-slate-200/90 bg-white p-4 sm:p-5  hover:border-[#c69b46] hover:translate-x-1 transition duration-200 group" href="mailto:Kavharibis@gmail.com">
                <span className="w-11 h-11 shrink-0 rounded-full bg-[#f3ead8] text-[#8a6724] font-bold text-lg flex items-center justify-center">✉</span>
                <div className="flex flex-col gap-0.5 min-w-0">
                  <small className="text-[10px] font-bold tracking-widest text-[#a37828] uppercase">EMAIL</small>
                  <b className="text-[#102a43] text-sm font-semibold break-all">Kavharibis@gmail.com</b>
                </div>
                <strong className="ml-auto text-[#c69b46] text-xl font-bold">→</strong>
              </a>
              <a className="min-h-[82px] flex items-center gap-4 border border-slate-200/90 bg-white p-4 sm:p-5 hover:border-[#c69b46] hover:translate-x-1 transition duration-200 group" href="tel:7322288558">
                <span className="w-11 h-11 shrink-0 rounded-full bg-[#f3ead8] text-[#8a6724] font-bold text-lg flex items-center justify-center">☎</span>
                <div className="flex flex-col gap-0.5 min-w-0">
                  <small className="text-[10px] font-bold tracking-widest text-[#a37828] uppercase">PHONE</small>
                  <b className="text-[#102a43] text-sm font-semibold">732-228-8558</b>
                </div>
                <strong className="ml-auto text-[#c69b46] text-xl font-bold">→</strong>
              </a>
              <div className="min-h-[82px] flex items-center gap-4 border border-slate-200/90 bg-white p-4 sm:p-5">
                <span className="w-11 h-11 shrink-0 rounded-full bg-[#f3ead8] text-[#8a6724] font-bold text-lg flex items-center justify-center">⌖</span>
                <div className="flex flex-col gap-0.5 min-w-0">
                  <small className="text-[10px] font-bold tracking-widest text-[#a37828] uppercase">LOCATION</small>
                  <b className="text-[#102a43] text-sm font-semibold">Lakewood, New Jersey 08701</b>
                </div>
              </div>
            </div>
            <aside className="mt-6 p-6 sm:p-8 bg-[#102a43] text-white space-y-4">
              <div>
                <small className="text-[10px] font-bold tracking-widest text-[#c69b46] uppercase block mb-1">HILCHOS RIBBIS QUESTIONS</small>
                <h3 className="text-2xl font-serif font-bold text-[#f7f3ea] mb-2">Need guidance from the Bais Horaah?</h3>
                <p className="text-slate-300 text-sm leading-relaxed">
                  Use the private question form to include the relevant details
                  and your preferred response method.
                </p>
              </div>
              <a className="inline-flex items-center px-5 py-2.5 bg-[#c69b46] hover:bg-[#b58a35] text-white font-bold text-xs tracking-wide transition shadow-sm" style={{ color: 'white' }} href="/bais-horaah">Submit a question →</a>
            </aside>
          </div>
          <ContactForm />
        </div>
      </section>
      <SiteFooter/>
    </>
  );
}
