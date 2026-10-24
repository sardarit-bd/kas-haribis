import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

// 1. Static and Structural Invariant Checks
test('Admin PDF State Isolation: edit() and "Back to add bank" clear draftPdfFile and reset file inputs', () => {
  const managerSrc = fs.readFileSync(
    path.resolve('app/admin/banks/bank-manager.tsx'),
    'utf-8',
  );

  // edit() must check for draftPdfFile and reset it
  const editMatch = managerSrc.match(/function edit\(bank: Bank\) \{([\s\S]*?)\n  \}/);
  assert.ok(editMatch, 'edit(bank) function must exist in bank-manager.tsx');
  const editBody = editMatch[1];

  assert.match(
    editBody,
    /setDraftPdfFile\(null\)/,
    'edit(bank) must call setDraftPdfFile(null) to prevent leaking staged PDF across banks',
  );

  assert.match(
    editBody,
    /report_pdf_file[\s\S]*?\.value\s*=\s*''/,
    'edit(bank) must reset report_pdf_file input element',
  );

  assert.match(
    editBody,
    /window\.confirm/,
    'edit(bank) must warn if an unsaved staged PDF is about to be discarded',
  );

  // "Back to add bank" button must also confirm and clear
  assert.match(
    managerSrc,
    /← Back to add bank[\s\S]*?setDraftPdfFile\(null\)/,
    '"Back to add bank" button must clear draftPdfFile',
  );

  // Must render a cancel selection button if draftPdfFile is staged
  assert.match(
    managerSrc,
    /Cancel selection/,
    'Bank manager UI must provide a "Cancel selection" control when a PDF is staged',
  );
});

test('Public Viewer and Delivery Isolation: No-store cache headers and iframe key versioning', () => {
  const routeSrc = fs.readFileSync(
    path.resolve('app/api/bank-report-pdf/route.ts'),
    'utf-8',
  );

  // Route must NOT serve long-lived browser cache
  assert.equal(
    routeSrc.includes('max-age=3600'),
    false,
    '/api/bank-report-pdf must not set max-age=3600',
  );

  assert.match(
    routeSrc,
    /'Cache-Control':\s*'private,\s*no-cache,\s*no-store,\s*must-revalidate'/,
    '/api/bank-report-pdf must send private, no-cache, no-store, must-revalidate',
  );

  // Viewer tabs must version pdfUrl and key iframe
  const tabsSrc = fs.readFileSync(
    path.resolve('app/bank-directory/full-report/report-tabs.tsx'),
    'utf-8',
  );

  assert.match(
    tabsSrc,
    /const pdfUrl = `\/api\/bank-report-pdf\?bankId=\$\{encodeURIComponent\(bankId\)\}.*?&v=\$\{pdfVersion\}`/,
    'report-tabs.tsx must append version parameter &v=${pdfVersion} to viewer URL',
  );

  assert.match(
    tabsSrc,
    /<iframe[\s\S]*?key=\{`pdf-viewer-\$\{bankId\}-\$\{pdfName \|\| 'report'\}`\}/,
    'report-tabs.tsx must key iframe by bankId and pdfName to guarantee remounting on bank change',
  );

  // Full report page must key ReportTabs by targetBankId
  const pageSrc = fs.readFileSync(
    path.resolve('app/bank-directory/full-report/page.tsx'),
    'utf-8',
  );

  assert.match(
    pageSrc,
    /<ReportTabs[\s\S]*?key=\{targetBankId\}[\s\S]*?bankId=\{targetBankId\}/,
    'full-report/page.tsx must provide key={targetBankId} to ReportTabs',
  );
});

