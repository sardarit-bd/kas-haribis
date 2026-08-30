export type MemberRecord = {
  email: string;
  name: string;
  phone: string;
  newsletter: boolean;
  ribbisAlerts: boolean;
  discounts: boolean;
  createdAt: string;
  updatedAt: string;
};
export type MemberOrder = {
  id: string;
  orderReference: string;
  itemSummary: string;
  totalCents: number;
  status: string;
  createdAt: string;
};
export const MEMBERS_TABLE = `CREATE TABLE IF NOT EXISTS members (email TEXT PRIMARY KEY,name TEXT NOT NULL DEFAULT '',phone TEXT NOT NULL DEFAULT '',newsletter INTEGER NOT NULL DEFAULT 1,ribbis_alerts INTEGER NOT NULL DEFAULT 1,discounts INTEGER NOT NULL DEFAULT 0,created_at TEXT NOT NULL,updated_at TEXT NOT NULL)`;
export const MEMBER_ORDERS_TABLE = `CREATE TABLE IF NOT EXISTS member_orders (id TEXT PRIMARY KEY,member_email TEXT NOT NULL,order_reference TEXT NOT NULL DEFAULT '',item_summary TEXT NOT NULL DEFAULT '',total_cents INTEGER NOT NULL DEFAULT 0,status TEXT NOT NULL DEFAULT 'Pending',created_at TEXT NOT NULL)`;
export async function ensureMembership(db: any) {
  await db.batch([
    db.prepare(MEMBERS_TABLE),
    db.prepare(MEMBER_ORDERS_TABLE),
    db.prepare(
      'CREATE INDEX IF NOT EXISTS member_orders_email_idx ON member_orders(member_email)',
    ),
  ]);
}
export async function getOrCreateMember(
  db: any,
  email: string,
  name = '',
): Promise<MemberRecord> {
  await ensureMembership(db);
  const now = new Date().toISOString();
  await db
    .prepare(
      "INSERT OR IGNORE INTO members(email,name,phone,newsletter,ribbis_alerts,discounts,created_at,updated_at) VALUES(?,?, '',1,1,0,?,?)",
    )
    .bind(email, name, now, now)
    .run();
  const row = (await db
    .prepare('SELECT * FROM members WHERE email=?')
    .bind(email)
    .first()) as any;
  return {
    email: row.email,
    name: row.name || name,
    phone: row.phone || '',
    newsletter: Boolean(row.newsletter),
    ribbisAlerts: Boolean(row.ribbis_alerts),
    discounts: Boolean(row.discounts),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
export async function listMemberOrders(
  db: any,
  email: string,
): Promise<MemberOrder[]> {
  await ensureMembership(db);
  const result = await db
    .prepare(
      'SELECT id,order_reference,item_summary,total_cents,status,created_at FROM member_orders WHERE member_email=? ORDER BY created_at DESC',
    )
    .bind(email)
    .all();
  return (result.results as any[]).map((row) => ({
    id: row.id,
    orderReference: row.order_reference,
    itemSummary: row.item_summary,
    totalCents: Number(row.total_cents),
    status: row.status,
    createdAt: row.created_at,
  }));
}
