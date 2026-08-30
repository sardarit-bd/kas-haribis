export async function ensureContactSubmissions(db: any) {
  await db
    .prepare(
      `CREATE TABLE IF NOT EXISTS contact_submissions (id TEXT PRIMARY KEY,reference TEXT NOT NULL UNIQUE,name TEXT NOT NULL,email TEXT NOT NULL,phone TEXT,organization TEXT,topic TEXT NOT NULL,message TEXT NOT NULL,response_method TEXT,status TEXT NOT NULL DEFAULT 'New',notes TEXT,created_at TEXT NOT NULL,updated_at TEXT NOT NULL)`,
    )
    .run();
  for (const addition of [
    'related_name TEXT',
    'related_url TEXT',
    'request_subtype TEXT',
    'preferred_date TEXT',
    'location TEXT',
    'audience TEXT',
    'attachment_key TEXT',
    'attachment_name TEXT',
  ])
    try {
      await db
        .prepare(`ALTER TABLE contact_submissions ADD COLUMN ${addition}`)
        .run();
    } catch {}
}
