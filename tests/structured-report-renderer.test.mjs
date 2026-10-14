import test from 'node:test';
import assert from 'node:assert/strict';
import { parseStructuredReport, parseInlineTokens } from '../app/bank-directory/full-report/parse-report.ts';

test('Structured Report: Empty and whitespace strings return empty blocks', () => {
  assert.deepEqual(parseStructuredReport(''), []);
  assert.deepEqual(parseStructuredReport('   \n\n  \t  \n'), []);
});

test('Structured Report: Parses headings (#, ##, ###, ####)', () => {
  const input = `# Bank Overview\n## Executive Management\n### Key Officers\n#### Sub-team`;
  const blocks = parseStructuredReport(input);

  assert.equal(blocks.length, 4);
  assert.equal(blocks[0].type, 'heading');
  assert.equal(blocks[0].level, 1);
  assert.equal(blocks[0].text, 'Bank Overview');

  assert.equal(blocks[1].type, 'heading');
  assert.equal(blocks[1].level, 2);
  assert.equal(blocks[1].text, 'Executive Management');

  assert.equal(blocks[2].type, 'heading');
  assert.equal(blocks[2].level, 3);
  assert.equal(blocks[2].text, 'Key Officers');

  assert.equal(blocks[3].type, 'heading');
  assert.equal(blocks[3].level, 4);
  assert.equal(blocks[3].text, 'Sub-team');
});

test('Structured Report: Parses unordered lists with - and *', () => {
  const input = `- Item 1\n- Item 2\n\n* Star Item A\n* Star Item B`;
  const blocks = parseStructuredReport(input);

  assert.equal(blocks.length, 2);
  assert.equal(blocks[0].type, 'list');
  assert.deepEqual(blocks[0].items, ['Item 1', 'Item 2']);

  assert.equal(blocks[1].type, 'list');
  assert.deepEqual(blocks[1].items, ['Star Item A', 'Star Item B']);
});

test('Structured Report: Parses blockquotes', () => {
  const input = `> This is a research note.\n> Second line of note.`;
  const blocks = parseStructuredReport(input);

  assert.equal(blocks.length, 1);
  assert.equal(blocks[0].type, 'blockquote');
  assert.deepEqual(blocks[0].lines, [
    'This is a research note.',
    'Second line of note.',
  ]);
});

test('Structured Report: Parses GFM pipe tables with explicit alignments', () => {
  const input = `
| Holder | Shares | Date Reported | % Out | Value |
| :--- | ---: | :---: | ---: | ---: |
| Vanguard Group Inc | 250,000 | 2024-12-31 | 5.2% | $3,500,000 |
| BlackRock Inc | 180,000 | 2024-12-31 | 3.8% | $2,520,000 |
`;
  const blocks = parseStructuredReport(input);

  assert.equal(blocks.length, 1);
  assert.equal(blocks[0].type, 'table');
  assert.deepEqual(blocks[0].data.headers, [
    'Holder',
    'Shares',
    'Date Reported',
    '% Out',
    'Value',
  ]);
  assert.deepEqual(blocks[0].data.alignments, [
    'left',
    'right',
    'center',
    'right',
    'right',
  ]);
  assert.equal(blocks[0].data.rows.length, 2);
  assert.deepEqual(blocks[0].data.rows[0], [
    'Vanguard Group Inc',
    '250,000',
    '2024-12-31',
    '5.2%',
    '$3,500,000',
  ]);
});

test('Structured Report: Infers numeric right alignment when column has numbers/currency/percentage', () => {
  const input = `
| Asset | Count | Amount | Ratio |
| --- | --- | --- | --- |
| Commercial | 150 | $5,000,000 | 45.2% |
| Residential | 280 | $8,200,000 | 54.8% |
`;
  const blocks = parseStructuredReport(input);

  assert.equal(blocks.length, 1);
  assert.equal(blocks[0].type, 'table');
  assert.deepEqual(blocks[0].data.alignments, [
    'left',
    'right',
    'right',
    'right',
  ]);
});

