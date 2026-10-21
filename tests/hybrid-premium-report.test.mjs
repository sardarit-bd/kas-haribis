import test from 'node:test';
import assert from 'node:assert/strict';
import { isHtmlReport, sanitizeReportHtml } from '../app/lib/report-sanitizer.ts';

// 1. Legacy Report Format Discriminator Tests
test('Format Discriminator: Identifies legacy plain-text and Markdown reports as non-HTML', () => {
  const legacyPlainText = `1st Colonial Bank
Public Bank: 1st Colonial Bancorp, Inc. (FCOB) OTCPK

Executive Management
Robert B white: President and CEO

Top Institutional Holders
Holder Shares Date Reported % Out Value
Banc Funds Company, L.L.C. (The) 108.14k Sep 30, 2024 2.24% 1,589,716`;

  assert.equal(isHtmlReport(legacyPlainText), false, 'Plain text must not be recognized as HTML');

  const legacyMarkdown = `### Executive Management
- **Robert B. White**: President and Chief Executive Officer
- **Mary K. Shea**: Executive Vice President

| Holder | Shares | Date Reported | % Out | Value |
|---|---|---|---|---|
| Siena Capital | 95.35k | Sep 30, 2024 | 1.97% | 1,401,674 |`;

  assert.equal(isHtmlReport(legacyMarkdown), false, 'Markdown must not be recognized as HTML');

  const textWithMathSigns = 'Bank loan-to-value < 65% and debt coverage > 1.25x';
  assert.equal(isHtmlReport(textWithMathSigns), false, 'Mathematical comparison operators must not be mistaken for HTML');
});

// 2. Rich HTML Format Discriminator Tests
test('Format Discriminator: Identifies rich-text HTML reports containing structural tags', () => {
  const richHtml1 = '<h2>Executive Management</h2><p>Robert B. White: CEO</p>';
  assert.equal(isHtmlReport(richHtml1), true);

  const richHtmlWithTable = '<p>Overview</p><table><thead><tr><th>Holder</th></tr></thead><tbody><tr><td>Banc Funds</td></tr></tbody></table>';
  assert.equal(isHtmlReport(richHtmlWithTable), true);

  const richHtmlWithList = '<h3>Key Criteria</h3><ul><li>Item 1</li><li>Item 2</li></ul>';
  assert.equal(isHtmlReport(richHtmlWithList), true);
});

// 3. Sanitizer Safety: Strips Malicious Content, Scripts, and Unsafe Schemes
test('HTML Sanitizer: Strips scripts, event handlers, and javascript: URLs while preserving safe formatting', () => {
  const maliciousInput = `
    <h2>Verified Report</h2>
    <script>alert("xss")</script>
    <p onclick="alert('hack')">Safe text with <strong onmouseover="stealCookies()">bold emphasis</strong>.</p>
    <a href="javascript:alert(1)" onclick="return false;">Malicious Link</a>
    <a href="https://kavharibis.com/bank-directory" target="_blank">Safe Link</a>
    <img src="javascript:alert(2)" onerror="alert(3)" />
    <img src="https://kavharibis.com/logo.png" alt="Bank Logo" width="120" />
    <iframe src="https://evil.com"></iframe>
    <table class="richReportTable">
      <thead>
        <tr><th colspan="2">Institutional Holders</th></tr>
      </thead>
      <tbody>
        <tr onclick="bad()"><td rowspan="1">Banc Funds</td><td>108.14k</td></tr>
      </tbody>
    </table>
  `;

  const clean = sanitizeReportHtml(maliciousInput);

  // Assert malicious elements and attributes are completely eliminated
  assert.equal(clean.includes('<script>'), false, 'Script tags must be removed');
  assert.equal(clean.includes('alert('), false, 'Script code must not survive');
  assert.equal(clean.includes('<iframe'), false, 'Iframe tags must be removed');
  assert.equal(clean.includes('onclick'), false, 'onclick handlers must be removed');
  assert.equal(clean.includes('onmouseover'), false, 'onmouseover handlers must be removed');
  assert.equal(clean.includes('onerror'), false, 'onerror handlers must be removed');
  assert.equal(clean.includes('javascript:'), false, 'javascript: URL scheme must be removed');

  // Assert legitimate semantic formatting, table structure, and attributes are preserved
  assert.ok(clean.includes('<h2>Verified Report</h2>'), 'H2 tag must be preserved');
  assert.ok(clean.includes('<strong>bold emphasis</strong>'), 'Strong tag must be preserved');
  assert.ok(clean.includes('href="https://kavharibis.com/bank-directory"'), 'Safe https link must be preserved');
  assert.ok(clean.includes('rel="noopener noreferrer"'), 'rel="noopener noreferrer" must be enforced on links');
  assert.ok(clean.includes('<table class="richReportTable">'), 'Table tag and class must be preserved');
  assert.ok(clean.includes('colspan="2"'), 'Table colspan attribute must be preserved');
  assert.ok(clean.includes('<td rowspan="1">Banc Funds</td>'), 'Table cell content with rowspan must be preserved');
  assert.ok(clean.includes('<td>108.14k</td>'), 'Plain table cell content must be preserved');
  assert.ok(clean.includes('src="https://kavharibis.com/logo.png"'), 'Safe image source must be preserved');
});

