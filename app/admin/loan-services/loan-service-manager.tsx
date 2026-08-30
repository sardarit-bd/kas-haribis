'use client';
import { FormEvent, useMemo, useState } from 'react';
type Item = {
  id: string;
  name: string;
  contact_name: string;
  service_type: string;
  description: string;
  specialties: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  service_area: string;
  phone: string;
  email: string;
  website: string;
  logo_url: string;
  rabbinical_oversight: string;
  kosher_details: string;
  verification_status: string;
  last_verified: string;
  public_notes: string;
  internal_notes: string;
  published: number;
  featured: number;
  sort_order: number;
};
const blank = (n: number): Item => ({
  id: '',
  name: '',
  contact_name: '',
  service_type: 'Mortgage broker',
  description: '',
  specialties: '',
  address: '',
  city: '',
  state: '',
  zip: '',
  service_area: '',
  phone: '',
  email: '',
  website: '',
  logo_url: '',
  rabbinical_oversight: '',
  kosher_details: '',
  verification_status: 'Verified',
  last_verified: '',
  public_notes: '',
  internal_notes: '',
  published: 1,
  featured: 0,
  sort_order: n,
});
export default function Manager({ initialItems }: { initialItems: Item[] }) {
  const [items, setItems] = useState(initialItems),
    [editing, setEditing] = useState<Item | null>(null),
    [q, setQ] = useState(''),
    [msg, setMsg] = useState(''),
    [busy, setBusy] = useState(false);
  const v = editing || blank(items.length + 1),
    filtered = useMemo(
      () =>
        items.filter((x) =>
          (x.name + x.contact_name + x.service_type + x.city)
            .toLowerCase()
            .includes(q.toLowerCase()),
        ),
      [items, q],
    );
  async function reload() {
    const j = (await fetch('/api/loan-services').then((r) => r.json())) as any;
    setItems(j.services || []);
  }
  async function save(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    const form = e.currentTarget,
      d = Object.fromEntries(new FormData(form).entries()) as any;
    d.published = d.published === 'on';
    d.featured = d.featured === 'on';
    const r = await fetch('/api/loan-services', {
        method: d.id ? 'PUT' : 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(d),
      }),
      j = (await r.json()) as any;
    if (!r.ok) {
      setMsg(j.error || 'Could not save.');
      setBusy(false);
      return;
    }
    const id = d.id || j.id,
      file = (form.elements.namedItem('logo_file') as HTMLInputElement)
        ?.files?.[0];
    if (file) {
      const fd = new FormData();
      fd.set('id', id);
      fd.set('file', file);
      const ur = await fetch('/api/admin/loan-service-logo', {
          method: 'POST',
          body: fd,
        }),
        uj = (await ur.json()) as any;
      if (!ur.ok) setMsg(`Listing saved, but logo failed: ${uj.error}`);
    }
    await reload();
    setEditing(null);
    form.reset();
    setMsg(d.id ? 'Loan service updated.' : 'Loan service added.');
    setBusy(false);
  }
  async function remove(x: Item) {
    if (!confirm(`Remove ${x.name}?`)) return;
    await fetch(`/api/loan-services?id=${encodeURIComponent(x.id)}`, {
      method: 'DELETE',
    });
    await reload();
    setEditing(null);
    setMsg(`${x.name} was removed.`);
  }
  return (
    <div className="businessAdminLayout">
      <section className="businessEditorCard">
        <div className="bankEditorHeading">
          <div>
            <p className="eyebrow gold">
              {editing ? 'EDIT LOAN SERVICE' : 'NEW LOAN SERVICE'}
            </p>
            <h2>{editing ? editing.name : 'Add a broker or service'}</h2>
          </div>
          {editing && (
            <button onClick={() => setEditing(null)}>← Back to list</button>
          )}
        </div>
        <form key={v.id || 'new'} onSubmit={save}>
          <input type="hidden" name="id" value={v.id} />
          <div className="businessFormGrid">
            <label>
              Company or broker name
              <input name="name" defaultValue={v.name} required />
            </label>
            <label>
              Contact person
              <input name="contact_name" defaultValue={v.contact_name} />
              <label>
                Service type
                <select name="service_type" defaultValue={v.service_type}>
                  <option>Mortgage broker</option>
                  <option>Loan broker</option>
                  <option>Commercial financing</option>
                  <option>Private lending</option>
                  <option>Business financing</option>
                  <option>Other</option>
                </select>
              </label>
              <label>
                Specialties
                <input
                  name="specialties"
                  defaultValue={v.specialties}
                  placeholder="Residential, commercial, bridge loans…"
                />
              </label>
            </label>
          </div>
          <label>
            Description
            <textarea
              name="description"
              rows={4}
              defaultValue={v.description}
            />
          </label>
          <fieldset>
            <legend>Contact and service area</legend>
            <div className="businessFormGrid">
              <label>
                Street address
                <input name="address" defaultValue={v.address} />
              </label>
              <label>
                City
                <input name="city" defaultValue={v.city} />
              </label>
              <label>
                State
                <input name="state" defaultValue={v.state} />
              </label>
              <label>
                ZIP code
                <input name="zip" defaultValue={v.zip} />
              </label>
              <label>
                Service area
                <input
                  name="service_area"
                  defaultValue={v.service_area}
                  placeholder="New York and New Jersey"
                />
              </label>
              <label>
                Phone
                <input name="phone" defaultValue={v.phone} />
              </label>
              <label>
                Email
                <input type="email" name="email" defaultValue={v.email} />
              </label>
              <label>
                Website
                <input
                  name="website"
                  defaultValue={v.website}
                  placeholder="https://…"
                />
              </label>
            </div>
          </fieldset>
          <fieldset>
            <legend>Kosher loan information</legend>
            <div className="businessFormGrid">
              <label>
                Rabbi / Bais Horaah oversight
                <input
                  name="rabbinical_oversight"
                  defaultValue={v.rabbinical_oversight}
                />
              </label>
              <label>
                Verification status
                <select
                  name="verification_status"
                  defaultValue={v.verification_status}
                >
                  <option>Verified</option>
                  <option>Approved with conditions</option>
                  <option>Needs review</option>
                  <option>Not currently verified</option>
                </select>
              </label>
              <label>
                Last verified
                <input
                  type="date"
                  name="last_verified"
                  defaultValue={v.last_verified}
                />
              </label>
              <label>
                Display order
                <input
                  type="number"
                  name="sort_order"
                  defaultValue={v.sort_order}
                />
              </label>
            </div>
            <label>
              Kosher loan / Heter Iska details
              <textarea
                name="kosher_details"
                rows={5}
                defaultValue={v.kosher_details}
                placeholder="Explain the oversight, required Heter Iska, conditions, or limitations."
              />
            </label>
          </fieldset>
          <label>
            Public note
            <textarea
              name="public_notes"
              rows={3}
              defaultValue={v.public_notes}
            />
          </label>
          <label>
            Private administrator notes
            <textarea
              name="internal_notes"
              rows={3}
              defaultValue={v.internal_notes}
            />
            <small>Never shown publicly.</small>
          </label>
          <div className="businessFormGrid">
            <label>
              Company logo
              <input
                type="file"
                name="logo_file"
                accept="image/png,image/jpeg,image/webp,image/gif"
              />
              <small>
                {v.logo_url
                  ? 'Upload to replace the current logo.'
                  : 'Up to 5 MB.'}
              </small>
            </label>
            <div className="adminSwitches">
              <label>
                <input
                  type="checkbox"
                  name="published"
                  defaultChecked={Boolean(v.published)}
                />{' '}
                Published
              </label>
              <label>
                <input
                  type="checkbox"
                  name="featured"
                  defaultChecked={Boolean(v.featured)}
                />{' '}
                Featured listing
              </label>
            </div>
          </div>
          {v.logo_url && (
            <img
              className="adminLogoPreview"
              src={v.logo_url}
              alt="Current logo"
            />
          )}
          <div className="editFormActions">
            <button className="primary" disabled={busy}>
              {busy ? 'Saving…' : editing ? 'Save changes' : 'Add loan service'}
            </button>
            {editing && (
              <button type="button" onClick={() => setEditing(null)}>
                Cancel editing
              </button>
            )}
          </div>
        </form>
        {msg && <p className="adminSaveMessage">{msg}</p>}
      </section>
      <section className="businessAdminList">
        <div className="bankListHeader">
          <div>
            <h2>All loan services</h2>
            <span>{items.length} records</span>
          </div>
          <button
            className="primary"
            onClick={() => {
              setEditing(null);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          >
            + Add service
          </button>
        </div>
        <label className="bankAdminSearch">
          Search
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Company, contact, city…"
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
                  {x.service_type || 'Loan service'} ·{' '}
                  {x.published ? 'Published' : 'Hidden'}
                  {x.featured ? ' · Featured' : ''}
                </small>
                <p>
                  {[x.city, x.state].filter(Boolean).join(', ') ||
                    x.contact_name ||
                    'No contact details'}
                </p>
              </div>
              <div className="bankRowActions">
                <button
                  onClick={() => {
                    setEditing(x);
                    setMsg('');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                >
                  Edit
                </button>
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
