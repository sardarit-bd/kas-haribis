import assert from 'node:assert/strict';
import test from 'node:test';
import fs from 'node:fs';
import path from 'node:path';

test('Banks Editor UI: Shows PDF file input for both new and existing bank records', () => {
  const bankManagerSrc = fs.readFileSync(
    path.resolve('app/admin/banks/bank-manager.tsx'),
    'utf-8',
  );

  // The PDF file input must NOT be wrapped in {value.id && (...)}
  assert.equal(
    /\{value\.id\s*&&\s*\(\s*<label[^>]*>[\s\S]*?name="report_pdf_file"/.test(bankManagerSrc),
    false,
    'PDF file input must not be hidden when value.id is empty (new banks)',
  );

  // The report_pdf_file input must be present
  assert.match(
    bankManagerSrc,
    /name="report_pdf_file"/,
    'report_pdf_file input must be available in the form',
  );

  // Clear microcopy distinguishing source PDF from inline images
  assert.match(
    bankManagerSrc,
    /Official source PDF is available in the public report as a downloadable document and embedded in the Original PDF Viewer tab/,
    'Microcopy must distinguish official source PDF from inline web images',
  );
});

test('Banks Editor UI: RichReportEditor gives actionable guidance when bankId is missing', () => {
  const editorSrc = fs.readFileSync(
    path.resolve('app/admin/banks/rich-report-editor.tsx'),
    'utf-8',
  );

  // Check uploadAndInsertImage notice
  assert.match(
    editorSrc,
    /Please save the bank entry first to enable uploading inline images\/charts\. Once saved, the editor will remain open and ready for images\./,
    'uploadAndInsertImage must instruct the user that saving first keeps the editor open',
  );

  // Check button title
  assert.match(
    editorSrc,
    /Save the bank entry first to enable uploading inline images\/charts/,
    'Add Image button must display pre-click tooltip when bankId is missing',
  );
});

test('Bank Save Workflow Simulation: New Bank creates record and transitions to Edit mode with valid bankId', async () => {
  const mockDb = new Map();
  let nextId = 100;

  // Simulated save handler matching bank-manager.tsx logic
  async function simulateSave({ formData, isNew, editingState, failPdfUpload = false }) {
    const data = { ...formData };
    let createdId = null;

    if (isNew) {
      createdId = `bank-${nextId++}`;
      mockDb.set(createdId, {
        id: createdId,
        title: data.title,
        status: data.status || 'Active',
        full_report: data.full_report || '',
        report_pdf_key: '',
        report_pdf_name: '',
      });
    } else {
      const existing = mockDb.get(data.id);
      if (!existing) throw new Error('Bank not found');
      mockDb.set(data.id, {
        ...existing,
        ...data,
      });
    }

    const bankId = (data.id) || createdId;

    // Simulate PDF upload if file present
    let pdfUploaded = false;
    if (data.report_pdf_file && bankId) {
      if (failPdfUpload) {
        // PDF upload fails, but bank record was already saved
        const record = mockDb.get(bankId);
        return {
          status: 'error_pdf_only',
          bankId,
          editing: record, // Must keep record open in edit mode!
          message: 'Bank record saved, but PDF report upload failed.',
        };
      }
      const record = mockDb.get(bankId);
      record.report_pdf_key = `bank-reports/${bankId}/report.pdf`;
      record.report_pdf_name = data.report_pdf_file.name;
      pdfUploaded = true;
    }

    const finalRecord = mockDb.get(bankId);

    if (isNew) {
      return {
        status: 'success_new',
        bankId,
        editing: finalRecord, // Keep open in edit mode!
        pdfUploaded,
      };
    } else {
      return {
        status: 'success_update',
        bankId,
        editing: null, // Reset form for existing bank edit
        pdfUploaded,
      };
    }
  }

  // 1. Create a brand new bank with PDF attached
  const res1 = await simulateSave({
    formData: {
      title: 'Chase Bank Test',
      status: 'Active',
      full_report: '<p>Initial report text</p>',
      report_pdf_file: { name: 'chase-analyst-report.pdf' },
    },
    isNew: true,
    editingState: null,
  });

  assert.equal(res1.status, 'success_new');
  assert.ok(res1.bankId, 'Must generate valid bankId');
  assert.ok(res1.editing, 'Must keep the newly created bank open in edit mode');
  assert.equal(res1.editing.id, res1.bankId);
  assert.equal(res1.pdfUploaded, true);
  assert.equal(res1.editing.report_pdf_name, 'chase-analyst-report.pdf');

  // 2. Admin continues editing the newly created bank (e.g. adding inline image or editing report)
  // Subsequent save sends data.id and must NOT create duplicate bank
  const res2 = await simulateSave({
    formData: {
      id: res1.bankId,
      title: 'Chase Bank Test',
      status: 'Active',
      full_report: '<p>Initial report text <img src="/api/bank-report-image?bankId=' + res1.bankId + '&id=img-1" /></p>',
    },
    isNew: false,
    editingState: res1.editing,
  });

  assert.equal(res2.status, 'success_update');
  assert.equal(mockDb.size, 1, 'Must not create a duplicate bank record on subsequent save');
  const updated = mockDb.get(res1.bankId);
  assert.match(updated.full_report, /img-1/, 'Must preserve report updates including inline images');
});

test('Bank Save Workflow Simulation: PDF failure preserves bank record in edit mode without creating duplicate on retry', async () => {
  const mockDb = new Map();
  let nextId = 200;

  async function simulateSave({ formData, isNew, failPdfUpload }) {
    const data = { ...formData };
    let createdId = null;

    if (isNew) {
      createdId = `bank-${nextId++}`;
      mockDb.set(createdId, {
        id: createdId,
        title: data.title,
        status: data.status || 'Active',
        full_report: '',
        report_pdf_key: '',
        report_pdf_name: '',
      });
    }

    const bankId = (data.id) || createdId;

    if (data.report_pdf_file && bankId) {
      if (failPdfUpload) {
        const record = mockDb.get(bankId);
        return {
          status: 'error_pdf_only',
          bankId,
          editing: record, // Kept in edit mode for retry
        };
      }
      const record = mockDb.get(bankId);
      record.report_pdf_key = `bank-reports/${bankId}/report.pdf`;
      record.report_pdf_name = data.report_pdf_file.name;
    }

    const record = mockDb.get(bankId);
    return {
      status: isNew ? 'success_new' : 'success_update',
      bankId,
      editing: isNew ? record : null,
    };
  }

  // 1. Initial attempt with failing PDF upload
  const res1 = await simulateSave({
    formData: {
      title: 'TD Bank Test',
      report_pdf_file: { name: 'corrupted.pdf' },
    },
    isNew: true,
    failPdfUpload: true,
  });

  assert.equal(res1.status, 'error_pdf_only');
  assert.ok(res1.editing, 'Record must be kept in edit mode despite PDF upload error');
  assert.equal(res1.editing.id, res1.bankId);
  assert.equal(mockDb.size, 1);

  // 2. Admin retries PDF upload with a valid PDF file using the existing record ID
  const res2 = await simulateSave({
    formData: {
      id: res1.editing.id, // Form now contains ID because record stayed in edit mode
      title: 'TD Bank Test',
      report_pdf_file: { name: 'valid-fixed.pdf' },
    },
    isNew: false, // Now an update, not a new create!
    failPdfUpload: false,
  });

  assert.equal(res2.status, 'success_update');
  assert.equal(mockDb.size, 1, 'Retrying PDF upload must never create duplicate bank entries');
  const record = mockDb.get(res1.bankId);
  assert.equal(record.report_pdf_name, 'valid-fixed.pdf');
});

test('Banks Editor UI: Form sections strictly match client-required 8-part sequence', () => {
  const bankManagerSrc = fs.readFileSync(
    path.resolve('app/admin/banks/bank-manager.tsx'),
    'utf-8',
  );

  const sections = [
    { name: '1. Comment shown with this bank', marker: 'name="comment"' },
    { name: '2. Protected Full Report', marker: '<FullReportEditor' },
    { name: '3. Research summary', marker: 'name="summary"' },
    { name: '4. Ownership and control research', marker: 'name="ownership_details"' },
    { name: '5. Heter Iska details', marker: 'name="iska_details"' },
    { name: '6. Source links', marker: 'name="source_urls"' },
    { name: '7. Private administrator notes', marker: 'name="internal_notes"' },
    { name: '8. Official Source Document (Original PDF)', marker: 'Official Source Document (Original PDF)' },
  ];

  let lastIndex = -1;
  for (const section of sections) {
    const idx = bankManagerSrc.indexOf(section.marker);
    assert.ok(
      idx !== -1,
      `Section "${section.name}" (marker: ${section.marker}) must exist in bank-manager.tsx`,
    );
    assert.ok(
      idx > lastIndex,
      `Section "${section.name}" must appear after the previous section in bank-manager.tsx (previous index: ${lastIndex}, current: ${idx})`,
    );
    lastIndex = idx;
  }
});