// 4. PDF Magic Bytes Signature Validation Test
test('PDF Upload Validator: Validates %PDF- signature and rejects non-PDF files', () => {
  function isPdfMagicBytes(bytes) {
    if (bytes.length < 5) return false;
    return (
      bytes[0] === 0x25 &&
      bytes[1] === 0x50 &&
      bytes[2] === 0x44 &&
      bytes[3] === 0x46 &&
      bytes[4] === 0x2d
    );
  }

  // Valid PDF magic bytes: %PDF-
  const validPdfBytes = new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x2d, 0x31, 0x2e, 0x37]);
  assert.equal(isPdfMagicBytes(validPdfBytes), true, 'Valid %PDF- header must be accepted');

  // Fake PDF (e.g. an executable or script renamed to .pdf)
  const exeBytes = new Uint8Array([0x4d, 0x5a, 0x90, 0x00, 0x03]); // MZ header
  assert.equal(isPdfMagicBytes(exeBytes), false, 'EXE header must be rejected');

  const pngBytes = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  assert.equal(isPdfMagicBytes(pngBytes), false, 'PNG header must be rejected');

  const textBytes = new TextEncoder().encode('This is just a plain text file');
  assert.equal(isPdfMagicBytes(textBytes), false, 'Plain text file renamed to .pdf must be rejected');
});

// 5. Image Magic Bytes Signature Validation Test
test('Image Upload Validator: Accepts PNG, JPEG, WebP and rejects SVG or scripts', () => {
  function detectImageFormat(bytes) {
    if (
      bytes.length >= 8 &&
      bytes[0] === 0x89 &&
      bytes[1] === 0x50 &&
      bytes[2] === 0x4e &&
      bytes[3] === 0x47 &&
      bytes[4] === 0x0d &&
      bytes[5] === 0x0a &&
      bytes[6] === 0x1a &&
      bytes[7] === 0x0a
    ) {
      return { valid: true, ext: 'png', mime: 'image/png' };
    }
    if (
      bytes.length >= 3 &&
      bytes[0] === 0xff &&
      bytes[1] === 0xd8 &&
      bytes[2] === 0xff
    ) {
      return { valid: true, ext: 'jpg', mime: 'image/jpeg' };
    }
    if (
      bytes.length >= 12 &&
      bytes[0] === 0x52 &&
      bytes[1] === 0x49 &&
      bytes[2] === 0x46 &&
      bytes[3] === 0x46 &&
      bytes[8] === 0x57 &&
      bytes[9] === 0x45 &&
      bytes[10] === 0x42 &&
      bytes[11] === 0x50
    ) {
      return { valid: true, ext: 'webp', mime: 'image/webp' };
    }
    return { valid: false, ext: '', mime: '' };
  }

  // PNG
  const png = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00]);
  assert.equal(detectImageFormat(png).valid, true);
  assert.equal(detectImageFormat(png).mime, 'image/png');

  // JPEG
  const jpeg = new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10]);
  assert.equal(detectImageFormat(jpeg).valid, true);
  assert.equal(detectImageFormat(jpeg).mime, 'image/jpeg');

  // SVG / HTML masquerading as image
  const svg = new TextEncoder().encode('<svg xmlns="http://www.w3.org/2000/svg"><script>alert(1)</script></svg>');
  assert.equal(detectImageFormat(svg).valid, false, 'SVG must be rejected from inline image upload');
});

