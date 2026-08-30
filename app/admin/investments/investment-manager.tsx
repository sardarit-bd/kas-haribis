'use client';
import { FormEvent, useMemo, useState } from 'react';
type Item = {
  id: string;
  opportunity_name: string;
  sponsor_name: string;
  investment_type: string;
  description: string;
  minimum_investment: string;
  return_information: string;
  investment_term: string;
  location: string;
  availability_status: string;
  kosher_status: string;
  rabbinical_oversight: string;
  kosher_details: string;
  last_reviewed: string;
  risk_disclosure: string;
  contact_name: string;
  phone: string;
  email: string;
  opportunity_url: string;
  logo_url: string;
  public_notes: string;
  internal_notes: string;
  published: number;
  featured: number;
  sort_order: number;
};
const blank = (n: number): Item => ({
  id: '',
  opportunity_name: '',
  sponsor_name: '',
  investment_type: 'Real estate',
  description: '',
  minimum_investment: '',
  return_information: '',
  investment_term: '',
  location: '',
  availability_status: 'Open',
  kosher_status: 'Reviewed',
  rabbinical_oversight: '',
  kosher_details: '',
  last_reviewed: '',
  risk_disclosure: '',
  contact_name: '',
  phone: '',
  email: '',
  opportunity_url: '',
  logo_url: '',
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
          (x.opportunity_name + x.sponsor_name + x.investment_type + x.location)
            .toLowerCase()
            .includes(q.toLowerCase()),
        ),
      [items, q],
    );
  async function reload() {
    const j = (await fetch('/api/investment-opportunities').then((r) =>
      r.json(),
    )) as any;
    setItems(j.opportunities || []);
  }
  async function save(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    const f = e.currentTarget,
      d = Object.fromEntries(new FormData(f).entries()) as any;
    d.published = d.published === 'on';
    d.featured = d.featured === 'on';
    const r = await fetch('/api/investment-opportunities', {
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
      file = (f.elements.namedItem('logo_file') as HTMLInputElement)
        ?.files?.[0];
    if (file) {
      const fd = new FormData();
      fd.set('id', id);
      fd.set('file', file);
      const ur = await fetch('/api/admin/investment-logo', {
          method: 'POST',
          body: fd,
        }),
        uj = (await ur.json()) as any;
      if (!ur.ok) setMsg(`Opportunity saved, but image failed: ${uj.error}`);
    }
    await reload();
    setEditing(null);
    f.reset();
    setMsg(d.id ? 'Opportunity updated.' : 'Opportunity added.');
    setBusy(false);
  }
  async function remove(x: Item) {
    if (!confirm(`Remove ${x.opportunity_name}?`)) return;
    await fetch(
      `/api/investment-opportunities?id=${encodeURIComponent(x.id)}`,
      { method: 'DELETE' },
    );
    await reload();
    setEditing(null);
    setMsg(`${x.opportunity_name} was removed.`);
  }
  return (
    <div className="businessAdminLayout">
      <section className="businessEditorCard">
        <div className="bankEditorHeading">
          <div>
            <p className="eyebrow gold">
              {editing ? 'EDIT OPPORTUNITY' : 'NEW OPPORTUNITY'}
            </p>
            <h2>{editing ? editing.opportunity_name : 'Add an investment'}</h2>
          </div>
          {editing && (
            <button onClick={() => setEditing(null)}>← Back to list</button>
          )}
        </div>
        <form key={v.id || 'new'} onSubmit={save}>
          <input type="hidden" name="id" value={v.id} />
          <div className="businessFormGrid">
            <label>
              Opportunity name
              <input
                name="opportunity_name"
                defaultValue={v.opportunity_name}
                required
              />
            </label>
            <label>
              Sponsor or company
              <input name="sponsor_name" defaultValue={v.sponsor_name} />
            </label>
            <label>
              Investment type
              <select name="investment_type" defaultValue={v.investment_type}>
                <option>Real estate</option>
                <option>Business</option>
                <option>Private equity</option>
                <option>Private credit</option>
                <option>Fund</option>
                <option>Other</option>
              </select>
            </label>
            <label>
              Availability
              <select
                name="availability_status"
                defaultValue={v.availability_status}
              >
                <option>Open</option>
                <option>Limited availability</option>
                <option>Coming soon</option>
                <option>Fully subscribed</option>
                <option>Closed</option>
              </select>
            </label>
            <label>
              Minimum investment
              <input
                name="minimum_investment"
                defaultValue={v.minimum_investment}
                placeholder="$25,000"
              />
            </label>
            <label>
              Return information
              <input
                name="return_information"
                defaultValue={v.return_information}
                placeholder="Use sponsor-approved wording only"
              />
            </label>
            <label>
              Investment term
              <input
                name="investment_term"
                defaultValue={v.investment_term}
                placeholder="Example: 3–5 years"
              />
            </label>
            <label>
              Location
              <input name="location" defaultValue={v.location} />
            </label>
          </div>
          <label>
            Public description
            <textarea
              name="description"
              rows={5}
              defaultValue={v.description}
            />
          </label>
          <fieldset>
            <legend>Kosher review</legend>
            <div className="businessFormGrid">
              <label>
                Kosher status
                <select name="kosher_status" defaultValue={v.kosher_status}>
                  <option>Reviewed</option>
                  <option>Approved</option>
                  <option>Approved with conditions</option>
                  <option>Needs review</option>
                  <option>Not approved</option>
                </select>
              </label>
              <label>
                Rabbi / Bais Horaah oversight
                <input
                  name="rabbinical_oversight"
                  defaultValue={v.rabbinical_oversight}
                />
              </label>
              <label>
                Last reviewed
                <input
                  type="date"
                  name="last_reviewed"
                  defaultValue={v.last_reviewed}
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
              Kosher structure and conditions
              <textarea
                name="kosher_details"
                rows={5}
                defaultValue={v.kosher_details}
              />
            </label>
          </fieldset>
          <fieldset>
            <legend>Sponsor contact and link</legend>
            <div className="businessFormGrid">
              <label>
                Contact name
                <input name="contact_name" defaultValue={v.contact_name} />
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
                Opportunity details link
                <input
                  type="url"
                  name="opportunity_url"
                  defaultValue={v.opportunity_url}
                  placeholder="https://…"
                />
              </label>
              <label>
                Logo or image
                <input
                  type="file"
                  name="logo_file"
                  accept="image/png,image/jpeg,image/webp,image/gif"
                />
                <small>
                  {v.logo_url
                    ? 'Upload to replace current image.'
                    : 'Up to 5 MB.'}
                </small>
              </label>
            </div>
          </fieldset>
          <label>
            Risk disclosure
            <textarea
              name="risk_disclosure"
              rows={5}
              defaultValue={v.risk_disclosure}
            />
          </label>
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
              Featured
            </label>
          </div>
          {v.logo_url && (
            <img
              className="adminLogoPreview"
              src={v.logo_url}
              alt="Current image"
            />
          )}
          <div className="editFormActions">
            <button className="primary" disabled={busy}>
              {busy ? 'Saving…' : editing ? 'Save changes' : 'Add opportunity'}
            </button>
            {editing && (
              <button type="button" onClick={() => setEditing(null)}>
                Cancel
              </button>
            )}
          </div>
        </form>
        {msg && <p className="adminSaveMessage">{msg}</p>}
      </section>
      <section className="businessAdminList">
        <div className="bankListHeader">
          <div>
            <h2>All opportunities</h2>
            <span>{items.length} records</span>
          </div>
          <button
            className="primary"
            onClick={() => {
              setEditing(null);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          >
            + Add opportunity
          </button>
        </div>
        <label className="bankAdminSearch">
          Search
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Name, sponsor, type…"
          />
        </label>
        <div className="businessAdminRows">
          {filtered.map((x) => (
            <article key={x.id}>
              {x.logo_url ? (
                <img src={x.logo_url} alt="" />
              ) : (
                <span className="bankInitial">{x.opportunity_name[0]}</span>
              )}
              <div>
                <b>{x.opportunity_name}</b>
                <small>
                  {x.investment_type || 'Investment'} ·{' '}
                  {x.published ? 'Published' : 'Hidden'}
                  {x.featured ? ' · Featured' : ''}
                </small>
                <p>{x.sponsor_name || x.availability_status}</p>
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
