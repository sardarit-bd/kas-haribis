import { ensureAnalytics } from '../../lib/analytics';
export const dynamic = 'force-dynamic';
export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Record<string, string>;
    const eventType = body.eventType === 'ad_click' ? 'ad_click' : 'page_view',
      path = (body.path || '/').slice(0, 300);
    if (path.startsWith('/admin') || path.includes('preview'))
      return Response.json({ ok: true });
    const visitorId = (body.visitorId || '')
      .replace(/[^a-zA-Z0-9_-]/g, '')
      .slice(0, 80);
    if (!visitorId)
      return Response.json(
        { error: 'Missing visitor identifier' },
        { status: 400 },
      );
    const { env } = await import('cloudflare:workers');
    await ensureAnalytics(env.DB);
    await env.DB.prepare(
      'INSERT INTO site_analytics(event_type,path,visitor_id,item_id,item_name,referrer,created_at) VALUES(?,?,?,?,?,?,?)',
    )
      .bind(
        eventType,
        path,
        visitorId,
        (body.itemId || '').slice(0, 80),
        (body.itemName || '').slice(0, 160),
        (body.referrer || '').slice(0, 400),
        new Date().toISOString(),
      )
      .run();
    return Response.json({ ok: true });
  } catch {
    return Response.json({ ok: false }, { status: 400 });
  }
}
