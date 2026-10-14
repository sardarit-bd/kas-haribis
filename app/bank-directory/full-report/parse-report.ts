export type TableAlignment = 'left' | 'center' | 'right';

export interface ParsedTable {
  headers: string[];
  alignments: TableAlignment[];
  rows: string[][];
}

export type ContentBlock =
  | { type: 'heading'; level: 1 | 2 | 3 | 4; text: string }
  | { type: 'list'; items: string[] }
  | { type: 'blockquote'; lines: string[] }
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

export function parseStructuredReport(text: string): ContentBlock[] {
  if (!text || !text.trim()) return [];

  const rawLines = text.replace(/\r\n/g, '\n').split('\n');
  const blocks: ContentBlock[] = [];
  let i = 0;

  while (i < rawLines.length) {
    const line = rawLines[i];
    const trimmed = line.trim();

    // 1. Skip empty lines
    if (!trimmed) {
      i++;
      continue;
    }

    // 2. Headings: #, ##, ###, ####
    const headingMatch = trimmed.match(/^(#{1,4})\s+(.+)$/);
    if (headingMatch) {
      const level = headingMatch[1].length as 1 | 2 | 3 | 4;
      blocks.push({
        type: 'heading',
        level,
        text: headingMatch[2].trim(),
      });
      i++;
      continue;
    }

    // 3. Blockquotes: > line
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

    // 4. Check for Markdown Pipe Table
    if (
      trimmed.includes('|') &&
      i + 1 < rawLines.length &&
      parseMarkdownTableSeparator(rawLines[i + 1]) !== null
    ) {
      const headerRow = parsePipeTableRow(trimmed);
      const separatorRow = parseMarkdownTableSeparator(rawLines[i + 1])!;
      const rows: string[][] = [];
      i += 2; // skip header & separator

      while (i < rawLines.length) {
        const bodyLine = rawLines[i].trim();
        if (!bodyLine || !bodyLine.includes('|')) break;
        if (bodyLine.startsWith('#') || bodyLine.startsWith('>')) break;
        const rowCells = parsePipeTableRow(bodyLine);
        while (rowCells.length < headerRow.length) rowCells.push('');
        rows.push(rowCells.slice(0, headerRow.length));
        i++;
      }

      // Infer column alignments if default left: if 60%+ values are numeric, default to right
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

    // 5. Check for Tab-Separated Table
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

    // 6. Unordered lists: - item or * item
    if (/^[-*]\s+/.test(trimmed)) {
      const items: string[] = [];
      while (i < rawLines.length && /^[-*]\s+/.test(rawLines[i].trim())) {
        items.push(rawLines[i].trim().replace(/^[-*]\s+/, ''));
        i++;
      }
      blocks.push({
        type: 'list',
        items,
      });
      continue;
    }

    // 7. Regular paragraph
    const pLines: string[] = [];
    while (
      i < rawLines.length &&
      rawLines[i].trim() &&
      !rawLines[i].trim().startsWith('#') &&
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