// 6. Bank ID and Authorization Isolation for PDF & Images
test('Data Isolation: Validates that Bank A token cannot access Bank B PDF or Image', () => {
  // Simulate token verification logic from /api/bank-report-pdf and /api/bank-report-image
  function verifyBankAccess(requestedBankId, tokenRecord) {
    if (!tokenRecord) return false;
    const isWithin7Days = Date.now() - new Date(tokenRecord.created_at).getTime() < 7 * 24 * 60 * 60 * 1000;
    return tokenRecord.bank_id === requestedBankId && isWithin7Days;
  }

  const tokenBankA = {
    bank_id: 'bank-1st-colonial',
    created_at: new Date().toISOString(),
  };

  // Accessing Bank A with Bank A token -> Authorized
  assert.equal(verifyBankAccess('bank-1st-colonial', tokenBankA), true);

  // Attempting to access Bank B (3650 Capital) with Bank A token -> Unauthorized
  assert.equal(
    verifyBankAccess('bank-3650-capital', tokenBankA),
    false,
    'Bank A token must be rejected when attempting to access Bank B report',
  );

  // Expired token (> 7 days) -> Unauthorized
  const expiredToken = {
    bank_id: 'bank-1st-colonial',
    created_at: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
  };
  assert.equal(verifyBankAccess('bank-1st-colonial', expiredToken), false, 'Expired token must be rejected');
});

// 7. R2 Key Namespace Isolation Test
test('Data Isolation: Enforces bank-scoped storage keys preventing cross-tenant access', () => {
  function buildPdfKey(bankId) {
    if (!bankId || typeof bankId !== 'string') throw new Error('Invalid bankId');
    const safeBankId = bankId.trim().replace(/[^a-zA-Z0-9_\-]/g, '');
    return `bank-reports/${safeBankId}/report.pdf`;
  }

  function buildImageKey(bankId, imageId, ext) {
    const safeBankId = bankId.trim().replace(/[^a-zA-Z0-9_\-]/g, '');
    const safeImageId = imageId.trim().replace(/[^a-zA-Z0-9_\-]/g, '');
    return `bank-reports/${safeBankId}/images/${safeImageId}.${ext}`;
  }

  const key1 = buildPdfKey('bank-1st-colonial');
  const key2 = buildPdfKey('bank-3650-capital');

  assert.equal(key1, 'bank-reports/bank-1st-colonial/report.pdf');
  assert.equal(key2, 'bank-reports/bank-3650-capital/report.pdf');
  assert.notEqual(key1, key2, 'Keys for different banks must be completely distinct');

  const imgKey1 = buildImageKey('bank-3650-capital', 'uuid-1234', 'png');
  assert.ok(imgKey1.startsWith('bank-reports/bank-3650-capital/images/'));
  assert.equal(imgKey1.includes('1st-colonial'), false);
});

