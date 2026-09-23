import BottomCTA from '../componnent/BottomCTA';
import { listBusinesses } from '../lib/directories';
import { MotionArticle, MotionDiv } from '../shared/motion-components';
import { InteriorPage, SiteFooter, SiteHeader } from '../shared/site-shell';

export const dynamic = 'force-dynamic';
export default async function BusinessesPage() {
  const { env } = await import('cloudflare:workers');
  const businesses = (await listBusinesses(env.DB)) as any[];
  return (
    <>
     <SiteHeader />
    <InteriorPage
      eyebrow="KOSHER COMMERCE DIRECTORY"
      title="Businesses With a Heter Iska"
      intro="A growing directory of businesses listed by Kav Haribis as operating with a Heter Iska. Review the information and confirm that the document remains current before relying on a listing."
    />
      <section className="p-6 sm:p-10 bg-gray-200" id="business-directory">
        <div className="container flex flex-col md:flex-row items-start md:items-end justify-between gap-6 pb-6 px-4 md:px-8">
          <MotionDiv
            initial={{ opacity: 0, scale: 0.90, y: 20 }}
            whileInView={{ opacity: 1, scale: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.6 }}
            className="w-full bg-red-700 text-center py-4 px-4 md:px-10 rounded-2xl shadow-md"
          >
            <p className='text-white text-xl font-bold'>
              "אלא הם דברי הגאון הרב משה שטרנבוך שליט"א בהקדמה לספרו קיצור דיני רבית המצויים "והנה הצורך להיתר עיסקא לחנונים ובעלי עסקים נחוץ ביותר וראוי לרבנים לתקן בארץ ובחו"ל שכל סוחר יחתום בשטר עיסקא ויתלה בחנות או בית עסק במקום בולט"  
            </p>
          </MotionDiv>
        </div>

        <div className="container grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 px-4 md:px-8">
          {businesses.map((item, index) => (
            <MotionArticle
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              whileInView={{ opacity: 1, scale: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.5, delay: (index % 4) * 0.08 }}
              whileHover={{ y: -6, transition: { duration: 0.2 } }}
              key={item.id}
              className="p-6 bg-white flex flex-col justify-between space-y-4 shadow-sm transition-shadow duration-300 hover:shadow-xl group"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between gap-4 pb-4 border-b border-[#f1f5f9]">
                  <div className="w-full h-52 flex items-center justify-center overflow-hidden shrink-0">
                    {item.logo_url ? (
                      <img src={item.logo_url} alt={`${item.name} logo`} className="max-w-full max-h-full object-contain transition-transform duration-500 ease-out group-hover:scale-105" />
                    ) : (
                      <span className="font-serif font-bold text-xl text-[#102a43]">{item.name.charAt(0)}</span>
                    )}
                  </div>
                </div>

                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#e9f4eb] text-[#367448] border border-[#c5e1cd] rounded-full text-xs font-semibold w-max">
                  {item.verification_status || 'LISTED WITH A HETER ISKA'}
                </div>

                <h3 className="text-2xl font-serif font-semibold text-[#102a43]/90 leading-snug group-hover:text-[#a37828] transition-colors" dir={/[֐-׿]/.test(item.name) ? 'rtl' : 'ltr'}>{item.name}</h3>

                {item.category && (
                  <small className="block text-base font-extrabold text-[#c69b46] uppercase tracking-wider">{item.category}</small>
                )}

                <p className="text-base font-meduim text-gray-500 leading-relaxed">
                  {item.description ||
                    'Listed in the Kav Haribis Heter Iska business directory.'}
                </p>

                {(item.address || item.city) && (
                  <address className="not-italic text-xs text-[#64748b] leading-normal block pt-1">
                    {[item.address, item.city, item.state, item.zip]
                      .filter(Boolean)
                      .join(', ')}
                  </address>
                )}

                {item.iska_authority && (
                  <p className="text-xs text-[#102a43] p-3 bg-[#f8fafc] rounded-xl border border-[#e2e8f0]">
                    <b className="font-semibold text-[#102a43]">Heter Iska authority:</b> {item.iska_authority}
                  </p>
                )}
                {item.iska_details && <p className="text-xs text-[#475569] leading-relaxed">{item.iska_details}</p>}
                {item.public_notes && (
                  <p className="p-3 bg-[#fff7e5] border-l-4 border-[#c69b46] rounded-r-xl text-xs text-[#876622]">{item.public_notes}</p>
                )}
                {item.last_verified && (
                  <time className="block text-[11px] text-[#94a3b8]" dateTime={item.last_verified}>
                    Last verified:{' '}
                    {new Date(
                      `${item.last_verified}T00:00:00`,
                    ).toLocaleDateString('en-US')}
                  </time>
                )}
              </div>

              <div className="flex items-center gap-3 pt-4 text-xs font-bold text-[#c69b46] flex-wrap">
                {item.phone && <a href={`tel:${item.phone}`} className="hover:underline">{item.phone}</a>}
                {item.email && <a href={`mailto:${item.email}`} className="hover:underline">Email</a>}
                {item.website && (
                  <a
                    href={
                      item.website.startsWith('http')
                        ? item.website
                        : `https://${item.website}`
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:underline ml-auto"
                  >
                    Website →
                  </a>
                )}
              </div>
            </MotionArticle>
          ))}
        </div>

      </section>

      <MotionDiv
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-50px' }}
        transition={{ duration: 0.5 }}
        className="container flex flex-col md:flex-row items-start md:items-end justify-between gap-6 bg-gray-200"
      >
        <div className='w-full bg-white text-center py-4 px-4 md:px-10'>
          <p className='text-black text-xl font-meduim'>
            <b className='text-red-800'>Disclaimer:</b> Kav Haribis doesn’t take any responsibility for the validity of any of these Heter Iskas, this is for reference only. 
          </p>
        </div>
      </MotionDiv>

      {/* CTA Section Banner */}
      <MotionDiv
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-50px' }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        <BottomCTA eyebrow={"IMPORTANT GUIDANCE"} title={"Verify before relying on a listing"} discription={"A listing is educational information and does not guarantee that every transaction is covered. Confirm that the business’s Heter Iska is current, properly executed, and applicable to the specific arrangement."} link="/bais-horaah" linktext="Ask the Bais Horaah" link2="" link2text=""/>
      </MotionDiv>
      <SiteFooter/>
     </>
  );
}

