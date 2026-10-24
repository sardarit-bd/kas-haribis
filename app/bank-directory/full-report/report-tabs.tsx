'use client';

import React, { useState } from 'react';
import { StructuredReportRenderer } from './structured-report-renderer';
import { isHtmlReport, sanitizeReportHtml } from '../../lib/report-sanitizer';

interface ReportTabsProps {
  bankId: string;
  bankTitle: string;
  fullReportText: string;
  hasPdf: boolean;
  pdfName?: string;
  token?: string;
}

export default function ReportTabs({
  bankId,
  bankTitle,
  fullReportText,
  hasPdf,
  pdfName,
  token = '',
}: ReportTabsProps) {
  const [activeTab, setActiveTab] = useState<'web' | 'pdf'>('web');

  const pdfVersion = encodeURIComponent(pdfName || 'v1');
  const pdfUrl = `/api/bank-report-pdf?bankId=${encodeURIComponent(bankId)}${token ? `&token=${encodeURIComponent(token)}` : ''}&v=${pdfVersion}`;
  const downloadUrl = `${pdfUrl}&download=1`;

  const isRichHtml = isHtmlReport(fullReportText);
  const sanitizedHtml = isRichHtml ? sanitizeReportHtml(fullReportText) : '';

  return (
    <div className="reportViewContainer">
      {/* Attached PDF Notice / Action Card */}
      {hasPdf && (
        <div className="my-4 p-4 bg-slate-50 border border-slate-200 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#102a43]">
              <span>📄 Verified Source Document Attached</span>
            </div>
            <p className="text-xs text-slate-600 mt-1">
              {pdfName || `${bankTitle} Official Analyst Report (PDF)`}
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {/* On mobile / tablets, download or open directly in native viewer */}
            <a
              href={downloadUrl}
              target="_blank"
              rel="noreferrer"
              className="reportPdfDownloadBtn inline-flex items-center gap-1.5 px-4 py-2 bg-[#102a43] hover:bg-[#1a385c] focus:bg-[#1a385c] focus:outline-hidden focus:ring-2 focus:ring-[#102a43] focus:ring-offset-2 text-white hover:text-white focus:text-white active:text-white text-xs font-bold rounded-lg transition-colors shadow-xs"
              style={{ color: '#ffffff' }}
            >
              Download Original PDF ↗
            </a>
          </div>
        </div>
      )}

      {/* Desktop Tabs Header (Only shown if PDF is attached) */}
      {hasPdf ? (
        <div className="reportTabNav hidden md:flex items-center gap-2 border-b border-slate-200 mb-6 mt-4">
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'web'}
            onClick={() => setActiveTab('web')}
            className={`px-4 py-2.5 text-sm font-bold border-b-2 transition-colors cursor-pointer ${
              activeTab === 'web'
                ? 'border-[#102a43] text-[#102a43]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Web Report
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'pdf'}
            onClick={() => setActiveTab('pdf')}
            className={`px-4 py-2.5 text-sm font-bold border-b-2 transition-colors cursor-pointer flex items-center gap-2 ${
              activeTab === 'pdf'
                ? 'border-[#102a43] text-[#102a43]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <span>Original PDF Viewer</span>
            <span className="text-[10px] bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded uppercase font-semibold">
              Source
            </span>
          </button>
        </div>
      ) : null}

      {/* Tab 1: Web Report */}
      {(activeTab === 'web' || !hasPdf) && (
        <div className="webReportBody">
          {fullReportText ? (
            isRichHtml ? (
              <div
                className="prose prose-slate max-w-none reportRichText overflow-x-auto text-[#334155] leading-relaxed space-y-4"
                dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
              />
            ) : (
              <StructuredReportRenderer content={fullReportText} />
            )
          ) : (
            <div className="text-slate-500 italic py-6">
              {hasPdf
                ? 'This bank report has an official analyst document attached above. Please use the Original PDF Viewer tab or the Download button to view the full report.'
                : 'No report text available for this institution.'}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Original PDF Viewer (Desktop view) */}
      {hasPdf && activeTab === 'pdf' && (
        <div className="hidden md:block pdfViewerTabWrapper">
          <div className="flex items-center justify-between mb-3 p-2 bg-slate-100 rounded-lg text-xs text-slate-600">
            <span>
              Viewing source PDF document. Charts, signatures, and original vector formatting are rendered in full fidelity.
            </span>
            <a
              href={downloadUrl}
              className="text-[#102a43] font-bold hover:underline"
              style={{ color: '#102a43' }}
            >
              Download PDF ↗
            </a>
          </div>
          <iframe
            key={`pdf-viewer-${bankId}-${pdfName || 'report'}`}
            src={pdfUrl}
            title={`${bankTitle} Original PDF Report`}
            className="w-full h-[850px] rounded-xl border border-slate-300 shadow-sm bg-white"
          />
        </div>
      )}
    </div>
  );
}