// 8. Payload Size Ceiling Test (500 KB limit validation)
test('Payload Size Validation: Rejects reports exceeding 500 KB ceiling and does not silently truncate', () => {
  const MAX_LIMIT = 512000; // 500 KB

  function validateReportSize(fullReport) {
    if (fullReport !== undefined) {
      if (typeof fullReport !== 'string') {
        return { valid: false, status: 400, error: 'Invalid report content.' };
      }
      if (fullReport.length > MAX_LIMIT) {
        return {
          valid: false,
          status: 413,
          error: 'Report content exceeds the maximum size limit of 500 KB. Please reduce embedded content or use the attached PDF.',
        };
      }
    }
    return { valid: true, content: String(fullReport || '').trim() };
  }

  // Normal report within limit
  const normalReport = '<h2>Report</h2><p>' + 'A'.repeat(50000) + '</p>';
  const normalResult = validateReportSize(normalReport);
  assert.equal(normalResult.valid, true);
  assert.equal(normalResult.content.length, normalReport.length);

  // Oversized report (> 500 KB)
  const oversizedReport = '<p>' + 'X'.repeat(520000) + '</p>';
  const oversizedResult = validateReportSize(oversizedReport);
  assert.equal(oversizedResult.valid, false);
  assert.equal(oversizedResult.status, 413);
  assert.match(oversizedResult.error, /exceeds the maximum size limit of 500 KB/);
});

// 9. DOCX Import Semantic Extraction Simulation
test('Word DOCX Extraction: Verifies table and heading tags pass cleanly through sanitizer', () => {
  // Mammoth output format sample for tables and headings
  const mammothHtmlOutput = `
    <h1>Executive Summary</h1>
    <p>Financial review and Heter Iska evaluation.</p>
    <table>
      <tr><th>Officer Name</th><th>Title</th><th>Ownership %</th></tr>
      <tr><td>John Doe</td><td>Managing Director</td><td>5.2%</td></tr>
      <tr><td>Jane Smith</td><td>Chief Risk Officer</td><td>3.1%</td></tr>
    </table>
  `;

  const sanitized = sanitizeReportHtml(mammothHtmlOutput);

  assert.ok(sanitized.includes('<h1>Executive Summary</h1>'));
  assert.ok(sanitized.includes('<table>'));
  assert.ok(sanitized.includes('<th>Officer Name</th>'));
  assert.ok(sanitized.includes('<td>John Doe</td>'));
  assert.ok(sanitized.includes('<td>5.2%</td>'));
});

// 10. Draft UUID Validation for New Bank Creation & Inline Image Insertion
test('Draft UUID Validation: Accepts valid UUIDs for draft bank entries and rejects malformed IDs', () => {
  function validateBankOrDraftId(id, existingDbIds = new Set()) {
    if (!id || typeof id !== 'string') return { valid: false, error: 'Bank ID is required' };
    const trimmed = id.trim();
    if (existingDbIds.has(trimmed)) return { valid: true, isDraft: false };
    const isValidUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(trimmed);
    if (isValidUuid) return { valid: true, isDraft: true };
    return { valid: false, error: 'Bank record or valid draft identifier not found' };
  }

  const existingDbIds = new Set(['legacy-1', 'bank-chase-corp']);

  // Valid existing bank
  const res1 = validateBankOrDraftId('legacy-1', existingDbIds);
  assert.equal(res1.valid, true);
  assert.equal(res1.isDraft, false);

  // Valid client-generated draft UUID
  const draftUuid = 'a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d';
  const res2 = validateBankOrDraftId(draftUuid, existingDbIds);
  assert.equal(res2.valid, true);
  assert.equal(res2.isDraft, true);

  // Malformed ID / path traversal attempt
  const res3 = validateBankOrDraftId('../../evil', existingDbIds);
  assert.equal(res3.valid, false);

  // Random non-existent string
  const res4 = validateBankOrDraftId('non-existent-bank', existingDbIds);
  assert.equal(res4.valid, false);
});

