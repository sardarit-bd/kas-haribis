'use client';
import { FormEvent, useMemo, useState } from 'react';
import {
  StructuredReportRenderer,
  INSTITUTIONAL_HOLDERS_TEMPLATE,
} from '../../bank-directory/full-report/structured-report-renderer';
import RichReportEditor from './rich-report-editor';

type Bank = {
  id: string;
  title: string;
  status: string;
  summary: string;
  comment: string;
  last_updated: string;
  full_report: string;
  sort_order: number;
  institution_type: string;
  website: string;
  logo_url: string;
  researcher: string;
  source_urls: string;
  ownership_details: string;
  iska_details: string;
  internal_notes: string;
  report_pdf_key?: string;
  report_pdf_name?: string;
};
type AccessCode = { id: string; code_hint: string; created_at: string };
const statuses = [
  ['kosher', 'Kosher'],
  ['mehudar', 'Mehudar'],
  ['only-kosher-with-iska', 'Kosher with Heter Iska'],
  ['case-by-case', 'Case by case'],
  ['questionable', 'Questionable'],
  ['no-good', 'Not recommended'],
  ['lack-of-information', 'Insufficient information'],
];
const emptyBank = (order: number): Bank => ({
  id: '',
  title: '',
  status: 'kosher',
  summary: '',
  comment: '',
  last_updated: '',
  full_report: '',
  sort_order: order,
  institution_type: '',
  website: '',
  logo_url: '',
  researcher: '',
  source_urls: '',
  ownership_details: '',
  iska_details: '',
  internal_notes: '',
  report_pdf_key: '',
  report_pdf_name: '',
});

