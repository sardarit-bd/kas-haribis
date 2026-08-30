'use client';
import { FormEvent, useState } from 'react';
type Section = {
  key: string;
  title: string;
  description: string;
  delegatable?: boolean;
};
type Staff = {
  email: string;
  name: string;
  active: number;
  permissions: string;
};
const parse = (value: string) => {
  try {
    return JSON.parse(value) || [];
  } catch {
    return [];
  }
};
export default function StaffAccessManager({
  initialStaff,
  sections,
}: {
  initialStaff: Staff[];
  sections: Section[];
}) {
  const [staff, setStaff] = useState(initialStaff),
    [message, setMessage] = useState('');
  async function load() {
    const response = await fetch('/api/admin-staff-access'),
      json = (await response.json()) as any;
    setStaff(json.staff || []);
  }
  async function add(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget,
      data = new FormData(form),
      permissions = data.getAll('permissions');
    setMessage('Saving staff access…');
    const response = await fetch('/api/admin-staff-access', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          name: data.get('name'),
          email: data.get('email'),
          permissions,
        }),
      }),
      json = (await response.json()) as any;
    if (!response.ok) {
      setMessage(json.error || 'Access could not be saved.');
      return;
    }
    form.reset();
    await load();
    setMessage('Staff access saved.');
  }
  async function update(event: FormEvent<HTMLFormElement>, person: Staff) {
    event.preventDefault();
    const data = new FormData(event.currentTarget),
      permissions = data.getAll('permissions'),
      response = await fetch('/api/admin-staff-access', {
        method: 'PUT',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          email: person.email,
          name: person.name,
          active: Boolean(person.active),
          permissions,
        }),
      }),
      json = (await response.json()) as any;
    if (!response.ok) {
      setMessage(json.error || 'Permissions could not be updated.');
      return;
    }
    await load();
    setMessage(`Permissions updated for ${person.email}.`);
  }
  async function toggle(person: Staff) {
    await fetch('/api/admin-staff-access', {
      method: 'PUT',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        ...person,
        active: !person.active,
        permissions: parse(person.permissions),
      }),
    });
    await load();
  }
  async function remove(person: Staff) {
    if (!confirm(`Remove all admin access for ${person.email}?`)) return;
    await fetch(
      `/api/admin-staff-access?email=${encodeURIComponent(person.email)}`,
      { method: 'DELETE' },
    );
    await load();
  }
  return (
    <>
      <section className="staffAccessAdd">
        <h2>Add staff member</h2>
        <p>They must sign in with this exact email address.</p>
        <form onSubmit={add}>
          <div className="staffIdentityFields">
            <input name="name" placeholder="Staff member name" />
            <input
              name="email"
              type="email"
              required
              placeholder="person@email.com"
            />
          </div>
          <PermissionChoices sections={sections} />
          <button className="primary">Add staff access</button>
        </form>
      </section>
      {message && (
        <p className="researchMessage" role="status">
          {message}
        </p>
      )}
      <section className="staffAccessList">
        <h2>Current staff permissions</h2>
        {staff.length ? (
          staff.map((person) => (
            <article
              key={person.email}
              className={person.active ? '' : 'inactive'}
            >
              <header>
                <div>
                  <b>{person.name || person.email}</b>
                  <span>{person.email}</span>
                </div>
                <div>
                  <button onClick={() => toggle(person)}>
                    {person.active ? 'Pause all access' : 'Restore access'}
                  </button>
                  <button onClick={() => remove(person)}>Remove</button>
                </div>
              </header>
              <form onSubmit={(event) => update(event, person)}>
                <PermissionChoices
                  sections={sections}
                  selected={parse(person.permissions)}
                />
                <button className="primary">Save permission changes</button>
              </form>
            </article>
          ))
        ) : (
          <p>No staff members have been added.</p>
        )}
      </section>
    </>
  );
}
function PermissionChoices({
  sections,
  selected = [],
}: {
  sections: Section[];
  selected?: string[];
}) {
  return (
    <div className="staffPermissionGrid">
      {sections
        .filter((section) => section.delegatable !== false)
        .map((section) => (
          <label key={section.key}>
            <input
              type="checkbox"
              name="permissions"
              value={section.key}
              defaultChecked={selected.includes(section.key)}
            />
            <span>
              <b>{section.title}</b>
              <small>{section.description}</small>
            </span>
          </label>
        ))}
    </div>
  );
}