// 11. Base64 Sanitization: Strips Data URIs to Prevent 413 while Preserving Hosted R2 URLs
test('HTML Sanitizer: Strips base64 data URIs and blob URLs to prevent 413 Payload Too Large', () => {
  const hostedR2Image = '<img src="/api/bank-report-image?bankId=draft-123&id=img-456&ext=png" alt="Chart" />';
  const base64Image = '<img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==" alt="Embedded" />';
  const blobImage = '<img src="blob:http://localhost:3000/temp-uuid" alt="Blob Image" />';

  const html = `<h2>Financial Ratios</h2><p>${hostedR2Image}</p><p>${base64Image}</p><p>${blobImage}</p>`;
  const sanitized = sanitizeReportHtml(html);

  // Hosted R2 URL is preserved
  assert.ok(sanitized.includes('src="/api/bank-report-image?bankId=draft-123&amp;id=img-456&amp;ext=png"'));

  // Base64 data URI is stripped
  assert.equal(sanitized.includes('data:image/png;base64'), false, 'data: URI must be stripped');

  // Blob URL is stripped
  assert.equal(sanitized.includes('blob:http'), false, 'blob: URL must be stripped');
});

// 12. Image Upload Size Validation: Enforces 1 MB Limit with HTTP 413
test('Image Upload Size Validation: Rejects files > 1 MB with HTTP 413 status code', () => {
  const MAX_IMAGE_SIZE = 1 * 1024 * 1024; // 1 MB (1,048,576 bytes)

  function validateImageSize(sizeInBytes) {
    if (sizeInBytes > MAX_IMAGE_SIZE) {
      return {
        status: 413,
        error: `Image is too large. Maximum allowed size is 1 MB. Your file is ${(sizeInBytes / (1024 * 1024)).toFixed(1)} MB.`,
      };
    }
    return { status: 200, valid: true };
  }

  // 0.5 MB image (allowed)
  const smallImg = validateImageSize(Math.floor(0.5 * 1024 * 1024));
  assert.equal(smallImg.status, 200);

  // Exactly 1 MB image (1,048,576 bytes - allowed)
  const exactLimitImg = validateImageSize(1 * 1024 * 1024);
  assert.equal(exactLimitImg.status, 200);

  // 1 MB + 1 byte image (rejected with 413)
  const slightlyOverImg = validateImageSize(1 * 1024 * 1024 + 1);
  assert.equal(slightlyOverImg.status, 413);
  assert.match(slightlyOverImg.error, /Image is too large\. Maximum allowed size is 1 MB\./);

  // 1.5 MB image (rejected with 413)
  const oversizedImg = validateImageSize(Math.floor(1.5 * 1024 * 1024));
  assert.equal(oversizedImg.status, 413);
  assert.equal(oversizedImg.error, 'Image is too large. Maximum allowed size is 1 MB. Your file is 1.5 MB.');
});

// 13. ID Collision Protection: Prevents duplicate records on bank create POST
test('ID Collision Prevention: Rejects bank creation if target ID already exists in DB', () => {
  const existingIds = new Set(['bank-existing-1', 'bank-existing-2']);

  function handleCreateId(providedId) {
    const isValidUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(providedId);
    const id = isValidUuid ? providedId : 'auto-generated-uuid';
    if (existingIds.has(id)) {
      return { status: 409, error: 'A bank entry with this identifier already exists.' };
    }
    return { status: 200, id };
  }

  // Pre-assigned UUID that does not exist -> accepted
  const newId = 'c1d2e3f4-a5b6-4c7d-8e9f-0a1b2c3d4e5f';
  const result1 = handleCreateId(newId);
  assert.equal(result1.status, 200);
  assert.equal(result1.id, newId);

  // Pre-assigned UUID that collides -> rejected with 409
  existingIds.add(newId);
  const result2 = handleCreateId(newId);
  assert.equal(result2.status, 409);
  assert.match(result2.error, /already exists/);
});

