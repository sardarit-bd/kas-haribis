import {
  ensureHeterTables,
  importOfficialHeterDocuments,
} from '../../lib/heter-documents';

export async function GET() {
  const { env } = await import('cloudflare:workers');
  await ensureHeterTables(env.DB);
  await importOfficialHeterDocuments(env.DB, env.BUCKET);
  const result = await env.DB.prepare(
    'SELECT id,title,description,filename,size,created_at FROM heter_documents WHERE active=1 ORDER BY created_at DESC',
  ).all();
  return Response.json({ documents: result.results });
}
