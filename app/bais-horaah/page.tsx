import { MotionArticle, MotionDiv } from '../shared/motion-components';
import { SiteFooter, SiteHeader } from '../shared/site-shell';
import BaisHoraahQuestionForm from './question-form';

export default function BaisHoraahPage() {
  return (
    <>
      <SiteHeader/>
      
      {/* Hero Section */}
      <section className='bg-[#f7f3ea] overflow-hidden'>
        <div className="px-4 lg:px-10 py-6 sm:py-10 container grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <MotionDiv
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-7 space-y-6"
          >
            <div>
              <p className="text-[#c69b46] font-bold text-xs tracking-widest uppercase mb-1">SPEAK TO A RAV</p>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-bold text-[#102a43] leading-tight">Clarity before you sign, borrow, lend, or invest</h2>
            </div>
            <p className="text-sm sm:text-base text-[#64748b] leading-relaxed">
              Whether you are reviewing a loan agreement, need guidance about a
              Heter Iska, or are dealing with a complicated financial arrangement,
              the Bais Horaah is here to help you keep the transaction fully
              aligned with halacha.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <a className="p-4 bg-[#102a43] hover:bg-[#1a385c] text-white transition-all duration-300 hover:scale-[1.02] flex items-center gap-3 shadow-md group rounded-lg" href="tel:7322288558">
                <span className="w-10 h-10 rounded-lg bg-[#c69b46] text-[#102a43] font-bold flex items-center justify-center text-lg">☎</span>
                <div>
                  <small className="block text-[10px] font-mono text-[#c69b46] uppercase tracking-widest">RIBBIS HOTLINE</small>
                  <b className="text-lg font-bold text-white group-hover:text-[#c69b46] transition-colors">732-228-8558</b>
                </div>
              </a>
              <a className="p-4 bg-white border border-[#ded7c9] hover:bg-[#f8fafc] text-[#102a43] transition-all duration-300 hover:scale-[1.02] flex items-center gap-3 shadow-sm rounded-lg" href="mailto:kavharibis@gmail.com">
                <span className="w-10 h-10 rounded-lg bg-[#f4f6f8] text-[#102a43] font-bold flex items-center justify-center text-lg">✉</span>
                <div>
                  <small className="block text-[10px] font-mono text-[#64748b] uppercase tracking-widest">EMAIL A QUESTION</small>
                  <b className="text-sm sm:text-base font-bold text-[#102a43]">kavharibis@gmail.com</b>
                </div>
              </a>
            </div>
            <small className="block text-xs text-[#94a3b8] leading-relaxed">
              For urgent or time-sensitive matters, please call. Never include
              account numbers, card numbers, passwords, or other sensitive
              financial information.
            </small>
          </MotionDiv>

          <MotionDiv
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1], delay: 0.12 }}
            className="lg:col-span-5 relative overflow-hidden shadow-xl border border-[#ded7c9] rounded-xl"
          >
            <img
              src="/kav-brand/bais-horaah.png"
              alt="A quiet rabbinical study prepared for confidential questions"
              className="w-full h-64 sm:h-80 object-cover hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#071728] via-[#071728]/40 to-transparent p-6 flex flex-col justify-end text-white">
              <span className="font-serif font-bold text-xl text-[#c69b46] block mb-1">בית הוראה</span>
              <b className="text-sm font-medium text-[#cbd5e1]">Confidential. Practical. Grounded in Halacha.</b>
            </div>
          </MotionDiv>
        </div>
      </section>

      {/* Question Form Section */}
      <section className="my-12 container grid grid-cols-1 lg:grid-cols-12 gap-8 items-start py-8 px-4 lg:px-8 overflow-hidden" id="submit-question">
        <MotionDiv
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-20px' }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="lg:col-span-5 space-y-6"
        >
          <div>
            <p className="text-[#c69b46] font-bold text-xs tracking-widest uppercase mb-1 hidden">SUBMIT YOUR QUESTION</p>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#102a43]">Send the details securely</h2>
          </div>
          <p className="text-md text-[#64748b] leading-relaxed">
            Your submission is saved in the private Bais Horaah administrator
            inbox. You will receive a reference number immediately.
          </p>
          <ul className="space-y-2.5 text-md text-[#475569]">
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#c69b46]"></span>
              Describe the complete arrangement
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#c69b46]"></span>
              Identify all relevant parties and their roles
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#c69b46]"></span>
              Mention any deadlines or documents already signed
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#c69b46]"></span>
              Select how you prefer to receive a response
            </li>
          </ul>
          <aside className="p-4 bg-[#f8fafc] border-l-4 border-[#102a43] rounded-r-xl space-y-1">
            <b className="text-md font-bold text-[#102a43] block">This form is for halachic questions.</b>
            <span className="text-md text-[#64748b] block">
              For programs, sponsorships, seforim, or general inquiries, please
              use the <a href="/contact" className="text-[#c69b46] font-bold hover:underline">Contact page</a>.
            </span>
          </aside>
        </MotionDiv>

        <MotionDiv
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-20px' }}
          transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="lg:col-span-7"
        >
          <BaisHoraahQuestionForm />
        </MotionDiv>
      </section>

      {/* Process Section */}
      <section className="p-6 sm:p-10 bg-[#f7f3ea] space-y-6 overflow-hidden">
        <MotionDiv
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-20px' }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className='container px-8'
        >
          <p className="text-[#c69b46] font-bold text-xs tracking-widest uppercase mb-1 hidden">WHAT HAPPENS NEXT</p>
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#102a43]">A clear, confidential process</h2>
        </MotionDiv>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 container px-8 pt-6">
          <MotionArticle
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-20px' }}
            transition={{ duration: 0.8, delay: 0.05, ease: [0.16, 1, 0.3, 1] }}
            whileHover={{ y: -4, transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] } }}
            className="p-5 bg-white space-y-2 rounded-xl shadow-xs hover:shadow-md transition-all"
          >
            <b className="w-8 h-8 rounded-full bg-[#102a43] text-white flex items-center justify-center text-xs font-mono font-bold">1</b>
            <h3 className="text-base font-serif font-bold text-[#102a43]">Submit the facts</h3>
            <p className="text-xs text-[#64748b] leading-relaxed">Send the relevant details and your preferred contact method.</p>
          </MotionArticle>
          <MotionArticle
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-20px' }}
            transition={{ duration: 0.8, delay: 0.12, ease: [0.16, 1, 0.3, 1] }}
            whileHover={{ y: -4, transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] } }}
            className="p-5 bg-white space-y-2 rounded-xl shadow-xs hover:shadow-md transition-all"
          >
            <b className="w-8 h-8 rounded-full bg-[#102a43] text-white flex items-center justify-center text-xs font-mono font-bold">2</b>
            <h3 className="text-base font-serif font-bold text-[#102a43]">Rabbinical review</h3>
            <p className="text-xs text-[#64748b] leading-relaxed">
              The question is reviewed and may require follow-up information.
            </p>
          </MotionArticle>
          <MotionArticle
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-20px' }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            whileHover={{ y: -4, transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] } }}
            className="p-5 bg-white space-y-2 rounded-xl shadow-xs hover:shadow-md transition-all"
          >
            <b className="w-8 h-8 rounded-full bg-[#102a43] text-white flex items-center justify-center text-xs font-mono font-bold">3</b>
            <h3 className="text-base font-serif font-bold text-[#102a43]">Receive guidance</h3>
            <p className="text-xs text-[#64748b] leading-relaxed">
              A response is provided through the selected contact method when
              possible.
            </p>
          </MotionArticle>
        </div>
      </section>

      <SiteFooter/>
    </>
  );
}

