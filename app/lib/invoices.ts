export async function ensureInvoices(db: any) {
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
    updated_at TEXT NOT NULL
  )`,
    )
    .run();
  for (const statement of [
    "ALTER TABLE invoices ADD COLUMN document_type TEXT NOT NULL DEFAULT 'Invoice'",
    'ALTER TABLE invoices ADD COLUMN payment_method TEXT',
    'ALTER TABLE invoices ADD COLUMN payment_reference TEXT',
    "ALTER TABLE invoices ADD COLUMN goods_services TEXT NOT NULL DEFAULT 'No goods or services were provided in exchange for this contribution.'",
  ]) {
    try {
      await db.prepare(statement).run();
    } catch (error) {
      if (!String(error).toLowerCase().includes('duplicate column'))
        throw error;
    }
  }
}
