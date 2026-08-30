'use client';
import { FormEvent, useMemo, useState } from 'react';
type DocumentRecord = {
  id: string;
  invoice_number: string;
  customer_name: string;
  customer_email: string;
  company: string;
  address: string;
  description: string;
  amount: number;
  issue_date: string;
  due_date: string;
  status: string;
  notes: string;
  created_at: string;
  document_type?: string;
  payment_method?: string;
  payment_reference?: string;
  goods_services?: string;
};
const today = () => new Date().toISOString().slice(0, 10);
const blank = (type = 'Invoice') => ({
  document_type: type,
  customer_name: '',
  customer_email: '',
  company: '',
  address: '',
  description:
    type === 'Donation Receipt'
      ? 'Charitable contribution to support the programs and work of Kav Haribis.'
      : '',
  amount: '',
  issue_date: today(),
  due_date: '',
  notes: '',
  payment_method: 'Zelle',
  payment_reference: '',
  goods_services:
    'No goods or services were provided in exchange for this contribution.',
});
export default function InvoiceManager({
  initialInvoices,
}: {
  initialInvoices: DocumentRecord[];
}) {
  const normalized = initialInvoices.map((x) => ({
    ...x,
    document_type: x.document_type || 'Invoice',
  }));
  const [items, setItems] = useState(normalized),
    [form, setForm] = useState<any>(blank()),
    [editing, setEditing] = useState<DocumentRecord | null>(null),
    [notice, setNotice] = useState(''),
    [busy, setBusy] = useState(false),
    [query, setQuery] = useState(''),
    [lastReceipt, setLastReceipt] = useState<DocumentRecord | null>(null);
  const isReceipt = form.document_type === 'Donation Receipt';
  const filtered = useMemo(
    () =>
      items.filter((x) =>
        (
          x.invoice_number +
          x.customer_name +
          x.customer_email +
          x.company +
          x.description +
          (x.document_type || '')
        )
          .toLowerCase()
          .includes(query.toLowerCase()),
      ),
    [items, query],
  );
  function chooseType(type: string) {
    if (editing) return;
    setForm(blank(type));
    setNotice('');
  }
  async function save(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setNotice('');
    setLastReceipt(null);
    try {
      const response = await fetch('/api/admin/invoices', {
          method: editing ? 'PUT' : 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify(
            editing ? { ...editing, ...form, id: editing.id } : form,
          ),
        }),
        result = (await response.json()) as any;
      if (!response.ok) {
        setNotice(result.error || 'Document could not be saved.');
        return;
      }
      if (editing)
        setItems((current) =>
          current.map((x) => (x.id === editing.id ? result.invoice : x)),
        );
      else setItems((current) => [result.invoice, ...current]);
      const madeReceipt = result.invoice.document_type === 'Donation Receipt';
      setEditing(null);
      setForm(blank(form.document_type));
      setNotice(
        `${madeReceipt ? 'Donation receipt' : 'Invoice'} ${result.invoice.invoice_number} was created. Preview it below before downloading.`,
      );
      setLastReceipt(result.invoice);
    } catch {
      setNotice(
        'The document could not be created. Please check your connection and try again.',
      );
    } finally {
      setBusy(false);
    }
  }
  function edit(item: DocumentRecord) {
    setEditing(item);
    setForm({
      ...blank(item.document_type || 'Invoice'),
      ...item,
      amount: String(item.amount),
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  async function status(item: DocumentRecord, value: string) {
    const response = await fetch('/api/admin/invoices', {
        method: 'PUT',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ ...item, status: value }),
      }),
      result = (await response.json()) as any;
    if (response.ok)
      setItems((current) =>
        current.map((x) => (x.id === item.id ? result.invoice : x)),
      );
  }
  async function remove(item: DocumentRecord) {
    if (
      !confirm(
        `Delete ${item.document_type || 'invoice'} ${item.invoice_number}?`,
      )
    )
      return;
    await fetch(`/api/admin/invoices?id=${encodeURIComponent(item.id)}`, {
      method: 'DELETE',
    });
    setItems((current) => current.filter((x) => x.id !== item.id));
  }
  function emailLink(item: DocumentRecord) {
    const receipt = item.document_type === 'Donation Receipt',
      subject = receipt
        ? `Donation receipt ${item.invoice_number} from Congregation Kav Haribis Inc.`
        : `Invoice ${item.invoice_number} from Congregation Kav Haribis Inc.`,
      body = receipt
        ? `Dear ${item.customer_name},\n\nThank you for your generous donation of $${Number(item.amount).toFixed(2)} to Congregation Kav Haribis Inc. Please find your donation receipt attached.\n\nReceipt: ${item.invoice_number}\nDonation date: ${item.issue_date}\n\nWith appreciation,\nKav Haribis`
        : `Dear ${item.customer_name},\n\nPlease find your invoice ${item.invoice_number} for $${Number(item.amount).toFixed(2)}.\n\nPayment options:\nZelle: 732-606-7923 (Congregation Kav Haribis Inc.)\nCredit card: https://secure.cardknox.com/congregationkavharibis\n\nPlease contact us if you need another payment method.\n\nThank you,\nKav Haribis`;
    return `mailto:${encodeURIComponent(item.customer_email)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  }
  return (
    <div className="invoiceManager">
      <form className="invoiceEditor" onSubmit={save} noValidate>
        {!editing && (
          <div
            className="documentTypeTabs"
            role="group"
            aria-label="Document type"
          >
            <button
              type="button"
              className={!isReceipt ? 'active' : ''}
              onClick={() => chooseType('Invoice')}
            >
              Create Invoice
            </button>
            <button
              type="button"
              className={isReceipt ? 'active' : ''}
              onClick={() => chooseType('Donation Receipt')}
            >
              Create Donation Receipt
            </button>
          </div>
        )}
        <div className="invoiceEditorHead">
          <span>KH</span>
          <div>
            <small>
              {editing
                ? `EDIT ${isReceipt ? 'RECEIPT' : 'INVOICE'}`
                : isReceipt
                  ? 'NEW DONATION RECEIPT'
                  : 'NEW INVOICE'}
            </small>
            <h2>
              {editing
                ? editing.invoice_number
                : isReceipt
                  ? 'Acknowledge a donation'
                  : 'Create an invoice'}
            </h2>
          </div>
        </div>
        {isReceipt && (
          <>
            <div className="receiptIntro">
              <b>Official donation acknowledgment</b>
              <span>
                The PDF includes Congregation Kav Haribis Inc., EIN 33-3357711,
                the donation details, and the required goods-or-services
                statement.
              </span>
            </div>
            <button type="submit" className="receiptTopSubmit" disabled={busy}>
              {busy ? 'Creating preview…' : 'Create Receipt Preview'}
            </button>
            <p className="receiptButtonHint">
              Complete the fields below, create the preview, review it, and
              download only when it is correct.
            </p>
          </>
        )}
        <div className="invoiceFormRow">
          <label>
            {isReceipt ? 'Donor name' : 'Customer name'}
            <input
              required
              value={form.customer_name}
              onChange={(e) =>
                setForm({ ...form, customer_name: e.target.value })
              }
            />
          </label>
          <label>
            Email address {isReceipt && <em>optional</em>}
            <input
              required={!isReceipt}
              type="email"
              value={form.customer_email}
              onChange={(e) =>
                setForm({ ...form, customer_email: e.target.value })
              }
            />
          </label>
        </div>
        <div className="invoiceFormRow">
          <label>
            {isReceipt ? 'Organization' : 'Company'} <em>optional</em>
            <input
              value={form.company}
              onChange={(e) => setForm({ ...form, company: e.target.value })}
            />
          </label>
          <label>
            {isReceipt ? 'Donation amount' : 'Amount due'}
            <input
              required
              min="0.01"
              step="0.01"
              type="number"
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
              placeholder="0.00"
            />
          </label>
        </div>
        <label>
          {isReceipt ? 'Donor address' : 'Billing address'} <em>optional</em>
          <textarea
            rows={2}
            value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
          />
        </label>
        <label>
          {isReceipt
            ? 'Donation purpose or description'
            : 'Service or invoice description'}
          <textarea
            required
            rows={4}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
        </label>
        <div className="invoiceFormRow">
          <label>
            {isReceipt ? 'Donation date' : 'Issue date'}
            <input
              required
              type="date"
              value={form.issue_date}
              onChange={(e) => setForm({ ...form, issue_date: e.target.value })}
            />
          </label>
          {!isReceipt && (
            <label>
              Due date <em>optional</em>
              <input
                type="date"
                value={form.due_date}
                onChange={(e) => setForm({ ...form, due_date: e.target.value })}
              />
            </label>
          )}
          {isReceipt && (
            <label>
              Payment method
              <select
                value={form.payment_method}
                onChange={(e) =>
                  setForm({ ...form, payment_method: e.target.value })
                }
              >
                <option>Zelle</option>
                <option>Credit card</option>
                <option>Check</option>
                <option>Cash</option>
                <option>Bank transfer</option>
                <option>Other</option>
              </select>
            </label>
          )}
        </div>
        {isReceipt && (
          <>
            <label>
              Payment reference <em>optional</em>
              <input
                value={form.payment_reference}
                onChange={(e) =>
                  setForm({ ...form, payment_reference: e.target.value })
                }
                placeholder="Check number or transaction reference"
              />
            </label>
            <label>
              Goods or services statement
              <textarea
                required
                rows={2}
                value={form.goods_services}
                onChange={(e) =>
                  setForm({ ...form, goods_services: e.target.value })
                }
              />
            </label>
          </>
        )}
        <label>
          Notes <em>optional</em>
          <textarea
            rows={3}
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            placeholder={
              isReceipt
                ? 'A personal thank-you message…'
                : 'Additional instructions or a thank-you message…'
            }
          />
        </label>
        {!isReceipt && (
          <div className="invoicePaymentPreview">
            <small>PAYMENT METHODS PRINTED ON EVERY INVOICE</small>
            <div>
              <span>
                <b>Zelle</b>732-606-7923
              </span>
              <span>
                <b>Credit card</b>Secure Cardknox link
              </span>
            </div>
          </div>
        )}
        {notice && <p className="invoiceNotice">{notice}</p>}
        {lastReceipt && (
          <div className="receiptReadyActions">
            <a
              className="receiptPreviewReady"
              target="_blank"
              rel="noreferrer"
              href={`/api/admin/invoice-pdf?id=${encodeURIComponent(lastReceipt.id)}&preview=1`}
            >
              View{' '}
              {lastReceipt.document_type === 'Donation Receipt'
                ? 'Receipt'
                : 'Invoice'}{' '}
              Preview
            </a>
            <a
              className="receiptDownloadReady"
              href={`/api/admin/invoice-pdf?id=${encodeURIComponent(lastReceipt.id)}`}
            >
              Download Final PDF
            </a>
          </div>
        )}
        <div className="invoiceEditorActions">
          <button className="primary" disabled={busy}>
            {busy
              ? 'Creating preview…'
              : editing
                ? 'Save Changes'
                : isReceipt
                  ? 'Create Receipt Preview'
                  : 'Create Invoice Preview'}
          </button>
          {editing && (
            <button
              type="button"
              onClick={() => {
                setEditing(null);
                setForm(blank());
              }}
            >
              Cancel edit
            </button>
          )}
        </div>
      </form>
      <section className="invoiceRecords">
        <div className="invoiceRecordsHead">
          <div>
            <p className="eyebrow gold">DOCUMENT HISTORY</p>
            <h2>Invoices & donation receipts</h2>
          </div>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search records…"
          />
        </div>
        {filtered.length ? (
          <div className="invoiceList">
            {filtered.map((item) => {
              const receipt = item.document_type === 'Donation Receipt';
              return (
                <article key={item.id}>
                  <div className="invoiceCardHead">
                    <span>
                      <small>
                        {receipt ? 'DONATION RECEIPT' : 'INVOICE'} ·{' '}
                        {item.invoice_number}
                      </small>
                      <b>{item.customer_name}</b>
                      {item.company && <em>{item.company}</em>}
                    </span>
                    <strong>${Number(item.amount).toFixed(2)}</strong>
                  </div>
                  <p>{item.description}</p>
                  <div className="invoiceDates">
                    <span>
                      {receipt ? 'Donated' : 'Issued'} <b>{item.issue_date}</b>
                    </span>
                    {receipt ? (
                      <span>
                        Method <b>{item.payment_method || 'Not specified'}</b>
                      </span>
                    ) : (
                      <span>
                        Due <b>{item.due_date || 'Upon receipt'}</b>
                      </span>
                    )}
                  </div>
                  <div className="invoiceCardActions">
                    <select
                      value={item.status}
                      onChange={(e) => status(item, e.target.value)}
                      aria-label={`Status for ${item.invoice_number}`}
                    >
                      {receipt ? (
                        <>
                          <option>Issued</option>
                          <option>Sent</option>
                          <option>Void</option>
                        </>
                      ) : (
                        <>
                          <option>Draft</option>
                          <option>Sent</option>
                          <option>Paid</option>
                          <option>Overdue</option>
                          <option>Void</option>
                        </>
                      )}
                    </select>
                    <a
                      target="_blank"
                      rel="noreferrer"
                      href={`/api/admin/invoice-pdf?id=${encodeURIComponent(item.id)}&preview=1`}
                    >
                      Preview
                    </a>
                    <a
                      className="invoicePdf"
                      href={`/api/admin/invoice-pdf?id=${encodeURIComponent(item.id)}`}
                    >
                      Download PDF
                    </a>
                    {item.customer_email && (
                      <a href={emailLink(item)}>Prepare email</a>
                    )}
                    <button onClick={() => edit(item)}>Edit</button>
                    <button
                      className="deleteButton"
                      onClick={() => remove(item)}
                    >
                      Delete
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="emptyState">
            <b>No matching records</b>
            <p>Create an invoice or donation receipt using the form.</p>
          </div>
        )}
      </section>
    </div>
  );
}
