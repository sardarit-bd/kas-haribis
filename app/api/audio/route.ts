import { getRequestEmail, isOwnerRequest } from '../../lib/request-auth';
import { ensureAudio, listAudio } from '../../lib/directories';
const clean = (v: unknown, n: number) =>
  String(v || '')
    .trim()
    .slice(0, n);
async function env() {
  return (await import('cloudflare:workers')).env;
}
export async function GET() {
  const runtime = await env();
  return Response.json({ audios: await listAudio(runtime.DB) });
}
export async function POST(request: Request) {
  if (!(await isOwnerRequest(request)))
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  const runtime = await env();
  await ensureAudio(runtime.DB);
  const body = (await request.json()) as any;
  const title = clean(body.title, 240),
    series = clean(body.series, 40),
    audioUrl = clean(body.audioUrl, 1000);
  if (!title)
    return Response.json(
      { error: 'Enter a recording title.' },
      { status: 400 },
    );
  const id = crypto.randomUUID();
  const max = (await runtime.DB.prepare(
    'SELECT MAX(sort_order) AS value FROM audio_items',
  ).first()) as any;
  await runtime.DB.prepare(
    'INSERT INTO audio_items(id,title,series,audio_url,sort_order,created_at) VALUES(?,?,?,?,?,?)',
  )
    .bind(
      id,
      title,
      series || 'english-series',
      audioUrl,
      Number(max?.value || 0) + 1,
      new Date().toISOString(),
    )
    .run();
  return Response.json({ saved: true, id });
}
export async function PUT(request: Request) {
  if (!(await isOwnerRequest(request)))
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  const runtime = await env();
  await ensureAudio(runtime.DB);
  const body = (await request.json()) as any;
  await runtime.DB.prepare(
    'UPDATE audio_items SET title=?,series=?,audio_url=?,sort_order=? WHERE id=?',
  )
    .bind(
      clean(body.title, 240),
      clean(body.series, 40),
      clean(body.audioUrl, 1000),
      Number(body.sort_order) || 0,
      clean(body.id, 80),
    )
    .run();
  return Response.json({ saved: true });
}
export async function DELETE(request: Request) {
  if (!(await isOwnerRequest(request)))
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  const runtime = await env();
  await ensureAudio(runtime.DB);
  const id = clean(new URL(request.url).searchParams.get('id'), 80);
  const item = (await runtime.DB.prepare(
    'SELECT audio_url FROM audio_items WHERE id=?',
  )
    .bind(id)
    .first()) as { audio_url?: string } | null;
  if (item?.audio_url?.startsWith('/api/audio-file'))
    await runtime.BUCKET.delete(`audio/${id}`);
  await runtime.DB.prepare('DELETE FROM audio_items WHERE id=?').bind(id).run();
  return Response.json({ deleted: true });
}