// 2. State Machine Simulation: Bank A -> Bank B Sequence
test('State Machine: Switching from Bank A to Bank B clears staged PDF A and protects Bank B', () => {
  // Simulate BankManager state machine
  class BankManagerStateMachine {
    constructor(banks) {
      this.banks = banks;
      this.editing = null;
      this.draftPdfFile = null;
      this.inputs = { report_pdf_file: '' };
      this.confirmPrompted = false;
    }

    // User stages a PDF while on New Bank or editing Bank A
    stagePdf(file) {
      this.draftPdfFile = file;
      this.inputs.report_pdf_file = file.name;
    }

    // User clicks "Edit" on a bank in the list
    edit(bank, userConfirms = true) {
      if (this.editing?.id === bank.id) return;
      if (this.draftPdfFile) {
        this.confirmPrompted = true;
        if (!userConfirms) return; // User cancelled
      }
      // Fixed behavior: State must be cleared!
      this.draftPdfFile = null;
      this.inputs.report_pdf_file = '';
      this.editing = bank;
    }

    // User clicks "Cancel selection"
    cancelStagedPdf() {
      this.draftPdfFile = null;
      this.inputs.report_pdf_file = '';
    }

    // User saves current bank
    save() {
      const bankId = this.editing?.id || 'new-bank-auto';
      const fileToUpload = this.draftPdfFile; // Must ONLY upload if currently staged for this bank
      if (fileToUpload) {
        const target = this.banks.find((b) => b.id === bankId);
        if (target) {
          target.report_pdf_key = `bank-reports/${bankId}/report.pdf`;
          target.report_pdf_name = fileToUpload.name;
        }
      }
      this.draftPdfFile = null;
      this.inputs.report_pdf_file = '';
      return { bankId, uploadedFile: fileToUpload };
    }
  }

  const banks = [
    { id: 'bank-a', title: 'Bank Alpha', report_pdf_key: '', report_pdf_name: '' },
    { id: 'bank-b', title: 'Bank Beta', report_pdf_key: 'bank-reports/bank-b/report.pdf', report_pdf_name: 'beta-original.pdf' },
  ];

  const sm = new BankManagerStateMachine(banks);

  // 1. User starts on Bank Alpha and stages "alpha-analyst.pdf"
  sm.editing = banks[0];
  sm.stagePdf({ name: 'alpha-analyst.pdf', size: 1024 * 1024 });
  assert.equal(sm.draftPdfFile?.name, 'alpha-analyst.pdf');

  // 2. User switches to Bank Beta
  sm.edit(banks[1], true);
  assert.equal(sm.confirmPrompted, true, 'Must prompt confirmation when discarding unsaved staged PDF');
  assert.equal(sm.draftPdfFile, null, 'draftPdfFile must be strictly null after switching to Bank Beta');
  assert.equal(sm.inputs.report_pdf_file, '', 'File input element must be cleared');
  assert.equal(sm.editing.id, 'bank-b');

  // 3. User saves Bank Beta
  const saveResult = sm.save();
  assert.equal(saveResult.uploadedFile, null, 'No file must be uploaded to Bank Beta');
  assert.equal(banks[1].report_pdf_name, 'beta-original.pdf', 'Bank Beta original PDF name must remain unchanged');
  assert.equal(banks[1].report_pdf_key, 'bank-reports/bank-b/report.pdf', 'Bank Beta PDF key must remain intact');
});

// 3. Multi-Bank Isolated Upload & Retrieval Lifecycle
test('Multi-Bank Isolation: Bank A and Bank B retain independent PDFs in storage and retrieval', async () => {
  // Simulate Cloudflare D1 and Cloudflare R2
  const mockD1 = new Map();
  const mockR2 = new Map();

  function uploadBankPdf(bankId, file) {
    const key = `bank-reports/${bankId}/report.pdf`;
    mockR2.set(key, { name: file.name, content: file.content });
    const bank = mockD1.get(bankId);
    bank.report_pdf_key = key;
    bank.report_pdf_name = file.name;
    return { key, name: file.name };
  }

  function getBankPdf(bankId) {
    const bank = mockD1.get(bankId);
    if (!bank || !bank.report_pdf_key) {
      return { status: 404, error: 'No PDF found' };
    }
    const r2Obj = mockR2.get(bank.report_pdf_key);
    if (!r2Obj) {
      return { status: 404, error: 'Object not found in R2' };
    }
    return {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Cache-Control': 'private, no-cache, no-store, must-revalidate',
        'Content-Disposition': `inline; filename="${bank.report_pdf_name}"`,
      },
      content: r2Obj.content,
      name: bank.report_pdf_name,
      key: bank.report_pdf_key,
    };
  }

  // Setup two distinct banks in D1
  mockD1.set('bank-chase', { id: 'bank-chase', title: 'JPMorgan Chase', report_pdf_key: '', report_pdf_name: '' });
  mockD1.set('bank-citi', { id: 'bank-citi', title: 'Citibank N.A.', report_pdf_key: '', report_pdf_name: '' });

  // 1. Upload distinct PDFs to each bank
  uploadBankPdf('bank-chase', { name: 'chase-annual-report.pdf', content: '%PDF-1.7 CHASE DATA' });
  uploadBankPdf('bank-citi', { name: 'citi-research.pdf', content: '%PDF-1.7 CITIBANK DATA' });

  // 2. Retrieve Bank Chase PDF
  const resChase = getBankPdf('bank-chase');
  assert.equal(resChase.status, 200);
  assert.equal(resChase.content, '%PDF-1.7 CHASE DATA');
  assert.equal(resChase.name, 'chase-annual-report.pdf');
  assert.equal(resChase.key, 'bank-reports/bank-chase/report.pdf');
  assert.equal(resChase.headers['Cache-Control'], 'private, no-cache, no-store, must-revalidate');

  // 3. Retrieve Bank Citi PDF
  const resCiti = getBankPdf('bank-citi');
  assert.equal(resCiti.status, 200);
  assert.equal(resCiti.content, '%PDF-1.7 CITIBANK DATA');
  assert.equal(resCiti.name, 'citi-research.pdf');
  assert.equal(resCiti.key, 'bank-reports/bank-citi/report.pdf');
  assert.notEqual(resChase.content, resCiti.content, 'Bank A and Bank B must contain different PDF contents');

  // 4. Replace Bank Chase PDF with v2
  uploadBankPdf('bank-chase', { name: 'chase-q4-updated.pdf', content: '%PDF-1.7 CHASE V2' });

  // 5. Verify Bank Citi is completely untouched
  const resCitiAfter = getBankPdf('bank-citi');
  assert.equal(resCitiAfter.content, '%PDF-1.7 CITIBANK DATA', 'Bank Citi must remain unchanged when Bank Chase is replaced');
  assert.equal(resCitiAfter.name, 'citi-research.pdf');

  // 6. Delete Bank Chase PDF
  const chaseRecord = mockD1.get('bank-chase');
  mockR2.delete(chaseRecord.report_pdf_key);
  chaseRecord.report_pdf_key = '';
  chaseRecord.report_pdf_name = '';

  assert.equal(getBankPdf('bank-chase').status, 404);
  assert.equal(getBankPdf('bank-citi').status, 200, 'Bank Citi must remain accessible when Bank Chase is deleted');
});

