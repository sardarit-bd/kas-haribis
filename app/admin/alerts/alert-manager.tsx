'use client';
import { FormEvent, useMemo, useState } from 'react';
type Item = {
  id: string;
  title: string;
  alert_date: string;
  category: string;
  severity: string;
  alert_status: string;
  reviewed_by: string;
  expires_at: string;
  summary: string;
  full_details: string;
  action_label: string;
  action_url: string;
  published: number;
  featured: number;
  sort_order: number;
};
const blank = (n: number): Item => ({
  id: '',
  title: '',
  alert_date: new Date().toISOString().slice(0, 10),
  category: 'General Alert',
  severity: 'Important',
  alert_status: 'Active',
  reviewed_by: 'Kav Haribis',
  expires_at: '',
  summary: '',
  full_details: '',
  action_label: '',
  action_url: '',
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
          (x.title + x.category + x.severity + x.alert_status)
            .toLowerCase()
            .includes(q.toLowerCase()),
        ),
      [items, q],
    );
  async function reload() {
    const j = (await fetch('/api/ribbis-alerts').then((r) => r.json())) as any;
    setItems(j.alerts || []);
  }
  async function save(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    const f = e.currentTarget,
      d = Object.fromEntries(new FormData(f).entries()) as any;
    d.published = d.published === 'on';
    d.featured = d.featured === 'on';
    const r = await fetch('/api/ribbis-alerts', {
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
    await reload();
    setEditing(null);
    f.reset();
    setMsg(d.id ? 'Alert updated.' : 'Alert added.');
    setBusy(false);
  }
  async function remove(x: Item) {
    if (!confirm(`Remove ${x.title}?`)) return;
    await fetch(`/api/ribbis-alerts?id=${encodeURIComponent(x.id)}`, {
      method: 'DELETE',
    });
    await reload();
    setEditing(null);
    setMsg(`${x.title} was removed.`);
  }
  return (
    <div className="businessAdminLayout">
      <section className="businessEditorCard">
        <div className="bankEditorHeading">
          <div>
            <p className="eyebrow gold">
              {editing ? 'EDIT ALERT' : 'NEW ALERT'}
            </p>
            <h2>{editing ? editing.title : 'Publish a Ribbis alert'}</h2>
          </div>
          {editing && (
            <button onClick={() => setEditing(null)}>← Back to list</button>
          )}
        </div>
        <form key={v.id || 'new'} onSubmit={save}>
          <input type="hidden" name="id" value={v.id} />
          <div className="businessFormGrid">
            <label>
              Alert title
              <input name="title" defaultValue={v.title} required />
            </label>
            <label>
              Alert date
              <input
                type="date"
                name="alert_date"
                defaultValue={v.alert_date}
              />
            </label>
            <label>
              Category
              <select name="category" defaultValue={v.category}>
                <option>General Alert</option>
                <option>Heter Iska</option>
                <option>Loans</option>
                <option>Banks</option>
                <option>Business</option>
                <option>Investments</option>
                <option>Directory Update</option>
                <option>Community Notice</option>
              </select>
            </label>
            <label>
              Color / severity
              <select name="severity" defaultValue={v.severity}>
                <option>Urgent</option>
                <option>Important</option>
                <option>Update</option>
                <option>Information</option>
              </select>
            </label>
            <label>
              Alert status
              <select name="alert_status" defaultValue={v.alert_status}>
                <option>Active</option>
                <option>Resolved</option>
                <option>Archived</option>
              </select>
            </label>
            <label>
              Reviewed by
              <input name="reviewed_by" defaultValue={v.reviewed_by} />
            </label>
            <label>
              Review or expiration date
              <input
                type="date"
                name="expires_at"
                defaultValue={v.expires_at}
              />
              <small>
                Use this to know when the alert should be reviewed or archived.
              </small>
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
            Short summary
            <textarea
              name="summary"
              rows={4}
              defaultValue={v.summary}
              required
            />
            <small>Displayed on the alert card.</small>
          </label>
          <label>
            Full alert details
            <textarea
              name="full_details"
              rows={7}
              defaultValue={v.full_details}
            />
            <small>Displayed in the full-alert popup.</small>
          </label>
          <fieldset>
            <legend>Optional action link</legend>
            <div className="businessFormGrid">
              <label>
                Button wording
                <input name="action_label" defaultValue={v.action_label} />
              </label>
              <label>
                Link
                <input
                  name="action_url"
                  defaultValue={v.action_url}
                  placeholder="/heter-iska or https://…"
                />
              </label>
            </div>
          </fieldset>
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
              Show as top featured alert
            </label>
          </div>
          <div className="editFormActions">
            <button className="primary" disabled={busy}>
              {busy ? 'Saving…' : editing ? 'Save changes' : 'Publish alert'}
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
            <h2>All alerts</h2>
            <span>{items.length} records</span>
          </div>
          <button
            className="primary"
            onClick={() => {
              setEditing(null);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          >
            + Add alert
          </button>
        </div>
        <label className="bankAdminSearch">
          Search
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Title, category, status…"
          />
        </label>
        <div className="businessAdminRows">
          {filtered.map((x) => (
            <article key={x.id}>
              <span className="bankInitial">!</span>
              <div>
                <b>{x.title}</b>
                <small>
                  {x.category} · {x.severity} · {x.alert_status || 'Active'} ·{' '}
                  {x.published ? 'Published' : 'Hidden'}
                  {x.featured ? ' · Featured' : ''}
                </small>
                <p>{x.alert_date || 'No date'}</p>
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
