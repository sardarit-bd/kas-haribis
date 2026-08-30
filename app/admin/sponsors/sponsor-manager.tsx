'use client';
import { FormEvent, useEffect, useState } from 'react';

type Sponsor = {
  id: number;
  company_name: string;
  ad_type: string;
  description?: string | null;
  phone?: string | null;
};

export default function SponsorManager() {
  const [items, setItems] = useState<Sponsor[]>([]);
  const [editing, setEditing] = useState<Sponsor | null>(null);
  const [message, setMessage] = useState('');

  async function load() {
    const response = await fetch('/api/sponsors');
    setItems((await response.json()).sponsors || []);
  }
  useEffect(() => {
    load();
  }, []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());
    const response = await fetch('/api/sponsors', {
      method: editing ? 'PUT' : 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(editing ? { ...data, id: editing.id } : data),
    });
    const result = (await response.json()) as { error?: string };
    if (!response.ok) {
      setMessage(result.error || 'The advertisement could not be saved.');
      return;
    }
    form.reset();
    setEditing(null);
    setMessage(
      editing
        ? 'Advertisement updated.'
        : 'Advertisement added to the rotation.',
    );
    load();
  }
  async function remove(id: number) {
    if (!confirm('Remove this advertisement?')) return;
    await fetch(`/api/sponsors?id=${id}`, { method: 'DELETE' });
    if (editing?.id === id) setEditing(null);
    setMessage('Advertisement removed.');
    load();
  }
  function startEdit(item: Sponsor) {
    setEditing(item);
    setMessage('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  return (
    <div className="managerLayout">
      <form
        key={editing?.id || 'new'}
        className="settingsCard"
        onSubmit={submit}
      >
        <h2>{editing ? 'Edit advertisement' : 'Add advertisement'}</h2>
        <p>
          {editing
            ? 'Update this sponsor’s public advertisement details.'
            : 'New advertisements automatically join the rotating strip at the top of the site.'}
        </p>
        <label>
          Company name
          <input
            name="companyName"
            defaultValue={editing?.company_name || ''}
            required
          />
        </label>
        <label>
          Advertisement type
          <select name="adType" defaultValue={editing?.ad_type || 'details'}>
            <option value="details">Click for more information</option>
            <option value="logo">Logo only</option>
            <option value="designed">Clean designed advertisement</option>
            <option value="image">Full advertisement image</option>
          </select>
        </label>
        <label>
          Services or description
          <textarea
            name="description"
            rows={4}
            defaultValue={editing?.description || ''}
          />
        </label>
        <label>
          Phone number
          <input name="phone" defaultValue={editing?.phone || ''} />
        </label>
        <div className="editFormActions">
          <button className="primary">
            {editing ? 'Save changes' : 'Add to rotation'}
          </button>
          {editing && (
            <button
              className="cancelEditButton"
              type="button"
              onClick={() => setEditing(null)}
            >
              Cancel editing
            </button>
          )}
        </div>
        <p>{message}</p>
      </form>
      <div className="managedList">
        <div className="connectionStatus">
          <b>Rotating advertisements</b>
          <span className="ready">{items.length} ads</span>
        </div>
        {items.length === 0 ? (
          <p>
            No managed advertisements yet. Prime Services remains the default
            display.
          </p>
        ) : (
          items.map((item) => (
            <article
              className={editing?.id === item.id ? 'editingRow' : ''}
              key={item.id}
            >
              <div className="sponsorIcon">
                {item.company_name.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <b>{item.company_name}</b>
                <span>
                  {item.ad_type} · {item.phone || 'No phone'}
                </span>
              </div>
              <button className="editButton" onClick={() => startEdit(item)}>
                Edit
              </button>
              <button onClick={() => remove(item.id)}>Remove</button>
            </article>
          ))
        )}
      </div>
    </div>
  );
}
