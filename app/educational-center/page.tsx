import BottomCTA from '../componnent/BottomCTA';
import { listEducationalResources } from '../lib/directories';
import { SiteFooter, SiteHeader } from '../shared/site-shell';

export const dynamic = 'force-dynamic';

export default async function EducationalCenter() {
  const { env } = await import('cloudflare:workers');
  const items = (await listEducationalResources(env.DB)) as any[];
  return (
    <main className="">
      <SiteHeader />
    

      <section id="resources" className="bg-[#f7f3ea] px-4 sm:px-8 py-12 md:py-16 w-full">
        <header className="mb-10 container">
          <div>
            <p className="text-[#c69b46] text-xs font-bold tracking-widest uppercase mb-2 hidden">FREE DOWNLOADS</p>
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-gray-700 tracking-tight mb-3">Learning resources</h2>
          </div>
          <p className="text-gray-600 text-base max-w-2xl leading-relaxed">
            Coloring sheets, printable activities, and PDF pamphlets—ready for
            homes, classrooms, and community programs.
          </p>
        </header>
        <div className="container grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item) => {
            const src = item.file_key?.startsWith('static:')
              ? item.file_key.slice(7)
              : `/api/educational-file?id=${encodeURIComponent(item.id)}`;
            const cover =
              item.id === 'neighbors-guide-ribbis'
                ? '/education/neighbors-guide-to-ribbis-cover.jpg'
                : item.id === 'ribbis-stench-tumah'
                  ? '/education/ribbis-gave-off-a-stench-of-tumah-cover.jpg'
                  : item.id === 'chaims-big-dream'
                    ? '/education/chaims-big-dream-cover.jpg'
                    : '';
            return (
              <article key={item.id} className="bg-[#102a43]/60  overflow-hidden hover:border-[#c69b46]/50 transition duration-300 flex flex-col">
                <figure className="relative bg-[#070f1e] aspect-[4/3] flex items-center justify-center overflow-hidden">
                  {item.file_type?.startsWith('image/') ? (
                    <img src={src} alt={item.title} className="w-full h-full object-cover" />
                  ) : cover ? (
                    <img src={cover} alt={`${item.title} cover`} className="w-full h-full object-cover" />
                  ) : (
                    <div className="flex flex-col items-center justify-center text-center p-6 bg-[#102a43] text-white rounded-lg border border-slate-600">
                      <span className="font-bold text-2xl tracking-wider text-[#c69b46]">PDF</span>
                      <span className="text-xs text-slate-300 mt-1 font-medium">Classroom resource</span>
                    </div>
                  )}
                  {item.resource_type && (
                    <span className="absolute top-3 right-3 bg-[#c69b46] text-white text-[11px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider shadow">
                      {item.resource_type}
                    </span>
                  )}
                </figure>
                <div className="p-6 flex-1 flex flex-col justify-between bg-white">
                  <div>
                    <small className="text-gray-400 text-md font-meduim tracking-wider block mb-1.5 ">
                      {item.audience || 'All learners'}
                    </small>
                    <h3 className="text-xl font-serif font-semibold text-gray-700 mb-2 leading-snug">{item.title}</h3>
                    <p className="text-slate-600 text-base pt-1 mb-6 leading-relaxed line-clamp-3">{item.description}</p>
                  </div>
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-4 mt-auto">
                    <a
                    style={{color:"white"}}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-[#c69b46] hover:bg-[#b58a35] text-white font-meduim text-base tracking-wide transition"
                      href={src}
                      target="_blank"
                      rel="noreferrer"
                    >
                      View material <b className="font-sans">↗</b>
                    </a>
                    <a
                    style={{color:"white"}}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-slate-200 hover:text-white font-meduim text-base transition bg-slate-800/40"
                      href={`${src}${src.includes('?') ? '&' : '?'}download=1`}
                      download={item.file_name}
                    >
                      Download &amp; print <b className="font-sans">↓</b>
                    </a>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
        {!items.length && (
          <p className="text-center py-16 text-slate-400 text-lg">
            New educational resources are coming soon.
          </p>
        )}
      </section>

      {/* CTA Section Banner */}
      <BottomCTA eyebrow={"SCHOOLS AND EDUCATORS"} title={"Want a Ribbis curriculum for your school?"} discription={"Reach out and see what we can do for you. We can explore age-appropriate lessons, workshops, and educational materials designed for your students."} link="/bais-horaah" linktext="Start a conversation →" link2="" link2text=""/>

      <SiteFooter />
    </main>
  );
}

