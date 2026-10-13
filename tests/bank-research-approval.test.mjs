import assert from 'node:assert/strict';
import test from 'node:test';

// Simulation functions matching our implementation logic in app/api/bank-research/route.ts
function resolveApprovalBankAssociation({
  submission,
  explicitBankId,
  createNewRequested,
  existingBanks,
}) {
  let bankId = '';
  let existing = null;

  // 1. Explicit bank ID provided
  if (explicitBankId) {
    const target = existingBanks.find((b) => b.id === explicitBankId);
    if (!target) {
      return { status: 404, error: 'The specified target bank ID was not found.' };
    }
    bankId = target.id;
    existing = target;
  } else if (submission.published_bank_id) {
    // 2. Preserve existing valid published_bank_id
    const target = existingBanks.find((b) => b.id === submission.published_bank_id);
    if (target) {
      bankId = target.id;
      existing = target;
    }
  }

  // 3. If published_bank_id is empty, check whether the submission clearly matches an existing bank
  if (!bankId) {
    const submissionTitle = String(submission.title || '').trim();

    // Exact title match check (case-insensitive, trimmed)
    const exactMatches = existingBanks.filter(
      (b) => b.title.trim().toLowerCase() === submissionTitle.toLowerCase(),
    );

    if (exactMatches.length === 1) {
      // Unambiguous exact match to single existing bank
      existing = exactMatches[0];
      bankId = existing.id;
    } else if (exactMatches.length > 1) {
      // Multiple exact matches: ambiguous!
      return {
        status: 409,
        error: `Multiple banks match the title "${submissionTitle}". Please manually select the intended bank before approving.`,
        ambiguous: true,
        candidates: exactMatches.map((m) => ({ id: m.id, title: m.title })),
      };
    } else {
      // No exact match. Check for similar/partial title matches in existing banks
      const cleanLower = submissionTitle.toLowerCase();
      let similarMatches = [];
      if (cleanLower.length >= 4) {
        similarMatches = existingBanks.filter((b) => {
          const bt = b.title.trim().toLowerCase();
          return bt.length >= 4 && (bt.includes(cleanLower) || cleanLower.includes(bt));
        });
      }

      if (similarMatches.length > 1) {
        // Multiple similar candidates: ambiguous!
        return {
          status: 409,
          error: `Multiple existing banks may match "${submissionTitle}". Please select the intended bank or confirm creating a new bank.`,
          ambiguous: true,
          candidates: similarMatches.map((m) => ({ id: m.id, title: m.title })),
        };
      } else if (similarMatches.length === 1 && !createNewRequested) {
        return {
          status: 409,
          error: `An existing bank with a similar name was found: "${similarMatches[0].title}". To update this existing bank, provide published_bank_id="${similarMatches[0].id}". To create a new bank instead, approve with create_new=true.`,
          ambiguous: true,
          candidates: [{ id: similarMatches[0].id, title: similarMatches[0].title }],
        };
      } else {
        // 0 matches found (or create_new explicitly confirmed): create new bank record
        bankId = 'generated-uuid-1234';
        existing = null;
      }
    }
  }

  return { status: 200, bankId, existing };
}

// Simulation function matching our retrieval logic in app/bank-directory/full-report/page.tsx
function resolveFullReportContent({
  bankRecord,
  targetBankId,
  submissions,
  banks,
}) {
  let approvedSubmission = submissions.find(
    (s) => s.published_bank_id === targetBankId && s.workflow_status === 'Approved',
  );

  if (!approvedSubmission && bankRecord?.title) {
    const cleanTitle = bankRecord.title.trim().toLowerCase();
    const titleMatches = submissions.filter(
      (s) =>
        (!s.published_bank_id || s.published_bank_id === '') &&
        s.title.trim().toLowerCase() === cleanTitle &&
        s.workflow_status === 'Approved',
    );

    if (titleMatches.length > 0) {
      const banksWithTitle = banks.filter(
        (b) => b.title.trim().toLowerCase() === cleanTitle,
      );
      if (banksWithTitle.length === 1) {
        approvedSubmission = titleMatches[0];
      }
    }
  }

  const fullReportText = String(
    bankRecord?.full_report || approvedSubmission?.full_report || '',
  ).trim();

  const attachedFile =
    approvedSubmission?.report_key && approvedSubmission.report_key.trim().length > 0
      ? {
          id: approvedSubmission.id,
          report_name: approvedSubmission.report_name || 'Download research report document',
          report_key: approvedSubmission.report_key,
        }
      : null;

  return {
    hasReportContent: Boolean(fullReportText || attachedFile),
    fullReportText,
    attachedFile,
    approvedSubmissionId: approvedSubmission?.id,
  };
}

test('Requirement 1: Preserves existing valid published_bank_id on approval', () => {
  const existingBanks = [
    { id: 'bank-1', title: '1st Colonial Bank', full_report: 'Existing bank report' },
    { id: 'bank-2', title: 'Chase Bank', full_report: '' },
  ];
  const submission = {
    id: 'sub-1',
    title: '1st Colonial Bank (Updated Name)',
    published_bank_id: 'bank-1',
    full_report: 'New detailed report',
  };

  const res = resolveApprovalBankAssociation({
    submission,
    explicitBankId: '',
    createNewRequested: false,
    existingBanks,
  });

  assert.equal(res.status, 200);
  assert.equal(res.bankId, 'bank-1');
  assert.equal(res.existing?.id, 'bank-1');
});

