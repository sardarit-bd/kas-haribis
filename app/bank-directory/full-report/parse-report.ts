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
} {
  const trimmed = line.trim();
  if (!trimmed) return { isHeading: false, clean: '', original: '' };

  const clean = trimmed
    .replace(/^#+\s*/, '')
    .replace(/:$/, '')
    .trim()
    .toLowerCase();

  const exactHeadings = [
    'executive management',
    'executive officers',
    'executive team',
    'management',
    'board of directors',
    'directors',
    'top institutional holders',
    'institutional holders',
    'institutional ownership',
    'principal shareholders',
    'top shareholders',
    'research note',
    'research notes',
    'halachic analysis',
    'halachic note',
    'halachic notes',
    'bank overview',
    'public bank information',
  ];

  if (exactHeadings.includes(clean)) {
    return {
      isHeading: true,
      clean,
      original: trimmed.replace(/^#+\s*/, '').replace(/:$/, ''),
    };
  }

  // Markdown heading (# to ####)
  if (/^#{1,4}\s+/.test(trimmed)) {
    return {
      isHeading: true,
      clean,
      original: trimmed.replace(/^#+\s*/, ''),
    };
  }

  return { isHeading: false, clean: '', original: '' };
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

        while (i < rawLines.length && !rawLines[i].trim()) i++;

        if (i < rawLines.length) {
          let tableHeaders = ['Holder', 'Shares', 'Date Reported', '% Out', 'Value'];
          const alignments: TableAlignment[] = ['left', 'right', 'center', 'right', 'right'];
          const rows: string[][] = [];

          // Check if first line is a header row
          const possibleHeader = rawLines[i].trim();
          if (/holder/i.test(possibleHeader) && /share/i.test(possibleHeader)) {
            if (possibleHeader.includes('|')) {
              tableHeaders = possibleHeader.split('|').map((c) => c.trim()).filter(Boolean);
            } else if (possibleHeader.includes('\t')) {
              tableHeaders = possibleHeader.split('\t').map((c) => c.trim()).filter(Boolean);
            }
            i++;
            if (
              i < rawLines.length &&
              rawLines[i].trim().includes('-') &&
              rawLines[i].trim().includes('|')
            ) {
              i++;
            }
          }

          while (i < rawLines.length) {
            const rowLine = rawLines[i].trim();
            if (!rowLine) {
              i++;
              while (i < rawLines.length && !rawLines[i].trim()) i++;
              if (i < rawLines.length && isKnownSectionHeading(rawLines[i].trim()).isHeading) break;
              continue;
            }
            if (isKnownSectionHeading(rowLine).isHeading) break;

            if (rowLine.includes('|')) {
              const cells = rowLine.split('|').map((c) => c.trim()).filter(Boolean);
              if (cells.length >= 2) rows.push(cells);
            } else if (rowLine.includes('\t')) {
              const cells = rowLine.split('\t').map((c) => c.trim()).filter(Boolean);
              if (cells.length >= 2) rows.push(cells);
            } else {
              const match = rowLine.match(INSTITUTIONAL_ROW_REGEX);
              if (match) {
                rows.push([match[1], match[2], match[3], match[4], match[5]]);
              } else {
                break;
              }
            }
            i++;
          }

          if (rows.length) {
            blocks.push({
              type: 'table',
              data: {
                headers: tableHeaders,
                alignments,
                rows,
              },
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
