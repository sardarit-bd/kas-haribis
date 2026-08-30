'use client';
import { useState } from 'react';
type Item = {
  id: string;
  name: string;
  email: string;
  active: number;
  created_at: string;
};
export default function Subscribers({
  initialItems,
}: {
  initialItems: Item[];
}) {
  const [items, setItems] = useState(initialItems);
  async function remove(x: Item) {
    if (!confirm(`Remove ${x.email} from the alert list?`)) return;
    await fetch(`/api/alert-subscriptions?id=${encodeURIComponent(x.id)}`, {
      method: 'DELETE',
    });
    setItems(items.filter((i) => i.id !== x.id));
  }
  return (
    <section className="subscriberAdmin">
      <div>
        <h2>{items.length} subscribers</h2>
        <p>
          Email delivery itself can be connected after the site has a
          sending-email service.
        </p>
      </div>
      <div>
        {items.map((x) => (
          <article key={x.id}>
            <span>{(x.name || x.email)[0].toUpperCase()}</span>
            <div>
              <b>{x.name || 'Subscriber'}</b>
              <a href={`mailto:${x.email}`}>{x.email}</a>
              <small>
                Joined {new Date(x.created_at).toLocaleDateString()}
              </small>
            </div>
            <button className="deleteButton" onClick={() => remove(x)}>
              Remove
            </button>
          </article>
        ))}
      </div>
    </section>
  );
}
