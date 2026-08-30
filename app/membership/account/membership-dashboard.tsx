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
    <section className="memberDashboard">
      <div className="memberDashboardGrid">
        <form className="memberProfileCard" onSubmit={save}>
          <p className="eyebrow gold">MEMBER PROFILE</p>
          <h2>Your information</h2>
          <label>
            Full name
            <input
              required
              value={member.name}
              onChange={(e) => setMember({ ...member, name: e.target.value })}
            />
          </label>
          <label>
            Email address
            <input value={member.email} disabled />
            <small>
              Your signed-in email identifies your secure membership.
            </small>
          </label>
          <label>
            Phone number <em>optional</em>
            <input
              value={member.phone}
              onChange={(e) => setMember({ ...member, phone: e.target.value })}
            />
          </label>
          <fieldset>
            <legend>Communication preferences</legend>
            <label>
              <input
                type="checkbox"
                checked={member.newsletter}
                onChange={(e) =>
                  setMember({ ...member, newsletter: e.target.checked })
                }
              />
              <span>
                <b>Kav Haribis newsletters</b>
                <small>Articles, gilyonos, and educational publications</small>
              </span>
            </label>
            <label>
              <input
                type="checkbox"
                checked={member.ribbisAlerts}
                onChange={(e) =>
                  setMember({ ...member, ribbisAlerts: e.target.checked })
                }
              />
              <span>
                <b>Ribbis Alerts</b>
                <small>Important warnings and community updates</small>
              </span>
            </label>
            <label>
              <input
                type="checkbox"
                checked={member.discounts}
                onChange={(e) =>
                  setMember({ ...member, discounts: e.target.checked })
                }
              />
              <span>
                <b>Service-discount notices</b>
                <small>Optional Kav Haribis member opportunities</small>
              </span>
            </label>
          </fieldset>
          {error && <p className="formError">{error}</p>}
          {saved && (
            <p className="memberSaved">
              ✓ Your Kav Haribis membership was saved.
            </p>
          )}
          <button className="primary" disabled={busy}>
            {busy ? 'Saving…' : 'Save membership preferences'}
          </button>
        </form>
        <aside className="memberIdentityCard">
          <div>
            <span>KH</span>
            <small>KAV HARIBIS MEMBER</small>
          </div>
          <p>{member.name || 'Member'}</p>
          <b>{member.email}</b>
          <small>
            Member since {new Date(member.createdAt).toLocaleDateString()}
          </small>
        </aside>
      </div>
      <section className="memberOrders">
        <div className="memberOrdersHead">
          <div>
            <p className="eyebrow gold">ORDER HISTORY</p>
            <h2>Your Kav Haribis orders</h2>
          </div>
          <span>{orders.length} orders</span>
        </div>
        {orders.length ? (
          <div className="memberOrderList">
            {orders.map((order) => (
              <article key={order.id}>
                <div>
                  <b>{order.itemSummary}</b>
                  <small>
                    {order.orderReference} ·{' '}
                    {new Date(order.createdAt).toLocaleDateString()}
                  </small>
                </div>
                <strong>${(order.totalCents / 100).toFixed(2)}</strong>
                <em>{order.status}</em>
              </article>
            ))}
          </div>
        ) : (
          <div className="memberOrderEmpty">
            <span>□</span>
            <h3>No Kav Haribis orders yet</h3>
            <p>
              When future orders are connected to this email address, they will
              appear here.
            </p>
            <a href="/seforim">Browse Kav Haribis seforim →</a>
          </div>
        )}
      </section>
    </section>
  );
}
