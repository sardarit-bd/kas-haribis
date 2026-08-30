import { getCurrentUser } from '../../lib/auth';
import {
  ensureMembership,
  getOrCreateMember,
  listMemberOrders,
} from '../../lib/members';
const clean = (value: unknown, limit = 300) =>
  String(value ?? '')
    .trim()
    .slice(0, limit);
async function runtime() {
  const { env } = await import('cloudflare:workers');
  await ensureMembership(env.DB);
  return env;
}
export async function GET() {
  const user = await getCurrentUser();
  if (!user)
    return Response.json({ error: 'Sign in is required.' }, { status: 401 });
  const env = await runtime();
  const member = await getOrCreateMember(
    env.DB,
    user.email.toLowerCase(),
    user.fullName || '',
  );
  const orders = await listMemberOrders(env.DB, member.email);
  return Response.json({ member, orders });
}
export async function PUT(request: Request) {
  const user = await getCurrentUser();
  if (!user)
    return Response.json({ error: 'Sign in is required.' }, { status: 401 });
  const body = (await request.json()) as any,
    env = await runtime(),
    email = user.email.toLowerCase(),
    now = new Date().toISOString();
  await getOrCreateMember(env.DB, email, user.fullName || '');
  await env.DB.prepare(
    'UPDATE members SET name=?,phone=?,newsletter=?,ribbis_alerts=?,discounts=?,updated_at=? WHERE email=?',
  )
    .bind(
      clean(body.name, 200),
      clean(body.phone, 100),
      body.newsletter ? 1 : 0,
      body.ribbisAlerts ? 1 : 0,
      body.discounts ? 1 : 0,
      now,
      email,
    )
    .run();
  return Response.json({ saved: true });
}
