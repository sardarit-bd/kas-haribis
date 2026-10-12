export async function ensureInvoices(db: any) {
  if (!db) return;
  await db
    .prepare(
      `CREATE TABLE IF NOT EXISTS invoices (
    id TEXT PRIMARY KEY,
    invoice_number TEXT NOT NULL UNIQUE,
    customer_name TEXT NOT NULL,
    customer_email TEXT NOT NULL,
    company TEXT,
    address TEXT,
    description TEXT NOT NULL,
    amount REAL NOT NULL,
    issue_date TEXT NOT NULL,
    due_date TEXT,
    status TEXT NOT NULL DEFAULT 'Draft',
    notes TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    document_type TEXT NOT NULL DEFAULT 'Invoice',
    payment_method TEXT,
    payment_reference TEXT,
    goods_services TEXT NOT NULL DEFAULT 'No goods or services were provided in exchange for this contribution.'
  )`,
    )
    .run();

  try {
    const tableInfo = await db.prepare("PRAGMA table_info('invoices')").all();
    const cols = new Set((tableInfo?.results || []).map((c: any) => String(c.name).toLowerCase()));
    const missing = [
      ['document_type', "ALTER TABLE invoices ADD COLUMN document_type TEXT NOT NULL DEFAULT 'Invoice'"],
      ['payment_method', 'ALTER TABLE invoices ADD COLUMN payment_method TEXT'],
      ['payment_reference', 'ALTER TABLE invoices ADD COLUMN payment_reference TEXT'],
      ['goods_services', "ALTER TABLE invoices ADD COLUMN goods_services TEXT NOT NULL DEFAULT 'No goods or services were provided in exchange for this contribution.'"],
    ].filter(([col]) => !cols.has(col));

    for (const [, statement] of missing) {
      await db.prepare(statement).run();
    }
  } catch (error) {
    const msg = String(error).toLowerCase();
    if (!msg.includes('duplicate column')) throw error;
  }
}