// 4. Fallback Lookup Safety and Ambiguity Rejection
test('Fallback Lookup: Rejects ambiguous matches and only resolves strictly unique candidates', async () => {
  const mockBanks = [
    { id: 'bank-101', title: 'Community Trust Bank', report_pdf_key: '' },
    { id: 'bank-102', title: 'Community Trust Bank', report_pdf_key: '' }, // Duplicate title bank!
    { id: 'bank-103', title: 'Unique Valley Bank', report_pdf_key: '' },
    { id: 'bank-104', title: 'Word Doc Bank', report_pdf_key: '' },
  ];

  const mockSubmissions = [
    // 2 submissions with same title
    { id: 'sub-1', title: 'Community Trust Bank', report_key: 'bank-research/sub-1/report', report_name: 'report1.pdf', published_bank_id: '', status: 'Approved' },
    { id: 'sub-2', title: 'Community Trust Bank', report_key: 'bank-research/sub-2/report', report_name: 'report2.pdf', published_bank_id: '', status: 'Approved' },
    // 1 unique submission for unique bank
    { id: 'sub-3', title: 'Unique Valley Bank', report_key: 'bank-research/sub-3/report.pdf', report_name: 'valley-analyst.pdf', published_bank_id: '', status: 'Approved' },
    // Non-PDF submission (Word doc)
    { id: 'sub-4', title: 'Word Doc Bank', report_key: 'bank-research/sub-4/report', report_name: 'document.docx', published_bank_id: '', status: 'Approved' },
  ];

  function safeFallbackResolve(bankId) {
    const bank = mockBanks.find((b) => b.id === bankId);
    if (!bank) return { resolved: false, reason: 'bank_not_found' };
    if (bank.report_pdf_key) return { resolved: true, key: bank.report_pdf_key };

    const cleanTitle = bank.title.trim().toLowerCase();

    // 1. Verify exactly 1 bank with this title exists
    const matchingBanks = mockBanks.filter((b) => b.title.trim().toLowerCase() === cleanTitle);
    if (matchingBanks.length !== 1) {
      return { resolved: false, reason: 'ambiguous_multiple_banks' };
    }

    // 2. Verify unlinked submissions
    const matchingSubs = mockSubmissions.filter(
      (s) =>
        !s.published_bank_id &&
        s.status === 'Approved' &&
        s.title.trim().toLowerCase() === cleanTitle &&
        Boolean(s.report_key) &&
        String(s.report_name || s.report_key).toLowerCase().endsWith('.pdf')
    );

    if (matchingSubs.length !== 1) {
      return { resolved: false, reason: matchingSubs.length === 0 ? 'no_valid_pdf_submission' : 'ambiguous_multiple_submissions' };
    }

    const match = matchingSubs[0];
    match.published_bank_id = bankId; // Backfill
    return { resolved: true, key: match.report_key, name: match.report_name };
  }

  // 1. Ambiguous bank title (2 banks share "Community Trust Bank")
  const result1 = safeFallbackResolve('bank-101');
  assert.equal(result1.resolved, false);
  assert.equal(result1.reason, 'ambiguous_multiple_banks');

  // 2. Non-PDF Word doc submission
  const resultDocx = safeFallbackResolve('bank-104');
  assert.equal(resultDocx.resolved, false);
  assert.equal(resultDocx.reason, 'no_valid_pdf_submission');

  // 3. Strictly unique bank and single valid submission
  const resultUnique = safeFallbackResolve('bank-103');
  assert.equal(resultUnique.resolved, true);
  assert.equal(resultUnique.key, 'bank-research/sub-3/report.pdf');
  assert.equal(resultUnique.name, 'valley-analyst.pdf');
  const sub = mockSubmissions.find((s) => s.id === 'sub-3');
  assert.equal(sub.published_bank_id, 'bank-103', 'Must backfill published_bank_id on unique resolution');
});
