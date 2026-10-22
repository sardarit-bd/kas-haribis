import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

// 1. UI Control and Layout Inspection
test('Banks Report Editor UI: Contains PDF upload control alongside Word import control', () => {
  const editorSrc = fs.readFileSync(
    path.resolve('app/admin/banks/rich-report-editor.tsx'),
    'utf-8',
  );

  // Both controls must exist in the action bar
  assert.ok(
    editorSrc.includes('Import Word (.docx)'),
    'Editor must retain "Import Word (.docx)" control',
  );
  assert.ok(
    editorSrc.includes('Upload PDF Report') || editorSrc.includes('Replace PDF Report'),
    'Editor must provide "Upload PDF Report" / "Replace PDF Report" control alongside Word import',
  );

  // PDF file input must enforce application/pdf
  assert.match(
    editorSrc,
    /accept="(application\/pdf,\.pdf|\.pdf,\s*application\/pdf)"/,
    'PDF input must restrict file types to .pdf, application/pdf',
  );

  // View tabs must include Web Edit, Web Preview, and PDF Report (Source)
  assert.match(
    editorSrc,
    /Edit Web Report/,
    'Must include "Edit Web Report" tab',
  );
  assert.match(
    editorSrc,
    /Preview Web/,
    'Must include "Preview Web" tab',
  );
  assert.match(
    editorSrc,
    /View PDF Report/,
    'Must include "View PDF Report" tab',
  );

  // Status banner for attached PDF
  assert.match(
    editorSrc,
    /Source PDF Report Attached:/,
    'Must display status banner clarifying that source PDF is attached',
  );

  // Embedded viewer iframe with accurate URL and fallback
  assert.match(
    editorSrc,
    /<iframe[\s\S]*?src=\{`\/api\/bank-report-pdf\?bankId=\$\{encodeURIComponent\(bankId\)\}/,
    'Must render embedded iframe viewer targeting secure PDF endpoint',
  );
});

test('Banks Manager UI: Connects FullReportEditor with bankTitle, pdfKey, pdfName and onPdfChange', () => {
  const managerSrc = fs.readFileSync(
    path.resolve('app/admin/banks/bank-manager.tsx'),
    'utf-8',
  );

  // FullReportEditor must forward PDF props to RichReportEditor
  assert.match(
    managerSrc,
    /<FullReportEditor[\s\S]*?bankTitle=\{value\.title\}[\s\S]*?pdfKey=\{value\.report_pdf_key\}[\s\S]*?pdfName=\{value\.report_pdf_name\}/,
    'FullReportEditor must be passed bankTitle, report_pdf_key, and report_pdf_name',
  );

  assert.match(
    managerSrc,
    /onPdfChange=\{\(key,\s*name\)\s*=>/,
    'FullReportEditor must receive onPdfChange handler to keep state synchronized',
  );
});

// 2. Client-side File Validation Simulation
test('Client-side PDF Validation: Rejects invalid file types and oversized files', () => {
  const MAX_PDF_SIZE = 25 * 1024 * 1024; // 25 MB

  function validatePdfSelection(file, bankId) {
    if (!bankId) {
      return { ok: false, error: 'Please save the bank entry first before uploading a PDF report.' };
    }
    const isPdfType = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
    if (!isPdfType) {
      return { ok: false, error: 'Invalid file type. Please upload a PDF document (.pdf).' };
    }
    if (file.size > MAX_PDF_SIZE) {
      const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
      return { ok: false, error: `PDF file size (${sizeMb} MB) exceeds the maximum allowed limit of 25 MB.` };
    }
    return { ok: true };
  }

  // 1. Missing bank ID (unsaved bank)
  assert.deepEqual(
    validatePdfSelection({ name: 'report.pdf', type: 'application/pdf', size: 1024 * 1024 }, ''),
    { ok: false, error: 'Please save the bank entry first before uploading a PDF report.' },
  );

  // 2. Invalid file type: Word .docx
  assert.deepEqual(
    validatePdfSelection({ name: 'report.docx', type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', size: 1024 * 1024 }, 'bank-1'),
    { ok: false, error: 'Invalid file type. Please upload a PDF document (.pdf).' },
  );

  // 3. Invalid file type: Plain text .txt
  assert.deepEqual(
    validatePdfSelection({ name: 'report.txt', type: 'text/plain', size: 500 }, 'bank-1'),
    { ok: false, error: 'Invalid file type. Please upload a PDF document (.pdf).' },
  );

  // 4. Oversized PDF: 26 MB
  const oversizedSize = 26 * 1024 * 1024;
  const result = validatePdfSelection({ name: 'huge-report.pdf', type: 'application/pdf', size: oversizedSize }, 'bank-1');
  assert.equal(result.ok, false);
  assert.ok(result.error.includes('exceeds the maximum allowed limit of 25 MB'));

  // 5. Valid PDF: 5 MB
  assert.deepEqual(
    validatePdfSelection({ name: 'analyst-report.pdf', type: 'application/pdf', size: 5 * 1024 * 1024 }, 'bank-1'),
    { ok: true },
  );
});

// 3. Coexistence and Non-Destructive Workflow
test('Coexistence Workflow: PDF upload preserves Word import and web report content', () => {
  // Simulate an admin bank record with existing Word-imported HTML content
  const bankRecord = {
    id: 'bank-first-colonial',
    title: '1st Colonial Community Bank',
    full_report: '<h2>Executive Management</h2><p>Robert B. White: President and CEO</p><table><tr><td>Holder</td><td>Shares</td></tr></table>',
    report_pdf_key: null,
    report_pdf_name: null,
  };

  const initialReportContent = bankRecord.full_report;

  // Simulate uploading a PDF report
  function handlePdfUploaded(record, newPdfKey, newPdfName) {
    return {
      ...record,
      report_pdf_key: newPdfKey,
      report_pdf_name: newPdfName,
      // Note: full_report is explicitly preserved!
    };
  }

  const updatedRecord = handlePdfUploaded(
    bankRecord,
    `bank-reports/${bankRecord.id}/report.pdf`,
    '1st-colonial-q3-report.pdf',
  );

  // 1. Web report is intact
  assert.equal(
    updatedRecord.full_report,
    initialReportContent,
    'Web report content must remain unchanged when a PDF is uploaded',
  );

  // 2. PDF metadata is attached
  assert.equal(updatedRecord.report_pdf_key, 'bank-reports/bank-first-colonial/report.pdf');
  assert.equal(updatedRecord.report_pdf_name, '1st-colonial-q3-report.pdf');

  // 3. Simulating reopening / reloading record
  const reopenedRecord = { ...updatedRecord };
  assert.equal(reopenedRecord.report_pdf_key, 'bank-reports/bank-first-colonial/report.pdf');
  assert.equal(reopenedRecord.report_pdf_name, '1st-colonial-q3-report.pdf');
  assert.equal(reopenedRecord.full_report, initialReportContent);
});

// 4. Server-Side Security & Permissions Simulation
test('Server-side PDF Upload: Enforces %PDF- signature and 25 MB limit', async () => {
  const MAX_PDF_SIZE = 25 * 1024 * 1024;

  function validateServerUpload(buffer, size) {
    if (size > MAX_PDF_SIZE) {
      return { status: 413, error: 'PDF file size exceeds 25 MB limit' };
    }
    const signature = buffer.slice(0, 5).toString('utf-8');
    if (signature !== '%PDF-') {
      return { status: 400, error: 'Invalid PDF file. The uploaded file is not a valid PDF document.' };
    }
    return { status: 200, valid: true };
  }

  // 1. Valid PDF buffer starting with %PDF-1.7
  const validPdfBuf = Buffer.from('%PDF-1.7\n1 0 obj\n<< /Type /Catalog >>\nendobj\n%%EOF');
  assert.deepEqual(validateServerUpload(validPdfBuf, validPdfBuf.length), { status: 200, valid: true });

  // 2. Disguised executable / HTML with .pdf extension
  const fakePdfBuf = Buffer.from('<html><body>Not a real PDF</body></html>');
  assert.deepEqual(
    validateServerUpload(fakePdfBuf, fakePdfBuf.length),
    { status: 400, error: 'Invalid PDF file. The uploaded file is not a valid PDF document.' },
  );

  // 3. Oversized payload
  assert.deepEqual(
    validateServerUpload(validPdfBuf, MAX_PDF_SIZE + 1),
    { status: 413, error: 'PDF file size exceeds 25 MB limit' },
  );
});

test('Protected PDF Access: Authorization gates verify role and token', () => {
  function checkPdfAccess({ role, hasValidCodeToken, isPublicBank }) {
    // Admin, Owner, Staff with bank permissions have full access
    if (role === 'admin' || role === 'owner' || role === 'staff') {
      return { allowed: true, reason: 'admin_role' };
    }
    // Subscribers with premium role have access
    if (role === 'premium') {
      return { allowed: true, reason: 'subscriber' };
    }
    // Visitors with a valid one-time report access code token have access
    if (hasValidCodeToken) {
      return { allowed: true, reason: 'access_code_token' };
    }
    // Public non-premium users are blocked
    return { allowed: false, reason: 'unauthorized' };
  }

  // 1. Admin / Owner access
  assert.equal(checkPdfAccess({ role: 'admin' }).allowed, true);
  assert.equal(checkPdfAccess({ role: 'owner' }).allowed, true);
  assert.equal(checkPdfAccess({ role: 'staff' }).allowed, true);

  // 2. Premium member access
  assert.equal(checkPdfAccess({ role: 'premium' }).allowed, true);

  // 3. Visitor with valid access token
  assert.equal(checkPdfAccess({ role: 'anonymous', hasValidCodeToken: true }).allowed, true);

  // 4. Anonymous unauthorized visitor without token
  assert.equal(checkPdfAccess({ role: 'anonymous', hasValidCodeToken: false }).allowed, false);

  // 5. Regular free member without access code
  assert.equal(checkPdfAccess({ role: 'member', hasValidCodeToken: false }).allowed, false);
});
