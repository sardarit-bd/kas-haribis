import { InteriorPage, SiteFooter, SiteHeader } from '../shared/site-shell';
import PersonalizedHeterForm from './request-form';

export default function PersonalizedHeterIskaPage() {
  return (
    <>
      <SiteHeader />
      <InteriorPage
        eyebrow="PERSONALIZED HETER ISKA SERVICE"
        title="A Heter Iska designed for your actual lending structure"
        intro="For banks, mortgage companies, private lenders, businesses, and institutions whose ownership, products, agreements, or loan terms may not be properly addressed by a standard template."
      />
      <section className="max-w-[1380px] mx-auto px-[5vw] py-[55px] pb-[70px] min-[651px]:px-[6vw] min-[651px]:pt-[82px] min-[651px]:pb-[100px] grid grid-cols-1 min-[951px]:grid-cols-[0.85fr_1.15fr] gap-[7vw] items-start bg-[linear-gradient(135deg,#fff_0%,#fff_55%,#f8f3e8_100%)]">
        <div className="static min-[951px]:sticky min-[951px]:top-[125px]">
          <p className="text-[15px] tracking-[0.10em] font-bold text-[#a67c2c] mb-5 capitalize hidden">
            TAILORED REVIEW
          </p>
          <h2 className="my-[8px] mt-2 mb-[18px] text-[#102a43] font-serif font-medium text-[clamp(32px,4vw,48px)] leading-[1.15]">
            Request a Personalized Heter Iska
          </h2>
          <p className="text-[#637282] leading-[1.8]">
            Tell Kav Haribis about your institution and lending structure. The
            information you provide will help our team understand the
            arrangement and determine what additional documents or details may
            be needed.
          </p>
          <div className="my-[28px] p-[27px] border border-[#d5b468] border-t-4 border-t-[#c69b46] rounded-[9px] bg-white shadow-[0_18px_50px_#102a4315]">
            <small className="text-[#8d6924] text-[9px] font-extrabold tracking-[0.16em] uppercase">
              STANDARD SERVICE FEE
            </small>
            <strong className="block my-[7px] text-[#102a43] font-serif text-[52px] leading-none font-medium">
              $250
            </strong>
            <p className="m-0 text-[#637282] leading-[1.65]">
              As a nonprofit organization, Kav Haribis offers a discounted price
              of <b className="text-[#8a651f] font-bold">$120</b> to anyone who would like it. Simply check the
              discount box in the request form.
            </p>
          </div>
          <ul className="pl-[20px] list-disc text-[#3d5364] leading-[2]">
            <li>Institution and ownership information</li>
            <li>Loan products and agreement structure</li>
            <li>Existing Heter Iska or supporting documents</li>
            <li>Direct follow-up from Kav Haribis</li>
          </ul>
          <small className="block text-[#7a8892] leading-[1.6] text-md mt-4">
            Submitting this form is a request for service. Payment and any
            additional information will be arranged after the request is
            reviewed.
          </small>
        </div>
        <PersonalizedHeterForm />
      </section>
      <SiteFooter />
    </>
  );
}

