export type TableAlignment = 'left' | 'center' | 'right';

export interface ParsedTable {
  headers: string[];
  alignments: TableAlignment[];
  rows: string[][];
}

export type ContentBlock =
  | { type: 'intro'; title: string; publicInfo: string }
  | { type: 'heading'; level: 1 | 2 | 3 | 4; text: string }
  | { type: 'list'; items: string[]; variant?: 'bullet' | 'officers' | 'directors' }
  | { type: 'blockquote'; lines: string[]; title?: string }
  | { type: 'table'; data: ParsedTable }
  | { type: 'paragraph'; text: string };

export type InlineToken =
  | { type: 'text'; value: string }
  | { type: 'bold'; value: string }
  | { type: 'italic'; value: string }
  | { type: 'code'; value: string };

const NUMERIC_REGEX = /^[\$€£]?\s*-?[\d,]+(\.\d+)?%?$/;

export function isCellNumeric(cell: string): boolean {
  const trimmed = cell.trim();
  return trimmed.length > 0 && NUMERIC_REGEX.test(trimmed);
}

export function parseInlineTokens(text: string): InlineToken[] {
  if (!text) return [];

  const tokens: InlineToken[] = [];
  let remaining = text;

  while (remaining.length > 0) {
    const boldMatch = remaining.match(/^(.*?)(\*\*|__)([\s\S]*?)\2([\s\S]*)$/);
    const codeMatch = remaining.match(/^(.*?)`([^`]+)`([\s\S]*)$/);
    const italicMatch = remaining.match(/^(.*?)(\*|_)([^*_]+)\2([\s\S]*)$/);

    const matches: Array<{
      type: 'bold' | 'code' | 'italic';
      before: string;
      content: string;
      after: string;
      index: number;
    }> = [];

    if (boldMatch && boldMatch[1] !== undefined) {
      matches.push({
        type: 'bold',
        before: boldMatch[1],
        content: boldMatch[3],
        after: boldMatch[4],
        index: boldMatch[1].length,
      });
    }
    if (codeMatch && codeMatch[1] !== undefined) {
      matches.push({
        type: 'code',
        before: codeMatch[1],
        content: codeMatch[2],
        after: codeMatch[3],
        index: codeMatch[1].length,
      });
    }
    if (italicMatch && italicMatch[1] !== undefined) {
      matches.push({
        type: 'italic',
        before: italicMatch[1],
        content: italicMatch[3],
        after: italicMatch[4],
        index: italicMatch[1].length,
      });
    }

    if (matches.length === 0) {
      tokens.push({ type: 'text', value: remaining });
      break;
    }

    matches.sort((a, b) => a.index - b.index);
    const earliest = matches[0];

    if (earliest.before) {
      tokens.push({ type: 'text', value: earliest.before });
    }

    tokens.push({
      type: earliest.type,
      value: earliest.content,
    });

    remaining = earliest.after;
  }

  return tokens;
}

export function parseMarkdownTableSeparator(line: string): TableAlignment[] | null {
  const trimmed = line.trim();
  if (!trimmed.includes('-')) return null;

  const rawPipes = trimmed.startsWith('|') && trimmed.endsWith('|')
    ? trimmed.slice(1, -1)
    : trimmed;

  const cells = rawPipes.split('|').map((c) => c.trim());
  if (cells.length < 2) return null;

  const alignments: TableAlignment[] = [];
  for (const cell of cells) {
    if (!/^:?-+:?$/.test(cell)) return null;
    const left = cell.startsWith(':');
    const right = cell.endsWith(':');
    if (left && right) {
      alignments.push('center');
    } else if (right) {
      alignments.push('right');
    } else {
      alignments.push('left');
    }
  }

  return alignments;
}

export function parsePipeTableRow(line: string): string[] {
  let trimmed = line.trim();
  if (trimmed.startsWith('|')) trimmed = trimmed.slice(1);
  if (trimmed.endsWith('|')) trimmed = trimmed.slice(0, -1);
  return trimmed.split('|').map((c) => c.trim());
}

export const INSTITUTIONAL_ROW_REGEX =
  /^(.*?)\s+([\d\.,]+[kmbKMB]?)\s+((?:(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s+\d{1,2},?\s+\d{4})|(?:\d{4}-\d{2}-\d{2})|(?:\d{1,2}\/\d{1,2}\/\d{2,4}))\s+([\d\.,]+%)\s+([\$€£]?[\d\.,]+)$/i;

export function isKnownSectionHeading(line: string): {
  isHeading: boolean;
  clean: string;
  original: string;
  rest?: string;
} {
  const trimmed = line.trim();
  if (!trimmed) return { isHeading: false, clean: '', original: '', rest: '' };

  const withoutMd = trimmed.replace(/^#{1,4}\s+/, '');
  const lower = withoutMd.toLowerCase();

  const exactHeadings = [
    'top institutional holders',
    'institutional holders',
    'institutional ownership',
    'principal shareholders',
    'top shareholders',
    'executive management',
    'executive officers',
    'executive team',
    'management',
    'board of directors',
    'directors',
    'research notes',
    'research note',
    'halachic analysis',
    'halachic notes',
    'halachic note',
    'bank overview',
    'public bank information',
  ];

  for (const h of exactHeadings) {
    if (lower === h || lower === h + ':') {
      return {
        isHeading: true,
        clean: h,
        original: withoutMd.replace(/:$/, '').trim(),
        rest: '',
      };
    }

    if (lower.startsWith(h)) {
      const charAfter = withoutMd[h.length];
      if (charAfter === ':' || charAfter === ' ' || charAfter === '\t') {
        const rest = withoutMd.slice(h.length).replace(/^[:\s]+/, '').trim();
        return {
          isHeading: true,
          clean: h,
          original: withoutMd.slice(0, h.length).trim(),
          rest,
        };
      }
    }
  }

  // Markdown heading (# to ####)
  if (/^#{1,4}\s+/.test(trimmed)) {
    return {
      isHeading: true,
      clean: withoutMd.toLowerCase().replace(/:$/, '').trim(),
      original: withoutMd.replace(/:$/, '').trim(),
      rest: '',
    };
  }

  return { isHeading: false, clean: '', original: '', rest: '' };
}

const DATE_PATTERN =
  '(?:(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\\.?\\s+\\d{1,2},?\\s+\\d{4})|(?:\\d{4}-\\d{2}-\\d{2})|(?:\\d{1,2}/\\d{1,2}/\\d{2,4})';
const PCT_PATTERN = '\\d+(?:\\.\\d+)?%';
const VAL_PATTERN = '[$€£]?\\d[\\d,]*(?:\\.\\d+)?[kmbKMB]?';
const SHARES_PATTERN = '[\\d,]+(?:\\.\\d+)?[kmbKMB]?';

export interface InstitutionalParseResult {
  headers: string[];
  alignments: TableAlignment[];
  rows: string[][];
  trailingText: string;
}

export function parseInstitutionalTableSection(
  lines: string[],
): InstitutionalParseResult | null {
  const cleanLines = lines.map((l) => l.trim()).filter(Boolean);
  if (cleanLines.length === 0) return null;

  // 1. Check for standard Markdown pipe table
  const pipeLines = cleanLines.filter((l) => l.includes('|'));
  if (pipeLines.length >= 2) {
    const headers = parsePipeTableRow(pipeLines[0]);
    let rows: string[][] = [];
    let startIdx = 1;
    if (pipeLines.length > 2 && parseMarkdownTableSeparator(pipeLines[1])) {
      startIdx = 2;
    }
    for (let j = startIdx; j < pipeLines.length; j++) {
      const cells = parsePipeTableRow(pipeLines[j]);
      if (cells.length >= 2) {
        while (cells.length < headers.length) cells.push('');
        rows.push(cells.slice(0, headers.length));
      }
    }
    if (rows.length > 0) {
      const alignments: TableAlignment[] = ['left', 'right', 'left', 'right', 'right'];
      return { headers, alignments, rows, trailingText: '' };
    }
  }

  // 2. Check for TSV table
  const tsvLines = cleanLines.filter((l) => l.includes('\t'));
  if (tsvLines.length >= 2) {
    const headers = tsvLines[0].split('\t').map((c) => c.trim()).filter(Boolean);
    const rows: string[][] = [];
    for (let j = 1; j < tsvLines.length; j++) {
      const cells = tsvLines[j].split('\t').map((c) => c.trim()).filter(Boolean);
      if (cells.length >= 2) rows.push(cells);
    }
    if (rows.length > 0) {
      const alignments: TableAlignment[] = ['left', 'right', 'left', 'right', 'right'];
      return { headers, alignments, rows, trailingText: '' };
    }
  }

  // 3. Plain-text / Flattened OCR table parsing
  const fullText = cleanLines.join(' ').replace(/\s+/g, ' ').trim();
  const headerRegex =
    /^(?:\|\s*)?Holder\s+Shares\s+Date(?:\s+Reported)?\s+(?:%\s*Out|%|Percent(?:\s+Out)?)\s+Value(?:\s*\|)?\s*/i;
  const headerMatch = fullText.match(headerRegex);

  let bodyText = fullText;
  const headers = ['Holder', 'Shares', 'Date Reported', '% Out', 'Value'];
  const alignments: TableAlignment[] = ['left', 'right', 'left', 'right', 'right'];

  if (headerMatch) {
    bodyText = fullText.slice(headerMatch[0].length).trim();
  }

  const rows: string[][] = [];
  const regex = new RegExp(
    '(?:^|\\s+)(.+?)\\s+(' +
      SHARES_PATTERN +
      ')\\s+(' +
      DATE_PATTERN +
      ')\\s+(' +
      PCT_PATTERN +
      ')\\s+(' +
      VAL_PATTERN +
      ')(?=\\s+[A-Za-z0-9\\(]|$)',
    'gi',
  );

  let match: RegExpExecArray | null;
  let lastIndex = 0;

  while ((match = regex.exec(bodyText)) !== null) {
    const holder = match[1].trim();
    const shares = match[2].trim();
    const dateReported = match[3].trim();
    const pctOut = match[4].trim();
    const value = match[5].trim();

    if (holder.length > 0) {
      rows.push([holder, shares, dateReported, pctOut, value]);
      lastIndex = regex.lastIndex;
    }
  }

  const trailingText = bodyText.slice(lastIndex).trim();

  if (rows.length > 0) {
    return {
      headers,
      alignments,
      rows,
      trailingText,
    };
  }

  return null;
}

export function parseStructuredReport(text: string): ContentBlock[] {
  if (!text || !text.trim()) return [];

  const rawLines = text.replace(/\r\n/g, '\n').split('\n');
  const blocks: ContentBlock[] = [];
  let i = 0;

  // Step 1: Detect Bank Title and Public Bank Information at the beginning
  while (i < rawLines.length && !rawLines[i].trim()) i++;

  if (i < rawLines.length) {
    const firstLine = rawLines[i].trim();
    const headingCheck = isKnownSectionHeading(firstLine);

    if (
      !headingCheck.isHeading &&
      !firstLine.startsWith('#') &&
      !firstLine.startsWith('|') &&
      !firstLine.startsWith('>') &&
      !firstLine.startsWith('-') &&
      !firstLine.startsWith('*') &&
      !firstLine.includes('\t')
    ) {
      let lookaheadIndex = i + 1;
      while (lookaheadIndex < rawLines.length && !rawLines[lookaheadIndex].trim()) {
        lookaheadIndex++;
      }

      if (lookaheadIndex < rawLines.length) {
        const nextLine = rawLines[lookaheadIndex].trim();
        if (
          /^(public bank|private bank|institution type|holding company|bank info|otc|nasdaq)/i.test(
            nextLine,
          )
        ) {
          blocks.push({
            type: 'intro',
            title: firstLine,
            publicInfo: nextLine,
          });
          i = lookaheadIndex + 1;
        }
      }
    }
  }

  // Step 2: Main loop through document sections
  while (i < rawLines.length) {
    const line = rawLines[i];
    const trimmed = line.trim();

    if (!trimmed) {
      i++;
      continue;
    }

    // Check for Section Headings
    const headingCheck = isKnownSectionHeading(trimmed);
    if (headingCheck.isHeading) {
      const sectionType = headingCheck.clean;
      const title = headingCheck.original;
      i++;

      // A. Executive Management
      if (
        ['executive management', 'executive officers', 'executive team', 'management'].includes(
          sectionType,
        )
      ) {
        blocks.push({ type: 'heading', level: 2, text: title });

        const items: string[] = [];
        while (i < rawLines.length) {
          const itemLine = rawLines[i].trim();
          if (!itemLine) {
            i++;
            while (i < rawLines.length && !rawLines[i].trim()) i++;
            if (i < rawLines.length && isKnownSectionHeading(rawLines[i].trim()).isHeading) break;
            continue;
          }
          if (isKnownSectionHeading(itemLine).isHeading) break;
          const cleanedItem = itemLine.replace(/^[-*]\s*/, '').trim();
          items.push(cleanedItem);
          i++;
        }

        if (items.length) {
          blocks.push({ type: 'list', items, variant: 'officers' });
        }
        continue;
      }

      // B. Board of Directors
      if (['board of directors', 'directors'].includes(sectionType)) {
        blocks.push({ type: 'heading', level: 2, text: title });

        const items: string[] = [];
        while (i < rawLines.length) {
          const itemLine = rawLines[i].trim();
          if (!itemLine) {
            i++;
            while (i < rawLines.length && !rawLines[i].trim()) i++;
            if (i < rawLines.length && isKnownSectionHeading(rawLines[i].trim()).isHeading) break;
            continue;
          }
          if (isKnownSectionHeading(itemLine).isHeading) break;
          const cleanedItem = itemLine.replace(/^[-*]\s*/, '').trim();
          items.push(cleanedItem);
          i++;
        }

        if (items.length) {
          blocks.push({ type: 'list', items, variant: 'directors' });
        }
        continue;
      }

      // C. Top Institutional Holders Table
      if (
        [
          'top institutional holders',
          'institutional holders',
          'institutional ownership',
          'principal shareholders',
          'top shareholders',
        ].includes(sectionType)
      ) {
        blocks.push({ type: 'heading', level: 2, text: title });

        const sectionLines: string[] = [];
        if (headingCheck.rest) {
          sectionLines.push(headingCheck.rest);
        }

        while (i < rawLines.length) {
          const rawCurrent = rawLines[i];
          const trimmedCurrent = rawCurrent.trim();

          if (!trimmedCurrent) {
            let lookAhead = i + 1;
            while (lookAhead < rawLines.length && !rawLines[lookAhead].trim()) {
              lookAhead++;
            }
            if (
              lookAhead < rawLines.length &&
              isKnownSectionHeading(rawLines[lookAhead]).isHeading
            ) {
              i++;
              break;
            }
            if (
              lookAhead < rawLines.length &&
              /^(as it is|note:|research note:|halachic note:)/i.test(
                rawLines[lookAhead].trim(),
              )
            ) {
              i++;
              break;
            }
            i++;
            continue;
          }

          if (isKnownSectionHeading(trimmedCurrent).isHeading) {
            break;
          }

          if (
            sectionLines.length > 0 &&
            /^(as it is|note:|research note:|halachic note:)/i.test(trimmedCurrent)
          ) {
            break;
          }

          sectionLines.push(trimmedCurrent);
          i++;
        }

        if (sectionLines.length > 0) {
          const parsed = parseInstitutionalTableSection(sectionLines);
          if (parsed && parsed.rows.length > 0) {
            blocks.push({
              type: 'table',
              data: {
                headers: parsed.headers,
                alignments: parsed.alignments,
                rows: parsed.rows,
              },
            });

            if (parsed.trailingText) {
              if (
                /^(as it is|note:|research note:|halachic note:)/i.test(
                  parsed.trailingText,
                )
              ) {
                blocks.push({
                  type: 'blockquote',
                  title: 'Research Note',
                  lines: [parsed.trailingText],
                });
              } else {
                blocks.push({
                  type: 'paragraph',
                  text: parsed.trailingText,
                });
              }
            }
          } else {
            // Preserve original unparsed section text under heading rather than dropping it
            blocks.push({
              type: 'paragraph',
              text: sectionLines.join(' '),
            });
          }
        }
        continue;
      }

      // D. Research Notes / Halachic Analysis
      if (
        [
          'research note',
          'research notes',
          'halachic analysis',
          'halachic note',
          'halachic notes',
        ].includes(sectionType)
      ) {
        blocks.push({ type: 'heading', level: 2, text: title });

        const noteLines: string[] = [];
        while (i < rawLines.length) {
          const noteLine = rawLines[i].trim();
          if (!noteLine) {
            i++;
            while (i < rawLines.length && !rawLines[i].trim()) i++;
            if (i < rawLines.length && isKnownSectionHeading(rawLines[i].trim()).isHeading) break;
            continue;
          }
          if (isKnownSectionHeading(noteLine).isHeading) break;
          noteLines.push(noteLine.replace(/^>\s*/, ''));
          i++;
        }

        if (noteLines.length) {
          blocks.push({
            type: 'blockquote',
            title,
            lines: noteLines,
          });
        }
        continue;
      }

      // General Heading
      const level = trimmed.startsWith('#')
        ? (Math.min(trimmed.match(/^#+/)?.[0].length || 2, 4) as 1 | 2 | 3 | 4)
        : 2;
      blocks.push({
        type: 'heading',
        level,
        text: title,
      });
      continue;
    }

    // Markdown pipe table without explicit section heading
    if (
      trimmed.includes('|') &&
      i + 1 < rawLines.length &&
      parseMarkdownTableSeparator(rawLines[i + 1]) !== null
    ) {
      const headerRow = parsePipeTableRow(trimmed);
      const separatorRow = parseMarkdownTableSeparator(rawLines[i + 1])!;
      const rows: string[][] = [];
      i += 2;

      while (i < rawLines.length) {
        const bodyLine = rawLines[i].trim();
        if (!bodyLine || !bodyLine.includes('|')) break;
        if (isKnownSectionHeading(bodyLine).isHeading || bodyLine.startsWith('>')) break;
        const rowCells = parsePipeTableRow(bodyLine);
        while (rowCells.length < headerRow.length) rowCells.push('');
        rows.push(rowCells.slice(0, headerRow.length));
        i++;
      }

      const finalAlignments = separatorRow.map((align, colIdx) => {
        if (align !== 'left') return align;
        const numericCount = rows.filter((r) => isCellNumeric(r[colIdx] || '')).length;
        if (rows.length > 0 && numericCount / rows.length >= 0.6) {
          return 'right';
        }
        return align;
      });

      blocks.push({
        type: 'table',
        data: {
          headers: headerRow,
          alignments: finalAlignments,
          rows,
        },
      });
      continue;
    }

    // Tab-Separated Table without heading
    if (trimmed.includes('\t')) {
      const candidateLines: string[][] = [];
      let tempIndex = i;
      let colCount: number | null = null;
      let validTsv = true;

      while (tempIndex < rawLines.length) {
        const tLine = rawLines[tempIndex].trim();
        if (!tLine) break;
        if (!tLine.includes('\t')) {
          validTsv = false;
          break;
        }
        const parts = tLine.split('\t').map((c) => c.trim());
        if (parts.length < 2) {
          validTsv = false;
          break;
        }
        if (colCount === null) {
          colCount = parts.length;
        } else if (parts.length !== colCount) {
          validTsv = false;
          break;
        }
        candidateLines.push(parts);
        tempIndex++;
      }

      if (validTsv && colCount && colCount >= 2 && candidateLines.length >= 2) {
        const headers = candidateLines[0];
        const rows = candidateLines.slice(1);
        const alignments: TableAlignment[] = headers.map((_, colIdx) => {
          const numericCount = rows.filter((r) => isCellNumeric(r[colIdx] || '')).length;
          return rows.length > 0 && numericCount / rows.length >= 0.6
            ? 'right'
            : 'left';
        });

        blocks.push({
          type: 'table',
          data: {
            headers,
            alignments,
            rows,
          },
        });
        i = tempIndex;
        continue;
      }
    }

    // Blockquote
    if (trimmed.startsWith('>')) {
      const quoteLines: string[] = [];
      while (i < rawLines.length && rawLines[i].trim().startsWith('>')) {
        quoteLines.push(rawLines[i].trim().replace(/^>\s?/, ''));
        i++;
      }
      blocks.push({
        type: 'blockquote',
        lines: quoteLines,
      });
      continue;
    }

    // Research note paragraph (detecting "As it is a bulletin board stock..." or "Note:")
    if (/^(as it is|note:|research note:|halachic note:)/i.test(trimmed)) {
      const noteLines: string[] = [trimmed];
      i++;
      while (
        i < rawLines.length &&
        rawLines[i].trim() &&
        !isKnownSectionHeading(rawLines[i].trim()).isHeading
      ) {
        noteLines.push(rawLines[i].trim());
        i++;
      }
      blocks.push({
        type: 'blockquote',
        title: 'Research Note',
        lines: noteLines,
      });
      continue;
    }

    // Unordered lists
    if (/^[-*]\s+/.test(trimmed)) {
      const items: string[] = [];
      while (i < rawLines.length && /^[-*]\s+/.test(rawLines[i].trim())) {
        items.push(rawLines[i].trim().replace(/^[-*]\s+/, ''));
        i++;
      }
      blocks.push({
        type: 'list',
        items,
        variant: 'bullet',
      });
      continue;
    }

    // Fallback paragraph
    const pLines: string[] = [];
    while (
      i < rawLines.length &&
      rawLines[i].trim() &&
      !isKnownSectionHeading(rawLines[i].trim()).isHeading &&
      !rawLines[i].trim().startsWith('>') &&
      !/^[-*]\s+/.test(rawLines[i].trim()) &&
      !(rawLines[i].trim().includes('|') && i + 1 < rawLines.length && parseMarkdownTableSeparator(rawLines[i + 1]) !== null)
    ) {
      pLines.push(rawLines[i].trim());
      i++;
    }

    if (pLines.length > 0) {
      blocks.push({
        type: 'paragraph',
        text: pLines.join(' '),
      });
    }
  }

  return blocks;
}
