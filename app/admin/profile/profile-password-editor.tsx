'use client';

import { useRouter } from 'next/navigation';
import { FormEvent, useState } from 'react';

interface ProfilePasswordEditorProps {
  initialHasPassword: boolean;
  initialRequirePassword: boolean;
}

export default function ProfilePasswordEditor({
  initialHasPassword,
  initialRequirePassword,
}: ProfilePasswordEditorProps) {
  const router = useRouter();

  const [hasPassword, setHasPassword] = useState(initialHasPassword);
  const [requirePassword, setRequirePassword] = useState(initialRequirePassword);

  const [mode, setMode] = useState<'idle' | 'add' | 'change' | 'confirm_remove'>('idle');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [saving, setSaving] = useState(false);
  const [enforceLoading, setEnforceLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  function resetForm() {
    setPassword('');
    setConfirmPassword('');
    setShowPassword(false);
    setMode('idle');
    setErrorMsg('');
  }

  async function handleSavePassword(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!password) {
      setErrorMsg('Password is required.');
      return;
    }
    if (password.length < 10) {
      setErrorMsg('Password must be at least 10 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match. Please verify your confirm password.');
      return;
    }

    setSaving(true);
    try {
      const res = await fetch('/api/admin/profile/password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          password,
          confirmPassword,
        }),
      });

      const data = (await res.json()) as {
        error?: string;
        success?: boolean;
        hasPassword?: boolean;
        requirePassword?: boolean;
      };

      if (!res.ok || !data.success) {
        setErrorMsg(data.error || 'Failed to save administrator password.');
        setSaving(false);
        return;
      }

      setHasPassword(true);
      if (typeof data.requirePassword === 'boolean') {
        setRequirePassword(data.requirePassword);
      }
      setSuccessMsg(
        mode === 'add'
          ? 'Administrator password created successfully.'
          : 'Administrator password updated successfully.',
      );
      resetForm();
      router.refresh();
      setTimeout(() => setSuccessMsg(''), 5000);
    } catch {
      setErrorMsg('A network error occurred while saving the password.');
    } finally {
      setSaving(false);
    }
  }

  async function handleRemovePassword() {
    setErrorMsg('');
    setSuccessMsg('');
    setSaving(true);

    try {
      const res = await fetch('/api/admin/profile/password', {
        method: 'DELETE',
      });

      const data = (await res.json()) as {
        error?: string;
        success?: boolean;
        hasPassword?: boolean;
        requirePassword?: boolean;
      };

      if (!res.ok || !data.success) {
        setErrorMsg(data.error || 'Failed to remove administrator password.');
        setSaving(false);
        return;
      }

      setHasPassword(false);
      setRequirePassword(false);
      setSuccessMsg(
        'Administrator password removed. Password enforcement on Google login has been disabled.',
      );
      resetForm();
      router.refresh();
      setTimeout(() => setSuccessMsg(''), 6000);
    } catch {
      setErrorMsg('A network error occurred while removing the password.');
    } finally {
      setSaving(false);
    }
  }

  async function handleToggleEnforcement(checked: boolean) {
    if (!hasPassword && checked) {
      setErrorMsg('Please configure an administrator password first.');
      return;
    }

    setErrorMsg('');
    setSuccessMsg('');
    setEnforceLoading(true);

    try {
      const res = await fetch('/api/admin/profile/password', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requirePassword: checked }),
      });

      const data = (await res.json()) as {
        error?: string;
        success?: boolean;
        requirePassword?: boolean;
      };

      if (!res.ok || !data.success) {
        setErrorMsg(data.error || 'Failed to update Google login enforcement.');
        setEnforceLoading(false);
        return;
      }

      setRequirePassword(Boolean(data.requirePassword));
      setSuccessMsg(
        checked
          ? 'Google login now requires Super Admin password verification.'
          : 'Google login password verification disabled. Direct OAuth login restored.',
      );
      router.refresh();
      setTimeout(() => setSuccessMsg(''), 5000);
    } catch {
      setErrorMsg('A network error occurred while updating the setting.');
    } finally {
      setEnforceLoading(false);
    }
  }

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs">
      <div className="flex items-start justify-between gap-4 pb-5 border-b border-slate-100">
        <div>
          <h2 className="text-lg font-bold text-slate-900 font-serif flex items-center gap-2">
            <svg
              className="w-5 h-5 text-amber-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
            Administrator Password
          </h2>
          <p className="mt-1 text-xs text-slate-600 leading-relaxed">
            Configure an optional dedicated password for your Super Admin account and choose whether to require it on Google OAuth sign-in.
          </p>
        </div>

        <div className="shrink-0">
          {hasPassword ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500" aria-hidden="true" />
              Configured
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
              <span className="w-2 h-2 rounded-full bg-slate-400" aria-hidden="true" />
              Not Configured
            </span>
          )}
        </div>
      </div>

      {/* Success Notification */}
      {successMsg && (
        <div className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 px-3.5 py-2.5 text-xs text-emerald-800 flex items-center justify-between">
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

      {/* Error Notification */}
      {errorMsg && (
        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-xs text-red-800 flex items-center justify-between">
          <span className="flex items-center gap-1.5 font-medium">
            <span className="text-red-600 font-bold">✕</span>
            {errorMsg}
          </span>
          <button
            type="button"
            onClick={() => setErrorMsg('')}
            className="text-red-600 hover:text-red-800 text-xs font-bold px-1"
            aria-label="Dismiss message"
          >
            ✕
          </button>
        </div>
      )}

      {/* Mode: Idle (Standard summary and buttons) */}
      {mode === 'idle' && (
        <div className="mt-5 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100">
            <div>
              <div className="text-sm font-semibold text-slate-800">
                {hasPassword ? 'Super Admin Password' : 'No Password Set'}
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {hasPassword
                  ? 'A secure PBKDF2-SHA256 password is active on your account.'
                  : 'You currently sign in exclusively via Google OAuth or unconfigured password.'}
              </p>
            </div>

            <div className="flex items-center gap-2">
              {!hasPassword ? (
                <button
                  type="button"
                  onClick={() => {
                    setErrorMsg('');
                    setMode('add');
                  }}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-amber-600 text-white hover:bg-amber-700 transition-colors shadow-xs"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                  Add Password
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      setErrorMsg('');
                      setMode('change');
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 hover:border-slate-400 transition-colors shadow-xs"
                  >
                    Change Password
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setErrorMsg('');
                      setMode('confirm_remove');
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-white border border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 transition-colors shadow-xs"
                  >
                    Remove Password
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Optional Google Login Password Enforcement */}
          <div className="pt-4 border-t border-slate-100">
            <div className="flex items-start gap-3">
              <div className="pt-0.5">
                <input
                  id="require-password-google"
                  type="checkbox"
                  checked={requirePassword}
                  disabled={!hasPassword || enforceLoading}
                  onChange={(e) => handleToggleEnforcement(e.target.checked)}
                  className="w-4 h-4 text-amber-600 border-slate-300 rounded focus:ring-amber-500 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>
              <label
                htmlFor="require-password-google"
                className={`text-xs select-none ${
                  hasPassword ? 'cursor-pointer' : 'cursor-not-allowed opacity-75'
                }`}
              >
                <span className="font-semibold text-slate-900 block text-sm">
                  Require Super Admin password on Google login
                </span>
                <span className="text-slate-600 block mt-0.5 leading-relaxed">
                  {hasPassword
                    ? 'When enabled, signing in with Google OAuth will prompt for your Super Admin password before elevating your session to administrator access.'
                    : 'Configure an administrator password above to enable this additional sign-in safeguard.'}
                </span>
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Mode: Add or Change Password Form */}
      {(mode === 'add' || mode === 'change') && (
        <form onSubmit={handleSavePassword} className="mt-5 space-y-4">
          <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200 text-xs text-amber-900 leading-relaxed">
            <strong>Security Policy:</strong> Must be at least 10 characters long. Avoid common phrases or reused passwords.
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="new-admin-password"
                className="block text-xs font-semibold text-slate-700 mb-1"
              >
                {mode === 'add' ? 'New Password' : 'Change Password'}
              </label>
              <div className="relative">
                <input
                  id="new-admin-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimum 10 characters"
                  disabled={saving}
                  autoComplete="new-password"
                  minLength={10}
                  className="w-full text-xs font-mono px-3 py-2 pr-10 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 px-2.5 flex items-center text-slate-400 hover:text-slate-600 text-xs"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>

            <div>
              <label
                htmlFor="confirm-admin-password"
                className="block text-xs font-semibold text-slate-700 mb-1"
              >
                Confirm Password
              </label>
              <input
                id="confirm-admin-password"
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter password"
                disabled={saving}
                autoComplete="new-password"
                minLength={10}
                className="w-full text-xs font-mono px-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                required
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={resetForm}
              disabled={saving}
              className="px-3.5 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || !password || password.length < 10 || password !== confirmPassword}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-lg transition-colors shadow-xs disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Password'
              )}
            </button>
          </div>
        </form>
      )}

      {/* Mode: Confirm Remove */}
      {mode === 'confirm_remove' && (
        <div className="mt-5 p-4 rounded-xl bg-red-50 border border-red-200 text-xs text-red-900 space-y-3">
          <div>
            <strong className="font-semibold block text-sm text-red-800 mb-1">
              Remove Administrator Password?
            </strong>
            <p className="leading-relaxed">
              Are you sure you want to remove your password? This will also automatically disable the optional password enforcement on Google OAuth sign-in. Your Google OAuth login will continue to function.
            </p>
          </div>
          <div className="flex items-center justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={resetForm}
              disabled={saving}
              className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleRemovePassword}
              disabled={saving}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors shadow-xs disabled:opacity-50"
            >
              {saving ? 'Removing...' : 'Confirm Remove'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
