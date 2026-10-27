import { requireChatGPTUser } from '../../chatgpt-auth';
import ProductBreadcrumb from '../../componnent/ProductBreadcrumb';
import { ensureSeforimOrders } from '../../lib/seforim';
import { canAccessSection } from "../../lib/admin-access";
export const dynamic = 'force-dynamic';

const breadcrumbs = [
  { label: 'Dashboard', href: '/admin' },
  { label: 'Seforim Orders', href: '/admin/orders' },
];

export default async function OrdersPage() {
  const user = await requireChatGPTUser('/admin/orders');
  const { env } = await import('cloudflare:workers');
  if (!(await canAccessSection(env.DB, user.email, 'orders')))
    return (
      <main className="adminPage">
        <div className="adminShell">
          <h1>Administrator access</h1>
          <p>This account is not authorized to access this section.</p>
        </div>
      </main>
    );
  await ensureSeforimOrders(env.DB);
  const result = await env.DB.prepare(
      'SELECT * FROM sefer_orders ORDER BY created_at DESC',
    ).all(),
    orders = result.results as any[];
  for (const order of orders) {
    const items = await env.DB.prepare(
      'SELECT title,format,quantity,unit_price FROM sefer_order_items WHERE order_id=?',
    )
      .bind(order.id)
      .all();
    order.items = items.results;
  }
  return (
    <main className="adminPage">
      <div className="adminShell">
        <ProductBreadcrumb breadcrumbs={breadcrumbs} backbtn={true} />
        <div className="adminHeading">
          <div>
            <h1>Paid Seforim Orders</h1>
            <p>Physical-book shipping details and protected PDF purchases.</p>
          </div>
          <a href="/seforim">View store →</a>
        </div>
        <section className="orderAdminList">
          {orders.length ? (
            orders.map((order) => (
              <article key={order.id}>
                <header>
                  <div>
                    <b>{order.id}</b>
                    <span>{new Date(order.created_at).toLocaleString()}</span>
                  </div>
                  <strong>
                    ${Number(order.total).toFixed(2)} · {order.status}
                  </strong>
                </header>
                <div className="orderCustomer">
                  <p>
                    <b>{order.customer_name}</b>
                    <br />
                    {order.email}
                    {order.phone && (
                      <>
                        <br />
                        {order.phone}
                      </>
                    )}
                  </p>
                  {order.address && (
                    <p>
                      <b>Ship to</b>
                      <br />
                      {order.address}
                      <br />
                      {order.city}, {order.state} {order.zip}
                    </p>
                  )}
                  <p>
                    <b>Payment reference</b>
                    <br />
                    {order.reference}
                  </p>
                </div>
                <ul>
                  {order.items.map((x: any, i: number) => (
                    <li key={i}>
                      <span>{x.title}</span>
                      <b>
                        {x.format === 'pdf' ? 'PDF Download' : 'Printed Book'} ×{' '}
                        {x.quantity}
                      </b>
                      <em>
                        $
                        {(Number(x.unit_price) * Number(x.quantity)).toFixed(2)}
                      </em>
                    </li>
                  ))}
                </ul>
                <div
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: '12px',
                    paddingTop: '12px',
                    marginTop: '12px',
                    borderTop: '1px dashed #cbd5e1',
                    fontSize: '13px',
                    color: '#475569',
                  }}
                >
                  <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                    <span>
                      Items Subtotal:{' '}
                      <b className="text-slate-800 font-mono">
                        $
                        {(
                          Number(order.total) -
                          Number(order.delivery_total || 0)
                        ).toFixed(2)}
                      </b>
                    </span>
                    <span>
                      Delivery:{' '}
                      <b className="text-slate-800 font-mono">
                        {Number(order.delivery_total || 0) > 0
                          ? `$${Number(order.delivery_total).toFixed(2)}`
                          : 'FREE'}
                      </b>
                    </span>
                  </div>
                  <span style={{ fontSize: '15px' }}>
                    Charged Total:{' '}
                    <b className="text-[#a37828] font-mono font-bold">
                      ${Number(order.total).toFixed(2)}
                    </b>
                  </span>
                </div>
              </article>
            ))
          ) : (
            <div className="emptyOrders">
              <h2>No paid orders yet</h2>
              <p>Completed store purchases will appear here automatically.</p>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
