'use client';

import { motion } from 'framer-motion';
import BottomCTA from '../componnent/BottomCTA';
import { SiteFooter, SiteHeader } from '../shared/site-shell';

const schoolsServed = [
  'Kamenitz',
  'Klausenberg',
  'Lakewood Cheder School',
  'Shaagas Aryeh',
  'Tashbar',
  'Toras Aharon',
  'Toras Menachem',
  'Toras Zev',
  'Yeshiva Nachlei Torah',
  'Yeshiva Yesodei HaTorah',
];

export default function ProgramsPage() {
  return (
    <main className="min-h-screen bg-[#f8f5ef]">
      <SiteHeader />

      {/* Hero Section */}
      <section className="relative overflow-hidden py-24">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(200,162,26,0.10),transparent_30%)]"></div>
        <div className="absolute -top-24 right-0 h-80 w-80 rounded-full bg-[#c8a21a]/10 blur-3xl"></div>
        <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="max-w-4xl"
          >
            <div className="mb-5 inline-flex items-center rounded-full border border-[#e8dfcf] bg-white/70 px-4 py-2 text-sm font-medium text-[#9b7b16] backdrop-blur">
              Education • Outreach • Compliance
            </div>
            <h1 className="text-5xl font-bold leading-tight tracking-tight text-[#051933] sm:text-6xl">
              Our <span className="text-[#c8a21a]">Programs</span>
            </h1>
            <p className="mt-8 max-w-4xl text-lg leading-8 text-[#5f6b7a]">
              Kav Haribis develops practical awareness of hilchos ribis across all levels—from students and community members to business owners and organizations.
            </p>
            <p className="mt-5 max-w-4xl text-base leading-8 text-[#7b8794]">
              Through shiurim, outreach, and hands-on business guidance, we equip both today’s decision-makers and the next generation to understand and navigate real-world financial situations in full alignment with halacha and Torah values.
            </p>
          </motion.div>
        </div>
      </section>

      {/* 1. School & Community Shiurim */}
      <section className="pb-24 scroll-mt-28" id="school-program">
        <div className="mx-auto grid max-w-7xl items-center gap-16 px-6 lg:grid-cols-2 lg:px-8">
          {/* Image Container with Zoom Animation */}
          <motion.div
            initial={{ opacity: 0, scale: 0.88 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="relative"
          >
            <div className="absolute -left-8 top-10 h-40 w-40 rounded-full bg-[#c8a21a]/15 blur-3xl"></div>
            <div className="overflow-hidden rounded-[32px] border border-[#eadfcb] bg-white p-3 shadow-[0_20px_60px_rgba(5,25,51,0.08)] transition-transform duration-300 hover:-translate-y-1 group">
              <img
                src="/assets/classroom.jpg"
                alt="School & Community Shiurim"
                className="h-full w-full rounded-[24px] object-cover transition-transform duration-700 ease-out group-hover:scale-105"
              />
            </div>
          </motion.div>

          {/* Content Container with Right Slide-in Animation */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
          >
            <div className="mb-4 inline-flex rounded-full border border-[#eadfcb] bg-white px-4 py-2 text-sm font-medium text-[#9b7b16]">
              Educational Outreach
            </div>
            <h2 className="text-4xl font-bold text-[#051933]">
              School &amp; Community Shiurim
            </h2>
            <p className="mt-6 text-lg leading-8 text-[#5f6b7a]">
              We visit schools and communities to deliver engaging shiurim tailored for both students and adults.
            </p>
            <p className="mt-5 text-base leading-8 text-[#7b8794]">
              Our Rabbanim incorporate real-life scenarios and interactive learning to make complex halachos clear, relevant, and practical.
            </p>
            <div className="mt-10 grid gap-4 sm:grid-cols-2">
              {[
                'Interactive Learning',
                'Real-Life Case Studies',
                'Student Programs',
                'Community Shiurim',
              ].map((item) => (
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  key={item}
                  className="rounded-2xl border border-[#ece3d5] bg-white p-5 transition-all duration-200 hover:border-[#c8a21a]/40 hover:shadow-md"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-3 w-3 rounded-full bg-[#c8a21a]"></div>
                    <span className="text-sm font-medium text-[#051933]">
                      {item}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Schools We've Served */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="mx-auto mt-16 max-w-7xl px-6 lg:px-8"
        >
          <div className="rounded-[32px] border border-[#eadfcb] bg-white p-8 shadow-sm md:p-10">
            <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
              <div>
                <div className="mb-3 inline-flex rounded-full border border-[#eadfcb] bg-[#faf7f2] px-4 py-2 text-sm font-medium text-[#9b7b16]">
                  Our Reach
                </div>
                <h3 className="text-2xl font-bold text-[#051933] sm:text-3xl">
                  Schools We've Served
                </h3>
              </div>
              <span className="text-sm font-medium text-[#7b8794]">
                {schoolsServed.length} institutions and counting
              </span>
            </div>
            <div className="flex flex-wrap gap-3">
              {schoolsServed.map((school) => (
                <motion.div
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.98 }}
                  key={school}
                  className="inline-flex items-center gap-2.5 rounded-full border border-[#f0e7d9] bg-[#fcfaf6] px-5 py-2.5 text-sm font-medium text-[#051933] transition-all duration-200 hover:border-[#c8a21a]/50 hover:bg-white hover:shadow-sm"
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-[#c8a21a]"></span>
                  {school}
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </section>

      {/* 2. Business & Organizational Outreach */}
      <section className="pb-24 scroll-mt-28" id="rabbinical-training">
        <div className="mx-auto grid max-w-7xl items-center gap-16 px-6 lg:grid-cols-2 lg:px-8">
          {/* Content Container with Left Slide-in Animation */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
            className="order-2 lg:order-1"
            id="investments"
          >
            <div className="mb-4 inline-flex rounded-full border border-[#eadfcb] bg-white px-4 py-2 text-sm font-medium text-[#9b7b16]">
              Professional Guidance
            </div>
            <h2 className="text-4xl font-bold text-[#051933]">
              Business &amp; Organizational Outreach
            </h2>
            <p className="mt-6 text-lg leading-8 text-[#5f6b7a]">
              We offer customized workshops and seminars for business owners, shuls, and organizations.
            </p>
            <p className="mt-5 text-base leading-8 text-[#7b8794]">
              Our outreach helps ensure that contracts, partnerships, and investments are structured in full compliance with halacha.
            </p>
            <div className="mt-10 rounded-[28px] border border-[#eadfcb] bg-white p-7 shadow-sm">
              <h3 className="text-xl font-semibold text-[#051933]">
                Areas Covered
              </h3>
              <div className="mt-6 space-y-4">
                {[
                  'Contracts & Agreements',
                  'Partnership Structures',
                  'Investment Compliance',
                  'Financial Halacha Training',
                ].map((item) => (
                  <div key={item} className="flex items-start gap-4">
                    <div className="mt-2 h-2.5 w-2.5 rounded-full bg-[#c8a21a]"></div>
                    <p className="text-sm leading-7 text-[#5f6b7a]">{item}</p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Image Container with Zoom Animation */}
          <motion.div
            initial={{ opacity: 0, scale: 0.88 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="relative order-1 lg:order-2"
          >
            <div className="absolute -right-10 top-10 h-40 w-40 rounded-full bg-[#c8a21a]/15 blur-3xl"></div>
            <div className="overflow-hidden rounded-[32px] border border-[#eadfcb] bg-white p-3 shadow-[0_20px_60px_rgba(5,25,51,0.08)] transition-transform duration-300 hover:-translate-y-1 group">
              <img
                src="/assets/businesspersons.jpg"
                alt="Business Outreach"
                className="h-full w-full rounded-[24px] object-cover transition-transform duration-700 ease-out group-hover:scale-105"
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* 3. Business Assessment & Compliance */}
      <section className="pb-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="overflow-hidden rounded-[40px] border border-[#eadfcb] bg-white/70 p-10 shadow-[0_20px_60px_rgba(5,25,51,0.06)] backdrop-blur">
            <div className="grid gap-12 lg:grid-cols-[1.2fr_0.8fr]">
              {/* Content Container with Left Slide-in Animation */}
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
              >
                <div className="mb-4 inline-flex rounded-full border border-[#eadfcb] bg-[#faf7f2] px-4 py-2 text-sm font-medium text-[#9b7b16]">
                  Full Compliance Review
                </div>
                <h2 className="text-4xl font-bold text-[#051933]">
                  Business Assessment &amp; Compliance
                </h2>
                <p className="mt-6 text-lg leading-8 text-[#5f6b7a]">
                  We provide comprehensive assessments of your business and financial structures to evaluate alignment with halacha.
                </p>
                <p className="mt-5 text-base leading-8 text-[#7b8794]">
                  Our Rabbanim and research team review ownership, governance, and financial practices to identify potential ribis concerns and offer clear, practical guidance for achieving full compliance.
                </p>
                <p className="mt-10 text-sm font-semibold uppercase tracking-wide text-[#9b7b16]">
                  Benefits
                </p>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  {[
                    'Verified Certification',
                    'Ongoing Training',
                    'Community Recognition',
                    'Rabbinic Oversight',
                  ].map((item) => (
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      key={item}
                      className="rounded-2xl border border-[#ece3d5] bg-white p-5 transition-all duration-200 hover:border-[#c8a21a]/40 hover:shadow-md"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-3 w-3 rounded-full bg-[#c8a21a]"></div>
                        <span className="text-sm font-medium text-[#051933]">
                          {item}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              {/* Image Container with Zoom Animation */}
              <motion.div
                initial={{ opacity: 0, scale: 0.88 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                className="relative"
              >
                <div className="absolute -right-6 -top-6 h-32 w-32 rounded-full bg-[#c8a21a]/15 blur-3xl"></div>
                <div className="overflow-hidden rounded-[32px] border border-[#eadfcb] bg-white p-3 shadow-[0_20px_60px_rgba(5,25,51,0.08)] transition-transform duration-300 hover:-translate-y-1 group">
                  <img
                    src="/assets/business_assessment.jpeg"
                    alt="Business Assessment & Compliance"
                    className="h-full w-full rounded-[24px] object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  />
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Newsletters & Gilyonos */}
      <section className="pb-24 scroll-mt-28" id="gilyonos">
        <div className="mx-auto grid max-w-7xl items-center gap-16 px-6 lg:grid-cols-2 lg:px-8">
          {/* Image Container with Zoom Animation */}
          <motion.div
            initial={{ opacity: 0, scale: 0.88 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="relative"
          >
            <div className="absolute -left-8 top-10 h-40 w-40 rounded-full bg-[#c8a21a]/15 blur-3xl"></div>
            <div className="overflow-hidden rounded-[32px] border border-[#eadfcb] bg-white p-3 shadow-[0_20px_60px_rgba(5,25,51,0.08)] transition-transform duration-300 hover:-translate-y-1 group">
              <img
                src="/assets/newletter.jpg"
                alt="Newsletters & Gilyonos"
                className="h-full w-full min-h-[360px] rounded-[24px] object-cover transition-transform duration-700 ease-out group-hover:scale-105"
              />
            </div>
          </motion.div>

          {/* Content Container with Right Slide-in Animation */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
          >
            <div className="mb-4 inline-flex rounded-full border border-[#eadfcb] bg-white px-4 py-2 text-sm font-medium text-[#9b7b16]">
              Published Articles
            </div>
            <h2 className="text-4xl font-bold text-[#051933]">
              Newsletters &amp; Gilyonos
            </h2>
            <p className="mt-6 text-lg leading-8 text-[#5f6b7a]">
              We publish regular newsletters and gilyonos that bring practical hilchos ribis to life—covering real-world scenarios in banking, business, and everyday finance.
            </p>
            <p className="mt-5 text-base leading-8 text-[#7b8794]">
              Each publication is reviewed by our Rabbanim before release and shared with the community, giving families and businesses ongoing access to clear, practical halachic guidance.
            </p>
            <div className="mt-10 grid gap-4 sm:grid-cols-2">
              {[
                'Real-World Case Studies',
                'Reviewed by Poskim',
                'Distributed Community-Wide',
                'Published on an Ongoing Basis',
              ].map((item) => (
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  key={item}
                  className="rounded-2xl border border-[#ece3d5] bg-white p-5 transition-all duration-200 hover:border-[#c8a21a]/40 hover:shadow-md"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-3 w-3 rounded-full bg-[#c8a21a]"></div>
                    <span className="text-sm font-medium text-[#051933]">
                      {item}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* 5. Training Programs */}
      <section className="pb-24 scroll-mt-28" id="training-programs">
        <div className="mx-auto grid max-w-7xl items-stretch gap-16 px-6 lg:grid-cols-2 lg:px-8">
          {/* Content Container with Left Slide-in Animation */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
            className="order-2 lg:order-1"
          >
            <div className="mb-4 inline-flex rounded-full border border-[#eadfcb] bg-white px-4 py-2 text-sm font-medium text-[#9b7b16]">
              Professional Development
            </div>
            <h2 className="text-4xl font-bold text-[#051933]">
              Training Programs
            </h2>
            <p className="mt-6 text-lg leading-8 text-[#5f6b7a]">
              Our advanced training program prepares the next generation of Talmidei Chachamim through intensive shimush under some of today's foremost Poskim. Participants receive rigorous guidance, practical experience, and the tools to develop into future halachic authorities. Graduates of the program serve communities around the world, providing leadership, education, and practical halachic guidance in the field of ribbis.
            </p>
            <div className="mt-10 rounded-[28px] border border-[#eadfcb] bg-white p-7 shadow-sm">
              <h3 className="text-xl font-semibold text-[#051933]">
                Highlights
              </h3>
              <div className="mt-6 space-y-4">
                {[
                  'Shimush Under Leading Poskim',
                  'Advanced Halachic Training',
                  'Practical Psak Development',
                  'Worldwide Alumni Network',
                ].map((item) => (
                  <div key={item} className="flex items-start gap-4">
                    <div className="mt-2 h-2.5 w-2.5 rounded-full bg-[#c8a21a]"></div>
                    <p className="text-sm leading-7 text-[#5f6b7a]">{item}</p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Image Container with Zoom Animation */}
          <motion.div
            initial={{ opacity: 0, scale: 0.88 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="relative order-1 mb-10 pb-6 pr-6 lg:order-2 lg:mb-0 lg:h-full lg:pb-10 lg:pr-10"
          >
            <div className="absolute -right-10 top-10 h-40 w-40 rounded-full bg-[#c8a21a]/15 blur-3xl"></div>
            <div className="h-full overflow-hidden rounded-[32px] border border-[#eadfcb] bg-white p-3 shadow-[0_20px_60px_rgba(5,25,51,0.08)] transition-transform duration-300 hover:-translate-y-1 group">
              <img
                src="/assets/program.JPG"
                alt="Rabbinical Training Programs"
                className="h-full w-full rounded-[24px] object-cover transition-transform duration-700 ease-out group-hover:scale-105"
              />
            </div>
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.6, delay: 0.25 }}
              className="absolute bottom-0 right-0 w-2/5 min-w-[140px] max-w-[220px] overflow-hidden rounded-[20px] border-4 border-[#f8f5ef] bg-white shadow-[0_20px_50px_rgba(5,25,51,0.2)] transition-transform duration-300 hover:-translate-y-1"
            >
              <img
                src="/assets/rabbinical-training.jpg"
                alt="Training Program Certification"
                className="aspect-square w-full object-cover"
              />
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Bottom CTA Banner */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-50px' }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        <BottomCTA
          eyebrow={'BRING A PROGRAM TO YOUR COMMUNITY'}
          title={'Let’s build the right presentation for your audience.'}
          discription={
            'Tell us about your school, business, organization, or community and what you would like the program to address.'
          }
          link="/contact?topic=Program%20request"
          linktext="Request a Kav Haribis program"
          link2=""
          link2text=""
        />
      </motion.div>

      <SiteFooter />
    </main>
  );
}

