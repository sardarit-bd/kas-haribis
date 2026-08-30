import { ensureHeterTables } from '../../lib/heter-documents';

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
      <main className="previewPage">
        <div className="previewMissing">
          <h1>Document not found</h1>
          <p>This Heter Iska is not currently published.</p>
          <a href="/heter-iska">← Back to Heter Iska Library</a>
        </div>
      </main>
    );

  return (
    <main className="previewPage">
      <header className="previewToolbar">
        <div>
          <small>WATERMARKED PREVIEW</small>
          <b dir="auto">{document.title}</b>
        </div>
        <nav aria-label="Preview choices">
          <a className="previewBack" href="/heter-iska">
            ← Back to Library
          </a>
          <a
            className="previewPay"
            href={`/heter-iska?document=${encodeURIComponent(document.id)}#purchase`}
          >
            Pay $25 and Download
          </a>
        </nav>
      </header>
      <div className="previewNotice">
        <b>Preview only:</b> this copy is marked NOT PAID. Complete payment to
        receive the clean downloadable PDF.
      </div>
      <iframe
        className="pdfPreviewFrame"
        title={`Watermarked preview of ${document.title}`}
        src={`/api/heter-preview?id=${encodeURIComponent(document.id)}#toolbar=0`}
      />
    </main>
  );
}
