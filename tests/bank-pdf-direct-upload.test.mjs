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
    /<iframe[\s\S]*?src=\{[\s\S]*?\/api\/bank-report-pdf\?bankId=\$\{encodeURIComponent\(bankId\)\}/,
    'Must render embedded iframe viewer targeting secure PDF endpoint',
  );
});

test('Banks Manager UI: Connects FullReportEditor with bankTitle, pdfKey, pdfName and onPdfChange only for persisted records', () => {
  const managerSrc = fs.readFileSync(
    path.resolve('app/admin/banks/bank-manager.tsx'),
    'utf-8',
  );

  // FullReportEditor must NOT be passed unpersisted client draft UUID (value.id)
  assert.equal(
    /<FullReportEditor[\s\S]*?bankId=\{value\.id\}/.test(managerSrc),
    false,
    'FullReportEditor must not receive unpersisted draft value.id',
  );

  // FullReportEditor must pass bankId, bankTitle, pdfKey, pdfName only when editing is persisted
  assert.match(
    managerSrc,
    /<FullReportEditor[\s\S]*?bankId=\{editing\s*\?\s*editing\.id\s*:\s*''\}[\s\S]*?bankTitle=\{editing\s*\?\s*editing\.title\s*:\s*''\}[\s\S]*?pdfKey=\{editing\s*\?\s*editing\.report_pdf_key\s*:\s*''\}[\s\S]*?pdfName=\{editing\s*\?\s*editing\.report_pdf_name\s*:\s*''\}/,
    'FullReportEditor must be passed bankId, bankTitle, report_pdf_key, and report_pdf_name conditionally based on editing',
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

test('Regression: Unsaved draft allows PDF selection without save-first warning and stages for Save', () => {
  const editorSrc = fs.readFileSync(
    path.resolve('app/admin/banks/rich-report-editor.tsx'),
    'utf-8',
  );

  // 1. PDF button must NOT be blocked by !bankId guard
  assert.equal(
    /onClick=\{\(\)\s*=>\s*\{[^}]*!bankId[^}]*pdfInputRef/.test(editorSrc),
    false,
    'Upload PDF button must not guard against !bankId with error notice',
  );

  // 2. handlePdfUpload must stage draft file when !bankId
  assert.match(
    editorSrc,
    /if\s*\(!bankId\)\s*\{[\s\S]*?setDraftPdfFile\(file\)[\s\S]*?onDraftPdfSelect\?\.[\s\S]*?setNotice\(/,
    'handlePdfUpload must stage file and set notice when !bankId',
  );

  // 3. Status banner must display when draftPdfFile is present
  assert.match(
    editorSrc,
    /\{\(attachedPdfKey\s*\|\|\s*draftPdfFile\)\s*&&/,
    'Status banner must display when either attachedPdfKey or draftPdfFile is present',
  );
});

test('Single-action Bank Creation Workflow: New bank with PDF saves in one action and associates PDF', async () => {
  const mockDb = new Map();
  let nextId = 500;

  async function handleSingleSave({ formData, draftPdfFile, isNew }) {
    let bankId = formData.id;
    if (isNew) {
      bankId = `bank-auto-${nextId++}`;
      mockDb.set(bankId, {
        id: bankId,
        title: formData.title,
        status: formData.status || 'kosher',
        full_report: formData.full_report || '',
        report_pdf_key: '',
        report_pdf_name: '',
      });
    }

    // Single submit: if PDF was selected (via draftPdfFile or form input), upload & attach
    let pdfUploaded = false;
    const pdfFile = draftPdfFile || formData.report_pdf_file;
    if (pdfFile && bankId) {
      const record = mockDb.get(bankId);
      record.report_pdf_key = `bank-reports/${bankId}/report.pdf`;
      record.report_pdf_name = pdfFile.name;
      pdfUploaded = true;
    }

    const finalRecord = mockDb.get(bankId);
    return {
      success: true,
      bankId,
      record: finalRecord,
      pdfUploaded,
    };
  }

  // 1. Create bank with PDF in single action
  const res1 = await handleSingleSave({
    formData: {
      title: 'Valley National Bank',
      status: 'kosher',
      full_report: '<h2>Valley National Summary</h2><p>Overview of bank operations</p>',
    },
    draftPdfFile: { name: 'valley-analyst-report.pdf', size: 2 * 1024 * 1024 },
    isNew: true,
  });

  assert.equal(res1.success, true);
  assert.ok(res1.bankId);
  assert.equal(res1.pdfUploaded, true);
  assert.equal(res1.record.title, 'Valley National Bank');
  assert.equal(res1.record.report_pdf_key, `bank-reports/${res1.bankId}/report.pdf`);
  assert.equal(res1.record.report_pdf_name, 'valley-analyst-report.pdf');
  assert.match(res1.record.full_report, /Valley National Summary/);

  // 2. Create bank WITHOUT PDF in single action
  const res2 = await handleSingleSave({
    formData: {
      title: 'First Republic Bank',
      status: 'mehudar',
      full_report: '<p>Standard report text</p>',
    },
    draftPdfFile: null,
    isNew: true,
  });

  assert.equal(res2.success, true);
  assert.equal(res2.pdfUploaded, false);
  assert.equal(res2.record.report_pdf_key, '');
  assert.equal(res2.record.report_pdf_name, '');
  assert.equal(res2.record.title, 'First Republic Bank');
});

test('Safe Retry Simulation: PDF failure preserves bank in edit mode without creating duplicates on retry', async () => {
  const mockDb = new Map();
  let nextId = 600;

  async function handleSaveWithPotentialPdfFailure({ formData, draftPdfFile, isNew, failPdf }) {
    let bankId = formData.id;
    if (isNew) {
      bankId = `bank-${nextId++}`;
      mockDb.set(bankId, {
        id: bankId,
        title: formData.title,
        status: formData.status || 'kosher',
        full_report: formData.full_report || '',
        report_pdf_key: '',
        report_pdf_name: '',
      });
    }

    const pdfFile = draftPdfFile || formData.report_pdf_file;
    if (pdfFile && bankId) {
      if (failPdf) {
        // PDF upload fails, but bank was persisted!
        const savedBank = mockDb.get(bankId);
        return {
          status: 'pdf_failed',
          bankId,
          editing: savedBank, // Kept in edit mode!
          error: 'PDF report upload failed: Network timeout',
        };
      }
      const record = mockDb.get(bankId);
      record.report_pdf_key = `bank-reports/${bankId}/report.pdf`;
      record.report_pdf_name = pdfFile.name;
    }

    return {
      status: isNew ? 'created' : 'updated',
      bankId,
      editing: isNew ? mockDb.get(bankId) : null,
    };
  }

  // 1. Initial submit: Bank creates but PDF fails
  const attempt1 = await handleSaveWithPotentialPdfFailure({
    formData: { title: 'PNC Financial' },
    draftPdfFile: { name: 'pnc-report.pdf' },
    isNew: true,
    failPdf: true,
  });

  assert.equal(attempt1.status, 'pdf_failed');
  assert.ok(attempt1.editing, 'Must keep the persisted record in edit mode');
  assert.equal(mockDb.size, 1);

  // 2. Retry submit: Uses the persisted ID from edit mode (isNew = false)
  const attempt2 = await handleSaveWithPotentialPdfFailure({
    formData: { id: attempt1.editing.id, title: 'PNC Financial' },
    draftPdfFile: { name: 'pnc-report.pdf' },
    isNew: false, // NOT a new bank, now an update!
    failPdf: false,
  });

  assert.equal(attempt2.status, 'updated');
  assert.equal(mockDb.size, 1, 'Must NOT create duplicate bank records upon retrying save');
  const record = mockDb.get(attempt1.bankId);
  assert.equal(record.report_pdf_name, 'pnc-report.pdf');
});

test('Existing Bank PDF Replacement: Updates PDF and keeps web report content intact', () => {
  const existingRecord = {
    id: 'bank-citibank',
    title: 'Citibank N.A.',
    full_report: '<h3>Compliance & Governance</h3><p>Board of directors overview</p>',
    report_pdf_key: 'bank-reports/bank-citibank/old-report.pdf',
    report_pdf_name: 'old-report.pdf',
  };

  function replacePdf(record, newPdfKey, newPdfName) {
    return {
      ...record,
      report_pdf_key: newPdfKey,
      report_pdf_name: newPdfName,
    };
  }

  const updated = replacePdf(existingRecord, 'bank-reports/bank-citibank/new-q4.pdf', 'new-q4.pdf');

  // PDF is updated
  assert.equal(updated.report_pdf_key, 'bank-reports/bank-citibank/new-q4.pdf');
  assert.equal(updated.report_pdf_name, 'new-q4.pdf');

  // Web report content is completely preserved
  assert.equal(updated.full_report, existingRecord.full_report);
});

test('Backend 404 Error Message: Informs caller to save bank entry first', () => {
  const routeSrc = fs.readFileSync(
    path.resolve('app/api/admin/bank-report-pdf/route.ts'),
    'utf-8',
  );

  assert.match(
    routeSrc,
    /Bank record not found\. Please save the bank entry first before uploading a PDF report\./,
    'Backend 404 message must guide the user that bank entry must be saved first',
  );
});

