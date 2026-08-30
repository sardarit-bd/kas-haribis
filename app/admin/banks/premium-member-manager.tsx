'use client';
import { FormEvent, useState } from 'react';
type Member = {
  id: string;
  email: string;
  name: string;
  active: number;
  access_type: string;
  expires_at: string;
  notes: string;
  created_at: string;
  updated_at: string;
  last_login_at: string;
  login_count: number;
};
const blank = {
  id: '',
  email: '',
  name: '',
  active: 1,
  access_type: 'permanent',
  expires_at: '',
  notes: '',
  created_at: '',
  updated_at: '',
  last_login_at: '',
  login_count: 0,
};
export default function PremiumMemberManager({
  initialMembers,
}: {
  initialMembers: Member[];
}) {
  const [members, setMembers] = useState(initialMembers),
    [editing, setEditing] = useState<Member | null>(null),
    [message, setMessage] = useState(''),
    [busy, setBusy] = useState(false),
    value = editing || blank;
  async function reload() {
    const result = (await fetch('/api/admin/bank-premium-members').then((r) =>
      r.json(),
    )) as any;
    setMembers(result.members || []);
  }
  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setMessage('Saving premium member…');
    const form = event.currentTarget,
      data = Object.fromEntries(new FormData(form).entries()) as any;
    data.active = data.active === 'on';
    try {
      const response = await fetch('/api/admin/bank-premium-members', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify(data),
        }),
        result = (await response.json()) as any;
      if (!response.ok)
        throw new Error(result.error || 'Could not save the member.');
      await reload();
      setEditing(null);
      form.reset();
      setMessage(
        data.active
          ? 'Premium member saved and access is active.'
          : 'Premium member saved as inactive.',
      );
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : 'Could not save the member.',
      );
    } finally {
      setBusy(false);
    }
  }
  async function toggle(member: Member) {
    const response = await fetch('/api/admin/bank-premium-members', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ ...member, active: !member.active }),
    });
    if (response.ok) {
      await reload();
      setMessage(
        member.active
          ? `${member.name}'s access was deactivated.`
          : `${member.name}'s access was activated.`,
      );
    }
  }
  async function remove(member: Member) {
    if (
      !confirm(
        `Remove ${member.name}? Their premium access will stop immediately.`,
      )
    )
      return;
    await fetch(
      `/api/admin/bank-premium-members?id=${encodeURIComponent(member.id)}`,
      { method: 'DELETE' },
    );
    await reload();
    setEditing(null);
    setMessage('Premium member removed.');
  }
  return (
    <section className="premiumAdmin">
      <div className="premiumAdminHeading">
        <div>
          <p className="eyebrow gold">DIRECTORY-WIDE ACCESS</p>
          <h2>Premium members</h2>
          <p>
            Create individual login accounts that can open every protected bank
            report.
          </p>
        </div>
        <span>{members.filter((x) => x.active).length} active</span>
      </div>
      <div className="premiumAdminGrid">
        <form key={value.id || 'new'} onSubmit={save}>
          <h3>{editing ? `Edit ${editing.name}` : 'Add premium member'}</h3>
          <label>
            Member name
            <input name="name" defaultValue={value.name} required />
          </label>
          <label>
            Login email
            <input
              name="email"
              type="email"
              defaultValue={value.email}
              required
            />
          </label>
          <label>
            {editing
              ? 'New password (leave blank to keep current password)'
              : 'Password'}
            <input
              name="password"
              type="password"
              minLength={8}
              required={!editing}
              autoComplete="new-password"
            />
            <small>
              At least 8 characters. Passwords are securely protected and cannot
              be viewed later.
            </small>
          </label>
          <div className="premiumAdminTwo">
            <label>
              Access type
              <select name="access_type" defaultValue={value.access_type}>
                <option value="permanent">Permanent until deactivated</option>
                <option value="temporary">Temporary</option>
              </select>
            </label>
            <label>
              Expiration date
              <input
                name="expires_at"
                type="datetime-local"
                defaultValue={value.expires_at?.slice(0, 16)}
              />
            </label>
          </div>
          <label>
            Private notes
            <textarea name="notes" rows={3} defaultValue={value.notes} />
          </label>
          <label className="premiumActive">
            <input
              name="active"
              type="checkbox"
              defaultChecked={Boolean(value.active)}
            />{' '}
            Account is active
          </label>
          <div>
            <button className="primary" disabled={busy}>
              {busy
                ? 'Saving…'
                : editing
                  ? 'Save member changes'
                  : 'Create premium member'}
            </button>
            {editing && (
              <button type="button" onClick={() => setEditing(null)}>
                Cancel
              </button>
            )}
          </div>
          {message && <p className="adminSaveMessage">{message}</p>}
        </form>
        <div className="premiumMemberList">
          {members.length === 0 ? (
            <div className="emptyState">
              <b>No premium members yet</b>
              <p>Create the first account using the form.</p>
            </div>
          ) : (
            members.map((member) => (
              <article key={member.id}>
                <div>
                  <b>{member.name}</b>
                  <span>{member.email}</span>
                  <small>
                    {member.access_type === 'permanent'
                      ? 'Permanent access'
                      : `Expires ${new Date(member.expires_at).toLocaleString('en-US')}`}{' '}
                    · Logged in {member.login_count}{' '}
                    {member.login_count === 1 ? 'time' : 'times'}
                    {member.last_login_at
                      ? ` · Last ${new Date(member.last_login_at).toLocaleString('en-US')}`
                      : ''}
                  </small>
                </div>
                <i className={member.active ? 'active' : 'inactive'}>
                  {member.active ? 'Active' : 'Inactive'}
                </i>
                <button onClick={() => toggle(member)}>
                  {member.active ? 'Deactivate' : 'Activate'}
                </button>
                <button onClick={() => setEditing(member)}>
                  Edit / reset password
                </button>
                <button className="deleteButton" onClick={() => remove(member)}>
                  Remove
                </button>
              </article>
            ))
          )}
        </div>
      </div>
    </section>
  );
}
