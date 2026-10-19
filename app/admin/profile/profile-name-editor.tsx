'use client';

import { useRouter } from 'next/navigation';
import { FormEvent, useState } from 'react';

export default function ProfileNameEditor({
  initialName,
}: {
  initialName: string;
}) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(initialName);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  async function handleSave(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const trimmed = name.trim();
    if (!trimmed) {
      setErrorMsg('Display name cannot be empty.');
      return;
    }
    if (trimmed.length > 100) {
      setErrorMsg('Display name must not exceed 100 characters.');
      return;
    }

    setSaving(true);

    try {
      // Intentionally send ONLY name. The server securely derives email from the auth cookie.
      const res = await fetch('/api/admin/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: trimmed }),
      });

      const data = (await res.json()) as { error?: string; name?: string };

      if (!res.ok) {
        setErrorMsg(data.error || 'Failed to update display name.');
        setSaving(false);
        return;
      }

      const updatedName = data.name || trimmed;
      setName(updatedName);
      setIsEditing(false);
      setSaving(false);
      setSuccessMsg('Display name updated successfully.');

      // Refresh server-rendered components (AdminNav and Profile page) immediately
      router.refresh();

      setTimeout(() => {
        setSuccessMsg('');
      }, 5000);
    } catch {
      setErrorMsg('A network error occurred while updating display name.');
      setSaving(false);
    }
  }

  function handleCancel() {
    setIsEditing(false);
    setName(initialName);
    setErrorMsg('');
  }

  return (
    <div className="w-full">
      {successMsg && (
        <div className="mb-3 rounded-lg border border-emerald-200 bg-emerald-50 px-3.5 py-2.5 text-xs text-emerald-800 flex items-center justify-between">
          <span className="flex items-center gap-1.5 font-medium">
            <span className="text-emerald-600 font-bold">✓</span>
            {successMsg}
          </span>
          <button
            type="button"
            onClick={() => setSuccessMsg('')}
            className="text-emerald-600 hover:text-emerald-800 text-xs font-bold px-1"
            aria-label="Dismiss message"
          >
            ✕
          </button>
        </div>
      )}

      {errorMsg && (
        <div className="mb-3 rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-xs text-red-800 flex items-center justify-between">
          <span className="flex items-center gap-1.5 font-medium">
            <span className="text-red-600 font-bold">✕</span>
            {errorMsg}
          </span>
          <button
            type="button"
            onClick={() => setErrorMsg('')}
            className="text-red-600 hover:text-red-800 text-xs font-bold px-1"
            aria-label="Dismiss error"
          >
            ✕
          </button>
        </div>
      )}

      {!isEditing ? (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="text-slate-900 font-medium">
            {initialName ? (
              <span>{initialName}</span>
            ) : (
              <span className="text-slate-500 italic">Not set (signed in with email)</span>
            )}
          </div>
          <button
            type="button"
            onClick={() => {
              setIsEditing(true);
              setErrorMsg('');
              setSuccessMsg('');
            }}
            className="text-xs font-semibold text-amber-800 hover:text-amber-900 bg-amber-50 hover:bg-amber-100/80 px-3 py-1.5 rounded-lg border border-amber-200 transition-colors inline-flex items-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <svg
              className="w-3.5 h-3.5 text-amber-700"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
              />
            </svg>
            <span>{initialName ? 'Edit name' : 'Set display name'}</span>
          </button>
        </div>
      ) : (
        <form onSubmit={handleSave} className="space-y-3 pt-1">
          <div>
            <label
              htmlFor="profile-display-name"
              className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1"
            >
              Edit Display Name
            </label>
            <input
              id="profile-display-name"
              type="text"
              required
              autoFocus
              maxLength={100}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your full name"
              disabled={saving}
              className="w-full h-10 rounded-lg border border-slate-300 px-3.5 text-sm text-slate-900 placeholder-slate-400 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 transition bg-white"
            />
            <p className="mt-1 text-[11px] text-slate-500">
              Maximum 100 characters. Visible on your header badge and administrative sessions.
            </p>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <button
              type="submit"
              disabled={saving}
              className="h-8 px-4 rounded-lg bg-[#102a43] hover:bg-[#173f5f] text-white text-xs font-semibold transition disabled:opacity-50 cursor-pointer shadow-xs inline-flex items-center justify-center gap-1.5"
            >
              {saving ? 'Saving…' : 'Save Changes'}
            </button>
            <button
              type="button"
              disabled={saving}
              onClick={handleCancel}
              className="h-8 px-3 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-medium transition cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
