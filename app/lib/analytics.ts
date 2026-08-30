export async function ensureAnalytics(db: any) {
  await db
    .prepare(
      `CREATE TABLE IF NOT EXISTS site_analytics(id INTEGER PRIMARY KEY AUTOINCREMENT,event_type TEXT NOT NULL,path TEXT NOT NULL,visitor_id TEXT NOT NULL,item_id TEXT,item_name TEXT,referrer TEXT,created_at TEXT NOT NULL)`,
    )
    .run();
  await db
    .prepare(
      'CREATE INDEX IF NOT EXISTS idx_analytics_created ON site_analytics(created_at)',
    )
    .run();
  await db
    .prepare(
      'CREATE INDEX IF NOT EXISTS idx_analytics_event ON site_analytics(event_type)',
    )
    .run();
}
