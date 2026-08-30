export const HETER_DOCUMENTS_TABLE =
  'CREATE TABLE IF NOT EXISTS heter_documents (id TEXT PRIMARY KEY, title TEXT NOT NULL, description TEXT NOT NULL, filename TEXT NOT NULL, storage_key TEXT NOT NULL UNIQUE, size INTEGER NOT NULL, active INTEGER NOT NULL DEFAULT 1, created_at TEXT NOT NULL)';
export const HETER_DOWNLOADS_TABLE =
  'CREATE TABLE IF NOT EXISTS heter_downloads (token TEXT PRIMARY KEY, document_id TEXT NOT NULL, payment_id TEXT NOT NULL, created_at TEXT NOT NULL)';
export const HETER_ACCESS_CODES_TABLE =
  "CREATE TABLE IF NOT EXISTS heter_access_codes (id TEXT PRIMARY KEY, document_id TEXT NOT NULL, code_hash TEXT NOT NULL UNIQUE, code_hint TEXT NOT NULL, label TEXT NOT NULL DEFAULT '', code_type TEXT NOT NULL, active INTEGER NOT NULL DEFAULT 1, use_count INTEGER NOT NULL DEFAULT 0, created_at TEXT NOT NULL, last_used_at TEXT)";
export const HETER_CODE_DOWNLOADS_TABLE =
  'CREATE TABLE IF NOT EXISTS heter_code_downloads (token TEXT PRIMARY KEY, document_id TEXT NOT NULL, code_id TEXT NOT NULL, created_at TEXT NOT NULL)';

export async function ensureHeterTables(db: any) {
  await db.batch([
    db.prepare(HETER_DOCUMENTS_TABLE),
    db.prepare(HETER_DOWNLOADS_TABLE),
    db.prepare(HETER_ACCESS_CODES_TABLE),
    db.prepare(HETER_CODE_DOWNLOADS_TABLE),
  ]);
}

const officialDocuments = [
  {
    title: 'Heter Iska for Using Someone Else’s Credit Card',
    description:
      'For an arrangement in which one person uses another person’s credit card.',
    filename: 'Heter-Iska-Credit-Card.pdf',
    url: 'https://kavharibis.com/wp-content/uploads/2025/09/Heret-Iska-for-using-some-ones-ells-credit-card.pdf',
  },
  {
    title: 'היתר עיסקא ברית פנחס משולב',
    description: 'The combined Bris Pinchos Heter Iska document.',
    filename: 'Heter-Iska-Bris-Pinchos-Combined.pdf',
    url: 'https://kavharibis.com/wp-content/uploads/2025/08/%C3%97_%C3%97_%C3%97a%C3%97%C2%A8-%C3%97%C2%A2%C3%97_%C3%97%C2%A1%C3%97%C2%A7%C3%97_-%C3%97_%C3%97%C2%A8%C3%97_%C3%97a-%C3%97%C2%A4%C3%97-%C3%97_%C3%97%C2%A1-%C3%97_%C3%97%C2%A9%C3%97_%C3%97_%C3%97_-1.pdf',
  },
  {
    title: 'English Heter Iska Bris Pinchos — Two Sides',
    description: 'An English, two-sided Bris Pinchos Heter Iska.',
    filename: 'English-Heter-Iska-Bris-Pinchos-Two-Sides.pdf',
    url: 'https://kavharibis.com/wp-content/uploads/2025/08/%C3%97_%C3%97-%C3%97_%C3%97_%C3%97_%C3%97a-%C3%97_%C3%97_%C3%97a%C3%97%C2%A8-%C3%97%C2%A2%C3%97_%C3%97%C2%A1%C3%97%C2%A7%C3%97_-%C3%97_%C3%97%C2%A8%C3%97_%C3%97a-%C3%97%C2%A4%C3%97-%C3%97_%C3%97%C2%A1-%C3%97%C2%A9%C3%97a%C3%97_-%C3%97%C2%A6%C3%97_%C3%97_%C3%97_%C3%97_-1.pdf',
  },
  {
    title: 'Heter Iska for Cosigner / Co-Borrower',
    description:
      'For financial arrangements involving a cosigner or co-borrower.',
    filename: 'Heter-Iska-Cosigner-Co-Borrower.pdf',
    url: 'https://kavharibis.com/wp-content/uploads/2025/08/HETER-ISKA-FOR-COBORROWER-1-2.pdf',
  },
  {
    title: 'Kav Haribis Standard Heter Iska — פלגא מלוה פלגא פקדון',
    description:
      'The Kav Haribis standard Heter Iska structured as half loan and half deposit.',
    filename: 'Kav-Haribis-Standard-Heter-Iska-Plaga-Milveh.pdf',
    url: 'https://kavharibis.com/wp-content/uploads/2025/10/%C3%97_%C3%97_%C3%97a%C3%97%C2%A8-%C3%97%C2%A2%C3%97_%C3%97%C2%A1%C3%97%C2%A7%C3%97_-%C3%97%C2%A4%C3%97_%C3%97_%C3%97_-%C3%97_%C3%97_%C3%97_%C3%97_-%C3%97_%C3%97%C2%A4%C3%97_%C3%97_%C3%97_-%C3%97%C2%A4%C3%97%C2%A7%C3%97_%C3%97_%C3%97_-of-kav-haribis.pdf',
  },
  {
    title: 'Kav Haribis Standard Heter Iska — כולו פיקדון',
    description:
      'The Kav Haribis standard Heter Iska structured entirely as a deposit.',
    filename: 'Kav-Haribis-Standard-Heter-Iska-Kulo-Pikadon.pdf',
    url: 'https://kavharibis.com/wp-content/uploads/2025/10/HETER-ISKA-KULO-PIKADON-of-kav-haribs-1.pdf',
  },
] as const;

export async function importOfficialHeterDocuments(db: any, bucket: any) {
  await ensureHeterTables(db);
  const existing = (await db
    .prepare('SELECT COUNT(*) AS count FROM heter_documents')
    .first()) as { count?: number } | null;
  if (Number(existing?.count || 0) > 0) return 0;
  let imported = 0;
  for (const item of officialDocuments) {
    const response = await fetch(item.url);
    if (!response.ok || !response.body)
      throw new Error(`Could not retrieve ${item.filename}`);
    const bytes = await response.arrayBuffer();
    if (!bytes.byteLength || bytes.byteLength > 100 * 1024 * 1024)
      throw new Error(`Invalid file ${item.filename}`);
    const id = crypto.randomUUID();
    const key = `heter-iska/${id}.pdf`;
    await bucket.put(key, bytes, {
      httpMetadata: {
        contentType: 'application/pdf',
        contentDisposition: `attachment; filename="${item.filename}"`,
      },
      customMetadata: {
        title: item.title,
        filename: item.filename,
        source: 'kavharibis.com',
      },
    });
    await db
      .prepare(
        'INSERT INTO heter_documents(id,title,description,filename,storage_key,size,active,created_at) VALUES(?,?,?,?,?,?,1,?)',
      )
      .bind(
        id,
        item.title,
        item.description,
        item.filename,
        key,
        bytes.byteLength,
        new Date(Date.now() + imported).toISOString(),
      )
      .run();
    imported++;
  }
  return imported;
}
