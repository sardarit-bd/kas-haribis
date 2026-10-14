import test from 'node:test';
import assert from 'node:assert/strict';
import {
  parseStructuredReport,
  parseInlineTokens,
} from '../app/bank-directory/full-report/parse-report.ts';

test('Structured Report: Empty and whitespace strings return empty blocks', () => {
  assert.deepEqual(parseStructuredReport(''), []);
  assert.deepEqual(parseStructuredReport('   \n\n  \t  \n'), []);
});

test('Structured Report: Parses exact unformatted plain-text 1st Colonial Bank report', () => {
  const input = `1st Colonial Bank
Public Bank: 1st Colonial Bancorp, Inc. (FCOB) OTCPK

Executive Management
Robert B white: President and CEO
Mary K Shea: EVP and CFO

Board of Directors:
Linda M Rohrer
Robert B white: President and CEO
Curt Byerly
Thomas A Clark III
John J Donnelley IV
Michael Haydinger
Harvey C Johnson
Stanley H Molotsky
Letita G Colombi
Shelley Sims
Thomas Brugger

Top Institutional Holders
Holder Shares Date Reported % Out Value
Banc Funds Company, L.L.C. (The) 108.14k Sep 30, 2024 2.24% 1,589,716
Siena Capital Partners GP, LLC 95.35k Sep 30, 2024 1.97% 1,401,674
Fulton Bank, NA 55.63k Dec 31, 2024 1.15% 817,716
Ethos Financial Group, LLC 14.42k Sep 30, 2024 0.30% 211,929

As it is a bulletin board stock I was unable to find ownership info. Might be enough to rely on regardless.`;

  const blocks = parseStructuredReport(input);

  // 1. Intro block
  assert.equal(blocks[0].type, 'intro');
  assert.equal(blocks[0].title, '1st Colonial Bank');
  assert.equal(blocks[0].publicInfo, 'Public Bank: 1st Colonial Bancorp, Inc. (FCOB) OTCPK');

  // 2. Executive Management
  assert.equal(blocks[1].type, 'heading');
  assert.equal(blocks[1].text, 'Executive Management');

  assert.equal(blocks[2].type, 'list');
  assert.equal(blocks[2].variant, 'officers');
  assert.equal(blocks[2].items.length, 2);
  assert.equal(blocks[2].items[0], 'Robert B white: President and CEO');
  assert.equal(blocks[2].items[1], 'Mary K Shea: EVP and CFO');

  // 3. Board of Directors
  assert.equal(blocks[3].type, 'heading');
  assert.equal(blocks[3].text, 'Board of Directors');

  assert.equal(blocks[4].type, 'list');
  assert.equal(blocks[4].variant, 'directors');
  assert.equal(blocks[4].items.length, 11);
  assert.equal(blocks[4].items[0], 'Linda M Rohrer');
  assert.equal(blocks[4].items[1], 'Robert B white: President and CEO');
  assert.equal(blocks[4].items[10], 'Thomas Brugger');

  // 4. Top Institutional Holders table
  assert.equal(blocks[5].type, 'heading');
  assert.equal(blocks[5].text, 'Top Institutional Holders');

  assert.equal(blocks[6].type, 'table');
  assert.deepEqual(blocks[6].data.headers, ['Holder', 'Shares', 'Date Reported', '% Out', 'Value']);
  assert.equal(blocks[6].data.rows.length, 4);
  assert.deepEqual(blocks[6].data.rows[0], [
    'Banc Funds Company, L.L.C. (The)',
    '108.14k',
    'Sep 30, 2024',
    '2.24%',
    '1,589,716',
  ]);
  assert.deepEqual(blocks[6].data.rows[1], [
    'Siena Capital Partners GP, LLC',
    '95.35k',
    'Sep 30, 2024',
    '1.97%',
    '1,401,674',
  ]);
  assert.deepEqual(blocks[6].data.rows[2], [
    'Fulton Bank, NA',
    '55.63k',
    'Dec 31, 2024',
    '1.15%',
    '817,716',
  ]);
  assert.deepEqual(blocks[6].data.rows[3], [
    'Ethos Financial Group, LLC',
    '14.42k',
    'Sep 30, 2024',
    '0.30%',
    '211,929',
  ]);

  // 5. Research note
  assert.equal(blocks[7].type, 'blockquote');
  assert.match(blocks[7].lines[0], /As it is a bulletin board stock/);
});

test('Structured Report: Parses Markdown headings (# to ####)', () => {
  const input = `# Bank Overview\n## Executive Management\n### Key Officers\n#### Sub-team`;
  const blocks = parseStructuredReport(input);

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

test('Structured Report: Parses clean TSV tables', () => {
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

test('Structured Report: Legacy plain text fallback preserves paragraphs without crashing', () => {
  const input = `This is a standard historical bank research report.
It does not contain special sections or institutional tables.

A second paragraph describes general heter iska terms.`;
  const blocks = parseStructuredReport(input);

  assert.equal(blocks[0].type, 'paragraph');
  assert.match(blocks[0].text, /historical bank research report/);
  assert.equal(blocks[1].type, 'paragraph');
  assert.match(blocks[1].text, /heter iska terms/);
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
