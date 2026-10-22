'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import { Table } from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import Image from '@tiptap/extension-image';
import { NodeSelection } from '@tiptap/pm/state';
import mammoth from 'mammoth';
import { sanitizeReportHtml, isHtmlReport } from '../../lib/report-sanitizer';
import { StructuredReportRenderer } from '../../bank-directory/full-report/structured-report-renderer';

interface RichReportEditorProps {
  defaultValue: string;
  bankId: string;
  bankTitle?: string;
  pdfKey?: string;
  pdfName?: string;
  name?: string;
  onContentChange?: (content: string) => void;
  onPdfChange?: (pdfKey: string, pdfName: string) => void;
}

export default function RichReportEditor({
  defaultValue,
  bankId,
  bankTitle,
  pdfKey,
  pdfName,
  name = 'full_report',
  onContentChange,
  onPdfChange,
}: RichReportEditorProps) {
  const [content, setContent] = useState(defaultValue);
  const [view, setView] = useState<'edit' | 'preview' | 'pdf'>('edit');
  const [isImporting, setIsImporting] = useState(false);
  const [notice, setNotice] = useState<{ text: string; isError?: boolean } | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isUploadingPdf, setIsUploadingPdf] = useState(false);

  const [attachedPdfKey, setAttachedPdfKey] = useState(pdfKey || '');
  const [attachedPdfName, setAttachedPdfName] = useState(pdfName || '');
  const [pdfTimestamp, setPdfTimestamp] = useState(Date.now());

  useEffect(() => {
    setAttachedPdfKey(pdfKey || '');
    setAttachedPdfName(pdfName || '');
  }, [pdfKey, pdfName]);

  const docxInputRef = useRef<HTMLInputElement | null>(null);
  const pdfInputRef = useRef<HTMLInputElement | null>(null);
  const imageInputRef = useRef<HTMLInputElement | null>(null);
  const editorBodyRef = useRef<HTMLDivElement | null>(null);

  const [selectedImagePos, setSelectedImagePos] = useState<number | null>(null);
  const [selectedImageRect, setSelectedImageRect] = useState<{
    top: number;
    left: number;
    width: number;
  } | null>(null);

  // Upload an image file to R2 and insert into editor
  async function uploadAndInsertImage(file: File) {
    if (!bankId) {
      setNotice({
        text: 'Please save the bank entry first to enable uploading inline images/charts. Once saved, the editor will remain open and ready for images.',
        isError: true,
      });
      return;
    }

    if (!/^image\/(png|jpeg|jpg|webp)$/i.test(file.type)) {
      setNotice({
        text: 'Invalid image format. Only PNG, JPEG, and WebP images are supported.',
        isError: true,
      });
      return;
    }

    const MAX_IMAGE_SIZE_BYTES = 1 * 1024 * 1024; // 1 MB (1,048,576 bytes)
    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      setNotice({
        text: `Image is too large. Maximum allowed size is 1 MB. Your file is ${(file.size / (1024 * 1024)).toFixed(1)} MB. Please select an image under 1 MB or attach via the Source PDF option.`,
        isError: true,
      });
      return;
    }

    setIsUploadingImage(true);
    setNotice({ text: 'Uploading image to Cloudflare R2…' });

    try {
      const fd = new FormData();
      fd.set('bankId', bankId);
      fd.set('file', file);

      const res = await fetch('/api/admin/bank-report-image', {
        method: 'POST',
        body: fd,
      });

      let errorMsg = '';
      let data: any = null;
      try {
        data = await res.json();
        if (data && typeof data === 'object' && data.error) {
          errorMsg = data.error;
        }
      } catch {
        // Fallback if response is non-JSON (e.g. gateway plain text/HTML)
      }

      if (!res.ok || !data?.url) {
        if (!errorMsg) {
          if (res.status === 413) {
            errorMsg = 'Upload request was rejected because the payload is too large for the server or network gateway (HTTP 413).';
          } else if (res.status === 401 || res.status === 403) {
            errorMsg = 'You do not have permission to upload images for this bank.';
          } else {
            errorMsg = `Upload failed with status ${res.status}.`;
          }
        }
        throw new Error(errorMsg);
      }

      if (editor) {
        editor.chain().focus().setImage({ src: data.url, alt: file.name }).run();
      }

      setNotice({ text: '✓ Image inserted successfully into report.' });
    } catch (err: any) {
      setNotice({
        text: err?.message || 'Failed to upload image.',
        isError: true,
      });
    } finally {
      setIsUploadingImage(false);
    }
  }

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3, 4] },
      }),
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          rel: 'noopener noreferrer',
          target: '_blank',
        },
      }),
      Table.configure({
        resizable: true,
        HTMLAttributes: {
          class: 'richReportTable',
        },
      }),
      TableRow,
      TableHeader,
      TableCell,
      Image.configure({
        inline: true,
        allowBase64: false,
        HTMLAttributes: {
          class: 'richReportImage',
        },
      }),
    ],
    content: defaultValue,
    editorProps: {
      attributes: {
        class: 'richTextEditorContent prose prose-slate max-w-none focus:outline-none min-h-[220px] p-4 text-sm',
      },
      handleClick: (view, pos, event) => {
        const target = event.target as HTMLElement | null;
        if (target && target.tagName === 'IMG') {
          try {
            const nodePos = view.posAtDOM(target, 0);
            if (typeof nodePos === 'number') {
              const tr = view.state.tr.setSelection(NodeSelection.create(view.state.doc, nodePos));
              view.dispatch(tr);
              view.focus();
              setSelectedImagePos(nodePos);
              return true;
            }
          } catch {
            // ignore
          }
        }
        return false;
      },
      handleKeyDown: (view, event) => {
        if (event.key === 'Backspace' || event.key === 'Delete') {
          const { selection } = view.state;
          if (selection instanceof NodeSelection && selection.node.type.name === 'image') {
            event.preventDefault();
            view.dispatch(view.state.tr.deleteSelection());
            setSelectedImagePos(null);
            setSelectedImageRect(null);
            setNotice({ text: '✓ Image removed from report.' });
            return true;
          }
        }
        return false;
      },
      handlePaste: (view, event) => {
        const items = event.clipboardData?.items;
        if (items) {
          for (let i = 0; i < items.length; i++) {
            if (items[i].type.startsWith('image/')) {
              const file = items[i].getAsFile();
              if (file) {
                event.preventDefault();
                uploadAndInsertImage(file);
                return true;
              }
            }
          }
        }
        const html = event.clipboardData?.getData('text/html');
        if (html && /<img[^>]+src=["']data:image\//i.test(html)) {
          // If pasted HTML contains embedded base64 data URIs, sanitize it to prevent 413 errors
          event.preventDefault();
          const cleanHtml = sanitizeReportHtml(html);
          if (editor) {
            editor.commands.insertContent(cleanHtml);
          }
          setNotice({
            text: 'Embedded base64 images from clipboard were stripped to prevent oversized reports (HTTP 413). Please use "Add Image / Chart" to insert images.',
            isError: false,
          });
          return true;
        }
        return false;
      },
      handleDrop: (view, event) => {
        const files = event.dataTransfer?.files;
        if (files && files.length > 0) {
          const file = files[0];
          if (/^image\/(png|jpeg|jpg|webp)$/i.test(file.type)) {
            event.preventDefault();
            uploadAndInsertImage(file);
            return true;
          }
        }
        return false;
      },
    },
    onSelectionUpdate: ({ editor }) => {
      const { selection } = editor.state;
      if (selection instanceof NodeSelection && selection.node.type.name === 'image') {
        setSelectedImagePos(selection.from);
      } else {
        setSelectedImagePos(null);
        setSelectedImageRect(null);
      }
    },
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      setContent(html);
      onContentChange?.(html);
    },
  });

  // Track position of the selected image in the editor DOM for floating contextual controls
  useEffect(() => {
    if (!editor || selectedImagePos === null || !editorBodyRef.current) {
      setSelectedImageRect(null);
      return;
    }

    const updateRect = () => {
      if (!editorBodyRef.current || !editor) return;
      const selectedImg = editor.view.dom.querySelector('img.ProseMirror-selectednode') as HTMLImageElement | null;
      if (!selectedImg) {
        setSelectedImageRect(null);
        return;
      }
      const containerRect = editorBodyRef.current.getBoundingClientRect();
      const imgRect = selectedImg.getBoundingClientRect();
      setSelectedImageRect({
        top: Math.max(0, imgRect.top - containerRect.top + editorBodyRef.current.scrollTop),
        left: Math.max(8, imgRect.left - containerRect.left),
        width: imgRect.width,
      });
    };

    updateRect();
    const frameId = requestAnimationFrame(updateRect);

    window.addEventListener('resize', updateRect);
    window.addEventListener('scroll', updateRect, true);
    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener('resize', updateRect);
      window.removeEventListener('scroll', updateRect, true);
    };
  }, [editor, selectedImagePos]);

  // Remove the currently selected image without affecting surrounding text
  function removeSelectedImage() {
    if (!editor) return;

    const { state } = editor.view;
    const { selection } = state;

    // 1. If currently a NodeSelection on an image
    if (selection instanceof NodeSelection && selection.node.type.name === 'image') {
      editor.chain().focus().deleteSelection().run();
      setSelectedImagePos(null);
      setSelectedImageRect(null);
      setNotice({ text: '✓ Image removed from report.' });
      return;
    }

    // 2. Tracked image position
    if (selectedImagePos !== null && selectedImagePos >= 0 && selectedImagePos < state.doc.content.size) {
      const node = state.doc.nodeAt(selectedImagePos);
      if (node && node.type.name === 'image') {
        editor.chain().focus().setNodeSelection(selectedImagePos).deleteSelection().run();
        setSelectedImagePos(null);
        setSelectedImageRect(null);
        setNotice({ text: '✓ Image removed from report.' });
        return;
      }
    }

    // 3. Search selection range
    const { from, to } = selection;
    let foundPos: number | null = null;
    state.doc.nodesBetween(Math.max(0, from - 1), Math.min(state.doc.content.size, to + 1), (node, pos) => {
      if (node.type.name === 'image') {
        foundPos = pos;
        return false;
      }
    });

    if (foundPos !== null) {
      editor.chain().focus().setNodeSelection(foundPos).deleteSelection().run();
      setSelectedImagePos(null);
      setSelectedImageRect(null);
      setNotice({ text: '✓ Image removed from report.' });
      return;
    }

    // 4. Fallback: check DOM selected element
    const selectedImg = editor.view.dom.querySelector('img.ProseMirror-selectednode');
    if (selectedImg) {
      try {
        const nodePos = editor.view.posAtDOM(selectedImg, 0);
        if (typeof nodePos === 'number') {
          editor.chain().focus().setNodeSelection(nodePos).deleteSelection().run();
          setSelectedImagePos(null);
          setSelectedImageRect(null);
          setNotice({ text: '✓ Image removed from report.' });
          return;
        }
      } catch {
        // ignore
      }
    }
  }

  const isImageSelected = Boolean(
    editor && (
      (editor.state.selection instanceof NodeSelection && editor.state.selection.node.type.name === 'image') ||
      editor.isActive('image') ||
      selectedImagePos !== null
    )
  );

  // Sync content when defaultValue changes (e.g. when switching banks)
  useEffect(() => {
    setContent(defaultValue);
    if (editor && editor.getHTML() !== defaultValue) {
      editor.commands.setContent(defaultValue, { emitUpdate: false });
    }
  }, [defaultValue, editor]);

  // Handle DOCX file import via Mammoth
  async function handleDocxImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.docx')) {
      setNotice({
        text: 'Please select a valid Microsoft Word (.docx) document.',
        isError: true,
      });
      return;
    }

    if (content.trim().length > 200 && typeof window !== 'undefined' && !window.confirm('Importing a Word document will replace current editor contents. Continue?')) {
      if (docxInputRef.current) docxInputRef.current.value = '';
      return;
    }

    setIsImporting(true);
    setNotice({ text: 'Processing Word document in browser…' });

    try {
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.convertToHtml({ arrayBuffer });
      const rawHtml = result.value;

      if (!rawHtml.trim()) {
        throw new Error('No readable text or tables found in the Word document.');
      }

      const sanitized = sanitizeReportHtml(rawHtml);

      if (editor) {
        editor.commands.setContent(sanitized);
        const currentHtml = editor.getHTML();
        setContent(currentHtml);
        onContentChange?.(currentHtml);
      }

      setNotice({
        text: '✓ Word document imported successfully. Tables, headings, and formatting preserved. (Note: Use "Add Image / Chart" to insert graphics at your desired location).',
      });
    } catch (err: any) {
      setNotice({
        text: `Word import failed: ${err?.message || 'Unknown error'}`,
        isError: true,
      });
    } finally {
      setIsImporting(false);
      if (docxInputRef.current) docxInputRef.current.value = '';
    }
  }

  // Handle PDF file upload directly to Cloudflare R2
  async function handlePdfUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!bankId) {
      setNotice({
        text: 'Please save the bank entry first to enable uploading a PDF report. Once saved, the editor will remain open and ready for PDF upload.',
        isError: true,
      });
      if (pdfInputRef.current) pdfInputRef.current.value = '';
      return;
    }

    const fileName = String(file.name || 'report.pdf').trim();
    const lowerName = fileName.toLowerCase();
    if (!lowerName.endsWith('.pdf')) {
      setNotice({
        text: 'Invalid file format. Please select a valid PDF file (.pdf).',
        isError: true,
      });
      if (pdfInputRef.current) pdfInputRef.current.value = '';
      return;
    }

    const mime = (file.type || '').toLowerCase();
    if (mime && mime !== 'application/pdf' && mime !== 'application/x-pdf') {
      setNotice({
        text: `Invalid MIME type (${file.type}). Only application/pdf files are accepted.`,
        isError: true,
      });
      if (pdfInputRef.current) pdfInputRef.current.value = '';
      return;
    }

    const MAX_PDF_SIZE_BYTES = 25 * 1024 * 1024; // 25 MB
    if (file.size > MAX_PDF_SIZE_BYTES) {
      setNotice({
        text: `The uploaded PDF exceeds the 25 MB limit (file size: ${(file.size / (1024 * 1024)).toFixed(1)} MB).`,
        isError: true,
      });
      if (pdfInputRef.current) pdfInputRef.current.value = '';
      return;
    }

    setIsUploadingPdf(true);
    setNotice({ text: 'Uploading PDF report to secure Cloudflare R2 storage…' });

    try {
      const fd = new FormData();
      fd.set('bankId', bankId);
      fd.set('file', file);

      const res = await fetch('/api/admin/bank-report-pdf', {
        method: 'POST',
        body: fd,
      });

      const data = (await res.json().catch(() => ({}))) as any;
      if (!res.ok || !data.saved) {
        throw new Error(data.error || `Upload failed with status HTTP ${res.status}`);
      }

      const newKey = data.key || `bank-reports/${bankId}/report.pdf`;
      const newName = data.name || fileName;

      setAttachedPdfKey(newKey);
      setAttachedPdfName(newName);
      setPdfTimestamp(Date.now());
      setView('pdf');
      onPdfChange?.(newKey, newName);

      setNotice({
        text: `✓ PDF report "${newName}" uploaded successfully and displayed below. Original layout, vector charts, and all pages preserved.`,
      });
    } catch (err: any) {
      setNotice({
        text: `PDF upload failed: ${err?.message || 'Unknown error'}`,
        isError: true,
      });
    } finally {
      setIsUploadingPdf(false);
      if (pdfInputRef.current) pdfInputRef.current.value = '';
    }
  }

  async function removeAttachedPdf() {
    if (!bankId || !attachedPdfKey) return;
    if (
      !confirm(
        `Are you sure you want to remove the attached PDF "${attachedPdfName || 'Source PDF'}" from this bank?`,
      )
    )
      return;

    setNotice({ text: 'Removing attached PDF…' });
    try {
      const res = await fetch(
        `/api/admin/bank-report-pdf?bankId=${encodeURIComponent(bankId)}`,
        {
          method: 'DELETE',
        },
      );
      const data = (await res.json().catch(() => ({}))) as any;
      if (!res.ok || !data.deleted) {
        throw new Error(data.error || 'Failed to remove attached PDF');
      }
      setAttachedPdfKey('');
      setAttachedPdfName('');
      onPdfChange?.('', '');
      if (view === 'pdf') {
        setView('edit');
      }
      setNotice({ text: '✓ Attached PDF removed.' });
    } catch (err: any) {
      setNotice({
        text: `Error removing PDF: ${err?.message || 'Failed to delete'}`,
        isError: true,
      });
    }
  }

  function insertTable() {
    if (editor) {
      editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
    }
  }

  return (
    <div className="fullReportEditor richReportContainer" style={{ margin: '20px 0' }}>
      {/* Hidden input ensures standard HTML form submission sends the editor content */}
      <input type="hidden" name={name} value={content} />

      <div
        style={{
          fontSize: '12px',
          color: '#334155',
          background: '#f8fafc',
          border: '1px solid #e2e8f0',
          borderRadius: '6px',
          padding: '8px 12px',
          marginBottom: '10px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}
      >
        <span style={{ fontSize: '15px' }}>💡</span>
        <span>
          <strong>Report Editor:</strong> Use <strong>📄 Import Word (.docx)</strong> to bring in formatted text and tables for the web report, or <strong>📑 Upload PDF Report</strong> to attach and display the official multi-page PDF document with full vector charts and analyst signatures. Both versions can coexist on the same bank. To add inline charts or screenshots to the web report, click <strong>📷 Add Image / Chart (PNG, JPEG, WebP up to 1 MB)</strong>.
        </span>
      </div>

      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '8px',
          marginBottom: '8px',
        }}
      >
        <span style={{ fontWeight: 'bold', fontSize: '14px', color: '#1e293b' }}>
          Protected Full Report
        </span>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          {/* Hidden inputs for DOCX, PDF, and image file pickers */}
          <input
            type="file"
            ref={docxInputRef}
            onChange={handleDocxImport}
            accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            style={{ display: 'none' }}
          />
          <input
            type="file"
            ref={pdfInputRef}
            onChange={handlePdfUpload}
            accept="application/pdf,.pdf"
            style={{ display: 'none' }}
          />
          <input
            type="file"
            ref={imageInputRef}
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) uploadAndInsertImage(f);
              if (imageInputRef.current) imageInputRef.current.value = '';
            }}
            accept="image/png,image/jpeg,image/webp"
            style={{ display: 'none' }}
          />

          <button
            type="button"
            disabled={isImporting || isUploadingPdf}
            onClick={() => docxInputRef.current?.click()}
            style={{
              padding: '4px 10px',
              fontSize: '12px',
              fontWeight: 600,
              background: '#e0f2fe',
              color: '#0369a1',
              border: '1px solid #bae6fd',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
            title="Import Word document directly into this editor (DOCX tables and headings preserved)"
          >
            {isImporting ? 'Importing…' : '📄 Import Word (.docx)'}
          </button>

          <button
            type="button"
            disabled={isImporting || isUploadingPdf}
            onClick={() => {
              if (!bankId) {
                setNotice({
                  text: 'Please save the bank entry first to enable uploading a PDF report. Once saved, the editor will remain open and ready for PDF upload.',
                  isError: true,
                });
                return;
              }
              pdfInputRef.current?.click();
            }}
            style={{
              padding: '4px 10px',
              fontSize: '12px',
              fontWeight: 600,
              background: '#fef2f2',
              color: '#991b1b',
              border: '1px solid #fecaca',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
            title={
              !bankId
                ? 'Save the bank entry first to enable uploading a PDF report'
                : 'Upload and display official PDF report (max 25 MB, vector layout and all pages preserved)'
            }
          >
            {isUploadingPdf
              ? 'Uploading PDF…'
              : attachedPdfKey
                ? '📑 Replace PDF Report'
                : '📑 Upload PDF Report'}
          </button>

          <button
            type="button"
            disabled={isUploadingImage || isUploadingPdf}
            onClick={() => {
              if (!bankId) {
                setNotice({
                  text: 'Please save the bank entry first to enable uploading inline images/charts. Once saved, the editor will remain open and ready for images.',
                  isError: true,
                });
                return;
              }
              imageInputRef.current?.click();
            }}
            style={{
              padding: '4px 10px',
              fontSize: '12px',
              fontWeight: 600,
              background: '#f1f5f9',
              color: '#334155',
              border: '1px solid #cbd5e1',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
            title={
              !bankId
                ? 'Save the bank entry first to enable uploading inline images/charts'
                : 'Upload or paste a chart screenshot / image at the cursor position (PNG, JPEG, WebP up to 1 MB)'
            }
          >
            {isUploadingImage ? 'Uploading…' : '📷 Add Image / Chart'}
          </button>

          {/* Edit / Preview tabs */}
          <div
            style={{
              display: 'inline-flex',
              border: '1px solid #cbd5e1',
              borderRadius: '4px',
              overflow: 'hidden',
              background: '#f8fafc',
            }}
          >
            <button
              type="button"
              onClick={() => setView('edit')}
              style={{
                padding: '4px 12px',
                fontSize: '12px',
                fontWeight: 600,
                border: 'none',
                cursor: 'pointer',
                background: view === 'edit' ? '#102a43' : 'transparent',
                color: view === 'edit' ? '#ffffff' : '#475569',
              }}
            >
              Edit Web Report
            </button>
            <button
              type="button"
              onClick={() => setView('preview')}
              style={{
                padding: '4px 12px',
                fontSize: '12px',
                fontWeight: 600,
                border: 'none',
                cursor: 'pointer',
                background: view === 'preview' ? '#102a43' : 'transparent',
                color: view === 'preview' ? '#ffffff' : '#475569',
              }}
            >
              Preview Web
            </button>
            {attachedPdfKey && (
              <button
                type="button"
                onClick={() => setView('pdf')}
                style={{
                  padding: '4px 12px',
                  fontSize: '12px',
                  fontWeight: 600,
                  border: 'none',
                  cursor: 'pointer',
                  background: view === 'pdf' ? '#102a43' : 'transparent',
                  color: view === 'pdf' ? '#ffffff' : '#475569',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <span>📑 View PDF Report</span>
                <span
                  style={{
                    fontSize: '9px',
                    background: view === 'pdf' ? '#38bdf8' : '#e2e8f0',
                    color: view === 'pdf' ? '#0f172a' : '#475569',
                    padding: '1px 4px',
                    borderRadius: '3px',
                    fontWeight: 700,
                  }}
                >
                  SOURCE
                </span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Attached PDF Notice / Status banner */}
      {attachedPdfKey && (
        <div
          style={{
            margin: '8px 0 12px 0',
            padding: '10px 14px',
            background: '#f0f9ff',
            border: '1px solid #bae6fd',
            borderRadius: '6px',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '8px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#0369a1' }}>
            <span style={{ fontSize: '15px' }}>📑</span>
            <span>
              <strong>Source PDF Report Attached:</strong>{' '}
              <span style={{ color: '#0c4a6e', fontWeight: 600 }}>
                {attachedPdfName || `${bankTitle || 'Bank'} Analyst Report (PDF)`}
              </span>
            </span>
            <span
              style={{
                fontSize: '10px',
                background: '#e0f2fe',
                color: '#0284c7',
                border: '1px solid #7dd3fc',
                padding: '1px 6px',
                borderRadius: '3px',
                fontWeight: 700,
                textTransform: 'uppercase',
              }}
            >
              Public PDF Active
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
            {view !== 'pdf' ? (
              <button
                type="button"
                onClick={() => setView('pdf')}
                style={{
                  padding: '3px 8px',
                  fontSize: '11px',
                  fontWeight: 600,
                  background: '#0284c7',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                }}
              >
                👁 View PDF Inline
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setView('edit')}
                style={{
                  padding: '3px 8px',
                  fontSize: '11px',
                  fontWeight: 600,
                  background: '#0f172a',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                }}
              >
                ✏ Back to Web Editor
              </button>
            )}
            <a
              href={`/api/bank-report-pdf?bankId=${encodeURIComponent(bankId)}&download=1`}
              target="_blank"
              rel="noreferrer"
              style={{
                padding: '3px 8px',
                fontSize: '11px',
                fontWeight: 600,
                background: '#ffffff',
                color: '#0369a1',
                border: '1px solid #bae6fd',
                borderRadius: '4px',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '3px',
              }}
            >
              Download ↗
            </a>
            <button
              type="button"
              onClick={() => pdfInputRef.current?.click()}
              style={{
                padding: '3px 8px',
                fontSize: '11px',
                fontWeight: 600,
                background: '#ffffff',
                color: '#475569',
                border: '1px solid #cbd5e1',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
              title="Upload a new PDF to replace this one"
            >
              Replace PDF
            </button>
            <button
              type="button"
              onClick={removeAttachedPdf}
              style={{
                padding: '3px 8px',
                fontSize: '11px',
                fontWeight: 600,
                background: '#fee2e2',
                color: '#b91c1c',
                border: '1px solid #fecaca',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
              title="Remove attached PDF from this bank"
            >
              Remove
            </button>
          </div>
        </div>
      )}

      {notice && (
        <div
          style={{
            padding: '8px 12px',
            marginBottom: '10px',
            fontSize: '12px',
            borderRadius: '6px',
            background: notice.isError ? '#fef2f2' : '#f0fdf4',
            color: notice.isError ? '#b91c1c' : '#15803d',
            border: `1px solid ${notice.isError ? '#fecaca' : '#bbf7d0'}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <span>{notice.text}</span>
          <button
            type="button"
            onClick={() => setNotice(null)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px', color: 'inherit' }}
          >
            ×
          </button>
        </div>
      )}

      {view === 'edit' ? (
        <div
          style={{
            border: '1px solid #cbd5e1',
            borderRadius: '8px',
            background: '#ffffff',
            overflow: 'hidden',
          }}
        >
          {/* TipTap Visual Toolbar */}
          {editor && (
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                gap: '4px',
                padding: '6px 8px',
                background: '#f8fafc',
                borderBottom: '1px solid #e2e8f0',
              }}
            >
              <button
                type="button"
                onClick={() => editor.chain().focus().toggleBold().run()}
                className={editor.isActive('bold') ? 'activeToolbarBtn' : 'toolbarBtn'}
                title="Bold"
                style={{ padding: '3px 8px', fontWeight: 'bold', fontSize: '12px' }}
              >
                B
              </button>
              <button
                type="button"
                onClick={() => editor.chain().focus().toggleItalic().run()}
                className={editor.isActive('italic') ? 'activeToolbarBtn' : 'toolbarBtn'}
                title="Italic"
                style={{ padding: '3px 8px', fontStyle: 'italic', fontSize: '12px' }}
              >
                I
              </button>
              <button
                type="button"
                onClick={() => editor.chain().focus().toggleUnderline().run()}
                className={editor.isActive('underline') ? 'activeToolbarBtn' : 'toolbarBtn'}
                title="Underline"
                style={{ padding: '3px 8px', textDecoration: 'underline', fontSize: '12px' }}
              >
                U
              </button>

              <span style={{ color: '#cbd5e1', margin: '0 2px' }}>|</span>

              <button
                type="button"
                onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                className={editor.isActive('heading', { level: 2 }) ? 'activeToolbarBtn' : 'toolbarBtn'}
                style={{ padding: '3px 7px', fontSize: '12px', fontWeight: 600 }}
              >
                H2
              </button>
              <button
                type="button"
                onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                className={editor.isActive('heading', { level: 3 }) ? 'activeToolbarBtn' : 'toolbarBtn'}
                style={{ padding: '3px 7px', fontSize: '12px', fontWeight: 600 }}
              >
                H3
              </button>

              <span style={{ color: '#cbd5e1', margin: '0 2px' }}>|</span>

              <button
                type="button"
                onClick={() => editor.chain().focus().toggleBulletList().run()}
                className={editor.isActive('bulletList') ? 'activeToolbarBtn' : 'toolbarBtn'}
                style={{ padding: '3px 7px', fontSize: '12px' }}
                title="Bullet List"
              >
                • List
              </button>
              <button
                type="button"
                onClick={() => editor.chain().focus().toggleOrderedList().run()}
                className={editor.isActive('orderedList') ? 'activeToolbarBtn' : 'toolbarBtn'}
                style={{ padding: '3px 7px', fontSize: '12px' }}
                title="Numbered List"
              >
                1. List
              </button>
              <button
                type="button"
                onClick={() => editor.chain().focus().toggleBlockquote().run()}
                className={editor.isActive('blockquote') ? 'activeToolbarBtn' : 'toolbarBtn'}
                style={{ padding: '3px 7px', fontSize: '12px' }}
                title="Quote"
              >
                “ Quote
              </button>

              <span style={{ color: '#cbd5e1', margin: '0 2px' }}>|</span>

              {/* Table Controls */}
              <button
                type="button"
                onClick={insertTable}
                style={{ padding: '3px 7px', fontSize: '12px', fontWeight: 600, background: '#f1f5f9' }}
                title="Insert a 3x3 table"
              >
                + Table
              </button>

              {editor.isActive('table') && (
                <>
                  <button
                    type="button"
                    onClick={() => editor.chain().focus().addRowAfter().run()}
                    style={{ padding: '3px 6px', fontSize: '11px' }}
                    title="Add row below"
                  >
                    + Row
                  </button>
                  <button
                    type="button"
                    onClick={() => editor.chain().focus().addColumnAfter().run()}
                    style={{ padding: '3px 6px', fontSize: '11px' }}
                    title="Add column right"
                  >
                    + Col
                  </button>
                  <button
                    type="button"
                    onClick={() => editor.chain().focus().deleteRow().run()}
                    style={{ padding: '3px 6px', fontSize: '11px', color: '#b91c1c' }}
                    title="Delete row"
                  >
                    - Row
                  </button>
                  <button
                    type="button"
                    onClick={() => editor.chain().focus().deleteColumn().run()}
                    style={{ padding: '3px 6px', fontSize: '11px', color: '#b91c1c' }}
                    title="Delete column"
                  >
                    - Col
                  </button>
                  <button
                    type="button"
                    onClick={() => editor.chain().focus().deleteTable().run()}
                    style={{ padding: '3px 6px', fontSize: '11px', color: '#b91c1c' }}
                    title="Delete table"
                  >
                    Delete Table
                  </button>
                </>
              )}

              {isImageSelected && (
                <>
                  <span style={{ color: '#cbd5e1', margin: '0 2px' }}>|</span>
                  <div
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      background: '#fef2f2',
                      border: '1px solid #fecaca',
                      borderRadius: '4px',
                      padding: '2px 6px',
                    }}
                  >
                    <span style={{ fontSize: '11px', fontWeight: 600, color: '#991b1b', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                      🖼️ Image:
                    </span>
                    <button
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={removeSelectedImage}
                      style={{
                        padding: '2px 8px',
                        fontSize: '11px',
                        fontWeight: 600,
                        background: '#dc2626',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '3px',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                      title="Remove selected image from report (Delete / Backspace)"
                      aria-label="Remove Image"
                    >
                      🗑️ Remove Image
                    </button>
                  </div>
                </>
              )}
            </div>
          )}

          {/* TipTap Editor Content */}
          <div ref={editorBodyRef} style={{ position: 'relative' }}>
            {selectedImageRect && isImageSelected && (
              <div
                style={{
                  position: 'absolute',
                  top: `${Math.max(6, selectedImageRect.top - 38)}px`,
                  left: `${selectedImageRect.left}px`,
                  zIndex: 25,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: '#0f172a',
                  color: '#ffffff',
                  padding: '4px 10px',
                  borderRadius: '6px',
                  boxShadow: '0 4px 14px rgba(0, 0, 0, 0.25)',
                  fontSize: '12px',
                }}
              >
                <span style={{ fontSize: '11px', fontWeight: 600, color: '#f1f5f9', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  🖼️ Image Selected
                </span>
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={removeSelectedImage}
                  style={{
                    padding: '3px 9px',
                    fontSize: '11px',
                    fontWeight: 600,
                    background: '#ef4444',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                  title="Remove this image from report (Delete / Backspace)"
                  aria-label="Remove Image"
                >
                  🗑️ Remove Image
                </button>
              </div>
            )}
            <EditorContent editor={editor} />
          </div>
        </div>
      ) : view === 'pdf' ? (
        <div
          style={{
            border: '1px solid #cbd5e1',
            borderRadius: '8px',
            background: '#ffffff',
            overflow: 'hidden',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          }}
        >
          <div
            style={{
              padding: '10px 14px',
              background: '#f8fafc',
              borderBottom: '1px solid #e2e8f0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '8px',
            }}
          >
            <div>
              <div style={{ fontSize: '12px', fontWeight: 700, color: '#0f172a' }}>
                📑 Embedded PDF Report Viewer
              </div>
              <div style={{ fontSize: '11px', color: '#64748b' }}>
                {attachedPdfName || 'Source Bank PDF Document'} (Original vector layout, charts, and all pages preserved)
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <a
                href={`/api/bank-report-pdf?bankId=${encodeURIComponent(bankId)}&t=${pdfTimestamp}`}
                target="_blank"
                rel="noreferrer"
                style={{
                  padding: '4px 10px',
                  fontSize: '11px',
                  fontWeight: 600,
                  background: '#0284c7',
                  color: '#ffffff',
                  borderRadius: '4px',
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                ↗ Open in Full Tab
              </a>
              <button
                type="button"
                onClick={() => setView('edit')}
                style={{
                  padding: '4px 10px',
                  fontSize: '11px',
                  fontWeight: 600,
                  background: '#f1f5f9',
                  color: '#334155',
                  border: '1px solid #cbd5e1',
                  borderRadius: '4px',
                  cursor: 'pointer',
                }}
              >
                ✏ Back to Web Editor
              </button>
            </div>
          </div>

          {attachedPdfKey ? (
            <div style={{ width: '100%', background: '#475569', minHeight: '650px', position: 'relative' }}>
              <iframe
                title="Bank PDF Report Viewer"
                src={`/api/bank-report-pdf?bankId=${encodeURIComponent(bankId)}&t=${pdfTimestamp}#toolbar=1&navpanes=1`}
                style={{
                  width: '100%',
                  height: '750px',
                  border: 'none',
                  display: 'block',
                }}
              />
              <div
                style={{
                  padding: '8px 12px',
                  background: '#f1f5f9',
                  borderTop: '1px solid #cbd5e1',
                  fontSize: '11px',
                  color: '#64748b',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <span>If your browser does not render embedded PDFs, you can view or download it directly:</span>
                <a
                  href={`/api/bank-report-pdf?bankId=${encodeURIComponent(bankId)}&download=1`}
                  download={attachedPdfName || 'bank-report.pdf'}
                  style={{ color: '#0284c7', fontWeight: 600, textDecoration: 'underline' }}
                >
                  Download Source PDF File
                </a>
              </div>
            </div>
          ) : (
            <div
              style={{
                padding: '40px 20px',
                textAlign: 'center',
                color: '#64748b',
                background: '#f8fafc',
              }}
            >
              <div style={{ fontSize: '32px', marginBottom: '12px' }}>📄</div>
              <div style={{ fontSize: '14px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                No PDF report is attached to this bank yet
              </div>
              <p style={{ fontSize: '12px', maxWidth: '400px', margin: '0 auto 16px auto' }}>
                Upload an analyst PDF report to provide subscribers with the original document alongside or in place of this web report.
              </p>
              <button
                type="button"
                onClick={() => pdfInputRef.current?.click()}
                disabled={!bankId || isUploadingPdf}
                style={{
                  padding: '6px 14px',
                  fontSize: '12px',
                  fontWeight: 600,
                  background: '#0284c7',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: (!bankId || isUploadingPdf) ? 'not-allowed' : 'pointer',
                }}
              >
                {isUploadingPdf ? '⏳ Uploading...' : '📑 Upload PDF Report'}
              </button>
            </div>
          )}
        </div>
      ) : (
        <div
          style={{
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            padding: '16px',
            background: '#ffffff',
            minHeight: '220px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          }}
        >
          <div
            style={{
              fontSize: '11px',
              fontWeight: 'bold',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              color: '#94a3b8',
              marginBottom: '8px',
              borderBottom: '1px solid #f1f5f9',
              paddingBottom: '4px',
            }}
          >
            Live Website Preview
          </div>

          {isHtmlReport(content) ? (
            <div
              className="prose prose-slate max-w-none reportRichText"
              dangerouslySetInnerHTML={{ __html: sanitizeReportHtml(content) }}
            />
          ) : (
            <StructuredReportRenderer content={content} />
          )}
        </div>
      )}

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '8px',
          marginTop: '6px',
          padding: '4px 8px',
          background: '#f8fafc',
          border: '1px solid #e2e8f0',
          borderRadius: '4px',
          fontSize: '11px',
          color: '#64748b',
        }}
      >
        <span>
          Report content size: <strong>{(new Blob([content]).size / 1024).toFixed(1)} KB</strong> / 500 KB limit
        </span>
        {new Blob([content]).size > 400 * 1024 ? (
          <span style={{ color: '#dc2626', fontWeight: 600 }}>
            ⚠️ Approaching 500 KB limit. Ensure charts are uploaded via &quot;Add Image / Chart&quot;, not embedded as base64 text.
          </span>
        ) : (
          <span>Hosted R2 images preserve full visual quality with zero text size bloat.</span>
        )}
      </div>

      <small
        style={{
          display: 'block',
          marginTop: '6px',
          color: '#64748b',
          fontSize: '12px',
        }}
      >
        You can paste directly from Microsoft Word, import a .docx file, or paste screenshot images of charts.
        Click any inserted image to select and remove it (using the Remove Image button or Delete / Backspace key).
        Tables and headings will format cleanly for website visitors.
      </small>
    </div>
  );
}