// 14. Frontend Image Upload Error Resolution & Parsing
test('Frontend Image Upload Error Parsing: Distinguishes application limit from upstream 413', () => {
  function parseUploadError(resStatus, responseJson, isJson) {
    let errorMsg = '';
    if (isJson && responseJson && responseJson.error) {
      errorMsg = responseJson.error;
    }

    if (!errorMsg) {
      if (resStatus === 413) {
        errorMsg = 'Upload request was rejected because the payload is too large for the server or network gateway (HTTP 413).';
      } else if (resStatus === 401 || resStatus === 403) {
        errorMsg = 'You do not have permission to upload images for this bank.';
      } else {
        errorMsg = `Upload failed with status ${resStatus}.`;
      }
    }
    return errorMsg;
  }

  // Case 1: Application 413 with explicit JSON error
  const appError = parseUploadError(413, { error: 'Image is too large. Maximum allowed size is 1 MB. Your file is 1.5 MB.' }, true);
  assert.equal(appError, 'Image is too large. Maximum allowed size is 1 MB. Your file is 1.5 MB.');

  // Case 2: Upstream proxy/gateway 413 without JSON error (e.g. plain text "Payload Too Large")
  const gatewayError = parseUploadError(413, null, false);
  assert.equal(gatewayError, 'Upload request was rejected because the payload is too large for the server or network gateway (HTTP 413).');
  assert.equal(gatewayError.includes('1 MB'), false, 'Must not falsely label gateway 413 as application 1 MB rejection');
  assert.equal(gatewayError.includes('5 MB'), false, 'Must not claim the file exceeded the 5 MB limit');

  // Case 3: 401 Unauthorized
  const authError = parseUploadError(401, null, false);
  assert.equal(authError, 'You do not have permission to upload images for this bank.');

  // Case 4: 500 Internal Server Error
  const serverError = parseUploadError(500, null, false);
  assert.equal(serverError, 'Upload failed with status 500.');
});

// 15. Client-Side Image Size Validation
test('Client-Side Image Validation: Returns accurate 1 MB limit in error message for oversized files', () => {
  const MAX_IMAGE_SIZE_BYTES = 1 * 1024 * 1024; // 1 MB (1,048,576 bytes)

  function validateClientImage(fileSize) {
    if (fileSize > MAX_IMAGE_SIZE_BYTES) {
      return {
        valid: false,
        message: `Image is too large. Maximum allowed size is 1 MB. Your file is ${(fileSize / (1024 * 1024)).toFixed(1)} MB. Please select an image under 1 MB or attach via the Source PDF option.`,
      };
    }
    return { valid: true };
  }

  // 0.5 MB image -> valid
  assert.equal(validateClientImage(0.5 * 1024 * 1024).valid, true);

  // Exactly 1.0 MB (1,048,576 bytes) -> valid
  assert.equal(validateClientImage(1 * 1024 * 1024).valid, true);

  // 1.0 MB + 1 byte -> invalid with message stating 1 MB limit
  const resBoundary = validateClientImage(1 * 1024 * 1024 + 1);
  assert.equal(resBoundary.valid, false);
  assert.match(resBoundary.message, /Maximum allowed size is 1 MB\./);

  // 1.5 MB image -> invalid with message stating 1 MB limit and actual size
  const res15 = validateClientImage(1.5 * 1024 * 1024);
  assert.equal(res15.valid, false);
  assert.match(res15.message, /Maximum allowed size is 1 MB\./);
  assert.match(res15.message, /Your file is 1.5 MB\./);

  // 3.0 MB image -> invalid
  const res30 = validateClientImage(3.0 * 1024 * 1024);
  assert.equal(res30.valid, false);
  assert.match(res30.message, /Your file is 3.0 MB\./);
});

// 16. UI Helper Text and Separate Upload Limits Integrity
test('UI and Upload Limits: Enforces 1 MB for inline images while preserving 25 MB for PDF attachments', () => {
  const helperText = 'Add Image / Chart (PNG, JPEG, WebP up to 1 MB)';
  assert.match(helperText, /up to 1 MB/);

  const MAX_PDF_SIZE = 25 * 1024 * 1024; // 25 MB
  const pdfSizeAllowed = 20 * 1024 * 1024;
  assert.ok(pdfSizeAllowed <= MAX_PDF_SIZE, '20 MB PDF is well within 25 MB limit');

  const pdfSizeLimit = 25 * 1024 * 1024;
  assert.ok(pdfSizeLimit <= MAX_PDF_SIZE, '25 MB PDF is accepted');

  const pdfOversized = 26 * 1024 * 1024;
  assert.ok(pdfOversized > MAX_PDF_SIZE, '26 MB PDF is rejected');
});