test('Structured Report: Parses clean TSV (tab-separated) tables', () => {
  const input = `Holder\tShares\tDate\tValue\nVanguard\t1000\t2024-12-31\t$10,000\nBlackRock\t2000\t2024-12-31\t$20,000`;
  const blocks = parseStructuredReport(input);

  assert.equal(blocks.length, 1);
  assert.equal(blocks[0].type, 'table');
  assert.deepEqual(blocks[0].data.headers, ['Holder', 'Shares', 'Date', 'Value']);
  assert.equal(blocks[0].data.rows.length, 2);
  assert.deepEqual(blocks[0].data.rows[0], [
    'Vanguard',
    '1000',
    '2024-12-31',
    '$10,000',
  ]);
});

test('Structured Report: Preserves inconsistent tab lines as readable text without dropping content', () => {
  const input = `Col A\tCol B\tCol C\nRow 2 A\tRow 2 B`;
  const blocks = parseStructuredReport(input);

  assert.equal(blocks.length, 1);
  assert.equal(blocks[0].type, 'paragraph');
  assert.match(blocks[0].text, /Col A/);
  assert.match(blocks[0].text, /Row 2/);
});

test('Structured Report: Full 1st Colonial Bank style report with all elements', () => {
  const input = `
# 1st Colonial Bank
Public Bank: 1st Colonial Bancorp, Inc. (FCOB) OTCPK

## Executive Management
- **Robert B. White**: President and Chief Executive Officer
- **Mary K. Shea**: Executive Vice President and Chief Financial Officer

## Board of Directors
- **Linda M. Rohrer**: Chair of the Board
- **Robert B. White**: Director

## Top Institutional Holders
| Holder | Shares | Date Reported | % Out | Value |
| :--- | ---: | :---: | ---: | ---: |
| Banc Funds Co LLC | 266,163 | 2024-09-30 | 5.34% | $2,781,403 |
| Endeavor Capital Advisors Inc | 125,000 | 2024-09-30 | 2.51% | $1,306,250 |

> Research Note: First colonial bank and first colonial community bank have the same ownership.
The kashruth status is based on detailed ownership and public float records.
`;
  const blocks = parseStructuredReport(input);

  assert.equal(blocks[0].type, 'heading');
  assert.equal(blocks[0].text, '1st Colonial Bank');

  assert.equal(blocks[1].type, 'paragraph');
  assert.match(blocks[1].text, /FCOB/);

  assert.equal(blocks[2].type, 'heading');
  assert.equal(blocks[2].text, 'Executive Management');

  assert.equal(blocks[3].type, 'list');
  assert.equal(blocks[3].items.length, 2);

  assert.equal(blocks[4].type, 'heading');
  assert.equal(blocks[4].text, 'Board of Directors');

  assert.equal(blocks[5].type, 'list');
  assert.equal(blocks[5].items.length, 2);

  assert.equal(blocks[6].type, 'heading');
  assert.equal(blocks[6].text, 'Top Institutional Holders');

  assert.equal(blocks[7].type, 'table');
  assert.equal(blocks[7].data.rows.length, 2);
  assert.deepEqual(blocks[7].data.rows[0], [
    'Banc Funds Co LLC',
    '266,163',
    '2024-09-30',
    '5.34%',
    '$2,781,403',
  ]);

  assert.equal(blocks[8].type, 'blockquote');
  assert.match(blocks[8].lines[0], /First colonial bank/);
});

test('Structured Report: Inline tokens parsing for bold, code, and italic', () => {
  const tokens = parseInlineTokens('Hello **world** and `code` with *emphasis*');
  assert.deepEqual(tokens, [
    { type: 'text', value: 'Hello ' },
    { type: 'bold', value: 'world' },
    { type: 'text', value: ' and ' },
    { type: 'code', value: 'code' },
    { type: 'text', value: ' with ' },
    { type: 'italic', value: 'emphasis' },
  ]);
});
