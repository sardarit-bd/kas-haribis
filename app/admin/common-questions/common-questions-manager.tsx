'use client';

import { useRouter } from 'next/navigation';
import { FormEvent, useMemo, useState } from 'react';

export type CommonQuestionItem = {
  id: string;
  category: string;
  question: string;
  answer: string;
  published: number | boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

const DEFAULT_CATEGORIES = [
  'Heter Iska',
  'Loans',
  'Business',
  'Everyday situations',
];

export default function CommonQuestionsManager({
  initialItems = [],
}: {
  initialItems: CommonQuestionItem[];
}) {
  const router = useRouter();
  const [items, setItems] = useState<CommonQuestionItem[]>(initialItems);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [editingItem, setEditingItem] = useState<CommonQuestionItem | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [message, setMessage] = useState('');
  const [customCategory, setCustomCategory] = useState('');
  const [selectedCategoryOption, setSelectedCategoryOption] = useState('Heter Iska');

  async function refreshItems() {
    try {
      const res = await fetch('/api/common-questions');
      const data = (await res.json()) as any;
      if (data.questions) {
        setItems(data.questions);
      }
    } catch (err) {
      console.error('Failed to refresh questions:', err);
    }
  }

  // Derive categories list dynamically
  const categories = useMemo(() => {
    const set = new Set<string>(DEFAULT_CATEGORIES);
    items.forEach((item) => {
      if (item.category) set.add(item.category);
    });
    return Array.from(set);
  }, [items]);

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchCat = categoryFilter === 'All' || item.category === categoryFilter;
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        (item.question || '').toLowerCase().includes(q) ||
        (item.answer || '').toLowerCase().includes(q) ||
        (item.category || '').toLowerCase().includes(q);
      return matchCat && matchSearch;
    });
  }, [items, categoryFilter, searchQuery]);

  async function handleCreate(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);

    const question = String(formData.get('question') || '').trim();
    const answer = String(formData.get('answer') || '').trim();
    const catChoice = String(formData.get('category') || '').trim();
    const customCat = String(formData.get('customCategory') || '').trim();
    const category = catChoice === '__CUSTOM__' ? customCat : catChoice;
    const published = formData.get('published') === 'on' ? 1 : 0;
    const sortOrder = Number(formData.get('sort_order')) || 0;

    if (!question || !answer) {
      setMessage('Please enter both question and answer.');
      return;
    }

    setMessage('Saving new common question…');

    try {
      const res = await fetch('/api/common-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question,
          answer,
          category,
          published,
          sort_order: sortOrder,
        }),
      });

      const json = (await res.json()) as any;
      if (!res.ok) {
        setMessage(json.error || 'Failed to save question.');
        return;
      }

      form.reset();
      setShowAddModal(false);
      await refreshItems();
      router.refresh();
      setMessage('Question created successfully.');
    } catch (err: any) {
      setMessage('Error creating question: ' + (err?.message || err));
    }
  }

  async function handleUpdate(e: FormEvent<HTMLFormElement>, item: CommonQuestionItem) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const question = String(formData.get('question') || '').trim();
    const answer = String(formData.get('answer') || '').trim();
    const catChoice = String(formData.get('category') || '').trim();
    const customCat = String(formData.get('customCategory') || '').trim();
    const category = catChoice === '__CUSTOM__' ? customCat : catChoice;
    const published = formData.get('published') === 'on' ? 1 : 0;
    const sortOrder = Number(formData.get('sort_order')) || 0;

    if (!question || !answer) {
      setMessage('Please enter both question and answer.');
      return;
    }

    setMessage('Updating question…');

    try {
      const res = await fetch('/api/common-questions', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: item.id,
          question,
          answer,
          category,
          published,
          sort_order: sortOrder,
        }),
      });

      const json = (await res.json()) as any;
      if (!res.ok) {
        setMessage(json.error || 'Failed to update question.');
        return;
      }

      setEditingItem(null);
      await refreshItems();
      router.refresh();
      setMessage('Question updated successfully.');
    } catch (err: any) {
      setMessage('Error updating question: ' + (err?.message || err));
    }
  }

  async function handleTogglePublish(item: CommonQuestionItem) {
    const isPub = item.published === 1 || item.published === true;
    setMessage(`Toggling publish status for "${item.question.slice(0, 30)}…"`);

    try {
      const res = await fetch('/api/common-questions', {
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
      setMessage(`Question ${isPub ? 'unpublished' : 'published'}.`);
    } catch (err) {
      setMessage('Error toggling status.');
    }
  }

  async function handleDelete(item: CommonQuestionItem) {
    if (!confirm(`Are you sure you want to delete this question?\n\n"${item.question}"`)) {
      return;
    }

    setMessage('Deleting question…');

    try {
      const res = await fetch(`/api/common-questions?id=${encodeURIComponent(item.id)}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        setMessage('Failed to delete question.');
        return;
      }

      if (editingItem?.id === item.id) {
        setEditingItem(null);
      }

      await refreshItems();
      router.refresh();
      setMessage('Question deleted successfully.');
    } catch (err) {
      setMessage('Error deleting question.');
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

      {/* Control Bar: Search, Category Tabs, Add Button */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Manage Common Questions</h2>
            <p className="text-xs text-slate-500">
              {items.length} question{items.length === 1 ? '' : 's'} total in database.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Search Input */}
            <div className="relative flex-1 md:w-64">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search questions or answers…"
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

            {/* Add New Button */}
            <button
              onClick={() => {
                setSelectedCategoryOption('Heter Iska');
                setCustomCategory('');
                setShowAddModal(true);
              }}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl transition shadow-xs flex items-center gap-1.5 shrink-0 cursor-pointer"
            >
              <span>+ Add Question</span>
            </button>
          </div>
        </div>

        {/* Category Filter Pills */}
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
          {categories.map((cat) => {
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

      {/* Questions List */}
      <div className="space-y-4">
        {filteredItems.length > 0 ? (
          filteredItems.map((item, idx) => {
            const isPub = item.published === 1 || item.published === true;
            return (
              <article
                key={item.id}
                className={`bg-white rounded-2xl border p-5 transition shadow-xs hover:shadow-md ${
                  isPub ? 'border-slate-200' : 'border-amber-200 bg-amber-50/20'
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-slate-100 text-slate-700 uppercase tracking-wider">
                        {item.category || 'General'}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-md text-[11px] font-bold ${
                          isPub
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                            : 'bg-amber-100 text-amber-900 border border-amber-300'
                        }`}
                      >
                        {isPub ? 'Published' : 'Draft / Hidden'}
                      </span>
                      <span className="text-slate-400 text-xs font-mono">
                        Order: {item.sort_order ?? idx}
                      </span>
                    </div>

                    <h3 className="text-base font-serif font-bold text-slate-900">
                      {item.question}
                    </h3>

                    <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                      {item.answer}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 md:self-start">
                    <button
                      onClick={() => handleTogglePublish(item)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition cursor-pointer ${
                        isPub
                          ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
                          : 'bg-emerald-500 hover:bg-emerald-600 text-white font-bold border-emerald-600'
                      }`}
                    >
                      {isPub ? 'Hide' : 'Publish'}
                    </button>
                    <button
                      onClick={() => {
                        setEditingItem(item);
                        setSelectedCategoryOption(
                          categories.includes(item.category)
                            ? item.category
                            : '__CUSTOM__',
                        );
                        setCustomCategory(
                          categories.includes(item.category) ? '' : item.category,
                        );
                      }}
                      className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 font-bold rounded-xl border border-amber-300 text-xs transition cursor-pointer"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(item)}
                      className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 font-bold rounded-xl border border-red-200 text-xs transition cursor-pointer"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </article>
            );
          })
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-500 italic">
            No questions found matching your filter or search query.
          </div>
        )}
      </div>

      {/* Add New Question Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden border border-slate-200 animate-in fade-in zoom-in duration-150">
            <div className="p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Add Common Question</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  This question will appear on the public Questions page.
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
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  name="category"
                  value={selectedCategoryOption}
                  onChange={(e) => setSelectedCategoryOption(e.target.value)}
                  className="w-full text-sm p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none bg-white"
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                  <option value="__CUSTOM__">+ Add Custom Category…</option>
                </select>
              </div>

              {selectedCategoryOption === '__CUSTOM__' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Custom Category Name
                  </label>
                  <input
                    name="customCategory"
                    value={customCategory}
                    onChange={(e) => setCustomCategory(e.target.value)}
                    placeholder="e.g. Credit Cards & Banking"
                    required
                    className="w-full text-sm p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Question Text <span className="text-red-500">*</span>
                </label>
                <input
                  name="question"
                  type="text"
                  required
                  placeholder="e.g. When is a Heter Iska needed?"
                  className="w-full text-sm p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Answer Text <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="answer"
                  rows={5}
                  required
                  placeholder="Provide clear halachic guidance and explanation…"
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
                  <span className="text-[11px] text-slate-400">Lower numbers appear first.</span>
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
                  className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl transition shadow-sm cursor-pointer"
                >
                  Save Question
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Question Modal */}
      {editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden border border-slate-200 animate-in fade-in zoom-in duration-150">
            <div className="p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Edit Common Question</h3>
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
                  Category
                </label>
                <select
                  name="category"
                  value={selectedCategoryOption}
                  onChange={(e) => setSelectedCategoryOption(e.target.value)}
                  className="w-full text-sm p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none bg-white"
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                  <option value="__CUSTOM__">+ Add Custom Category…</option>
                </select>
              </div>

              {selectedCategoryOption === '__CUSTOM__' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Custom Category Name
                  </label>
                  <input
                    name="customCategory"
                    value={customCategory}
                    onChange={(e) => setCustomCategory(e.target.value)}
                    placeholder="e.g. Credit Cards & Banking"
                    required
                    className="w-full text-sm p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Question Text
                </label>
                <input
                  name="question"
                  type="text"
                  required
                  defaultValue={editingItem.question}
                  className="w-full text-sm p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Answer Text
                </label>
                <textarea
                  name="answer"
                  rows={5}
                  required
                  defaultValue={editingItem.answer}
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
                  Delete Question
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
                    className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl transition shadow-sm cursor-pointer"
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
