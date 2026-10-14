'use client';

import React from 'react';
import {
  parseStructuredReport,
  parseInlineTokens,
  type ContentBlock,
  type TableAlignment,
  type ParsedTable,
} from './parse-report';

export {
  parseStructuredReport,
  type ContentBlock,
  type TableAlignment,
  type ParsedTable,
};

function renderInline(text: string): React.ReactNode {
  const tokens = parseInlineTokens(text);
  if (tokens.length === 0) return text;
  if (tokens.length === 1 && tokens[0].type === 'text') return tokens[0].value;

  return tokens.map((token, idx) => {
    switch (token.type) {
      case 'bold':
        return (
          <strong key={idx} className="font-semibold text-slate-900">
            {token.value}
          </strong>
        );
      case 'code':
        return (
          <code
            key={idx}
            className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-800 text-xs font-mono"
          >
            {token.value}
          </code>
        );
      case 'italic':
        return (
          <em key={idx} className="italic">
            {token.value}
          </em>
        );
      default:
        return token.value;
    }
  });
}

export interface StructuredReportRendererProps {
  content: string;
  className?: string;
  emptyMessage?: string;
}

export function StructuredReportRenderer({
  content,
  className = '',
  emptyMessage = 'No report details provided.',
}: StructuredReportRendererProps) {
  const blocks = React.useMemo(() => parseStructuredReport(content), [content]);

  if (!blocks.length) {
    return (
      <div className={`text-slate-500 italic py-4 ${className}`}>
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className={`space-y-4 text-[#334155] leading-relaxed ${className}`}>
      {blocks.map((block, index) => {
        switch (block.type) {
          case 'heading': {
            if (block.level === 1) {
              return (
                <h1
                  key={index}
                  className="text-2xl font-bold text-[#102a43] mt-8 mb-4 border-b border-slate-200 pb-2"
                >
                  {renderInline(block.text)}
                </h1>
              );
            }
            if (block.level === 2) {
              return (
                <h2
                  key={index}
                  className="text-xl font-bold text-[#102a43] mt-7 mb-3 border-b border-slate-200 pb-2"
                >
                  {renderInline(block.text)}
                </h2>
              );
            }
            if (block.level === 3) {
              return (
                <h3
                  key={index}
                  className="text-lg font-bold text-[#102a43] mt-5 mb-2"
                >
                  {renderInline(block.text)}
                </h3>
              );
            }
            return (
              <h4
                key={index}
                className="text-base font-semibold text-[#102a43] mt-4 mb-1"
              >
                {renderInline(block.text)}
              </h4>
            );
          }

          case 'list': {
            return (
              <ul
                key={index}
                className="my-3 space-y-1.5 list-disc list-outside pl-5 text-slate-700"
              >
                {block.items.map((item, itemIdx) => (
                  <li key={itemIdx} className="pl-1">
                    {renderInline(item)}
                  </li>
                ))}
              </ul>
            );
          }

          case 'blockquote': {
            return (
              <blockquote
                key={index}
                className="my-4 border-l-4 border-[#c69b46] bg-amber-50/50 p-4 rounded-r-lg text-slate-800 text-sm space-y-1"
              >
                {block.lines.map((line, lineIdx) => (
                  <p key={lineIdx}>{renderInline(line)}</p>
                ))}
              </blockquote>
            );
          }

          case 'table': {
            const { headers, alignments, rows } = block.data;
            return (
              <div
                key={index}
                className="my-6 overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-xs"
              >
                <table className="w-full text-left text-sm border-collapse min-w-[500px]">
                  <thead className="bg-slate-100/90 text-[#102a43] border-b border-slate-200">
                    <tr>
                      {headers.map((header, hIdx) => {
                        const align = alignments[hIdx] || 'left';
                        const alignClass =
                          align === 'right'
                            ? 'text-right'
                            : align === 'center'
                              ? 'text-center'
                              : 'text-left';
                        return (
                          <th
                            key={hIdx}
                            className={`py-3 px-4 font-bold text-xs uppercase tracking-wider ${alignClass}`}
                          >
                            {renderInline(header)}
                          </th>
                        );
                      })}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {rows.map((row, rIdx) => (
                      <tr
                        key={rIdx}
                        className="hover:bg-slate-50/70 transition-colors even:bg-slate-50/30"
                      >
                        {row.map((cell, cIdx) => {
                          const align = alignments[cIdx] || 'left';
                          const alignClass =
                            align === 'right'
                              ? 'text-right font-mono'
                              : align === 'center'
                                ? 'text-center'
                                : 'text-left';
                          return (
                            <td
                              key={cIdx}
                              className={`py-2.5 px-4 text-slate-700 ${alignClass}`}
                            >
                              {renderInline(cell)}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
          }

          case 'paragraph': {
            return (
              <p key={index} className="leading-relaxed">
                {renderInline(block.text)}
              </p>
            );
          }

          default:
            return null;
        }
      })}
    </div>
  );
}

export const INSTITUTIONAL_HOLDERS_TEMPLATE = `### Executive Management
- **Robert B. White**: President and Chief Executive Officer
- **Mary K. Shea**: Executive Vice President and Chief Financial Officer

### Board of Directors
- [Director Name]: [Title / Role]
- [Director Name]: [Title / Role]

### Top Institutional Holders
| Holder | Shares | Date Reported | % Out | Value |
| :--- | ---: | :---: | ---: | ---: |
| [Institution Name] | 0 | YYYY-MM-DD | 0.0% | $0 |
| [Institution Name] | 0 | YYYY-MM-DD | 0.0% | $0 |

### Research Note
[Enter halachic analysis, ownership structure, and relevant notes here.]`;
