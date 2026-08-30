import { getRequestEmail } from '../../lib/request-auth';
import { ADMIN_OWNER } from '../../lib/admin-access';
import { ensureBankResearch } from '../../lib/directories';
import { researchIdentity } from '../../lib/research-access';
const OWNER = ADMIN_OWNER;
const emailOf = async (r: Request) => await getRequestEmail(r);
export async function POST(request: Request) {
  const { env } = await import('cloudflare:workers');
  await ensureBankResearch(env.DB);
  const identity = await researchIdentity(request, env.DB),
    email = identity?.email || '';
  if (!email)
    return Response.json(
      { error: 'Research access is required.' },
      { status: 401 },
    );
  const form = await request.formData(),
    id = String(form.get('id') || ''),
    kind = String(form.get('kind') || ''),
    file = form.get('file'),
    row = (await env.DB.prepare(
      'SELECT researcher_email FROM bank_research_submissions WHERE id=?',
    )
      .bind(id)
      .first()) as any;
  if (!row || (email !== OWNER && row.researcher_email !== email))
    return Response.json(
      { error: 'Research record not found.' },
      { status: 404 },
    );
  if (!(file instanceof File) || !file.size)
    return Response.json({ error: 'Choose a file.' }, { status: 400 });
  const isLogo = kind === 'logo',
    valid = isLogo
      ? /^image\/(png|jpeg|webp)$/.test(file.type)
      : /^(application\/pdf|application\/msword|application\/vnd\.openxmlformats-officedocument\.wordprocessingml\.document)$/.test(
          file.type,
        ),
    limit = isLogo ? 5 * 1024 * 1024 : 20 * 1024 * 1024;
  if (!valid || file.size > limit)
    return Response.json(
      {
        error: isLogo
          ? 'Use a PNG, JPG, or WEBP logo up to 5 MB.'
          : 'Use a PDF or Word research report up to 20 MB.',
      },
      { status: 400 },
    );
  const key = `bank-research/${id}/${isLogo ? 'logo' : 'report'}`;
  await env.BUCKET.put(key, await file.arrayBuffer(), {
    httpMetadata: { contentType: file.type },
  });
  await env.DB.prepare(
    `UPDATE bank_research_submissions SET ${isLogo ? 'logo_key' : 'report_key'}=?,${isLogo ? 'logo_name' : 'report_name'}=?,updated_at=? WHERE id=?`,
  )
    .bind(key, String(file.name).slice(0, 250), new Date().toISOString(), id)
    .run();
  return Response.json({ saved: true, name: file.name });
}
