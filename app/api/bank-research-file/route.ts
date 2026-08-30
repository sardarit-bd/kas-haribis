import { ADMIN_OWNER } from '../../lib/admin-access';
import { ensureBankResearch } from '../../lib/directories';
import { researchIdentity } from '../../lib/research-access';
const OWNER = ADMIN_OWNER;
export async function GET(request: Request) {
  const { env } = await import('cloudflare:workers');
  await ensureBankResearch(env.DB);
  const identity = await researchIdentity(request, env.DB);
  const url = new URL(request.url),
    id = url.searchParams.get('id') || '',
    kind = url.searchParams.get('kind') === 'logo' ? 'logo' : 'report',
    row = (await env.DB.prepare(
      'SELECT researcher_email,workflow_status,logo_key,logo_name,report_key,report_name FROM bank_research_submissions WHERE id=?',
    )
      .bind(id)
      .first()) as any;
  if (!row) return new Response('Not found', { status: 404 });
  const email = identity?.email || '';
  if (kind === 'report' && email !== OWNER && email !== row.researcher_email)
    return new Response('Unauthorized', { status: 401 });
  if (
    kind === 'logo' &&
    row.workflow_status !== 'Approved' &&
    email !== OWNER &&
    email !== row.researcher_email
  )
    return new Response('Unauthorized', { status: 401 });
  const key = kind === 'logo' ? row.logo_key : row.report_key,
    name = kind === 'logo' ? row.logo_name : row.report_name;
  if (!key) return new Response('Not found', { status: 404 });
  const object = await env.BUCKET.get(key);
  if (!object) return new Response('Not found', { status: 404 });
  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set(
    'cache-control',
    kind === 'logo' ? 'public, max-age=3600' : 'private, no-store',
  );
  if (kind === 'report')
    headers.set(
      'content-disposition',
      `inline; filename="${String(name || 'research-report.pdf').replace(/[\"\r\n]/g, '')}"`,
    );
  return new Response(object.body, { headers });
}
