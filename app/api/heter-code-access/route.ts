import { ensureHeterTables } from '../../lib/heter-documents';

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

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      code?: string;
      documentId?: string;
    };
    const code = normalizeCode(clean(body.code, 40)),
      documentId = clean(body.documentId, 80);
    if (code.length !== 10)
      return Response.json(
        { error: 'Enter the complete 10-character access code.' },
        { status: 400 },
      );
    const { env } = await import('cloudflare:workers');
    await ensureHeterTables(env.DB);
    const codeHash = await hashCode(code);
    const record = (await env.DB.prepare(
      'SELECT id,code_type,active,use_count FROM heter_access_codes WHERE code_hash=? AND document_id=?',
    )
      .bind(codeHash, documentId)
      .first()) as {
      id?: string;
      code_type?: string;
      active?: number;
      use_count?: number;
    } | null;
    if (!record?.id || !record.active)
      return Response.json(
        {
          error:
            'This access code is invalid, inactive, or for a different document.',
        },
        { status: 403 },
      );
    const now = new Date().toISOString();
    if (record.code_type === 'single') {
      const update = await env.DB.prepare(
        "UPDATE heter_access_codes SET use_count=1,active=0,last_used_at=? WHERE id=? AND active=1 AND use_count=0 AND code_type='single'",
      )
        .bind(now, record.id)
        .run();
      if (!Number(update.meta?.changes || 0))
        return Response.json(
          { error: 'This single-use code has already been used.' },
          { status: 403 },
        );
    } else {
      const update = await env.DB.prepare(
        "UPDATE heter_access_codes SET use_count=use_count+1,last_used_at=? WHERE id=? AND active=1 AND code_type='reusable'",
      )
        .bind(now, record.id)
        .run();
      if (!Number(update.meta?.changes || 0))
        return Response.json(
          { error: 'This reusable code is no longer active.' },
          { status: 403 },
        );
    }
    const token = `${crypto.randomUUID()}${crypto.randomUUID()}`.replaceAll(
      '-',
      '',
    );
    await env.DB.prepare(
      'INSERT INTO heter_code_downloads(token,document_id,code_id,created_at) VALUES(?,?,?,?)',
    )
      .bind(token, documentId, record.id, now)
      .run();
    return Response.json({
      unlocked: true,
      downloadUrl: `/api/heter-download?token=${token}`,
    });
  } catch (error) {
    console.error('Heter code access error', error);
    return Response.json(
      { error: 'The code could not be verified. Please try again.' },
      { status: 500 },
    );
  }
}
