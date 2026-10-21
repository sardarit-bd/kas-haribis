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
import mammoth from 'mammoth';
import { sanitizeReportHtml, isHtmlReport } from '../../lib/report-sanitizer';
import { StructuredReportRenderer } from '../../bank-directory/full-report/structured-report-renderer';

interface RichReportEditorProps {
  defaultValue: string;
  bankId: string;
  name?: string;
  onContentChange?: (content: string) => void;
}

export default function RichReportEditor({
  defaultValue,
  bankId,
  name = 'full_report',
  onContentChange,
}: RichReportEditorProps) {
  const [content, setContent] = useState(defaultValue);
  const [view, setView] = useState<'edit' | 'preview'>('edit');
  const [isImporting, setIsImporting] = useState(false);
  const [notice, setNotice] = useState<{ text: string; isError?: boolean } | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const docxInputRef = useRef<HTMLInputElement | null>(null);
  const imageInputRef = useRef<HTMLInputElement | null>(null);

  // Upload an image file to R2 and insert into editor
  async function uploadAndInsertImage(file: File) {
    if (!bankId) {
      setNotice({
        text: 'Missing bank identifier. Please refresh the page and try again.',
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

    if (file.size > 5 * 1024 * 1024) {
      setNotice({
        text: `Image size exceeds the 5 MB limit (file size: ${(file.size / (1024 * 1024)).toFixed(1)} MB). Please select an image under 5 MB or attach via the Source PDF option.`,
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

      const data = (await res.json().catch(() => ({}))) as any;
      if (!res.ok || !data.url) {
        const errorMsg = res.status === 413
          ? (data.error || 'The image file exceeds the 5 MB server size limit (HTTP 413).')
          : (data.error || `Upload failed with status ${res.status}`);
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
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      setContent(html);
      onContentChange?.(html);
    },
  });

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
          <strong>Report Editor:</strong> Use <strong>📄 Import Word (.docx)</strong> to bring in formatted text and tables. To add charts or screenshots, place your cursor where desired and click <strong>📷 Add Image / Chart</strong> (PNG, JPEG, WebP up to 5 MB).
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
          Protected Full Report (Web Version)
        </span>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          {/* Hidden inputs for DOCX and image file pickers */}
          <input
            type="file"
            ref={docxInputRef}
            onChange={handleDocxImport}
            accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
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
            disabled={isImporting}
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
            disabled={isUploadingImage}
            onClick={() => {
              if (!bankId) {
                setNotice({
                  text: 'Missing bank identifier. Please refresh the page and try again.',
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
            title="Upload or paste a chart screenshot / image at the cursor position"
          >
            {isUploadingImage ? 'Uploading…' : '📷 Add Image / Chart'}
          </button>

          {/* Edit / Preview toggle */}
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
              Edit
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
              Preview
            </button>
          </div>
        </div>
      </div>

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
            </div>
          )}

          {/* TipTap Editor Content */}
          <EditorContent editor={editor} />
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
        Tables and headings will format cleanly for website visitors.
      </small>
    </div>
  );
}