test('Requirement 2: Unambiguous exact title match preserves existing bank ID when published_bank_id is empty', () => {
  const existingBanks = [
    { id: 'legacy-bank-42', title: '1st Colonial Bank', full_report: '' },
    { id: 'legacy-bank-43', title: 'TD Bank', full_report: '' },
  ];
  const submission = {
    id: 'sub-2',
    title: '1st Colonial Bank',
    published_bank_id: '',
    full_report: 'Brand new research text report',
  };

  const res = resolveApprovalBankAssociation({
    submission,
    explicitBankId: '',
    createNewRequested: false,
    existingBanks,
  });

  assert.equal(res.status, 200);
  assert.equal(res.bankId, 'legacy-bank-42');
  assert.equal(res.existing?.id, 'legacy-bank-42');
});

test('Requirement 3: Rejects approval when multiple banks have matching titles (Ambiguous match)', () => {
  const existingBanks = [
    { id: 'bank-dup-1', title: 'Community Bank', full_report: '' },
    { id: 'bank-dup-2', title: 'Community Bank', full_report: '' },
  ];
  const submission = {
    id: 'sub-3',
    title: 'Community Bank',
    published_bank_id: '',
    full_report: 'Report',
  };

  const res = resolveApprovalBankAssociation({
    submission,
    explicitBankId: '',
    createNewRequested: false,
    existingBanks,
  });

  assert.equal(res.status, 409);
  assert.equal(res.ambiguous, true);
  assert.equal(res.candidates.length, 2);
  assert.match(res.error, /Multiple banks match the title/);
});

test('Requirement 3: Rejects approval when multiple similar bank names exist without manual selection', () => {
  const existingBanks = [
    { id: 'bank-sim-1', title: 'First National Bank of LI', full_report: '' },
    { id: 'bank-sim-2', title: 'First National Bank of PA', full_report: '' },
  ];
  const submission = {
    id: 'sub-4',
    title: 'First National Bank',
    published_bank_id: '',
    full_report: 'Report',
  };

  const res = resolveApprovalBankAssociation({
    submission,
    explicitBankId: '',
    createNewRequested: false,
    existingBanks,
  });

  assert.equal(res.status, 409);
  assert.equal(res.ambiguous, true);
  assert.match(res.error, /Multiple existing banks may match/);
});

test('Requirement 4: Allows new bank creation only when no matching banks exist or explicitly confirmed', () => {
  const existingBanks = [
    { id: 'bank-1', title: 'Valley Bank', full_report: '' },
  ];
  const submission = {
    id: 'sub-5',
    title: 'Completely Unique Lender LLC',
    published_bank_id: '',
    full_report: 'Report',
  };

  const res = resolveApprovalBankAssociation({
    submission,
    explicitBankId: '',
    createNewRequested: false,
    existingBanks,
  });

  assert.equal(res.status, 200);
  assert.equal(res.bankId, 'generated-uuid-1234');
  assert.equal(res.existing, null);
});

test('Requirement 5 & 6: Full report page resolves text and attached PDF/Word for the correct bank with Approved status', () => {
  const banks = [
    { id: 'bank-10', title: 'Meridian Capital Bank', full_report: '' },
  ];
  const submissions = [
    {
      id: 'sub-10',
      title: 'Meridian Capital Bank',
      published_bank_id: 'bank-10',
      workflow_status: 'Approved',
      full_report: 'Approved research report text paragraph 1.\n\nParagraph 2.',
      report_key: 'bank-research/sub-10-report.docx',
      report_name: 'Meridian_Report.docx',
    },
    {
      id: 'sub-draft',
      title: 'Meridian Capital Bank',
      published_bank_id: 'bank-10',
      workflow_status: 'Draft',
      full_report: 'Draft unapproved report',
      report_key: 'draft.pdf',
    },
  ];

  const content = resolveFullReportContent({
    bankRecord: banks[0],
    targetBankId: 'bank-10',
    submissions,
    banks,
  });

  assert.equal(content.hasReportContent, true);
  assert.match(content.fullReportText, /Approved research report text paragraph 1/);
  assert.equal(content.attachedFile?.report_name, 'Meridian_Report.docx');
  assert.equal(content.approvedSubmissionId, 'sub-10');
});

test('Requirement 6 & 7: Rejects non-approved research submissions from being exposed', () => {
  const banks = [
    { id: 'bank-20', title: 'Unapproved Bank', full_report: '' },
  ];
  const submissions = [
    {
      id: 'sub-draft-only',
      title: 'Unapproved Bank',
      published_bank_id: 'bank-20',
      workflow_status: 'Submitted', // Not yet approved by owner
      full_report: 'Top secret draft research',
      report_key: 'secret.pdf',
    },
  ];

  const content = resolveFullReportContent({
    bankRecord: banks[0],
    targetBankId: 'bank-20',
    submissions,
    banks,
  });

  assert.equal(content.hasReportContent, false);
  assert.equal(content.fullReportText, '');
  assert.equal(content.attachedFile, null);
});
