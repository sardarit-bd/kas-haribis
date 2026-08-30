'use client';

import { useRef, useState } from 'react';

const columns = [
  'Bank Name',
  'Type',
  'Status',
  'Author',
  'Last Updated',
  'Comments',
  'Website',
  'Research Summary',
  'Public Comment',
  'Ownership and Control',
  'Heter Iska Details',
  'Source Links',
  'Full Report',
  'Private Notes',
];

function parseCsv(text: string) {
  const rows: string[][] = [];
  let row: string[] = [],
    cell = '',
    quoted = false;
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (char === '"') {
      if (quoted && text[i + 1] === '"') {
        cell += '"';
        i++;
      } else quoted = !quoted;
    } else if (char === ',' && !quoted) {
      row.push(cell);
      cell = '';
    } else if ((char === '\n' || char === '\r') && !quoted) {
      if (char === '\r' && text[i + 1] === '\n') i++;
      row.push(cell);
      if (row.some((value) => value.trim())) rows.push(row);
      row = [];
      cell = '';
    } else cell += char;
  }
  row.push(cell);
  if (row.some((value) => value.trim())) rows.push(row);
  return rows;
}
function key(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]/g, '');
}
function status(value: string) {
  const normalized = value.trim().toLowerCase();
  if (['g', 'green', 'kosher', 'good'].includes(normalized)) return 'kosher';
  if (['r', 'red', 'no good', 'problematic'].includes(normalized))
    return 'no-good';
  if (
    ['y', 'yellow', 'questionable', 'needs clarification'].includes(normalized)
  )
    return 'questionable';
  const allowed = [
    'mehudar',
    'kosher',
    'only-kosher-with-iska',
    'case-by-case',
    'questionable',
    'no-good',
    'lack-of-information',
  ];
  return allowed.includes(normalized) ? normalized : 'lack-of-information';
}
function isoDate(value: string) {
  const trimmed = value.trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return trimmed;
  const match = trimmed.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  return match
    ? `${match[3]}-${match[1].padStart(2, '0')}-${match[2].padStart(2, '0')}`
    : '';
}

export default function SpreadsheetImport({
  researcherName,
}: {
  researcherName: string;
}) {
  const input = useRef<HTMLInputElement>(null),
    [message, setMessage] = useState(''),
    [busy, setBusy] = useState(false);
  function downloadTemplate() {
    const csv = [
      columns,
      ...[
        [
          'Example Bank',
          'Public Bank',
          'green',
          researcherName,
          new Date().toLocaleDateString('en-US'),
          'Short master-list comment',
          'https://example.com',
          'Short directory summary',
          'Public warning or condition',
          'Ownership findings',
          'Heter Iska findings',
          'https://source.example',
          'Complete protected report',
          'Internal notes',
        ],
      ],
    ]
      .map((row) =>
        row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(','),
      )
      .join('\r\n');
    const url = URL.createObjectURL(
      new Blob([csv], { type: 'text/csv;charset=utf-8' }),
    );
    const link = document.createElement('a');
    link.href = url;
    link.download = 'kav-haribis-bank-research-template.csv';
    link.click();
    URL.revokeObjectURL(url);
  }
  async function upload(file: File) {
    setBusy(true);
    setMessage('Reading spreadsheet…');
    const rows = parseCsv(await file.text());
    if (rows.length < 2) {
      setMessage('The CSV does not contain any lender rows.');
      setBusy(false);
      return;
    }
    const headers = rows[0].map(key),
      at = (row: string[], ...names: string[]) => {
        for (const name of names) {
          const index = headers.indexOf(key(name));
          if (index >= 0) return (row[index] || '').trim();
        }
        return '';
      };
    const payloads = rows
      .slice(1)
      .map((row) => ({
        title: at(row, 'Bank Name', 'Bank or lender name', 'Institution Name'),
        institution_type: at(row, 'Type', 'Institution Type') || 'Not entered',
        status_recommendation: status(at(row, 'Status', 'Recommended Status')),
        researcher_name: at(row, 'Author', 'Researcher') || researcherName,
        last_updated: isoDate(
          at(row, 'Last Updated', 'Research completed / updated'),
        ),
        public_comment: at(row, 'Public Comment') || at(row, 'Comments'),
        website: at(row, 'Website', 'Institution Website'),
        summary: at(row, 'Research Summary', 'Summary'),
        ownership_details: at(
          row,
          'Ownership and Control',
          'Ownership Details',
        ),
        iska_details: at(row, 'Heter Iska Details'),
        source_urls: at(row, 'Source Links', 'Sources'),
        full_report: at(row, 'Full Report', 'Report'),
        internal_notes: at(row, 'Private Notes', 'Internal Notes'),
      }))
      .filter((row) => row.title);
    setMessage(`Importing ${payloads.length} lender rows…`);
    const response = await fetch('/api/bank-research-bulk', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ rows: payloads }),
      }),
      json = (await response.json()) as any;
    if (!response.ok) {
      setMessage(json.error || 'The bulk upload failed.');
      setBusy(false);
      return;
    }
    setMessage(
      `${json.imported} lenders imported as private drafts${json.skipped ? `; ${json.skipped} incomplete rows skipped` : ''}. Opening the list…`,
    );
    setBusy(false);
    setTimeout(() => location.reload(), 1000);
  }
  return (
    <section className="researchSpreadsheetImport">
      <div>
        <small>BULK UPLOAD — UP TO 1,000 BANKS</small>
        <h2>Upload hundreds of lenders at once</h2>
        <p>
          Upload one Google Sheets CSV containing Bank Name, Type, Status,
          Author, Last Updated, Comments, and every detailed site field. Every
          imported bank stays private until it is reviewed and approved.
        </p>
      </div>
      <div className="spreadsheetImportActions">
        <button type="button" onClick={downloadTemplate}>
          Download bulk-upload template
        </button>
        <button
          type="button"
          className="primary bulkUploadButton"
          disabled={busy}
          onClick={() => input.current?.click()}
        >
          {busy ? 'Bulk uploading…' : 'BULK UPLOAD CSV'}
        </button>
        <input
          ref={input}
          hidden
          type="file"
          accept=".csv,text/csv"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) upload(file);
            event.currentTarget.value = '';
          }}
        />
      </div>
      {message && <p className="researchMessage">{message}</p>}
      <small className="spreadsheetHelp">
        From Google Sheets: File → Download → Comma-separated values (.csv).
        Logos and PDF/Word reports can be attached afterward from each imported
        draft.
      </small>
    </section>
  );
}
