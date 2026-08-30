import { getRequestEmail, isOwnerRequest } from '../../lib/request-auth';
import { ADMIN_OWNER } from '../../lib/admin-access';
import { ensureContactSubmissions } from '../../lib/contact-submissions';
const owner = ADMIN_OWNER;
const clean = (v: unknown, n = 5000) =>
    String(v ?? '')
      .trim()
      .slice(0, n);
async function runtime() {
  const { env } = await import('cloudflare:workers');
  await ensureContactSubmissions(env.DB);
  return env;
}


export async function POST(request: Request) {
  const form = await request.formData(),
    name = clean(form.get('name'), 200),
    email = clean(form.get('email'), 300).toLowerCase(),
    message = clean(form.get('message'), 10000);
  if (!name || !email || !message)
    return Response.json(
      { error: 'Name, email, and message are required.' },
      { status: 400 },
    );
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    return Response.json(
      { error: 'Enter a valid email address.' },
      { status: 400 },
    );
  if (message.length < 10)
    return Response.json(
      { error: 'Please provide a little more detail.' },
      { status: 400 },
    );
  const env = await runtime(),
    id = crypto.randomUUID(),
    reference = `KH-C-${id.slice(0, 8).toUpperCase()}`,
    now = new Date().toISOString(),
    file = form.get('attachment');
  let attachmentKey = '',
    attachmentName = '';
  if (file instanceof File && file.size) {
    if (file.size > 10 * 1024 * 1024)
      return Response.json(
        { error: 'The supporting document must be 10 MB or smaller.' },
        { status: 400 },
      );
    if (
      !/^(application\/pdf|application\/msword|application\/vnd\.openxmlformats-officedocument\.wordprocessingml\.document|image\/(png|jpeg|webp))$/.test(
        file.type,
      )
    )
      return Response.json(
        { error: 'Use a PDF, Word document, JPG, PNG, or WEBP file.' },
        { status: 400 },
      );
    attachmentKey = `contact-attachments/${id}`;
    attachmentName = clean(file.name, 250);
    await env.BUCKET.put(attachmentKey, await file.arrayBuffer(), {
      httpMetadata: { contentType: file.type },
    });
  }
  await env.DB.prepare(
    "INSERT INTO contact_submissions(id,reference,name,email,phone,organization,topic,message,response_method,status,notes,created_at,updated_at,related_name,related_url,request_subtype,preferred_date,location,audience,attachment_key,attachment_name) VALUES(?,?,?,?,?,?,?,?,?,'New','',?,?,?,?,?,?,?,?,?,?)",
  )
    .bind(
      id,
      reference,
      name,
      email,
      clean(form.get('phone'), 100),
      clean(form.get('organization'), 300),
      clean(form.get('topic'), 200) || 'General message',
      message,
      clean(form.get('response_method'), 100) || 'Email',
      now,
      now,
      clean(form.get('related_name'), 300),
      clean(form.get('related_url'), 1000),
      clean(form.get('request_subtype'), 300),
      clean(form.get('preferred_date'), 30),
      clean(form.get('location'), 300),
      clean(form.get('audience'), 300),
      attachmentKey,
      attachmentName,
    )
    .run();
  return Response.json({ reference });
}


export async function GET(request: Request) {
  if (
    !(await isOwnerRequest(request))
  )
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  const env = await runtime(),
    q = await env.DB.prepare(
      'SELECT * FROM contact_submissions ORDER BY created_at DESC',
    ).all();
  return Response.json({ submissions: q.results });
}


export async function PUT(request: Request) {
  if (
    !(await isOwnerRequest(request))
  )
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  const b = (await request.json()) as any,
    env = await runtime();
  await env.DB.prepare(
    'UPDATE contact_submissions SET status=?,notes=?,updated_at=? WHERE id=?',
  )
    .bind(
      clean(b.status, 50) || 'New',
      clean(b.notes, 10000),
      new Date().toISOString(),
      clean(b.id, 100),
    )
    .run();
  return Response.json({ saved: true });
}



export async function DELETE(request: Request) {
  if (
    !(await isOwnerRequest(request))
  )
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  const env = await runtime(),
    id = clean(new URL(request.url).searchParams.get('id'), 100),
    row = (await env.DB.prepare(
      'SELECT attachment_key FROM contact_submissions WHERE id=?',
    )
      .bind(id)
      .first()) as any;
  if (row?.attachment_key) await env.BUCKET.delete(row.attachment_key);
  await env.DB.prepare('DELETE FROM contact_submissions WHERE id=?')
    .bind(id)
    .run();
  return Response.json({ deleted: true });
}
