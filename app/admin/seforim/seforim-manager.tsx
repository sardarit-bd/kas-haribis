'use client';
import { FormEvent, useState } from 'react';
import type { SeferRecord } from '../../lib/seforim';
const formatOf = (x: SeferRecord) =>
  x.available && x.pdf_available
    ? 'both'
    : x.pdf_available
      ? 'pdf'
      : x.available
        ? 'book'
        : 'hidden';
export default function SeforimManager({
  initialBooks,
  initialDeliveryPrice = 0,
}: {
  initialBooks: SeferRecord[];
  initialDeliveryPrice?: number;
}) {
  const [books, setBooks] = useState(initialBooks),
    [editing, setEditing] = useState<SeferRecord | null>(null),
    [message, setMessage] = useState(''),
    [busy, setBusy] = useState(false);
  const [deliveryPrice, setDeliveryPrice] = useState(initialDeliveryPrice);
  const [deliveryInput, setDeliveryInput] = useState(
    initialDeliveryPrice.toFixed(2),
  );
  const [deliveryMessage, setDeliveryMessage] = useState('');
  const [deliveryBusy, setDeliveryBusy] = useState(false);

  async function saveDeliveryPrice(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setDeliveryBusy(true);
    setDeliveryMessage('Saving delivery price…');
    try {
      const res = await fetch('/api/seforim/delivery-pricing', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ deliveryPrice: Number(deliveryInput) }),
      });
      const data = (await res.json()) as any;
      if (!res.ok) {
        setDeliveryMessage(data.error || 'Could not save delivery price.');
        setDeliveryBusy(false);
        return;
      }
      setDeliveryPrice(data.deliveryPrice);
      setDeliveryInput(Number(data.deliveryPrice).toFixed(2));
      setDeliveryMessage('Delivery price saved successfully.');
    } catch {
      setDeliveryMessage('Failed to save delivery price.');
    } finally {
      setDeliveryBusy(false);
    }
  }

  async function reload() {
    const j = (await fetch('/api/seforim').then((r) => r.json())) as any;
    setBooks(j.books);
    return j.books as SeferRecord[];
  }
  async function sendPdf(id: string, file: File, display: boolean) {
    const r = await fetch(
        `/api/admin/seforim-pdf?id=${encodeURIComponent(id)}&display=${display ? 1 : 0}`,
        {
          method: 'POST',
          headers: {
            'content-type': 'application/pdf',
            'x-file-name': file.name,
          },
          body: file,
        },
      ),
      j = (await r.json()) as any;
    if (!r.ok) throw new Error(j.error || 'Could not upload PDF.');
  }
  async function save(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setMessage('Saving title…');
    const form = e.currentTarget,
      fd = new FormData(form),
      pdf = fd.get('pdf_file') as File | null,
      format = String(fd.get('sale_format') || 'hidden'),
      data = Object.fromEntries(fd.entries()) as any;
    delete data.pdf_file;
    delete data.sale_format;
    data.available = format === 'book' || format === 'both';
    data.pdf_display = format === 'pdf' || format === 'both';
    data.request_availability =
      fd.get('request_availability') === 'on' ||
      fd.get('request_availability') === '1' ||
      fd.get('request_availability') === 'true';
    data.sort_order = Number(data.sort_order || 0);
    data.pdf_price = Number(data.pdf_price || 0);
    if (data.pdf_display && !pdf?.size && !editing?.pdf_filename) {
      setMessage(
        'Choose a PDF file before displaying this title as a PDF Book.',
      );
      setBusy(false);
      return;
    }
    const creating = !data.id,
      r = await fetch('/api/seforim', {
        method: creating ? 'POST' : 'PUT',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(data),
      }),
      j = (await r.json()) as any;
    if (!r.ok) {
      setMessage(j.error || 'Could not save.');
      setBusy(false);
      return;
    }
    const id = creating ? j.id : data.id;
    try {
      if (pdf?.size) {
        setMessage('Uploading protected PDF…');
        await sendPdf(id, pdf, data.pdf_display);
      }
      if (!creating) {
        await fetch('/api/seforim', {
          method: 'PUT',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ ...data, id }),
        });
      }
    } catch (error) {
      setMessage(
        error instanceof Error
          ? `Title saved, but PDF failed: ${error.message}`
          : 'PDF upload failed.',
      );
      setBusy(false);
      await reload();
      return;
    }
    const list = await reload();
    if (creating) {
      form.reset();
      setEditing(null);
    } else setEditing(list.find((x) => x.id === id) || null);
    setMessage(
      pdf?.size
        ? 'Title and protected PDF saved.'
        : 'Display format and title saved.',
    );
    setBusy(false);
  }
  async function cover(id: string, file: File) {
    setBusy(true);
    const r = await fetch(`/api/seforim-cover?id=${encodeURIComponent(id)}`, {
        method: 'POST',
        headers: { 'content-type': file.type },
        body: file,
      }),
      j = (await r.json()) as any;
    if (!r.ok) {
      setMessage(j.error || 'Cover upload failed.');
      setBusy(false);
      return;
    }
    const list = await reload();
    setEditing(list.find((x) => x.id === id) || null);
    setMessage('Cover updated.');
    setBusy(false);
  }
  async function removePdf(id: string) {
    if (!confirm('Remove this PDF file?')) return;
    await fetch(`/api/admin/seforim-pdf?id=${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
    const list = await reload();
    setEditing(list.find((x) => x.id === id) || null);
    setMessage('PDF removed.');
  }
  async function remove(id: string) {
    if (!confirm('Remove this title?')) return;
    await fetch(`/api/seforim?id=${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
    setBooks((x) => x.filter((y) => y.id !== id));
    if (editing?.id === id) setEditing(null);
  }
  const v = editing || {
    id: '',
    title: '',
    price: 0,
    available: true,
    image: '',
    description: '',
    sort_order: books.length + 1,
    pdf_available: false,
    pdf_price: 0,
    pdf_filename: '',
    request_availability: false,
  };
  return (
    <div className="seforimManagerLayout">
      <div
        className="editorColumn"
        style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}
      >
        <section className="settingsCard">
          <div className="connectionStatus">
            <b>Global Delivery Pricing</b>
            <span className="ready">
              {deliveryPrice > 0
                ? `$${deliveryPrice.toFixed(2)} Flat Rate`
                : 'FREE Delivery'}
            </span>
          </div>
          <form onSubmit={saveDeliveryPrice}>
            <label>
              Global Delivery Price ($)
              <input
                type="number"
                min="0"
                max="1000"
                step="0.01"
                value={deliveryInput}
                onChange={(e) => setDeliveryInput(e.target.value)}
                placeholder="0.00"
                required
              />
              <small>
                Flat delivery fee applied once per order containing physical books. Set to 0.00 for Free Delivery. PDF downloads are never charged delivery.
              </small>
            </label>
            <button className="primary" disabled={deliveryBusy}>
              {deliveryBusy ? 'SAVING…' : 'UPDATE DELIVERY PRICE'}
            </button>
            {deliveryMessage && (
              <p className="adminSaveMessage">{deliveryMessage}</p>
            )}
          </form>
        </section>

        <section className="settingsCard stickyEditor">
          <div className="pdfAdminHeading">
            <div>
              <p className="eyebrow gold">PRINT & DIGITAL</p>
              <h2>{editing ? 'Edit title' : 'Add a new title'}</h2>
            </div>
            <span>PDF uploads are protected</span>
          </div>
          <form key={v.id || 'new'} onSubmit={save}>
            <input type="hidden" name="id" value={v.id} />
            <label>
              Book or PDF title
              <input name="title" defaultValue={v.title} dir="auto" required />
            </label>
            <label className="saleFormatChoice">
              <b>How should this title be displayed?</b>
              <select name="sale_format" defaultValue={formatOf(v)}>
                <option value="book">Printed Book Only</option>
                <option value="pdf">PDF Book Only</option>
                <option value="both">Printed Book and PDF</option>
                <option value="hidden">Hidden / Unavailable</option>
              </select>
              <small>
                This controls the exact format labels and purchase buttons shown
                in the public store.
              </small>
            </label>
            <div className="availabilityRequestsSection">
              <b className="sectionTitle">Availability requests</b>
              <label className="checkboxRow">
                <input
                  name="request_availability"
                  type="checkbox"
                  defaultChecked={Boolean(v.request_availability)}
                />
                <span>Show “Request availability” form</span>
              </label>
              <small className="explanationText">
                Visitors can send their contact details and the quantity needed. Requests appear in the backend.
              </small>
            </div>
            <div className="twoFields">
              <label>
                Printed book price ($)
                <input
                  name="price"
                  type="number"
                  min="0"
                  step="0.01"
                  defaultValue={v.price}
                  required
                />
              </label>
              <label>
                PDF price ($)
                <input
                  name="pdf_price"
                  type="number"
                  min="0"
                  step="0.01"
                  defaultValue={v.pdf_price}
                />
              </label>
            </div>
            <label className="mainPdfUpload">
              <b>{v.pdf_filename ? 'Replace PDF Book' : 'Upload PDF Book'}</b>
              <input name="pdf_file" type="file" accept="application/pdf" />
              <small>
                Required when selecting PDF Book Only or Printed Book and PDF.
                Maximum 30 MB.
              </small>
              {v.pdf_filename && (
                <em>Current protected file: {v.pdf_filename}</em>
              )}
            </label>
            <label>
              Display order
              <input
                name="sort_order"
                type="number"
                min="0"
                defaultValue={v.sort_order}
              />
            </label>
            <label>
              Description
              <textarea
                name="description"
                rows={5}
                defaultValue={v.description}
                dir="auto"
              />
            </label>
            <button className="primary" disabled={busy}>
              {busy ? 'SAVING…' : editing ? 'SAVE TITLE & FORMAT' : 'ADD TITLE'}
            </button>
            {editing && (
              <button
                type="button"
                className="cancelButton"
                onClick={() => setEditing(null)}
              >
                Cancel
              </button>
            )}
          </form>
          {editing && (
            <div className="bookFileUploads">
              <label className="coverUpload">
                Replace cover image
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={(e) =>
                    e.target.files?.[0] && cover(editing.id, e.target.files[0])
                  }
                />
              </label>
              {editing.pdf_filename && (
                <button
                  className="deleteButton removePdf"
                  onClick={() => removePdf(editing.id)}
                >
                  Remove PDF file
                </button>
              )}
            </div>
          )}
          <p className="adminSaveMessage">{message}</p>
        </section>
      </div>
      <section className="adminBookList">
        <div className="connectionStatus">
          <b>Catalog</b>
          <span className="ready">{books.length} titles</span>
        </div>
        {books.map((x) => (
          <article key={x.id}>
            <img src={x.image} alt="" />
            <div dir="auto">
              <b>{x.title}</b>
              <span>
                {formatOf(x) === 'both'
                  ? 'Printed Book and PDF'
                  : formatOf(x) === 'pdf'
                    ? 'PDF Book Only'
                    : formatOf(x) === 'book'
                      ? 'Printed Book Only'
                      : 'Hidden'}
              </span>
              <span>
                {x.available
                  ? x.request_availability
                    ? 'Book (Price on request)'
                    : `Book $${x.price.toFixed(2)}`
                  : ''}
                {x.available && x.pdf_available ? ' · ' : ''}
                {x.pdf_available ? `PDF $${x.pdf_price.toFixed(2)}` : ''}
              </span>
            </div>
            <button
              onClick={() => {
                setEditing(x);
                setMessage('');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            >
              Edit
            </button>
            <button className="deleteButton" onClick={() => remove(x.id)}>
              Remove
            </button>
          </article>
        ))}
      </section>
    </div>
  );
}
