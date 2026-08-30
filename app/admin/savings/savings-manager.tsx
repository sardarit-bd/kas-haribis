'use client';
import { FormEvent, useMemo, useState } from 'react';
type Item = {
  id: string;
  institution_name: string;
  account_name: string;
  description: string;
  apy: string;
  minimum_deposit: string;
  monthly_fee: string;
  fdic_status: string;
  kosher_status: string;
  kosher_details: string;
  last_reviewed: string;
  open_account_url: string;
  website: string;
  logo_url: string;
  public_notes: string;
  internal_notes: string;
  published: number;
  featured: number;
  sort_order: number;
};
const blank = (n: number): Item => ({
  id: '',
  institution_name: '',
  account_name: 'High-Yield Savings Account',
  description: '',
  apy: '',
  minimum_deposit: '',
  monthly_fee: '',
  fdic_status: 'FDIC insured',
  kosher_status: 'Reviewed',
  kosher_details: '',
  last_reviewed: '',
  open_account_url: '',
  website: '',
  logo_url: '',
  public_notes: '',
  internal_notes: '',
  published: 1,
  featured: 0,
  sort_order: n,
});
export default function SavingsManager({
  initialItems,
}: {
  initialItems: Item[];
}) {
  const [items, setItems] = useState(initialItems),
    [editing, setEditing] = useState<Item | null>(null),
    [q, setQ] = useState(''),
    [msg, setMsg] = useState(''),
    [busy, setBusy] = useState(false);
  const v = editing || blank(items.length + 1),
    filtered = useMemo(
      () =>
        items.filter((x) =>
          (x.institution_name + x.account_name + x.kosher_status)
            .toLowerCase()
            .includes(q.toLowerCase()),
        ),
      [items, q],
    );
  async function reload() {
    const j = (await fetch('/api/savings-accounts').then((r) =>
      r.json(),
    )) as any;
    setItems(j.accounts || []);
  }
  async function save(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    const form = e.currentTarget,
      d = Object.fromEntries(new FormData(form).entries()) as any;
    d.published = d.published === 'on';
    d.featured = d.featured === 'on';
    const r = await fetch('/api/savings-accounts', {
        method: d.id ? 'PUT' : 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(d),
      }),
      j = (await r.json()) as any;
    if (!r.ok) {
      setMsg(j.error || 'Could not save the account.');
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
      const ur = await fetch('/api/admin/savings-logo', {
          method: 'POST',
          body: fd,
        }),
        uj = (await ur.json()) as any;
      if (!ur.ok) setMsg(`Account saved, but logo failed: ${uj.error}`);
    }
    await reload();
    setEditing(null);
    form.reset();
    setMsg(d.id ? 'Savings account updated.' : 'Savings account added.');
    setBusy(false);
  }
  async function remove(x: Item) {
    if (!confirm(`Remove ${x.institution_name}?`)) return;
    await fetch(`/api/savings-accounts?id=${encodeURIComponent(x.id)}`, {
      method: 'DELETE',
    });
    await reload();
    setEditing(null);
    setMsg(`${x.institution_name} was removed.`);
  }
  return (
    <div className="businessAdminLayout">
      <section className="businessEditorCard">
        <div className="bankEditorHeading">
          <div>
            <p className="eyebrow gold">
              {editing ? 'EDIT SAVINGS ACCOUNT' : 'NEW SAVINGS ACCOUNT'}
            </p>
            <h2>{editing ? editing.institution_name : 'Add an account'}</h2>
          </div>
          {editing && (
            <button onClick={() => setEditing(null)}>← Back to list</button>
          )}
        </div>
        <form key={v.id || 'new'} onSubmit={save}>
          <input type="hidden" name="id" value={v.id} />
          <div className="businessFormGrid">
            <label>
              Bank or institution name
              <input
                name="institution_name"
                defaultValue={v.institution_name}
                required
              />
            </label>
            <label>
              Account name
              <input name="account_name" defaultValue={v.account_name} />
            </label>
            <label>
              Current APY
              <input
                name="apy"
                defaultValue={v.apy}
                placeholder="Example: 4.25%"
              />
            </label>
            <label>
              Minimum opening deposit
              <input
                name="minimum_deposit"
                defaultValue={v.minimum_deposit}
                placeholder="Example: $0 or $500"
              />
            </label>
            <label>
              Monthly fee
              <input
                name="monthly_fee"
                defaultValue={v.monthly_fee}
                placeholder="Example: None"
              />
            </label>
            <label>
              Deposit insurance
              <input
                name="fdic_status"
                defaultValue={v.fdic_status}
                placeholder="FDIC insured"
              />
            </label>
          </div>
          <label>
            Public description
            <textarea
              name="description"
              rows={4}
              defaultValue={v.description}
            />
          </label>
          <fieldset>
            <legend>Kosher review information</legend>
            <div className="businessFormGrid">
              <label>
                Kosher status
                <select name="kosher_status" defaultValue={v.kosher_status}>
                  <option>Reviewed</option>
                  <option>Approved</option>
                  <option>Approved with conditions</option>
                  <option>Needs current verification</option>
                  <option>Not recommended</option>
                </select>
              </label>
              <label>
                Last reviewed
                <input
                  type="date"
                  name="last_reviewed"
                  defaultValue={v.last_reviewed}
                />
              </label>
            </div>
            <label>
              Kosher details
              <textarea
                name="kosher_details"
                rows={5}
                defaultValue={v.kosher_details}
                placeholder="Explain the relevant structure, conditions, Heter Iska, or limitations."
              />
            </label>
          </fieldset>
          <fieldset>
            <legend>Links and display</legend>
            <div className="businessFormGrid">
              <label>
                Open an Account link
                <input
                  type="url"
                  name="open_account_url"
                  defaultValue={v.open_account_url}
                  placeholder="https://bank.com/open-account"
                />
                <small>This powers the public Open an Account button.</small>
              </label>
              <label>
                Institution website
                <input
                  type="url"
                  name="website"
                  defaultValue={v.website}
                  placeholder="https://bank.com"
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
              <label>
                Institution logo
                <input
                  type="file"
                  name="logo_file"
                  accept="image/png,image/jpeg,image/webp,image/gif"
                />
                <small>
                  {v.logo_url
                    ? 'Upload to replace the current logo.'
                    : 'PNG, JPG, WEBP or GIF up to 5 MB.'}
                </small>
              </label>
            </div>
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
            <small>Never displayed publicly.</small>
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
              alt="Current logo"
            />
          )}
          <div className="editFormActions">
            <button className="primary" disabled={busy}>
              {busy
                ? 'Saving…'
                : editing
                  ? 'Save changes'
                  : 'Add savings account'}
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
            <h2>All savings accounts</h2>
            <span>{items.length} records</span>
          </div>
          <button
            className="primary"
            onClick={() => {
              setEditing(null);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          >
            + Add account
          </button>
        </div>
        <label className="bankAdminSearch">
          Search
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Institution or account…"
          />
        </label>
        <div className="businessAdminRows">
          {filtered.map((x) => (
            <article key={x.id}>
              {x.logo_url ? (
                <img src={x.logo_url} alt="" />
              ) : (
                <span className="bankInitial">{x.institution_name[0]}</span>
              )}
              <div>
                <b>{x.institution_name}</b>
                <small>
                  {x.account_name || 'Savings account'} ·{' '}
                  {x.published ? 'Published' : 'Hidden'}
                  {x.featured ? ' · Featured' : ''}
                </small>
                <p>
                  {x.apy ? `${x.apy} APY · ` : ''}
                  {x.kosher_status}
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
