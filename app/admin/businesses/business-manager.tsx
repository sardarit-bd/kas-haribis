'use client';
import { FormEvent, useMemo, useState } from 'react';
type Business = {
  id: string;
  name: string;
  category: string;
  description: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  phone: string;
  email: string;
  website: string;
  logo_url: string;
  iska_authority: string;
  iska_details: string;
  verification_status: string;
  last_verified: string;
  public_notes: string;
  internal_notes: string;
  source_url: string;
  published: number;
  sort_order: number;
};
const blank = (order: number): Business => ({
  id: '',
  name: '',
  category: '',
  description: '',
  address: '',
  city: '',
  state: '',
  zip: '',
  phone: '',
  email: '',
  website: '',
  logo_url: '',
  iska_authority: '',
  iska_details: '',
  verification_status: 'Verified',
  last_verified: '',
  public_notes: '',
  internal_notes: '',
  source_url: '',
  published: 1,
  sort_order: order,
});
export default function BusinessManager({
  initialBusinesses,
}: {
  initialBusinesses: Business[];
}) {
  const [items, setItems] = useState(initialBusinesses),
    [editing, setEditing] = useState<Business | null>(null),
    [query, setQuery] = useState(''),
    [message, setMessage] = useState(''),
    [busy, setBusy] = useState(false);
  const value = editing || blank(items.length + 1),
    filtered = useMemo(
      () =>
        items.filter((x) =>
          (x.name + ' ' + x.category + ' ' + x.city)
            .toLowerCase()
            .includes(query.toLowerCase()),
        ),
      [items, query],
    );
  async function reload() {
    const j = (await fetch('/api/businesses').then((r) => r.json())) as any;
    setItems(j.businesses || []);
  }
  async function save(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    const form = e.currentTarget,
      data = Object.fromEntries(new FormData(form).entries()) as any;
    data.published = data.published === 'on';
    const r = await fetch('/api/businesses', {
        method: data.id ? 'PUT' : 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(data),
      }),
      j = (await r.json()) as any;
    if (!r.ok) {
      setMessage(j.error || 'Could not save.');
      setBusy(false);
      return;
    }
    const id = data.id || j.id,
      file = (form.elements.namedItem('logo_file') as HTMLInputElement)
        ?.files?.[0];
    if (file) {
      const fd = new FormData();
      fd.set('id', id);
      fd.set('file', file);
      const upload = await fetch('/api/admin/business-logo', {
          method: 'POST',
          body: fd,
        }),
        uj = (await upload.json()) as any;
      if (!upload.ok)
        setMessage(
          `Business saved, but logo failed: ${uj.error || 'upload error'}`,
        );
    }
    await reload();
    setEditing(null);
    form.reset();
    setMessage(
      data.id
        ? 'Business updated and published settings saved.'
        : 'Business added to the directory.',
    );
    setBusy(false);
  }
  async function remove(x: Business) {
    if (!confirm(`Remove ${x.name}?`)) return;
    await fetch(`/api/businesses?id=${encodeURIComponent(x.id)}`, {
      method: 'DELETE',
    });
    await reload();
    if (editing?.id === x.id) setEditing(null);
    setMessage(`${x.name} was removed.`);
  }
  function edit(x: Business) {
    setEditing(x);
    setMessage('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  return (
    <div className="businessAdminLayout">
      <section className="businessEditorCard">
        <div className="bankEditorHeading">
          <div>
            <p className="eyebrow gold">
              {editing ? 'EDIT BUSINESS' : 'NEW BUSINESS'}
            </p>
            <h2>{editing ? editing.name : 'Add a business'}</h2>
          </div>
          {editing && (
            <button onClick={() => setEditing(null)}>← Back to list</button>
          )}
        </div>
        <form key={value.id || 'new'} onSubmit={save}>
          <input type="hidden" name="id" value={value.id} />
          <div className="businessFormGrid">
            <label>
              Business name
              <input name="name" defaultValue={value.name} required />
            </label>
            <label>
              Category
              <input
                name="category"
                defaultValue={value.category}
                placeholder="Furniture, appliance, retail…"
              />
            </label>
          </div>
          <label>
            Description
            <textarea
              name="description"
              rows={4}
              defaultValue={value.description}
            />
          </label>
          <fieldset>
            <legend>Contact and location</legend>
            <div className="businessFormGrid">
              <label>
                Street address
                <input name="address" defaultValue={value.address} />
              </label>
              <label>
                City
                <input name="city" defaultValue={value.city} />
              </label>
              <label>
                State
                <input name="state" defaultValue={value.state} />
              </label>
              <label>
                ZIP code
                <input name="zip" defaultValue={value.zip} />
              </label>
              <label>
                Phone
                <input name="phone" defaultValue={value.phone} />
              </label>
              <label>
                Email
                <input type="email" name="email" defaultValue={value.email} />
              </label>
              <label>
                Website
                <input
                  name="website"
                  defaultValue={value.website}
                  placeholder="https://…"
                />
              </label>
              <label>
                Original listing/source URL
                <input name="source_url" defaultValue={value.source_url} />
              </label>
            </div>
          </fieldset>
          <fieldset>
            <legend>Heter Iska and verification</legend>
            <div className="businessFormGrid">
              <label>
                Rabbi / issuing authority
                <input
                  name="iska_authority"
                  defaultValue={value.iska_authority}
                />
              </label>
              <label>
                Verification status
                <select
                  name="verification_status"
                  defaultValue={value.verification_status}
                >
                  <option>Verified</option>
                  <option>Current</option>
                  <option>Needs review</option>
                  <option>Expired</option>
                </select>
              </label>
              <label>
                Last verified
                <input
                  type="date"
                  name="last_verified"
                  defaultValue={value.last_verified}
                />
              </label>
              <label>
                Display order
                <input
                  type="number"
                  name="sort_order"
                  defaultValue={value.sort_order}
                />
              </label>
            </div>
            <label>
              Heter Iska details
              <textarea
                name="iska_details"
                rows={4}
                defaultValue={value.iska_details}
                placeholder="Document type, coverage, limitations, and relevant details."
              />
            </label>
          </fieldset>
          <label>
            Public notes
            <textarea
              name="public_notes"
              rows={3}
              defaultValue={value.public_notes}
            />
            <small>Shown to visitors on the directory card.</small>
          </label>
          <label>
            Private administrator notes
            <textarea
              name="internal_notes"
              rows={3}
              defaultValue={value.internal_notes}
            />
            <small>Never shown on the public website.</small>
          </label>
          <div className="businessFormGrid">
            <label>
              Business logo
              <input
                name="logo_file"
                type="file"
                accept="image/png,image/jpeg,image/webp,image/gif"
              />
              <small>
                {value.logo_url
                  ? 'Upload only to replace the current logo.'
                  : 'PNG, JPG, WEBP or GIF, up to 5 MB.'}
              </small>
            </label>
            <label className="publishToggle">
              <input
                type="checkbox"
                name="published"
                defaultChecked={Boolean(value.published)}
              />
              <span>Published on the website</span>
            </label>
          </div>
          {value.logo_url && (
            <img
              className="adminLogoPreview"
              src={value.logo_url}
              alt="Current logo"
            />
          )}
          <div className="editFormActions">
            <button className="primary" disabled={busy}>
              {busy ? 'Saving…' : editing ? 'Save all changes' : 'Add business'}
            </button>
            {editing && (
              <button type="button" onClick={() => setEditing(null)}>
                Cancel editing
              </button>
            )}
          </div>
        </form>
        {message && <p className="adminSaveMessage">{message}</p>}
      </section>
      <section className="businessAdminList">
        <div className="bankListHeader">
          <div>
            <h2>All businesses</h2>
            <span>{items.length} records</span>
          </div>
          <button
            className="primary"
            onClick={() => {
              setEditing(null);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          >
            + Add business
          </button>
        </div>
        <label className="bankAdminSearch">
          Search businesses
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Name, category, or city…"
          />
        </label>
        <div className="businessAdminRows">
          {filtered.map((x) => (
            <article key={x.id}>
              {x.logo_url ? (
                <img src={x.logo_url} alt="" />
              ) : (
                <span className="bankInitial">{x.name[0]}</span>
              )}
              <div>
                <b>{x.name}</b>
                <small>
                  {x.category || 'No category'} ·{' '}
                  {x.published ? 'Published' : 'Hidden'}
                </small>
                <p>{x.city || x.description || 'No details added yet.'}</p>
              </div>
              <div className="bankRowActions">
                <button onClick={() => edit(x)}>Edit</button>
                <button className="deleteButton" onClick={() => remove(x)}>
                  Remove
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
