'use client';

import React from 'react';
import {
  parseStructuredReport,
  parseInlineTokens,
  type ContentBlock,
  type TableAlignment,
  type ParsedTable,
  INSTITUTIONAL_HOLDERS_TEMPLATE,
} from './parse-report';

export {
  parseStructuredReport,
  type ContentBlock,
  type TableAlignment,
  type ParsedTable,
  INSTITUTIONAL_HOLDERS_TEMPLATE,
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

function renderOfficerOrDirector(item: string) {
  // Check if item contains Name: Title or Name — Title or Name - Title
  const colonMatch = item.match(/^(.*?)(?:\s*:\s*|\s*[—–-]\s*)(.+)$/);
  if (colonMatch) {
    const name = colonMatch[1].trim();
    const role = colonMatch[2].trim();
    return (
      <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-2">
        <span className="font-semibold text-slate-900">{renderInline(name)}</span>
        <span className="text-slate-400 hidden sm:inline">·</span>
        <span className="text-slate-600 text-sm font-medium">{renderInline(role)}</span>
      </div>
    );
  }

  return <span className="font-medium text-slate-800">{renderInline(item)}</span>;
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
    <div className={`space-y-6 text-[#334155] leading-relaxed ${className}`}>
      {blocks.map((block, index) => {
        switch (block.type) {
          case 'intro': {
            return (
              <div
                key={index}
                className="mb-6 p-5 bg-gradient-to-r from-slate-50 to-slate-100/70 border border-slate-200 rounded-xl shadow-2xs"
              >
                <div className="text-xs font-bold uppercase tracking-wider text-amber-700 mb-1">
                  Bank Research Overview
                </div>
                <h2 className="text-xl font-bold text-[#102a43]">
                  {renderInline(block.title)}
                </h2>
                {block.publicInfo && (
                  <p className="text-sm font-medium text-slate-600 mt-1.5 flex items-center gap-2">
                    <span className="inline-block w-2 h-2 rounded-full bg-emerald-500" />
                    {renderInline(block.publicInfo)}
                  </p>
                )}
              </div>
            );
          }

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
                  className="text-xl font-bold text-[#102a43] mt-8 mb-3 border-b border-slate-200 pb-2 flex items-center gap-2"
                >
                  <span className="w-1.5 h-5 bg-[#102a43] rounded-sm inline-block" />
                  {renderInline(block.text)}
                </h2>
              );
            }
            if (block.level === 3) {
              return (
                <h3
                  key={index}
                  className="text-lg font-bold text-[#102a43] mt-6 mb-2"
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
            if (block.variant === 'officers') {
              return (
                <div key={index} className="my-4 grid grid-cols-1 gap-2.5">
                  {block.items.map((item, itemIdx) => (
                    <div
                      key={itemIdx}
                      className="p-3 bg-white border border-slate-200 rounded-lg shadow-2xs hover:border-slate-300 transition-colors"
                    >
                      {renderOfficerOrDirector(item)}
                    </div>
                  ))}
                </div>
              );
            }

            if (block.variant === 'directors') {
              return (
                <div
                  key={index}
                  className="my-4 grid grid-cols-1 sm:grid-cols-2 gap-2.5"
                >
                  {block.items.map((item, itemIdx) => (
                    <div
                      key={itemIdx}
                      className="p-3 bg-slate-50/80 border border-slate-200/90 rounded-lg text-sm"
                    >
                      {renderOfficerOrDirector(item)}
                    </div>
                  ))}
                </div>
              );
            }

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
                className="my-6 border-l-4 border-[#c69b46] bg-amber-50/60 p-4 rounded-r-xl text-slate-800 text-sm shadow-2xs"
              >
                {block.title && (
                  <div className="font-bold text-amber-900 text-xs uppercase tracking-wider mb-1.5">
                    {block.title}
                  </div>
                )}
                <div className="space-y-1.5">
                  {block.lines.map((line, lineIdx) => (
                    <p key={lineIdx}>{renderInline(line)}</p>
                  ))}
                </div>
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
                <table className="w-full text-left text-sm border-collapse min-w-[550px]">
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
                                : 'text-left font-medium text-slate-900';
                          return (
                            <td
                              key={cIdx}
                              className={`py-3 px-4 text-slate-700 ${alignClass}`}
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
