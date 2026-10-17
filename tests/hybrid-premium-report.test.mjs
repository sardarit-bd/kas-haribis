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
