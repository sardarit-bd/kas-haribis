export async function ensureContactSubmissions(db: any) {
  if (!db) return;
  await db
    .prepare(
      `CREATE TABLE IF NOT EXISTS contact_submissions (
        id TEXT PRIMARY KEY,
        reference TEXT NOT NULL UNIQUE,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        phone TEXT,
        organization TEXT,
        topic TEXT NOT NULL,
        message TEXT NOT NULL,
        response_method TEXT,
        status TEXT NOT NULL DEFAULT 'New',
        notes TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        related_name TEXT,
        related_url TEXT,
        request_subtype TEXT,
        preferred_date TEXT,
        location TEXT,
        audience TEXT,
        attachment_key TEXT,
        attachment_name TEXT
      )`,
    )
    .run();

  try {
    const tableInfo = await db.prepare("PRAGMA table_info('contact_submissions')").all();
    const cols = new Set((tableInfo?.results || []).map((c: any) => String(c.name).toLowerCase()));
    const missing = [
      ['related_name', 'related_name TEXT'],
      ['related_url', 'related_url TEXT'],
      ['request_subtype', 'request_subtype TEXT'],
      ['preferred_date', 'preferred_date TEXT'],
      ['location', 'location TEXT'],
      ['audience', 'audience TEXT'],
      ['attachment_key', 'attachment_key TEXT'],
      ['attachment_name', 'attachment_name TEXT'],
    ].filter(([col]) => !cols.has(col));

    for (const [, addition] of missing) {
      await db.prepare(`ALTER TABLE contact_submissions ADD COLUMN ${addition}`).run();
    }
  } catch (error) {
    const msg = String(error).toLowerCase();
    if (!msg.includes('duplicate column')) throw error;
  }
}
