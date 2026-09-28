import { MdKeyboardBackspace } from "react-icons/md";
import { ensureHeterTables } from '../../lib/heter-documents';
import { SiteFooter, SiteHeader } from '../../shared/site-shell';

export const dynamic = 'force-dynamic';

export default async function HeterPreviewPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>;
}) {
  const { id = '' } = await searchParams;
  const { env } = await import('cloudflare:workers');
  await ensureHeterTables(env.DB);
  const document = (await env.DB.prepare(
    'SELECT id,title FROM heter_documents WHERE id=? AND active=1',
  )
    .bind(id)
    .first()) as { id?: string; title?: string } | null;

  if (!document?.id)
    return (
      <>
      <SiteHeader/>
      <main className="h-fit py-32 flex flex-col bg-gray-300">
        <div className="max-w-[600px] m-auto p-[45px] bg-white text-center">
          <h1 className="text-[24px] font-bold text-[#172431] mb-2">Document not found</h1>
          <p className="text-[15px] text-[#637282] mb-4">This Heter Iska is not currently published.</p>
          <a
            href="/heter-iska"
            className="inline-block mt-[15px] text-[#7d6025] font-bold hover:underline transition-colors"
          >
            ← Back to Heter Iska Library
          </a>
        </div>
      </main>
      <SiteFooter/>
      </>
    );

  return (
    <>
      <SiteHeader />
      <main className="h-screen flex flex-col bg-[var(--navy,#102a43)] text-white border-b-[3px] border-b-[var(--gold,#c69b46)]">
        <div className="container">
        <header className="flex flex-col min-[721px]:flex-row items-start min-[721px]:items-center justify-between gap-[25px] py-[17px] px-4 lg:px-8">
          <div className="flex flex-row items-start sm:items-center gap-3 sm:gap-5">
            <a
              className="p-2 bg-gray-200/20 rounded-[4px] font-bold border border-[#ffffff7a] text-white hover:bg-white/10 transition-colors text-center shrink-0"
              href="/heter-iska"
            >
             <MdKeyboardBackspace className="text-3xl"/>
            </a>
            <div className="flex flex-col gap-1">
              <small className="text-[#d8b969] font-bold tracking-[0.11em] text-[11px] uppercase">
                WATERMARKED PREVIEW
              </small>
              <b
                dir="auto"
                className="font-['Georgia',serif] text-[20px] max-[720px]:text-[17px] font-bold text-white leading-tight"
              >
                {document.title}
              </b>
            </div>
          </div>
          <nav
            aria-label="Preview choices"
            className="flex gap-[10px] max-[720px]:w-full max-[720px]:grid max-[720px]:grid-cols-1"
          >
            <a
              className="py-[12px] px-[16px] rounded-[4px] font-bold bg-[var(--gold,#c69b46)] text-white hover:opacity-95 transition-opacity text-center"
              href={`/heter-iska?document=${encodeURIComponent(document.id)}#purchase`}
            >
              Pay $25 and Download
            </a>
          </nav>
        </header>
        </div>
        <div className="py-[10px] px-[5vw] bg-[#fff4d7] text-[#604713] text-center text-[14px] max-[720px]:text-[12px]">
          <b>Preview only:</b> this copy is marked NOT PAID. Complete payment to
          receive the clean downloadable PDF.
        </div>
        <iframe
          className="w-full flex-1 border-0 bg-[#40484e]"
          title={`Watermarked preview of ${document.title}`}
          src={`/api/heter-preview?id=${encodeURIComponent(document.id)}#toolbar=0`}
        />
        
      </main>
      <SiteFooter />
    </>
  );
}
