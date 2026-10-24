import { canAccessSection, isOwnerEmail } from '../../lib/admin-access';
import { ensureBankReportTables, ensureBankResearch } from '../../lib/directories';
import { premiumMemberFromHeaders } from '../../lib/bank-premium';
import { getUserFromCookieHeader } from '../../lib/auth';

function sanitizeFilename(title: string): string {
  const clean = title.replace(/[^a-zA-Z0-9_\-\.]/g, '_').replace(/_+/g, '_');
  return (clean || 'Report').slice(0, 80) + '.pdf';
}

export async function GET(request: Request) {
  const { env } = await import('cloudflare:workers');
  await ensureBankReportTables(env.DB);
  await ensureBankResearch(env.DB);

  const url = new URL(request.url);
  const bankId = String(url.searchParams.get('bankId') || url.searchParams.get('id') || '').trim();
  const token = String(url.searchParams.get('token') || '').trim();
  const download = url.searchParams.get('download') === '1' || url.searchParams.get('download') === 'true';

  if (!bankId) {
    return new Response('Bank ID is required.', { status: 400 });
  }

  // 1. Verify Bank Record exists in D1
  const bank = (await env.DB.prepare(
    'SELECT id, title, report_pdf_key, report_pdf_name FROM banks WHERE id=?',
  )
    .bind(bankId)
    .first()) as {
    id: string;
    title: string;
    report_pdf_key: string;
    report_pdf_name: string;
  } | null;

  if (!bank) {
    return new Response('Bank not found.', { status: 404 });
  }

  // 2. Resolve PDF Key from banks table or fallback to approved research submission
  let pdfKey = String(bank.report_pdf_key || '').trim();
  let pdfName = String(bank.report_pdf_name || '').trim();

  if (!pdfKey) {
    const approvedSubmission = (await env.DB.prepare(
      "SELECT report_key, report_name FROM bank_research_submissions WHERE published_bank_id=? AND workflow_status='Approved' ORDER BY updated_at DESC LIMIT 1",
    )
      .bind(bankId)
      .first()) as { report_key?: string; report_name?: string } | null;

    if (approvedSubmission?.report_key) {
      pdfKey = approvedSubmission.report_key.trim();
      pdfName = approvedSubmission.report_name?.trim() || '';
    } else if (bank.title?.trim()) {
      // Safe fallback for legacy unlinked submissions:
      // Verify that candidate is uniquely identified and verified as belonging to the requested bank.
      const cleanTitle = bank.title.trim();

      // 1. Verify unambiguous bank title: exactly 1 bank with this title exists
      const bankCountRow = (await env.DB.prepare(
        'SELECT COUNT(*) AS count FROM banks WHERE LOWER(TRIM(title))=LOWER(TRIM(?))',
      )
        .bind(cleanTitle)
        .first()) as { count?: number } | null;

      if (Number(bankCountRow?.count || 0) === 1) {
        // 2. Query all unlinked approved submissions matching this exact title
        const titleMatches = (await env.DB.prepare(
          "SELECT id, report_key, report_name FROM bank_research_submissions WHERE (published_bank_id IS NULL OR published_bank_id='') AND LOWER(TRIM(title))=LOWER(TRIM(?)) AND workflow_status='Approved'",
        )
          .bind(cleanTitle)
          .all()).results as Array<{ id: string; report_key?: string; report_name?: string }>;

        const validMatches = titleMatches.filter(
          (m) =>
            Boolean(m.report_key && m.report_key.trim()) &&
            String(m.report_name || m.report_key).toLowerCase().endsWith('.pdf'),
        );

        // Exactly 1 unlinked submission with a valid PDF report must exist
        if (validMatches.length === 1) {
          const match = validMatches[0];
          pdfKey = match.report_key!.trim();
          pdfName = match.report_name?.trim() || '';

          // Backfill association so future queries and token downloads use published_bank_id directly
          await env.DB.prepare(
            'UPDATE bank_research_submissions SET published_bank_id=? WHERE id=?',
          )
            .bind(bankId, match.id)
            .run();
        }
      }
    }
  }

  if (!pdfKey) {
    return new Response('No original PDF document attached for this bank.', { status: 404 });
  }

  const isPdfExtension =
    pdfName.toLowerCase().endsWith('.pdf') ||
    pdfKey.toLowerCase().endsWith('.pdf') ||
    pdfKey.startsWith('bank-reports/');

  if (!isPdfExtension) {
    return new Response('The attached document for this bank is not a PDF file.', { status: 415 });
  }

  // 3. Authorization check
  const sessionUser = await getUserFromCookieHeader(request.headers.get('cookie'));
  const isOwner = Boolean(sessionUser?.email && isOwnerEmail(sessionUser.email));
  const isStaff = Boolean(
    sessionUser?.email && (await canAccessSection(env.DB, sessionUser.email, 'banks')),
  );
  const premium = await premiumMemberFromHeaders(request.headers, env.DB);

  let authorized = isOwner || isStaff || Boolean(premium);

  if (!authorized && token) {
    const accessRecord = (await env.DB.prepare(
      'SELECT created_at, bank_id FROM bank_report_access WHERE token=?',
    )
      .bind(token)
      .first()) as { created_at?: string; bank_id?: string } | null;

    if (
      accessRecord?.bank_id === bankId &&
      accessRecord.created_at &&
      Date.now() - new Date(accessRecord.created_at).getTime() < 7 * 24 * 60 * 60 * 1000
    ) {
      authorized = true;
    }
  }

  if (!authorized) {
    return new Response('Unauthorized access. A valid premium membership or 7-day token is required.', {
      status: 401,
    });
  }

  // 4. Retrieve PDF stream from Cloudflare R2
  const object = await env.BUCKET.get(pdfKey);
  if (!object || !object.body) {
    return new Response('The attached PDF document file could not be found in storage.', {
      status: 404,
    });
  }

  const dispositionType = download ? 'attachment' : 'inline';
  const downloadFilename = sanitizeFilename(pdfName || `${bank.title}-Report`);

  return new Response(object.body, {
    status: 200,
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `${dispositionType}; filename="${downloadFilename}"`,
      'X-Content-Type-Options': 'nosniff',
      'Cache-Control': 'private, no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
    },
  });
}
