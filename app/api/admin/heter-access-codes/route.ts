import { getRequestEmail, isOwnerRequest } from '../../../lib/request-auth';
import { ensureHeterTables } from '../../../lib/heter-documents';

const clean = (value: unknown, max: number) =>
  String(value || '')
    .trim()
    .slice(0, max);
const normalizeCode = (value: string) =>
  value.toUpperCase().replace(/[^A-Z0-9]/g, '');
async function hashCode(code: string) {
  const bytes = await crypto.subtle.digest(
    'SHA-256',
    new TextEncoder().encode(normalizeCode(code)),
  );
  return Array.from(new Uint8Array(bytes), (byte) =>
    byte.toString(16).padStart(2, '0'),
  ).join('');
}
function createCode() {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const bytes = crypto.getRandomValues(new Uint8Array(10));
  const raw = Array.from(
    bytes,
    (value) => alphabet[value % alphabet.length],
  ).join('');
  return `${raw.slice(0, 5)}-${raw.slice(5)}`;
}

export async function GET(request: Request) {
  if (!(await isOwnerRequest(request)))
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  const { env } = await import('cloudflare:workers');
  await ensureHeterTables(env.DB);
  const result = await env.DB.prepare(
    'SELECT c.id,c.document_id,c.code_hint,c.label,c.code_type,c.active,c.use_count,c.created_at,c.last_used_at,d.title AS document_title FROM heter_access_codes c JOIN heter_documents d ON d.id=c.document_id ORDER BY c.created_at DESC',
  ).all();
  return Response.json({ codes: result.results });
}

export async function POST(request: Request) {
  if (!(await isOwnerRequest(request)))
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  const body = (await request.json()) as {
    documentId?: string;
    codeType?: string;
    label?: string;
  };
  const documentId = clean(body.documentId, 80),
    codeType = clean(body.codeType, 20),
    label = clean(body.label, 120);
  if (codeType !== 'single' && codeType !== 'reusable')
    return Response.json(
      { error: 'Choose single-use or reusable.' },
      { status: 400 },
    );
  const { env } = await import('cloudflare:workers');
  await ensureHeterTables(env.DB);
  const document = await env.DB.prepare(
    'SELECT id FROM heter_documents WHERE id=?',
  )
    .bind(documentId)
    .first();
  if (!document)
    return Response.json(
      { error: 'Choose a valid Heter Iska.' },
      { status: 400 },
    );
  const code = createCode(),
    normalized = normalizeCode(code);
  await env.DB.prepare(
    'INSERT INTO heter_access_codes(id,document_id,code_hash,code_hint,label,code_type,active,use_count,created_at) VALUES(?,?,?,?,?,?,1,0,?)',
  )
    .bind(
      crypto.randomUUID(),
      documentId,
      await hashCode(normalized),
      `Ends in ${normalized.slice(-4)}`,
      label,
      codeType,
      new Date().toISOString(),
    )
    .run();
  return Response.json({ created: true, code });
}

export async function PUT(request: Request) {
  if (!(await isOwnerRequest(request)))
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  const body = (await request.json()) as { id?: string; active?: boolean };
  const id = clean(body.id, 80);
  const { env } = await import('cloudflare:workers');
  await ensureHeterTables(env.DB);
  if (body.active) {
    const existing = (await env.DB.prepare(
      'SELECT code_type,use_count FROM heter_access_codes WHERE id=?',
    )
      .bind(id)
      .first()) as { code_type?: string; use_count?: number } | null;
    if (existing?.code_type === 'single' && Number(existing.use_count) > 0)
      return Response.json(
        {
          error:
            'A used single-use code cannot be reactivated. Create a new code instead.',
        },
        { status: 400 },
      );
  }
  await env.DB.prepare('UPDATE heter_access_codes SET active=? WHERE id=?')
    .bind(body.active ? 1 : 0, id)
    .run();
  return Response.json({ updated: true });
}

export async function DELETE(request: Request) {
  if (!(await isOwnerRequest(request)))
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  const id = clean(new URL(request.url).searchParams.get('id'), 80);
  const { env } = await import('cloudflare:workers');
  await ensureHeterTables(env.DB);
  await env.DB.prepare('DELETE FROM heter_access_codes WHERE id=?')
    .bind(id)
    .run();
  return Response.json({ deleted: true });
}
