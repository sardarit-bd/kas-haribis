import { isOwnerRequest } from '../../lib/request-auth';
import { ADMIN_OWNER } from '../../lib/admin-access';
import {
  researchAccessStatus,
  setResearchAccessCode,
} from '../../lib/research-access';
const OWNER = ADMIN_OWNER;

export async function GET(request: Request) {
  if (!(await isOwnerRequest(request)))
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  const { env } = await import('cloudflare:workers');
  return Response.json(await researchAccessStatus(env.DB));
}

export async function PUT(request: Request) {
  if (!(await isOwnerRequest(request)))
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  const { env } = await import('cloudflare:workers'),
    body = (await request.json()) as any,
    code = String(body.code || '').trim();
  if (!/^\d{6}$/.test(code))
    return Response.json(
      { error: 'Enter exactly six digits.' },
      { status: 400 },
    );
  const updatedAt = await setResearchAccessCode(env.DB, code);
  return Response.json({ saved: true, configured: true, updatedAt });
}
