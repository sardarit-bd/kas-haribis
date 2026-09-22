import BottomCTA from '../componnent/BottomCTA';
import { listAboutMembers } from '../lib/directories';
import { SiteFooter, SiteHeader } from '../shared/site-shell';
import MemberAvatar from './member-avatar';

export const metadata = {
  title: 'About Us | Kav Haribis',
  description: 'Learn about Kav Haribis, our founders, rabbinic leadership, mission, and community programs for Hilchos Ribbis.',
};

export const dynamic = 'force-dynamic';

type Member = {
  id: string;
  category: string;
  name: string;
  designation?: string;
  description?: string;
  image_url?: string;
};

export default async function AboutPage() {
  let members: Member[] = [];
  try {
    const { env } = await import('cloudflare:workers');
    members = (await listAboutMembers(env.DB, false)) as Member[];
  } catch (err) {
    console.error('Failed to load about members:', err);
  }

  // Filter members by category
  const researchTeam = members.filter(
    (m) => m.category === 'Kosher Bank Directory Research Team',
  );
  const genealogistTeam = members.filter(
    (m) => m.category === 'Our Genealogist and Yuchasin specialist',
  );
  const committeeTeam = members.filter(
    (m) => m.category === 'Committee Members',
  );

  return (
    <main className="min-h-screen bg-white overflow-x-clip">
      <SiteHeader />

      {/* Hero Banner Section */}
      <section className="min-h-[540px] bg-[#102a43] text-white relative overflow-hidden hidden">
        <div className="container max-w-[1440px] mx-auto px-4 sm:px-8 py-16 md:py-20 grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-10 lg:gap-[50px] items-center">
          <div className="flex flex-col">
            <h1 className="text-white text-3xl sm:text-4xl md:text-5xl lg:text-[52px] font-semibold leading-tight tracking-tight mt-3.5 mb-5">
              Clarity in Hilchos Ribbis.
              <em className="text-[#e5c474] not-italic block mt-2 font-semibold">Guidance for everyday life.</em>
            </h1>
            <p className="text-slate-200 text-base sm:text-lg leading-relaxed font-normal max-w-[620px] mb-8">
              Kav Haribis is a dedicated halachic center bringing clarity to the laws of ribbis through comprehensive education, communal outreach, research directories, and direct access to experienced Rabbanim.
            </p>
            <div className="flex items-center gap-5 flex-wrap">
              <a
                href="/bais-horaah"
                style={{ color: 'white' }}
                className="inline-flex items-center gap-2.5 px-6 py-3.5 pBG text-white font-semibold text-sm sm:text-base shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5"
              >
                <span>Ask the Bais Horaah</span>
              </a>
              <a
                href="/programs"
                className="inline-flex items-center gap-2.5 px-6 py-3.5 bg-white/10 hover:bg-white/20 text-gray-300 font-semibold text-sm sm:text-base border border-white/20 transition-all duration-300"
              >
                <span>Explore Programs</span>
              </a>
            </div>
          </div>

          <div className="relative overflow-hidden border border-[#c69b46]/40 shadow-[0_20px_50px_rgba(0,0,0,0.4)] h-[360px] sm:h-[420px]">
            <img
              src="/kav-impact/heter-iska-presentation.jpg"
              alt="Kav Haribis presenting a Heter Iska"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </section>

      {/* Welcome & Founder Story Section */}
      <section className="bg-white border-b border-slate-100">
        <div className="container max-w-[1440px] mx-auto px-4 sm:px-8 py-10 md:py-[50px] grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-[60px] items-start">
          <div className="overflow-hidden border border-slate-200 shadow-md h-[400px] md:h-[700px]">
            <img
              src="/kav-impact/heter-iska-presentation-2.jpg"
              alt="Kav Haribis educational presentation"
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <h2 className="text-3xl sm:text-4xl font-semibold text-[#102a43] leading-tight tracking-tight mb-6">
              Welcome to Kav HaRibis — a halachic center dedicated to bringing clarity to the laws of ribis, with a strong focus on outreach and raising awareness in Hilchos Ribis.
            </h2>
            <div className="space-y-4">
              <p className="text-slate-600 text-base sm:text-lg leading-relaxed font-normal">
                Kav haribis was founded By the talmidim of Harav Pinchos Vind shlita who were inspired by his world wide network of batei Horaah and his passion to create awareness in hilchos ribis, and work closely with him and his network of Batei Horaah to advance awareness in hilchos ribis and bring you the most up to date and accurate ruling in hilchos ribis.   
              </p>
              <p className="text-slate-600 text-base sm:text-lg leading-relaxed font-normal">
                Harav Pinchos Vind Shlita had the privilege to discuss many questions regarding hilchos ribis with Harav Yosef Shalom Elyashiv Zazal and Harav Sholmo Vozner Zatal among many other Gedolim, and has a close connection with many of the current gedolei Yisroel to help us clarify the complex questions when they arrive.
              </p>
              <p className="text-slate-600 text-base sm:text-lg leading-relaxed font-normal">
                Furthermore the Rabonim of our Bais Horaah Have a connection to many of well known experts in hilchos ribis like Harav Ari Marberger Harav Shmuel Honigwachs and Harav Avrohom Moshe Levanoni amongst many other Rabonim  to bring you the the most accurate pesak based on our Mesorah.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Rabbinic Leadership & Advisory Banner */}
      <section className="bg-[#102a43] text-white hidden">
        <div className="container max-w-[1440px] mx-auto px-4 sm:px-8 py-16 md:py-[50px] grid grid-cols-1 lg:grid-cols-[0.9fr_1.1fr] gap-10 lg:gap-[60px] items-center">
          <div className="overflow-hidden border border-white/10 shadow-lg h-[320px] sm:h-[400px]">
            <img
              src="/kav-impact/recognition-event.jpg"
              alt="Kav Haribis community recognition event"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex flex-col">
            <h2 className="text-2xl sm:text-4xl lg:text-5xl font-semibold leading-tight tracking-tight text-white mb-5">
              Rooted in Torah. Responsive to modern financial life.
            </h2>
            <p className="text-slate-200 text-base sm:text-lg leading-relaxed font-normal mb-4">
              Harav Pinchos Vind shlita had the privilege of discussing many questions in Hilchos Ribbis with <strong className="text-[#e5c474] font-semibold">Harav Yosef Shalom Elyashiv zt״l</strong> and <strong className="text-[#e5c474] font-semibold">Harav Shmuel Wosner zt״l</strong>, among other Gedolei Yisroel.
            </p>
            <p className="text-slate-200 text-base sm:text-lg leading-relaxed font-normal mb-4">
              Through his close relationships with leading contemporary Gedolim, complex financial questions can be clarified with the depth, care, and practical understanding they require. The Rabbanim of the Kav Haribis Bais Horaah bring this guidance to the real financial questions facing individuals, families, businesses, and institutions.
            </p>
            <a
              href="/bais-horaah"
              className="inline-flex items-center gap-2 text-[#e5c474] hover:text-white font-semibold text-sm sm:text-base transition-colors mt-2"
            >
              <span>Learn about the Bais Horaah</span>
              <span className="text-lg">→</span>
            </a>
          </div>
        </div>
      </section>

      {/* Our Mission & Core Pillars Section */}
      <section className="bg-gray-200 py-16 md:py-[100px] hidden">
        <div className="container max-w-[1440px] mx-auto px-4 sm:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-3xl sm:text-4xl font-semibold text-[#102a43] tracking-tight">
              Helping Klal Yisroel navigate financial life responsibly
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-7">
            <article className="bg-white border border-slate-200 p-8 sm:p-9 relative overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col group">
              <div className="w-[48px] h-[48px] rounded-full bg-[#102a43] text-[#e2c071] font-semibold text-base grid place-items-center mb-6 group-hover:bg-[#c69b46] group-hover:text-[#071d31] transition-colors duration-300">
                01
              </div>
              <h3 className="font-semibold text-xl sm:text-2xl text-[#102a43] mb-3 tracking-tight">
                Awareness &amp; Education
              </h3>
              <p className="text-slate-600 text-base leading-relaxed font-normal">
                Shiurim, articles, alerts, and community programs that bring Hilchos Ribbis into everyday conversation and financial decision-making.
              </p>
            </article>

            <article className="bg-white border border-slate-200 p-8 sm:p-9 relative overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col group">
              <div className="w-[48px] h-[48px] rounded-full bg-[#102a43] text-[#e2c071] font-semibold text-base grid place-items-center mb-6 group-hover:bg-[#c69b46] group-hover:text-[#071d31] transition-colors duration-300">
                02
              </div>
              <h3 className="font-semibold text-xl sm:text-2xl text-[#102a43] mb-3 tracking-tight">
                Practical Guidance
              </h3>
              <p className="text-slate-600 text-base leading-relaxed font-normal">
                Clear educational resources and direct access to experienced Rabbanim for personal, commercial, and institutional questions.
              </p>
            </article>

            <article className="bg-white border border-slate-200 p-8 sm:p-9 relative overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col group">
              <div className="w-[48px] h-[48px] rounded-full bg-[#102a43] text-[#e2c071] font-semibold text-base grid place-items-center mb-6 group-hover:bg-[#c69b46] group-hover:text-[#071d31] transition-colors duration-300">
                03
              </div>
              <h3 className="font-semibold text-xl sm:text-2xl text-[#102a43] mb-3 tracking-tight">
                Research &amp; Resources
              </h3>
              <p className="text-slate-600 text-base leading-relaxed font-normal">
                Careful financial research, kosher bank directories, custom Heter Iska documents, and tools designed for practical everyday use.
              </p>
            </article>
          </div>
        </div>
      </section>

      {/* Work in Action Photo Showcase */}
      <section className="bg-white py-16 md:py-[95px] hidden">
        <div className="container max-w-[1440px] mx-auto px-4 sm:px-8 grid grid-cols-1 lg:grid-cols-[0.75fr_1.25fr] gap-10 lg:gap-[60px] items-center">
          <div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-semibold text-[#102a43] mb-4 tracking-tight leading-tight">
              Education that reaches every part of the community
            </h2>
            <p className="text-slate-600 text-base sm:text-lg leading-relaxed font-normal mb-6">
              From classrooms and community events to businesses and financial institutions, Kav Haribis works to make awareness of Hilchos Ribbis practical, visible, and lasting.
            </p>
            <a
              href="/programs"
              className="inline-flex items-center gap-2.5 px-6 py-3.5 pBG text-white font-semibold text-sm sm:text-base shadow-md hover:shadow-lg transition-all duration-300"
            >
              <span className="text-white">See All Programs</span>
            </a>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2 overflow-hidden h-[260px] shadow-md border border-slate-200 group">
              <img
                src="/kav-impact/community-event.jpg"
                alt="Kav Haribis community gathering"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </div>
            <div className="overflow-hidden h-[220px] shadow-md border border-slate-200 group">
              <img
                src="/kav-impact/student-shiur.jpg"
                alt="Students attending a Kav Haribis shiur"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </div>
            <div className="overflow-hidden h-[220px] shadow-md border border-slate-200 group">
              <img
                src="/kav-impact/financial-outreach.jpg"
                alt="Kav Haribis financial outreach visit"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Rabbis Hotline Section */}
      <section className="bg-gray-200 py-12 md:py-16 border-t border-slate-100">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold font-serif text-[#102a43] mb-8 sm:mb-10 tracking-tight">
            Rabbi’s who answer questions on our hotline-
          </h2>
          <div className="flex flex-wrap justify-center gap-3 sm:gap-3.5 max-w-3xl mx-auto">
            {[
              'Rabbi Baruch Moses',
              'Rabbi Shmuel Poltman',
              'Rabbi Yechiel Blum',
              'Rabbi Moskowitz',
              'Rabbi Ginsberg',
              'Rabbi Elenbogen',
              'Rabbi Tzvi Smoke',
              'Rabbi Yaakov Yitzchok Jacob',
              'Rabbi Yehuda Framowitz',
              'Rabbi Lipshitz',
            ].map((name) => (
              <span
                key={name}
                className="px-5 py-2.5 bg-white border border-slate-300/90 rounded-2xl text-slate-800 text-sm sm:text-base font-semibold shadow-xs hover:border-slate-400 transition"
              >
                {name}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Kosher Bank Directory Research Team */}
      {researchTeam.length > 0 && (
        <section className="bg-white py-12 md:py-16 border-t border-slate-100">
          <div className="max-w-5xl mx-auto px-4">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold font-serif text-[#102a43] text-center mb-10 tracking-tight">
              Kosher Bank Directory Research Team
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl mx-auto">
              {researchTeam.map((member) => (
                <div key={member.id || member.name} className="flex flex-col">
                  <MemberAvatar member={member} />
                  <h3 className="font-bold text-[#102a43] text-sm sm:text-base mt-3.5">
                    {member.name}
                  </h3>
                  {member.designation && (
                    <p className="text-xs text-amber-700 font-semibold mt-0.5">
                      {member.designation}
                    </p>
                  )}
                  {member.description && (
                    <p className="text-slate-500 text-xs leading-relaxed mt-1">
                      {member.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Our Genealogist and Yuchasin specialist */}
      {genealogistTeam.length > 0 && (
        <section className="bg-white py-12 md:py-16 border-t border-slate-100">
          <div className="max-w-5xl mx-auto px-4">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold font-serif text-[#102a43] text-center mb-10 tracking-tight">
              Our Genealogist and Yuchasin specialist
            </h2>
            <div className="max-w-md mx-auto flex flex-col">
              {genealogistTeam.map((member) => (
                <div key={member.id || member.name} className="flex flex-col">
                  <MemberAvatar member={member} />
                  <h3 className="font-bold text-[#102a43] text-base sm:text-lg mt-4 mb-1.5">
                    {member.name}
                  </h3>
                  {member.designation && (
                    <p className="text-xs text-amber-700 font-semibold mb-1">
                      {member.designation}
                    </p>
                  )}
                  {member.description && (
                    <p className="text-slate-500 text-xs sm:text-sm leading-relaxed">
                      {member.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Committee Members */}
      {committeeTeam.length > 0 && (
        <section className="bg-white py-12 md:py-16 border-t border-slate-100">
          <div className="max-w-6xl mx-auto px-4">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold font-serif text-[#102a43] text-center mb-10 tracking-tight">
              Committee Members
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 max-w-5xl mx-auto">
              {committeeTeam.map((member) => (
                <div key={member.id || member.name} className="flex flex-col">
                  <MemberAvatar member={member} />
                  <h3 className="font-bold text-[#102a43] text-sm sm:text-base mt-3.5">
                    {member.name}
                  </h3>
                  {member.designation && (
                    <p className="text-xs text-amber-700 font-semibold mt-0.5">
                      {member.designation}
                    </p>
                  )}
                  {member.description && (
                    <p className="text-slate-500 text-xs leading-relaxed mt-1">
                      {member.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Bottom CTA Banner */}
      <BottomCTA
        eyebrow={"HOW CAN WE HELP?"}
        title={"Bring your question, program, or research need to Kav Haribis."}
        discription={"Whether you have a personal question, need halachic guidance for a financial product, or would like to invite Kav Haribis to present a program, we are here to help."}
        link="/contact"
        linktext="Contact Kav Haribis"
        link2="/contact"
        link2text="Contact Kav Haribis"
      />

      <SiteFooter />
    </main>
  );
}