export default function BankManager({
  initialBanks,
}: {
  initialBanks: Bank[];
}) {
  const [banks, setBanks] = useState(initialBanks),
    [editing, setEditing] = useState<Bank | null>(null),
    [query, setQuery] = useState(''),
    [message, setMessage] = useState(''),
    [isError, setIsError] = useState(false),
    [isSaving, setIsSaving] = useState(false);
  const [codes, setCodes] = useState<AccessCode[]>([]),
    [newCode, setNewCode] = useState(''),
    [formVersion, setFormVersion] = useState(0);
  const filtered = useMemo(
    () =>
      banks.filter((bank) =>
        (bank.title + ' ' + bank.comment)
          .toLowerCase()
          .includes(query.toLowerCase()),
      ),
    [banks, query],
  );
  const value = editing || emptyBank(banks.length + 1);
  async function reload() {
    try {
      const response = await fetch('/api/banks');
      if (!response.ok) return;
      const result = (await response.json()) as { banks: Bank[] };
      if (Array.isArray(result?.banks)) {
        setBanks(result.banks);
      }
    } catch {
      // ignore background reload failure
    }
  }
  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());
    setIsError(false);
    setIsSaving(true);
    setMessage('Saving…');
    try {
      const response = await fetch('/api/banks', {
        method: data.id ? 'PUT' : 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(data),
      });
      const result = (await response.json().catch(() => ({}))) as {
        id?: string;
        error?: string;
        saved?: boolean;
      };
      if (!response.ok || !result.saved) {
        setIsError(true);
        setMessage(result.error || `Could not save the bank (HTTP ${response.status}).`);
        setIsSaving(false);
        return;
      }
      const bankId = (data.id as string) || result.id;
      const logoFile = (form.elements.namedItem('logo_file') as HTMLInputElement)
        ?.files?.[0];
      if (logoFile && bankId) {
        setMessage('Uploading logo…');
        const logoFd = new FormData();
        logoFd.set('id', bankId);
        logoFd.set('file', logoFile);
        const logoResponse = await fetch('/api/admin/bank-logo', {
          method: 'POST',
          body: logoFd,
        });
        const logoResult = (await logoResponse.json().catch(() => ({}))) as {
          error?: string;
          saved?: boolean;
        };
        if (!logoResponse.ok || !logoResult.saved) {
          setIsError(true);
          setMessage(`Bank saved, but logo upload failed: ${logoResult.error || 'Upload failed'}`);
          setIsSaving(false);
          await reload();
          return;
        }
      }

      const pdfFile = (form.elements.namedItem('report_pdf_file') as HTMLInputElement)?.files?.[0];
      if (pdfFile && bankId) {
        setMessage('Uploading PDF report…');
        const pdfFd = new FormData();
        pdfFd.set('bankId', bankId);
        pdfFd.set('file', pdfFile);
        const pdfResponse = await fetch('/api/admin/bank-report-pdf', {
          method: 'POST',
          body: pdfFd,
        });
        const pdfResult = (await pdfResponse.json().catch(() => ({}))) as {
          error?: string;
          saved?: boolean;
        };
        if (!pdfResponse.ok || !pdfResult.saved) {
          setIsError(true);
          setMessage(`Bank saved, but PDF upload failed: ${pdfResult.error || 'Upload failed'}`);
          setIsSaving(false);
          await reload();
          return;
        }
      }

      await reload();
      form.reset();
      setEditing(null);
      setFormVersion((v) => v + 1);
      setIsError(false);
      setMessage(
        data.id ? '✓ Bank and report updated successfully.' : '✓ Bank added to the directory successfully.',
      );
    } catch (err: any) {
      setIsError(true);
      setMessage(err?.message || 'A network error occurred while saving the bank.');
    } finally {
      setIsSaving(false);
    }
  }
  async function remove(bank: Bank) {
    if (!confirm(`Remove ${bank.title} from the bank directory?`)) return;
    try {
      const response = await fetch(
        `/api/banks?id=${encodeURIComponent(bank.id)}`,
        { method: 'DELETE' },
      );
      const result = (await response.json().catch(() => ({}))) as {
        error?: string;
        deleted?: boolean;
      };
      if (!response.ok || !result.deleted) {
        setIsError(true);
        setMessage(result.error || 'The bank could not be removed.');
        return;
      }
      setIsError(false);
      setBanks((current) => current.filter((item) => item.id !== bank.id));
      if (editing?.id === bank.id) setEditing(null);
      setMessage(`✓ ${bank.title} was removed.`);
    } catch (err: any) {
      setIsError(true);
      setMessage(`The bank could not be removed: ${err?.message || 'Network error'}`);
    }
  }

  async function removePdf(bankId: string) {
    if (!confirm('Are you sure you want to remove the attached original PDF from this bank?')) return;
    try {
      setMessage('Removing attached PDF…');
      const res = await fetch(`/api/admin/bank-report-pdf?bankId=${encodeURIComponent(bankId)}`, {
        method: 'DELETE',
      });
      const data = (await res.json().catch(() => ({}))) as any;
      if (!res.ok || !data.deleted) {
        throw new Error(data.error || 'Could not remove attached PDF');
      }
      await reload();
      if (editing?.id === bankId) {
        setEditing((prev) => (prev ? { ...prev, report_pdf_key: '', report_pdf_name: '' } : null));
      }
      setIsError(false);
      setMessage('✓ Attached PDF removed.');
    } catch (err: any) {
      setIsError(true);
      setMessage(err.message || 'Error removing PDF.');
    }
  }
  async function loadCodes(bankId: string) {
    const result = (await fetch(
      `/api/admin/bank-report-codes?bankId=${encodeURIComponent(bankId)}`,
    ).then((response) => response.json())) as { codes?: AccessCode[] };
    setCodes(result.codes || []);
  }
  async function createCode() {
    if (!editing) return;
    setNewCode('');
    const response = await fetch('/api/admin/bank-report-codes', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ bankId: editing.id }),
    });
    const result = (await response.json()) as { code?: string; error?: string };
    if (!response.ok || !result.code) {
      setMessage(result.error || 'The access code could not be created.');
      return;
    }
    setNewCode(result.code);
    setMessage(
      'New access code created. Copy it now and give it to the visitor.',
    );
    loadCodes(editing.id);
  }
  async function removeCode(id: string) {
    if (!confirm('Remove this access code? It will stop working immediately.'))
      return;
    await fetch(`/api/admin/bank-report-codes?id=${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
    if (editing) loadCodes(editing.id);
  }
  function edit(bank: Bank) {
    setEditing(bank);
    setMessage('');
    setIsError(false);
    setNewCode('');
    loadCodes(bank.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  return (
    <div className="bankAdminLayout">
      <section className="bankEditorCard">
        <div className="bankEditorHeading">
          <div>
            <p className="eyebrow gold">{editing ? 'EDIT BANK' : 'NEW BANK'}</p>
            <h2>{editing ? editing.title : 'Add a bank or lender'}</h2>
          </div>
          {editing && (
            <button
              type="button"
              onClick={() => {
                setEditing(null);
                setMessage('');
                setIsError(false);
              }}
            >
              ← Back to add bank
            </button>
          )}
        </div>
        <form key={value.id ? value.id : `new-${formVersion}`} onSubmit={save}>
          <input type="hidden" name="id" value={value.id} />
          <input type="hidden" name="logo_url" value={value.logo_url || ''} />
          <input type="hidden" name="report_pdf_key" value={value.report_pdf_key || ''} />
          <input type="hidden" name="report_pdf_name" value={value.report_pdf_name || ''} />
          <div className="bankFormGrid">
            <label>
              Bank or institution name
              <input
                name="title"
                defaultValue={value.title}
                required
                placeholder="Enter the full bank name"
              />
            </label>
            <label>
              Institution type
              <input
                name="institution_type"
                defaultValue={value.institution_type}
                placeholder="Public bank, private lender…"
              />
            </label>
            <label>
              Directory status
              <select name="status" defaultValue={value.status}>
                {statuses.map(([key, label]) => (
                  <option value={key} key={key}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Institution website
              <input
                name="website"
                type="url"
                defaultValue={value.website}
                placeholder="https://…"
              />
            </label>
          </div>
          <label>
            Research summary
            <textarea
              name="summary"
              rows={5}
              defaultValue={value.summary}
              placeholder="Enter the research findings or Heter Iska information."
            />
          </label>
          <label>
            Comment shown with this bank
            <textarea
              name="comment"
              rows={3}
              defaultValue={value.comment}
              placeholder="Add a special note, warning, clarification, or current update."
            />
            <small>
              This comment will appear publicly when visitors open this bank.
            </small>
          </label>
          <label>
            Ownership and control research
            <textarea
              name="ownership_details"
              rows={4}
              defaultValue={value.ownership_details}
            />
          </label>
          <label>
            Heter Iska details
            <textarea
              name="iska_details"
              rows={4}
              defaultValue={value.iska_details}
            />
          </label>
          <label>
            Source links
            <textarea
              name="source_urls"
              rows={3}
              defaultValue={value.source_urls}
            />
          </label>
          <label>
            Private administrator notes
            <textarea
              name="internal_notes"
              rows={3}
              defaultValue={value.internal_notes}
            />
          </label>

          {/* Official Source PDF Document Attachment Card */}
          <div
            className="pdfAttachmentSection"
            style={{
              margin: '18px 0',
              padding: '16px',
              background: '#f8fafc',
              border: '1px solid #cbd5e1',
              borderRadius: '8px',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '8px',
              }}
            >
              <strong style={{ fontSize: '13px', color: '#1e293b' }}>
                Official Source Document (Original PDF)
              </strong>
              {value.report_pdf_key && (
                <span
                  style={{
                    fontSize: '11px',
                    background: '#dbeafe',
                    color: '#1e40af',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    fontWeight: 'bold',
                  }}
                >
                  PDF ATTACHED
                </span>
              )}
            </div>

            {value.report_pdf_key ? (
              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '10px',
                }}
              >
                <div style={{ fontSize: '13px', color: '#334155' }}>
                  📄 <strong>{value.report_pdf_name || 'Attached PDF Document'}</strong>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <a
                    href={`/api/bank-report-pdf?bankId=${encodeURIComponent(value.id)}&download=1`}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      padding: '4px 10px',
                      fontSize: '12px',
                      background: '#ffffff',
                      border: '1px solid #cbd5e1',
                      borderRadius: '4px',
                      color: '#0f172a',
                      textDecoration: 'none',
                      fontWeight: 600,
                    }}
                  >
                    Download / View ↗
                  </a>
                  <button
                    type="button"
                    onClick={() => removePdf(value.id)}
                    style={{
                      padding: '4px 10px',
                      fontSize: '12px',
                      background: '#fee2e2',
                      border: '1px solid #fecaca',
                      borderRadius: '4px',
                      color: '#b91c1c',
                      cursor: 'pointer',
                      fontWeight: 600,
                    }}
                  >
                    Remove PDF
                  </button>
                </div>
              </div>
            ) : (
              <p style={{ margin: '0 0 10px 0', fontSize: '12px', color: '#64748b' }}>
                {value.id
                  ? 'No original PDF attached yet. Attach the official source PDF document to preserve complex vector charts, analyst signatures, and original formatting.'
                  : 'Save this bank record first before uploading an attached PDF document.'}
              </p>
            )}

            {value.id && (
              <label
                style={{
                  display: 'block',
                  marginTop: value.report_pdf_key ? '12px' : '4px',
                }}
              >
                <span
                  style={{
                    fontSize: '12px',
                    fontWeight: 600,
                    color: '#475569',
                    display: 'block',
                    marginBottom: '4px',
                  }}
                >
                  {value.report_pdf_key ? 'Replace Attached PDF (max 25 MB):' : 'Attach PDF Document (max 25 MB):'}
                </span>
                <input
                  name="report_pdf_file"
                  type="file"
                  accept="application/pdf"
                  style={{ fontSize: '12px' }}
                />
              </label>
            )}
          </div>

          <FullReportEditor defaultValue={value.full_report} bankId={value.id} />
          <div className="bankFormGrid compactFields">
            <label>
              Researcher
              <input name="researcher" defaultValue={value.researcher} />
            </label>
            <label>
              Last updated date
              <input
                name="last_updated"
                type="date"
                defaultValue={value.last_updated}
              />
              <small>This date will be displayed publicly.</small>
            </label>
            <label>
              Display order
              <input
                name="sort_order"
                type="number"
                min="0"
                defaultValue={value.sort_order}
              />
            </label>
          </div>
          <label className="logoUploadField" style={{ display: 'block', marginTop: '16px' }}>
            Bank or Lender Logo / Image
            <input
              name="logo_file"
              type="file"
              accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml"
            />
            <small style={{ display: 'block', color: '#64748b', fontSize: '12px', marginTop: '4px' }}>
              Upload logo image (PNG, JPG, WebP, SVG). Will be displayed in admin table and public cards.
            </small>
          </label>
          {value.logo_url && (
            <div className="logoPreviewBox" style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '14px 0', padding: '12px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px' }}>
              <img
                className="adminLogoPreview"
                src={value.logo_url}
                alt="Current institution logo"
                style={{ width: '48px', height: '48px', objectFit: 'contain', background: '#fff', padding: '4px', border: '1px solid #cbd5e1', borderRadius: '6px' }}
              />
              <div>
                <strong style={{ fontSize: '13px', color: '#1e293b' }}>Current Logo</strong>
                <small style={{ display: 'block', color: '#64748b', fontSize: '11px', wordBreak: 'break-all' }}>{value.logo_url}</small>
              </div>
            </div>
          )}
          <div className="editFormActions">
            <button className="primary" disabled={isSaving}>
              {isSaving ? 'Saving…' : editing ? 'Save bank changes' : 'Add bank'}
            </button>
            {editing && (
              <button
                className="cancelEditButton"
                type="button"
                disabled={isSaving}
                onClick={() => {
                  setEditing(null);
                  setMessage('');
                  setIsError(false);
                }}
              >
                Cancel editing
              </button>
            )}
          </div>
        </form>
        {message && (
          <div
            role="alert"
            className={isError ? 'adminErrorMessage' : 'adminSaveMessage'}
            style={
              isError
                ? {
                    padding: '12px 16px',
                    background: '#fef2f2',
                    color: '#991b1b',
                    borderLeft: '4px solid #ef4444',
                    borderRadius: '4px',
                    margin: '16px 0',
                    fontSize: '14px',
                    fontWeight: 500,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }
                : {
                    padding: '12px 16px',
                    background: '#eff8f0',
                    color: '#2b6f3b',
                    borderLeft: '4px solid #4e9660',
                    borderRadius: '4px',
                    margin: '16px 0',
                    fontSize: '14px',
                    fontWeight: 500,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }
            }
          >
            <span style={{ fontSize: '16px', lineHeight: 1 }}>{isError ? '⚠️' : '✓'}</span>
            <span>{message}</span>
          </div>
        )}
        {editing && (
          <section className="bankCodeManager">
            <div>
              <h3>Full report access codes</h3>
              <p>
                Create a free-access code to give to a specific visitor. Codes
                can be removed at any time.
              </p>
            </div>
            <button className="primary" type="button" onClick={createCode}>
              Generate new code
            </button>
            {newCode && (
              <div className="newAccessCode">
                <small>NEW CODE — COPY NOW</small>
                <strong>{newCode}</strong>
                <button
                  type="button"
                  onClick={() => navigator.clipboard.writeText(newCode)}
                >
                  Copy code
                </button>
              </div>
            )}
            <div className="accessCodeList">
              {codes.length === 0 ? (
                <p>No access codes created for this bank.</p>
              ) : (
                codes.map((code) => (
                  <article key={code.id}>
                    <span>
                      <b>{code.code_hint}</b>
                      <small>
                        Created{' '}
                        {new Date(code.created_at).toLocaleDateString('en-US')}
                      </small>
                    </span>
                    <button type="button" onClick={() => removeCode(code.id)}>
                      Remove
                    </button>
                  </article>
                ))
              )}
            </div>
          </section>
        )}
      </section>
      <section className="bankAdminList">
        <div className="bankListHeader">
          <div>
            <h2>All banks and institutions</h2>
            <span>{banks.length} directory records</span>
          </div>
          <button
            className="primary"
            onClick={() => {
              setEditing(null);
              setMessage('');
              setIsError(false);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          >
            + Add new bank
          </button>
        </div>
        <label className="bankAdminSearch">
          Search banks or comments
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Type a bank name…"
          />
        </label>
        <div className="bankAdminTableWrapper" style={{ overflowX: 'auto', marginTop: '16px' }}>
          {filtered.length === 0 ? (
            <div className="emptyState">
              <b>No banks found</b>
              <p>Try a different search.</p>
            </div>
          ) : (
            <table className="adminBankTable" style={{ width: '100%', borderCollapse: 'collapse', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0', textAlign: 'left', fontSize: '12px', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  <th style={{ padding: '12px 16px', width: '64px' }}>Logo</th>
                  <th style={{ padding: '12px 16px' }}>Bank / Institution</th>
                  <th style={{ padding: '12px 16px' }}>Status</th>
                  <th style={{ padding: '12px 16px' }}>Comment & Date</th>
                  <th style={{ padding: '12px 16px' }}>Full Report</th>
                  <th style={{ padding: '12px 16px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((bank) => (
                  <tr key={bank.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <td style={{ padding: '12px 16px', verticalAlign: 'middle' }}>
                      {bank.logo_url ? (
                        <img
                          src={bank.logo_url}
                          alt={bank.title}
                          style={{ width: '44px', height: '44px', objectFit: 'contain', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '2px' }}
                        />
                      ) : (
                        <span
                          style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '44px', height: '44px', background: '#102a43', color: '#ffffff', fontWeight: 'bold', fontSize: '18px', borderRadius: '6px' }}
                        >
                          {bank.title.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </td>
                    <td style={{ padding: '12px 16px', verticalAlign: 'middle' }}>
                      <b style={{ display: 'block', fontSize: '15px', color: '#0f172a' }}>{bank.title}</b>
                      {bank.institution_type && (
                        <span style={{ fontSize: '12px', color: '#64748b', display: 'block', marginTop: '2px' }}>
                          {bank.institution_type}
                        </span>
                      )}
                      {bank.website && (
                        <a
                          href={bank.website}
                          target="_blank"
                          rel="noreferrer"
                          style={{ fontSize: '11px', color: '#c69b46', textDecoration: 'none', display: 'inline-block', marginTop: '2px' }}
                        >
                          Website ↗
                        </a>
                      )}
                    </td>
                    <td style={{ padding: '12px 16px', verticalAlign: 'middle' }}>
                      <i className={`bankStatus status-${bank.status}`}>
                        {statuses.find((status) => status[0] === bank.status)?.[1] || bank.status}
                      </i>
                    </td>
                    <td style={{ padding: '12px 16px', verticalAlign: 'middle', maxWidth: '300px' }}>
                      <p style={{ margin: 0, fontSize: '13px', color: '#334155', lineHeight: '1.4' }}>
                        {bank.comment || <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>No comment added</span>}
                      </p>
                      {bank.last_updated && (
                        <time style={{ display: 'block', fontSize: '11px', color: '#64748b', marginTop: '4px' }}>
                          Updated: {new Date(`${bank.last_updated}T00:00:00`).toLocaleDateString('en-US')}
                        </time>
                      )}
                    </td>
                    <td style={{ padding: '12px 16px', verticalAlign: 'middle' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        {bank.full_report ? (
                          <span className="reportReadyBadge" style={{ display: 'inline-block', fontSize: '11px', fontWeight: 'bold', padding: '3px 8px', background: '#fef3c7', color: '#92400e', border: '1px solid #fde68a', borderRadius: '4px' }}>
                            $15 WEB REPORT
                          </span>
                        ) : null}
                        {bank.report_pdf_key ? (
                          <span style={{ display: 'inline-block', fontSize: '11px', fontWeight: 'bold', padding: '3px 8px', background: '#e0f2fe', color: '#0369a1', border: '1px solid #bae6fd', borderRadius: '4px' }}>
                            📄 SOURCE PDF
                          </span>
                        ) : null}
                        {!bank.full_report && !bank.report_pdf_key && (
                          <span style={{ fontSize: '12px', color: '#94a3b8' }}>—</span>
                        )}
                      </div>
                    </td>
                    <td style={{ padding: '12px 16px', verticalAlign: 'middle', textAlign: 'right' }}>
                      <div className="bankRowActions" style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                        <button onClick={() => edit(bank)}>Edit</button>
                        <button className="deleteButton" onClick={() => remove(bank)}>
                          Remove
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>
    </div>
  );
}

function FullReportEditor({
  defaultValue,
  bankId,
}: {
  defaultValue: string;
  bankId?: string;
}) {
  const [useRich, setUseRich] = useState(true);
  const [text, setText] = useState(defaultValue);
  const [view, setView] = useState<'edit' | 'preview'>('edit');

  function insertTemplate() {
    const separator = text.trim() ? '\n\n' : '';
    setText((prev) => prev + separator + INSTITUTIONAL_HOLDERS_TEMPLATE);
    setView('edit');
  }

  return (
    <div className="fullReportEditorSection">
      {useRich ? (
        <div>
          <RichReportEditor
            defaultValue={defaultValue}
            bankId={bankId || ''}
            name="full_report"
          />
          <div style={{ textAlign: 'right', marginTop: '-12px', marginBottom: '14px' }}>
            <button
              type="button"
              onClick={() => {
                setText(defaultValue);
                setUseRich(false);
              }}
              style={{
                background: 'none',
                border: 'none',
                color: '#64748b',
                fontSize: '11px',
                textDecoration: 'underline',
                cursor: 'pointer',
              }}
            >
              Switch to plain Markdown textarea
            </button>
          </div>
        </div>
      ) : (
        <div className="fullReportEditor" style={{ margin: '20px 0' }}>
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
              Protected full report (Plain Markdown)
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                type="button"
                onClick={() => setUseRich(true)}
                style={{
                  padding: '4px 10px',
                  fontSize: '12px',
                  fontWeight: 600,
                  background: '#f8fafc',
                  color: '#102a43',
                  border: '1px solid #cbd5e1',
                  borderRadius: '4px',
                  cursor: 'pointer',
                }}
              >
                Switch to Rich Editor
              </button>
              <button
                type="button"
                onClick={insertTemplate}
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
              >
                + Insert Table Template
              </button>
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

          {view === 'edit' ? (
            <textarea
              name="full_report"
              rows={12}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Enter the complete detailed report in Markdown or plain text."
              style={{ width: '100%', fontFamily: 'monospace', fontSize: '13px' }}
            />
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
              <input type="hidden" name="full_report" value={text} />
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
              <StructuredReportRenderer content={text} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

