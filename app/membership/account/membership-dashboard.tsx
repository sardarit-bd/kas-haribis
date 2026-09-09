'use client';
import { FormEvent, useState } from 'react';
import type { MemberOrder, MemberRecord } from '../../lib/members';

export default function MembershipDashboard({
  initialMember,
  orders,
}: {
  initialMember: MemberRecord;
  orders: MemberOrder[];
}) {
  const [member, setMember] = useState(initialMember),
    [busy, setBusy] = useState(false),
    [saved, setSaved] = useState(false),
    [error, setError] = useState('');
  async function save(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setSaved(false);
    setError('');
    try {
      const response = await fetch('/api/membership', {
        method: 'PUT',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(member),
      });
      const result = (await response.json()) as any;
      if (!response.ok)
        throw new Error(result.error || 'Your membership could not be saved.');
      setSaved(true);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Your membership could not be saved.',
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <section className="w-full">
      <div className="grid md:grid-cols-12 gap-8 items-start mb-12">
        <form className="md:col-span-8 bg-white border border-slate-200/90 p-6 sm:p-8 rounded-2xl flex flex-col gap-6 shadow-sm" onSubmit={save}>
          <div>
            <p className="text-[#a37828] text-xs font-bold tracking-widest uppercase mb-1">MEMBER PROFILE</p>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#102a43]">Your information</h2>
          </div>
          <label className="flex flex-col gap-1.5 text-xs font-semibold text-slate-600">
            Full name
            <input
              className="bg-[#f8fafc] border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 text-sm focus:outline-none focus:border-[#c69b46]"
              required
              value={member.name}
              onChange={(e) => setMember({ ...member, name: e.target.value })}
            />
          </label>
          <label className="flex flex-col gap-1.5 text-xs font-semibold text-slate-600">
            Email address
            <input className="bg-slate-100 border border-slate-200 text-slate-500 rounded-xl px-3.5 py-2.5 text-sm cursor-not-allowed" value={member.email} disabled />
            <small className="text-slate-500 font-normal">
              Your signed-in email identifies your secure membership.
            </small>
          </label>
          <label className="flex flex-col gap-1.5 text-xs font-semibold text-slate-600">
            <span>Phone number <em className="text-slate-500 font-normal not-italic">(optional)</em></span>
            <input
              className="bg-[#f8fafc] border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 text-sm focus:outline-none focus:border-[#c69b46]"
              value={member.phone}
              onChange={(e) => setMember({ ...member, phone: e.target.value })}
            />
          </label>
          <fieldset className="border border-slate-200 rounded-xl p-5 flex flex-col gap-4">
            <legend className="text-xs font-bold text-[#a37828] tracking-wider uppercase px-2">Communication preferences</legend>
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                className="mt-1 accent-[#a37828] w-4 h-4 rounded"
                type="checkbox"
                checked={member.newsletter}
                onChange={(e) =>
                  setMember({ ...member, newsletter: e.target.checked })
                }
              />
              <span className="flex flex-col">
                <b className="text-slate-800 text-sm font-semibold">Kav Haribis newsletters</b>
                <small className="text-slate-500 text-xs font-normal">Articles, gilyonos, and educational publications</small>
              </span>
            </label>
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                className="mt-1 accent-[#a37828] w-4 h-4 rounded"
                type="checkbox"
                checked={member.ribbisAlerts}
                onChange={(e) =>
                  setMember({ ...member, ribbisAlerts: e.target.checked })
                }
              />
              <span className="flex flex-col">
                <b className="text-slate-800 text-sm font-semibold">Ribbis Alerts</b>
                <small className="text-slate-500 text-xs font-normal">Important warnings and community updates</small>
              </span>
            </label>
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                className="mt-1 accent-[#a37828] w-4 h-4 rounded"
                type="checkbox"
                checked={member.discounts}
                onChange={(e) =>
                  setMember({ ...member, discounts: e.target.checked })
                }
              />
              <span className="flex flex-col">
                <b className="text-slate-800 text-sm font-semibold">Service-discount notices</b>
                <small className="text-slate-500 text-xs font-normal">Optional Kav Haribis member opportunities</small>
              </span>
            </label>
          </fieldset>
          {error && <p className="bg-rose-50 border border-rose-200 text-rose-700 text-sm p-3.5 rounded-xl">{error}</p>}
          {saved && (
            <p className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm p-3.5 rounded-xl">
              ✓ Your Kav Haribis membership was saved.
            </p>
          )}
          <button className="py-3 px-6 rounded-xl bg-[#102a43] hover:bg-[#102a43]/90 text-white font-bold text-sm tracking-wide transition shadow-sm cursor-pointer self-start disabled:opacity-50" style={{ color: 'white' }} disabled={busy}>
            {busy ? 'Saving…' : 'Save membership preferences'}
          </button>
        </form>
        <aside className="md:col-span-4 bg-white border border-slate-200/90 p-6 sm:p-8 rounded-2xl text-center shadow-sm flex flex-col items-center">
          <div className="w-16 h-16 rounded-full bg-[#f8fafc] border-2 border-[#a37828] flex flex-col items-center justify-center mb-4 text-[#102a43]">
            <span className="font-serif text-lg font-bold">KH</span>
            <small className="text-[7px] font-bold tracking-widest uppercase text-[#a37828]">MEMBER</small>
          </div>
          <p className="text-xl font-serif font-bold text-[#102a43] mb-1">{member.name || 'Member'}</p>
          <b className="text-slate-600 text-sm font-mono block mb-4 break-all">{member.email}</b>
          <small className="text-slate-500 text-xs pt-4 border-t border-slate-100 w-full block">
            Member since {new Date(member.createdAt).toLocaleDateString()}
          </small>
        </aside>
      </div>
      <section className="bg-white border border-slate-200/90 p-6 sm:p-8 rounded-2xl shadow-sm">
        <div className="flex items-center justify-between gap-4 mb-6 border-b border-slate-100 pb-4">
          <div>
            <p className="text-[#a37828] text-xs font-bold tracking-widest uppercase mb-1">ORDER HISTORY</p>
            <h2 className="text-2xl font-serif font-bold text-[#102a43]">Your Kav Haribis orders</h2>
          </div>
          <span className="bg-[#f8fafc] border border-slate-200 text-slate-600 text-xs font-semibold px-3 py-1 rounded-full">{orders.length} orders</span>
        </div>
        {orders.length ? (
          <div className="flex flex-col gap-3">
            {orders.map((order) => (
              <article className="bg-[#f8fafc] border border-slate-200/90 p-4 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4" key={order.id}>
                <div>
                  <b className="text-slate-900 font-serif text-base block mb-1">{order.itemSummary}</b>
                  <small className="text-slate-500 font-mono text-xs">
                    {order.orderReference} ·{' '}
                    {new Date(order.createdAt).toLocaleDateString()}
                  </small>
                </div>
                <div className="flex items-center gap-4 shrink-0">
                  <strong className="text-[#a37828] font-mono text-base">${(order.totalCents / 100).toFixed(2)}</strong>
                  <em className="not-italic text-xs font-semibold uppercase px-2.5 py-1 rounded bg-slate-100 text-slate-700 border border-slate-200">{order.status}</em>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <span className="text-3xl text-slate-400 block mb-2">□</span>
            <h3 className="text-lg font-serif font-bold text-[#102a43] mb-2">No Kav Haribis orders yet</h3>
            <p className="text-slate-500 text-sm max-w-md mx-auto mb-6">
              When future orders are connected to this email address, they will
              appear here.
            </p>
            <a className="inline-flex items-center gap-1.5 text-[#a37828] hover:text-[#102a43] text-sm font-bold transition" href="/seforim">Browse Kav Haribis seforim →</a>
          </div>
        )}
      </section>
    </section>
  );
}