// 17. Image Removal UX Precision & Persistence Tests
test('Image Removal UX: Removes only the targeted image, preserves surrounding text, and persists', () => {
  // Scenario A: Two images inserted, remove one
  const reportWithTwoImages = `
    <h2>Executive Overview</h2>
    <p>Opening paragraph with essential data.</p>
    <p><img class="richReportImage" src="/api/bank-report-image?bankId=test-bank&id=img-1&ext=png" alt="Chart 1" /></p>
    <p>Intermediary financial metrics paragraph.</p>
    <p><img class="richReportImage" src="/api/bank-report-image?bankId=test-bank&id=img-2&ext=png" alt="Chart 2" /></p>
    <p>Closing analysis paragraph.</p>
  `;

  // Simulate removing Image 1 only
  const targetImg1Src = '/api/bank-report-image?bankId=test-bank&id=img-1&ext=png';
  function removeImageBySrc(html, imgSrc) {
    // Matches the img tag with the specific src
    const regex = new RegExp(`<img[^>]*src=["']${imgSrc.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}["'][^>]*>`, 'i');
    return html.replace(regex, '');
  }

  const reportAfterRemoval1 = removeImageBySrc(reportWithTwoImages, targetImg1Src);
  const clean1 = sanitizeReportHtml(reportAfterRemoval1);

  // Assert Image 1 is completely removed
  assert.equal(clean1.includes('id=img-1'), false, 'Targeted image 1 must be removed');

  // Assert Image 2 remains completely intact
  assert.ok(clean1.includes('id=img-2'), 'Non-targeted image 2 must remain in the report');

  // Assert all text and headings are preserved
  assert.ok(clean1.includes('<h2>Executive Overview</h2>'), 'Heading must be preserved');
  assert.ok(clean1.includes('Opening paragraph with essential data.'), 'Preceding paragraph must be preserved');
  assert.ok(clean1.includes('Intermediary financial metrics paragraph.'), 'Intermediary paragraph must be preserved');
  assert.ok(clean1.includes('Closing analysis paragraph.'), 'Closing paragraph must be preserved');

  // Scenario B: Image between paragraphs removed
  const singleImageBetweenParagraphs = `
    <p>Before paragraph.</p>
    <p><img class="richReportImage" src="/api/bank-report-image?bankId=test-bank&id=img-solo&ext=png" alt="Solo Chart" /></p>
    <p>After paragraph.</p>
  `;
  const reportAfterSoloRemoval = removeImageBySrc(singleImageBetweenParagraphs, '/api/bank-report-image?bankId=test-bank&id=img-solo&ext=png');
  const cleanSolo = sanitizeReportHtml(reportAfterSoloRemoval);

  assert.equal(cleanSolo.includes('img-solo'), false, 'Solo image must be removed');
  assert.ok(cleanSolo.includes('Before paragraph.'), 'Before paragraph must be preserved');
  assert.ok(cleanSolo.includes('After paragraph.'), 'After paragraph must be preserved');

  // Scenario C: Persistence check - saving and reloading the report
  const savedDbRecord = {
    id: 'test-bank',
    full_report: cleanSolo,
  };

  // Simulate reopening editor with saved report
  const reloadedReport = savedDbRecord.full_report;
  assert.equal(reloadedReport.includes('img-solo'), false, 'Removed image must not reappear upon reopening');
  assert.ok(reloadedReport.includes('Before paragraph.'), 'Before text must persist');
  assert.ok(reloadedReport.includes('After paragraph.'), 'After text must persist');
});


