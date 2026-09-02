'use client';

import { useRouter } from 'next/navigation';
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
  has_password?: boolean | number;
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
  const router = useRouter();
  const [staff, setStaff] = useState<Staff[]>(initialStaff);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [message, setMessage] = useState('');

  async function load() {
    try {
      const response = await fetch('/api/admin-staff-access');
      const json = (await response.json()) as any;
      const list = json.staff || [];
      setStaff(list);
      // If modal is open, keep selectedStaff in sync
      if (selectedStaff) {
        const updated = list.find((s: Staff) => s.email === selectedStaff.email);
        if (updated) setSelectedStaff(updated);
      }
    } catch {}
  }

  async function add(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const permissions = data.getAll('permissions');
    setMessage('Saving staff access…');

    const response = await fetch('/api/admin-staff-access', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        name: data.get('name'),
        email: data.get('email'),
        password: data.get('password'),
        permissions,
      }),
    });

    const json = (await response.json()) as any;
    if (!response.ok) {
      setMessage(json.error || 'Access could not be saved.');
      return;
    }

    form.reset();
    setShowAddModal(false);
    await load();
    router.refresh();
    setMessage('New staff access created successfully.');
  }

  async function updateModalStaff(
    event: FormEvent<HTMLFormElement>,
    person: Staff,
  ) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const permissions = data.getAll('permissions');
    const name = data.get('name');
    const password = data.get('password');
    setMessage('Updating staff member…');

    const response = await fetch('/api/admin-staff-access', {
      method: 'PUT',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        email: person.email,
        name: name,
        active: Boolean(person.active),
        password: password || undefined,
        permissions,
      }),
    });

    const json = (await response.json()) as any;
    if (!response.ok) {
      setMessage(json.error || 'Permissions could not be updated.');
      return;
    }

    await load();
    router.refresh();
    setMessage(`Updated staff member details for ${person.email}.`);
    setSelectedStaff(null);
  }

  async function toggle(person: Staff) {
    setMessage(`Updating status for ${person.email}…`);
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
    router.refresh();
    setMessage(`Access ${person.active ? 'paused' : 'restored'} for ${person.email}.`);
  }

  async function remove(person: Staff) {
    if (!confirm(`Remove all admin access for ${person.email}?`)) return;
    setMessage(`Removing staff member ${person.email}…`);
    await fetch(
      `/api/admin-staff-access?email=${encodeURIComponent(person.email)}`,
      { method: 'DELETE' },
    );
    if (selectedStaff?.email === person.email) {
      setSelectedStaff(null);
    }
    await load();
    router.refresh();
    setMessage(`Removed staff member ${person.email}.`);
  }

  // Search filter
  const filteredStaff = staff.filter((person) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      (person.name || '').toLowerCase().includes(q) ||
      (person.email || '').toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {message && (
        <div className="p-3 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl text-xs font-semibold flex items-center justify-between">
          <span>{message}</span>
          <button
            onClick={() => setMessage('')}
            className="text-amber-600 hover:text-amber-900 font-bold ml-2"
          >
            ✕
          </button>
        </div>
      )}

      {/* Staff Table Section */}
      <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Current Staff Members</h2>
            <p className="text-xs text-slate-500">
              Click any staff member row to view full details and update permissions.
            </p>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            {/* Search Input */}
            <div className="relative flex-1 md:w-64">
              <span className="absolute inset-y-0 left-3 flex items-center text-slate-400 text-sm pointer-events-none">
                🔍
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name or email…"
                className="w-full pl-9 pr-4 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
              />
            </div>

            {/* Add New Staff Button */}
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl transition shadow-xs flex items-center gap-1.5 shrink-0"
            >
              <span>+ Add New Staff</span>
            </button>
          </div>
        </div>

        {/* Staff Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                <th className="py-3.5 px-4">Staff Member</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Password</th>
                <th className="py-3.5 px-4">Permissions</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStaff.length ? (
                filteredStaff.map((person) => {
                  const permList = parse(person.permissions);
                  return (
                    <tr
                      key={person.email}
                      onClick={() => setSelectedStaff(person)}
                      className={`cursor-pointer transition hover:bg-slate-50/80 ${
                        person.active ? '' : 'bg-slate-50/40 text-slate-400'
                      }`}
                    >
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900 text-sm">
                          {person.name || person.email}
                        </div>
                        <div className="text-slate-500 text-xs font-mono">
                          {person.email}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-block px-2.5 py-1 text-[11px] font-bold rounded-md ${
                            person.active
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                              : 'bg-slate-200 text-slate-700 border border-slate-300'
                          }`}
                        >
                          {person.active ? 'Active' : 'Paused'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-block px-2.5 py-1 text-[11px] font-semibold rounded-md ${
                            person.has_password
                              ? 'bg-blue-50 text-blue-800 border border-blue-200'
                              : 'bg-amber-50 text-amber-800 border border-amber-200'
                          }`}
                        >
                          {person.has_password ? '🔑 Password Set' : '🔒 No Password'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">
                        <span className="font-semibold text-slate-800">
                          {permList.length}
                        </span>{' '}
                        {permList.length === 1 ? 'section' : 'sections'} assigned
                      </td>
                      <td className="py-3.5 px-4 text-right space-x-2" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => setSelectedStaff(person)}
                          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold rounded-lg border border-slate-300 text-xs transition"
                        >
                          View / Edit
                        </button>
                        <button
                          onClick={() => toggle(person)}
                          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg border border-slate-300 text-xs transition"
                        >
                          {person.active ? 'Pause' : 'Restore'}
                        </button>
                        <button
                          onClick={() => remove(person)}
                          className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 font-semibold rounded-lg border border-red-200 text-xs transition"
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-500 italic">
                    {searchQuery ? 'No staff members found matching your search.' : 'No staff members added.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Add New Staff Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden border border-slate-200 animate-in fade-in zoom-in duration-150">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Add New Staff Member</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Enter details and select section permissions for the new staff member.
                </p>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="w-8 h-8 rounded-full bg-slate-200 hover:bg-slate-300 text-slate-600 flex items-center justify-center font-bold text-sm"
              >
                ✕
              </button>
            </div>

            {/* Modal Form Body */}
            <form onSubmit={add} className="p-6 overflow-y-auto space-y-5 flex-1">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Staff Name
                  </label>
                  <input
                    name="name"
                    placeholder="Staff member name"
                    className="w-full text-sm p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    name="email"
                    type="email"
                    required
                    placeholder="person@email.com"
                    className="w-full text-sm p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Temporary Password (Optional)
                </label>
                <input
                  name="password"
                  type="password"
                  placeholder="Set temporary password for email/password login"
                  className="w-full text-sm p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  Assign Admin Permissions
                </label>
                <PermissionChoices sections={sections} />
              </div>

              {/* Modal Footer Buttons */}
              <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl transition shadow-sm"
                >
                  Create Staff Access
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Staff Detail & Edit Modal */}
      {selectedStaff && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden border border-slate-200 animate-in fade-in zoom-in duration-150">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-slate-900">
                    {selectedStaff.name || selectedStaff.email}
                  </h3>
                  <span
                    className={`px-2 py-0.5 text-[10px] font-bold rounded uppercase ${
                      selectedStaff.active
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : 'bg-slate-200 text-slate-700 border border-slate-300'
                    }`}
                  >
                    {selectedStaff.active ? 'Active Access' : 'Access Paused'}
                  </span>
                </div>
                <p className="text-xs text-slate-500 font-mono mt-0.5">
                  {selectedStaff.email}
                </p>
              </div>
              <button
                onClick={() => setSelectedStaff(null)}
                className="w-8 h-8 rounded-full bg-slate-200 hover:bg-slate-300 text-slate-600 flex items-center justify-center font-bold text-sm"
              >
                ✕
              </button>
            </div>

            {/* Modal Form Body */}
            <form
              onSubmit={(e) => updateModalStaff(e, selectedStaff)}
              className="p-6 overflow-y-auto space-y-5 flex-1"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Staff Name
                  </label>
                  <input
                    name="name"
                    defaultValue={selectedStaff.name}
                    placeholder="Enter staff name"
                    className="w-full text-sm p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Email Address
                  </label>
                  <input
                    disabled
                    value={selectedStaff.email}
                    className="w-full text-sm p-2.5 bg-slate-100 border border-slate-300 rounded-xl text-slate-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Set / Reset Temporary Password
                </label>
                <input
                  name="password"
                  type="password"
                  placeholder="Enter new temporary password to update (leave blank to keep unchanged)"
                  className="w-full text-sm p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  Current credential status:{' '}
                  <span className="font-semibold text-slate-700">
                    {selectedStaff.has_password ? 'Password configured' : 'No password set'}
                  </span>
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  Admin Section Permissions
                </label>
                <PermissionChoices
                  sections={sections}
                  selected={parse(selectedStaff.permissions)}
                />
              </div>

              {/* Modal Footer Buttons */}
              <div className="pt-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => toggle(selectedStaff)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl border border-slate-300 transition"
                  >
                    {selectedStaff.active ? 'Pause Access' : 'Restore Access'}
                  </button>
                  <button
                    type="button"
                    onClick={() => remove(selectedStaff)}
                    className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-bold rounded-xl border border-red-200 transition"
                  >
                    Remove Staff
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedStaff(null)}
                    className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold rounded-xl transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl transition shadow-sm"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
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

