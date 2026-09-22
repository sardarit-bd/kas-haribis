'use client';

import { useRouter } from 'next/navigation';
import { FormEvent, useMemo, useRef, useState } from 'react';

export type AboutMemberItem = {
  id: string;
  category: string;
  name: string;
  designation: string;
  description: string;
  image_url: string;
  published: number | boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

const CATEGORIES = [
  'Kosher Bank Directory Research Team',
  'Our Genealogist and Yuchasin specialist',
  'Committee Members',
];

export default function AboutMembersManager({
  initialItems = [],
}: {
  initialItems: AboutMemberItem[];
}) {
  const router = useRouter();
  const [items, setItems] = useState<AboutMemberItem[]>(initialItems);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [editingItem, setEditingItem] = useState<AboutMemberItem | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  const addFileInputRef = useRef<HTMLInputElement>(null);
  const editFileInputRef = useRef<HTMLInputElement>(null);
  const [addFileSelected, setAddFileSelected] = useState(false);
  const [editFileSelected, setEditFileSelected] = useState(false);

  async function refreshItems() {
    try {
      const res = await fetch('/api/about-members');
      const data = (await res.json()) as any;
      if (data.members) {
        setItems(data.members);
      }
    } catch (err) {
      console.error('Failed to refresh members:', err);
    }
  }

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchCat = categoryFilter === 'All' || item.category === categoryFilter;
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        (item.name || '').toLowerCase().includes(q) ||
        (item.designation || '').toLowerCase().includes(q) ||
        (item.description || '').toLowerCase().includes(q);
      return matchCat && matchSearch;
    });
  }, [items, categoryFilter, searchQuery]);

  async function handleCreate(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    const form = e.currentTarget;
    const formData = new FormData(form);

    const name = String(formData.get('name') || '').trim();
    const category = String(formData.get('category') || '').trim();
    const designation = String(formData.get('designation') || '').trim();
    const description = String(formData.get('description') || '').trim();
    const published = formData.get('published') === 'on' ? 1 : 0;
    const sortOrder = Number(formData.get('sort_order')) || 0;

    if (!name) {
      setMessage('Please enter member name.');
      setBusy(false);
      return;
    }

    setMessage('Saving new team member…');

    try {
      const res = await fetch('/api/about-members', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          category,
          designation,
          description,
          image_url: '',
          published,
          sort_order: sortOrder,
        }),
      });

      const json = (await res.json()) as any;
      if (!res.ok) {
        setMessage(json.error || 'Failed to save team member.');
        setBusy(false);
        return;
      }

      const memberId = json.id;
      const imageFileInput = form.elements.namedItem('imageFile') as HTMLInputElement;
      const file = imageFileInput?.files?.[0];

      if (file && memberId) {
        setMessage('Uploading profile image…');
        const fd = new FormData();
        fd.set('id', String(memberId));
        fd.set('file', file);
        const uploadRes = await fetch('/api/admin/about-member-image', {
          method: 'POST',
          body: fd,
        });
        const uploadResult = (await uploadRes.json()) as { error?: string };
        if (!uploadRes.ok) {
          setMessage(`Member saved, but image upload failed: ${uploadResult.error || 'upload error'}`);
        }
      }

      form.reset();
      setAddFileSelected(false);
      setShowAddModal(false);
      await refreshItems();
      router.refresh();
      setMessage('Team member added successfully.');
    } catch (err: any) {
      setMessage('Error creating team member: ' + (err?.message || err));
    } finally {
      setBusy(false);
    }
  }

  async function handleUpdate(e: FormEvent<HTMLFormElement>, item: AboutMemberItem) {
    e.preventDefault();
    setBusy(true);
    const form = e.currentTarget;
    const formData = new FormData(form);

    const name = String(formData.get('name') || '').trim();
    const category = String(formData.get('category') || '').trim();
    const designation = String(formData.get('designation') || '').trim();
    const description = String(formData.get('description') || '').trim();
    const published = formData.get('published') === 'on' ? 1 : 0;
    const sortOrder = Number(formData.get('sort_order')) || 0;

    if (!name) {
      setMessage('Please enter member name.');
      setBusy(false);
      return;
    }

    setMessage('Updating team member…');

    try {
      const res = await fetch('/api/about-members', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: item.id,
          name,
          category,
          designation,
          description,
          image_url: item.image_url || '',
          published,
          sort_order: sortOrder,
        }),
      });

      const json = (await res.json()) as any;
      if (!res.ok) {
        setMessage(json.error || 'Failed to update member.');
        setBusy(false);
        return;
      }

      const imageFileInput = form.elements.namedItem('imageFile') as HTMLInputElement;
      const file = imageFileInput?.files?.[0];

      if (file && item.id) {
        setMessage('Uploading new profile image…');
        const fd = new FormData();
        fd.set('id', String(item.id));
        fd.set('file', file);
        const uploadRes = await fetch('/api/admin/about-member-image', {
          method: 'POST',
          body: fd,
        });
        const uploadResult = (await uploadRes.json()) as { error?: string };
        if (!uploadRes.ok) {
          setMessage(`Member updated, but image upload failed: ${uploadResult.error || 'upload error'}`);
        }
      }

      setEditingItem(null);
      setEditFileSelected(false);
      await refreshItems();
      router.refresh();
      setMessage('Team member updated successfully.');
    } catch (err: any) {
      setMessage('Error updating team member: ' + (err?.message || err));
    } finally {
      setBusy(false);
    }
  }

  async function handleTogglePublish(item: AboutMemberItem) {
    const isPub = item.published === 1 || item.published === true;
    setMessage(`Toggling status for "${item.name}"…`);

    try {
      const res = await fetch('/api/about-members', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...item,
          published: isPub ? 0 : 1,
        }),
      });

      if (!res.ok) {
        setMessage('Failed to toggle status.');
        return;
      }

      await refreshItems();
      router.refresh();
      setMessage(`Member status ${isPub ? 'hidden' : 'published'}.`);
    } catch (err) {
      setMessage('Error toggling status.');
    }
  }

  async function handleDelete(item: AboutMemberItem) {
    if (!confirm(`Are you sure you want to delete "${item.name}"?`)) {
      return;
    }

    setMessage('Deleting team member…');

    try {
      const res = await fetch(`/api/about-members?id=${encodeURIComponent(item.id)}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        setMessage('Failed to delete team member.');
        return;
      }

      if (editingItem?.id === item.id) {
        setEditingItem(null);
      }

      await refreshItems();
      router.refresh();
      setMessage('Team member deleted successfully.');
    } catch (err) {
      setMessage('Error deleting team member.');
    }
  }

  return (
    <div className="space-y-6">
      {message && (
        <div className="p-3 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl text-xs font-semibold flex items-center justify-between">
          <span>{message}</span>
          <button
            onClick={() => setMessage('')}
            className="text-amber-600 hover:text-amber-900 font-bold ml-2 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Control Bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Manage About Us Team</h2>
            <p className="text-xs text-slate-500">
              {items.length} member{items.length === 1 ? '' : 's'} across 3 categories.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="relative flex-1 md:w-64">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search name or designation…"
                className="w-full pl-3 pr-8 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600 text-xs font-bold"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Add Button */}
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl transition shadow-xs flex items-center gap-1.5 shrink-0 cursor-pointer"
            >
              <span>+ Add Team Member</span>
            </button>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
          <span className="text-xs text-slate-500 font-semibold mr-1">Category:</span>
          <button
            onClick={() => setCategoryFilter('All')}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition cursor-pointer ${
              categoryFilter === 'All'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            All ({items.length})
          </button>
          {CATEGORIES.map((cat) => {
            const count = items.filter((i) => i.category === cat).length;
            return (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition cursor-pointer ${
                  categoryFilter === cat
                    ? 'bg-amber-500 text-slate-950 font-bold shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {cat} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Members Grid / List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredItems.length > 0 ? (
          filteredItems.map((item) => {
            const isPub = item.published === 1 || item.published === true;
            return (
              <article
                key={item.id}
                className={`bg-white rounded-2xl border p-5 transition shadow-xs hover:shadow-md flex flex-col justify-between ${
                  isPub ? 'border-slate-200' : 'border-amber-200 bg-amber-50/20'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={item.image_url || '/assets/avatar.webp'}
                      alt={item.name}
                      className="w-14 h-14 rounded-xl object-cover bg-slate-200 shrink-0 border border-slate-200"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/assets/avatar.webp';
                      }}
                    />
                    <div>
                      <h3 className="font-bold text-slate-900 text-base leading-snug">
                        {item.name}
                      </h3>
                      {item.designation && (
                        <p className="text-xs text-amber-700 font-medium">
                          {item.designation}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-600 uppercase">
                      {item.category}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                        isPub
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-900'
                      }`}
                    >
                      {isPub ? 'Active' : 'Hidden'}
                    </span>
                  </div>

                  {item.description && (
                    <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">
                      {item.description}
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-between gap-2 pt-4 mt-4 border-t border-slate-100">
                  <button
                    onClick={() => handleTogglePublish(item)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold border cursor-pointer ${
                      isPub
                        ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
                        : 'bg-emerald-500 hover:bg-emerald-600 text-white border-emerald-600 font-bold'
                    }`}
                  >
                    {isPub ? 'Hide' : 'Publish'}
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setEditingItem(item)}
                      className="px-3 py-1 bg-amber-50 hover:bg-amber-100 text-amber-900 font-bold rounded-lg border border-amber-300 text-xs transition cursor-pointer"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(item)}
                      className="px-3 py-1 bg-red-50 hover:bg-red-100 text-red-700 font-bold rounded-lg border border-red-200 text-xs transition cursor-pointer"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </article>
            );
          })
        ) : (
          <div className="col-span-full bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-500 italic">
            No team members found matching your filter.
          </div>
        )}
      </div>

      {/* Add New Member Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full max-h-[90vh] flex flex-col overflow-hidden border border-slate-200 animate-in fade-in zoom-in duration-150">
            <div className="p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Add Team Member</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Upload profile image and enter details for the About Us page.
                </p>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="w-8 h-8 rounded-full bg-slate-200 hover:bg-slate-300 text-slate-600 flex items-center justify-center font-bold text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreate} className="p-6 overflow-y-auto space-y-4 flex-1">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Category Section <span className="text-red-500">*</span>
                </label>
                <select
                  name="category"
                  defaultValue={CATEGORIES[0]}
                  className="w-full text-sm p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none bg-white"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  name="name"
                  type="text"
                  required
                  placeholder="e.g. Rabbi Aharon Pollack"
                  className="w-full text-sm p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Upload Profile Image File
                </label>
                <div className="flex items-center gap-2">
                  <input
                    ref={addFileInputRef}
                    name="imageFile"
                    type="file"
                    accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml"
                    onChange={(e) => setAddFileSelected(!!e.target.files?.length)}
                    className="w-full text-xs p-2 border border-slate-300 rounded-xl bg-slate-50 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-amber-500 file:text-slate-950 hover:file:bg-amber-600 cursor-pointer"
                  />
                  {addFileSelected && (
                    <button
                      type="button"
                      onClick={() => {
                        if (addFileInputRef.current) addFileInputRef.current.value = '';
                        setAddFileSelected(false);
                      }}
                      className="px-2.5 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs rounded-xl shrink-0 cursor-pointer"
                      title="Clear selected file"
                    >
                      Clear File
                    </button>
                  )}
                </div>
                <span className="text-[11px] text-slate-400 mt-1 block">
                  PNG, JPG, WEBP, GIF, or SVG up to 5 MB. If left empty, default avatar will be used.
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Designation / Role (Optional)
                </label>
                <input
                  name="designation"
                  type="text"
                  placeholder="e.g. Research Specialist"
                  className="w-full text-sm p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Short Description (2 lines optional)
                </label>
                <textarea
                  name="description"
                  rows={3}
                  placeholder="e.g. Our rabbinical guidance specifically for..."
                  className="w-full text-sm p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none leading-relaxed"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Sort Order Priority
                  </label>
                  <input
                    name="sort_order"
                    type="number"
                    defaultValue={items.length}
                    className="w-full text-sm p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none"
                  />
                </div>

                <div className="flex items-center pt-5">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      name="published"
                      type="checkbox"
                      defaultChecked
                      className="w-4 h-4 accent-amber-500 rounded"
                    />
                    <span className="text-xs font-bold text-slate-800">Publish Immediately</span>
                  </label>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold rounded-xl transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={busy}
                  className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl transition shadow-sm cursor-pointer disabled:opacity-50"
                >
                  {busy ? 'Saving…' : 'Save Member'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Member Modal */}
      {editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full max-h-[90vh] flex flex-col overflow-hidden border border-slate-200 animate-in fade-in zoom-in duration-150">
            <div className="p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Edit Team Member</h3>
                <p className="text-xs text-slate-500 mt-0.5 font-mono">
                  ID: {editingItem.id}
                </p>
              </div>
              <button
                onClick={() => setEditingItem(null)}
                className="w-8 h-8 rounded-full bg-slate-200 hover:bg-slate-300 text-slate-600 flex items-center justify-center font-bold text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form
              onSubmit={(e) => handleUpdate(e, editingItem)}
              className="p-6 overflow-y-auto space-y-4 flex-1"
            >
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Category Section
                </label>
                <select
                  name="category"
                  defaultValue={editingItem.category}
                  className="w-full text-sm p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none bg-white"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Full Name
                </label>
                <input
                  name="name"
                  type="text"
                  required
                  defaultValue={editingItem.name}
                  className="w-full text-sm p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Upload New Profile Image File
                </label>
                <div className="flex items-center gap-2">
                  <input
                    ref={editFileInputRef}
                    name="imageFile"
                    type="file"
                    accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml"
                    onChange={(e) => setEditFileSelected(!!e.target.files?.length)}
                    className="w-full text-xs p-2 border border-slate-300 rounded-xl bg-slate-50 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-amber-500 file:text-slate-950 hover:file:bg-amber-600 cursor-pointer"
                  />
                  {editFileSelected && (
                    <button
                      type="button"
                      onClick={() => {
                        if (editFileInputRef.current) editFileInputRef.current.value = '';
                        setEditFileSelected(false);
                      }}
                      className="px-2.5 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs rounded-xl shrink-0 cursor-pointer"
                      title="Clear selected file"
                    >
                      Clear File
                    </button>
                  )}
                </div>
                <span className="text-[11px] text-slate-400 mt-1 block">
                  Select a new image file to replace the current picture.
                </span>
              </div>

              {editingItem.image_url && editingItem.image_url !== '/assets/avatar.webp' ? (
                <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <div className="flex items-center gap-3">
                    <img
                      src={editingItem.image_url}
                      alt="Current profile image"
                      className="w-12 h-12 rounded-lg object-cover bg-white border border-slate-300 shrink-0"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/assets/avatar.webp';
                      }}
                    />
                    <div>
                      <span className="text-xs font-semibold text-slate-700 block">Current Image</span>
                      <span className="text-[11px] text-slate-400 block truncate max-w-[200px]">
                        Custom uploaded image
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setEditingItem({ ...editingItem, image_url: '' })}
                    className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 font-bold rounded-lg border border-red-200 text-xs transition cursor-pointer flex items-center gap-1.5 shrink-0"
                  >
                    <span>✕</span>
                    <span>Remove Image</span>
                  </button>
                </div>
              ) : (
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-3">
                  <img
                    src="/assets/avatar.webp"
                    alt="Default avatar"
                    className="w-12 h-12 rounded-lg object-cover bg-white border border-slate-300 shrink-0 opacity-70"
                  />
                  <div>
                    <span className="text-xs font-semibold text-slate-700 block">Default Avatar</span>
                    <span className="text-[11px] text-slate-400 block">No custom image set (using default avatar)</span>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Designation / Role
                </label>
                <input
                  name="designation"
                  type="text"
                  defaultValue={editingItem.designation}
                  className="w-full text-sm p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Short Description
                </label>
                <textarea
                  name="description"
                  rows={3}
                  defaultValue={editingItem.description}
                  className="w-full text-sm p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none leading-relaxed"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Sort Order Priority
                  </label>
                  <input
                    name="sort_order"
                    type="number"
                    defaultValue={editingItem.sort_order ?? 0}
                    className="w-full text-sm p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none"
                  />
                </div>

                <div className="flex items-center pt-5">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      name="published"
                      type="checkbox"
                      defaultChecked={
                        editingItem.published === 1 || editingItem.published === true
                      }
                      className="w-4 h-4 accent-amber-500 rounded"
                    />
                    <span className="text-xs font-bold text-slate-800">Published</span>
                  </label>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => handleDelete(editingItem)}
                  className="px-4 py-2.5 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-bold rounded-xl border border-red-200 transition cursor-pointer"
                >
                  Delete Member
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingItem(null)}
                    className="px-4 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold rounded-xl transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={busy}
                    className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl transition shadow-sm cursor-pointer disabled:opacity-50"
                  >
                    {busy ? 'Saving…' : 'Save Changes'}
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
