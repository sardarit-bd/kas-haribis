import { getRequestEmail, isOwnerRequest } from '../../lib/request-auth';
import { ADMIN_OWNER } from '../../lib/admin-access';
import { ensureCertificationApplications } from '../../lib/certification-applications';
const owner = ADMIN_OWNER;
const clean = (value: unknown, length = 5000) =>
    String(value ?? '')
      .trim()
      .slice(0, length);
async function runtime() {
  const { env } = await import('cloudflare:workers');
  await ensureCertificationApplications(env.DB);
  return env;
}
export async function POST(request: Request) {
  const form = await request.formData(),
    company = clean(form.get('company_name'), 300),
    name = clean(form.get('contact_name'), 200),
    email = clean(form.get('email'), 300).toLowerCase(),
    details = clean(form.get('structure_details'), 15000);
  if (!company || !name || !email || !details)
    return Response.json(
      {
        error:
          'Company name, contact name, email, and structure details are required.',
      },
      { status: 400 },
    );
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    return Response.json(
      { error: 'Enter a valid email address.' },
      { status: 400 },
    );
  const env = await runtime(),
    id = crypto.randomUUID(),
    reference = `KH-IC-${id.slice(0, 8).toUpperCase()}`,
    now = new Date().toISOString(),
    file = form.get('attachment');
  let key = '',
    fileName = '';
  if (file instanceof File && file.size) {
    if (file.size > 15 * 1024 * 1024)
      return Response.json(
        { error: 'The supporting document must be 15 MB or smaller.' },
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
    key = `certification-applications/${id}`;
    fileName = clean(file.name, 250);
    await env.BUCKET.put(key, await file.arrayBuffer(), {
      httpMetadata: { contentType: file.type },
    });
  }
  await env.DB.prepare(
    "INSERT INTO certification_applications(id,reference,company_name,contact_name,email,phone,website,investment_type,offering_name,minimum_investment,structure_details,investor_profile,current_heter_iska,desired_timeline,response_method,status,notes,attachment_key,attachment_name,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,'New','',?,?,?,?)",
  )
    .bind(
      id,
      reference,
      company,
      name,
      email,
      clean(form.get('phone'), 100),
      clean(form.get('website'), 1000),
      clean(form.get('investment_type'), 200),
      clean(form.get('offering_name'), 300),
      clean(form.get('minimum_investment'), 100),
      details,
      clean(form.get('investor_profile'), 3000),
      clean(form.get('current_heter_iska'), 100),
      clean(form.get('desired_timeline'), 200),
      clean(form.get('response_method'), 100) || 'Email',
      key,
      fileName,
      now,
      now,
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
    query = await env.DB.prepare(
      'SELECT * FROM certification_applications ORDER BY created_at DESC',
    ).all();
  return Response.json({ applications: query.results });
}
export async function PUT(request: Request) {
  if (
    !(await isOwnerRequest(request))
  )
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  const body = (await request.json()) as any,
    env = await runtime();
  await env.DB.prepare(
    'UPDATE certification_applications SET status=?,notes=?,updated_at=? WHERE id=?',
  )
    .bind(
      clean(body.status, 100),
      clean(body.notes, 15000),
      new Date().toISOString(),
      clean(body.id, 100),
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
      'SELECT attachment_key FROM certification_applications WHERE id=?',
    )
      .bind(id)
      .first()) as any;
  if (row?.attachment_key) await env.BUCKET.delete(row.attachment_key);
  await env.DB.prepare('DELETE FROM certification_applications WHERE id=?')
    .bind(id)
    .run();
  return Response.json({ deleted: true });
}
