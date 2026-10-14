import { canAccessSection, isOwnerEmail } from '../../lib/admin-access';
import { ensureBankResearch, ensureBankReportTables } from '../../lib/directories';
import { researchIdentity } from '../../lib/research-access';
import { premiumMemberFromHeaders } from '../../lib/bank-premium';
import { getUserFromCookieHeader } from '../../lib/auth';

export async function GET(request: Request) {
  const { env } = await import('cloudflare:workers');
  await ensureBankResearch(env.DB);
  await ensureBankReportTables(env.DB);

  const url = new URL(request.url),
    id = url.searchParams.get('id') || '',
    kind = url.searchParams.get('kind') === 'logo' ? 'logo' : 'report',
    token = url.searchParams.get('token') || '',
    row = (await env.DB.prepare(
      'SELECT id,title,published_bank_id,researcher_email,workflow_status,logo_key,logo_name,report_key,report_name FROM bank_research_submissions WHERE id=?',
    )
      .bind(id)
      .first()) as any;
  if (!row) return new Response('Not found', { status: 404 });

  const sessionUser = await getUserFromCookieHeader(request.headers.get('cookie'));
  const isOwner = Boolean(sessionUser?.email && isOwnerEmail(sessionUser.email));
  const isStaff = Boolean(
    sessionUser?.email && (await canAccessSection(env.DB, sessionUser.email, 'banks')),
  );

  const identity = await researchIdentity(request, env.DB);
  const researcherEmail = (identity?.email || '').toLowerCase();
  const isResearcherOwner = isOwnerEmail(researcherEmail);
  const isAuthor = Boolean(
    researcherEmail &&
    researcherEmail === String(row.researcher_email || '').toLowerCase(),
  );

  let authorized = false;

  if (kind === 'logo') {
    authorized =
      row.workflow_status === 'Approved' ||
      isOwner ||
      isStaff ||
      isResearcherOwner ||
      isAuthor;
  } else {
    // kind === 'report'
    if (isOwner || isStaff || isResearcherOwner || isAuthor) {
      authorized = true;
    } else if (row.workflow_status === 'Approved') {
      const premium = await premiumMemberFromHeaders(request.headers, env.DB);
      if (premium) {
        authorized = true;
      } else if (token) {
        const accessRecord = (await env.DB.prepare(
          'SELECT created_at,bank_id FROM bank_report_access WHERE token=?',
        )
          .bind(token)
          .first()) as any;
        if (
          accessRecord?.bank_id &&
          accessRecord.created_at &&
          Date.now() - new Date(accessRecord.created_at).getTime() <
            7 * 24 * 60 * 60 * 1000
        ) {
          if (accessRecord.bank_id === row.published_bank_id) {
            authorized = true;
          } else if (!row.published_bank_id && row.title) {
            // Check unambiguous bank title match for legacy unlinked submissions
            const bankRow = (await env.DB.prepare(
              'SELECT id, title FROM banks WHERE id=?',
            )
              .bind(accessRecord.bank_id)
              .first()) as any;
            if (
              bankRow?.title &&
              bankRow.title.trim().toLowerCase() === row.title.trim().toLowerCase()
            ) {
              const countRow = (await env.DB.prepare(
                'SELECT COUNT(*) AS count FROM banks WHERE LOWER(TRIM(title))=LOWER(TRIM(?))',
              )
                .bind(bankRow.title.trim())
                .first()) as { count?: number } | null;
              if (Number(countRow?.count || 0) === 1) {
                authorized = true;
                // Backfill published_bank_id to seal association permanently
                await env.DB.prepare(
                  'UPDATE bank_research_submissions SET published_bank_id=? WHERE id=?',
                )
                  .bind(accessRecord.bank_id, row.id)
                  .run();
              }
            }
          }
        }
      }
    }
  }

  if (!authorized) return new Response('Unauthorized', { status: 401 });

  const key = kind === 'logo' ? row.logo_key : row.report_key,
    name = kind === 'logo' ? row.logo_name : row.report_name;
  if (!key) return new Response('Not found', { status: 404 });
  const object = await env.BUCKET.get(key);
  if (!object) return new Response('Not found', { status: 404 });
  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set(
    'cache-control',
    kind === 'logo' ? 'public, max-age=3600' : 'private, no-store',
  );
  if (kind === 'report')
    headers.set(
      'content-disposition',
      `inline; filename="${String(name || 'research-report.pdf').replace(/[\"\r\n]/g, '')}"`,
    );
  return new Response(object.body, { headers });
}
