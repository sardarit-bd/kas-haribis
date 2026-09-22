import { canAccessSection } from '../../lib/admin-access';
import { getRequestEmail } from '../../lib/request-auth';
import { ensureAboutMembers, listAboutMembers } from '../../lib/directories';

const clean = (v: unknown, n = 8000) =>
  String(v ?? '')
    .trim()
    .slice(0, n);

async function runtime() {
  return (await import('cloudflare:workers')).env;
}

async function checkAuth(request: Request, db: any) {
  const email = await getRequestEmail(request);
  return canAccessSection(db, email, 'about-members');
}

export async function GET(request: Request) {
  const e = await runtime();
  const authorized = await checkAuth(request, e.DB);
  const members = await listAboutMembers(e.DB, authorized);
  return Response.json({ members });
}

export async function POST(request: Request) {
  const e = await runtime();
  if (!(await checkAuth(request, e.DB))) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await ensureAboutMembers(e.DB);
  const body = (await request.json()) as any;

  const category = clean(body.category, 200) || 'Committee Members';
  const name = clean(body.name, 300);
  const designation = clean(body.designation, 500);
  const description = clean(body.description, 4000);
  const imageUrl = clean(body.image_url, 1000) || '/assets/avatar.webp';

  if (!name) {
    return Response.json({ error: 'Member name is required.' }, { status: 400 });
  }

  const id = clean(body.id, 80) || crypto.randomUUID();
  const now = new Date().toISOString();
  const published = body.published !== false && body.published !== 0 && body.published !== 'false' ? 1 : 0;
  const sortOrder = Number(body.sort_order) || 0;

  await e.DB.prepare(
    'INSERT INTO about_members(id, category, name, designation, description, image_url, published, sort_order, created_at, updated_at) VALUES(?,?,?,?,?,?,?,?,?,?)',
  )
    .bind(id, category, name, designation, description, imageUrl, published, sortOrder, now, now)
    .run();

  return Response.json({ saved: true, id });
}

export async function PUT(request: Request) {
  const e = await runtime();
  if (!(await checkAuth(request, e.DB))) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await ensureAboutMembers(e.DB);
  const body = (await request.json()) as any;
  const id = clean(body.id, 80);

  if (!id) {
    return Response.json({ error: 'Member ID is required.' }, { status: 400 });
  }

  const category = clean(body.category, 200) || 'Committee Members';
  const name = clean(body.name, 300);
  const designation = clean(body.designation, 500);
  const description = clean(body.description, 4000);
  const imageUrl = clean(body.image_url, 1000) || '/assets/avatar.webp';

  if (!name) {
    return Response.json({ error: 'Member name is required.' }, { status: 400 });
  }

  const published = body.published ? 1 : 0;
  const sortOrder = Number(body.sort_order) || 0;

  await e.DB.prepare(
    'UPDATE about_members SET category=?, name=?, designation=?, description=?, image_url=?, published=?, sort_order=?, updated_at=? WHERE id=?',
  )
    .bind(category, name, designation, description, imageUrl, published, sortOrder, new Date().toISOString(), id)
    .run();

  return Response.json({ saved: true });
}

export async function DELETE(request: Request) {
  const e = await runtime();
  if (!(await checkAuth(request, e.DB))) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const url = new URL(request.url);
  const id = clean(url.searchParams.get('id'), 80);

  if (!id) {
    return Response.json({ error: 'Missing member ID.' }, { status: 400 });
  }

  await ensureAboutMembers(e.DB);
  await e.DB.prepare('DELETE FROM about_members WHERE id=?').bind(id).run();

  return Response.json({ deleted: true });
}
