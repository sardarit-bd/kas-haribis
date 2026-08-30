export type SeferRecord = {
  id: string;
  title: string;
  price: number;
  available: boolean;
  image: string;
  description: string;
  sort_order: number;
  pdf_available: boolean;
  pdf_price: number;
  pdf_filename: string;
};

export const SEFORIM_TABLE =
  'CREATE TABLE IF NOT EXISTS seforim (id TEXT PRIMARY KEY,title TEXT NOT NULL,price REAL NOT NULL,available INTEGER NOT NULL DEFAULT 1,image TEXT NOT NULL,description TEXT NOT NULL,sort_order INTEGER NOT NULL DEFAULT 0,created_at TEXT NOT NULL)';

const initial: SeferRecord[] = [
  {
    id: '1215',
    title: 'כל הסדרה',
    price: 40,
    available: false,
    image: '/seforim/book-01.webp',
    description: 'The complete Kav Haribis seforim collection.',
    sort_order: 1,
  },
  {
    id: '1213',
    title: 'חוברות הלכות ריבית לתלמידים/ת',
    price: 40,
    available: true,
    image: '/seforim/book-02.webp',
    description: 'Student booklets for learning practical Hilchos Ribbis.',
    sort_order: 2,
  },
  {
    id: '1211',
    title: 'חוברות הלכות ריבית לחתן וכלה',
    price: 30,
    available: true,
    image: '/seforim/book-03.webp',
    description:
      'Practical Hilchos Ribbis booklets prepared for a chosson and kallah.',
    sort_order: 3,
  },
  {
    id: '1209',
    title: 'כסף פורח',
    price: 40,
    available: true,
    image: '/seforim/book-04.webp',
    description:
      'A Kav Haribis publication addressing practical financial halacha.',
    sort_order: 4,
  },
  {
    id: '1207',
    title: 'ספר איזהו נשך המבואר',
    price: 20,
    available: true,
    image: '/seforim/book-05.webp',
    description: 'An accessible explanation of the sugya of Eizehu Neshech.',
    sort_order: 5,
  },
  {
    id: '1204',
    title: 'חבילת ספר התשובות חלק א׳ וב׳, כסף פורח, עומק הריבית וחוברות',
    price: 50,
    available: false,
    image: '/seforim/book-06.webp',
    description:
      'A comprehensive package of responsa, practical seforim and educational booklets.',
    sort_order: 6,
  },
  {
    id: '1203',
    title: 'חבילת ריבית הלכה למעשה, ריבית ברורה ואיזהו נשך המבואר',
    price: 20,
    available: true,
    image: '/seforim/book-07.webp',
    description:
      'A bundled practical learning set covering core areas of Hilchos Ribbis.',
    sort_order: 7,
  },
  {
    id: '1201',
    title: 'ריבית הלכה למעשה – צרפתית',
    price: 50,
    available: true,
    image: '/seforim/book-08.webp',
    description: 'The practical Hilchos Ribbis guide in French.',
    sort_order: 8,
  },
  {
    id: '1198',
    title: 'מדריך הכשרות לעסקים',
    price: 40,
    available: false,
    image: '/seforim/book-09.webp',
    description:
      'A guide for evaluating and maintaining halachic financial compliance in business.',
    sort_order: 9,
  },
  {
    id: '1197',
    title: 'ריבית ברורה – ריבית הלכה למעשה במהדורה מצויירת ומנוקדת',
    price: 10,
    available: true,
    image: '/seforim/book-10.webp',
    description:
      'An illustrated and vowelized edition designed for clear, practical learning.',
    sort_order: 10,
  },
  {
    id: '1195',
    title: 'עומק הריבית – ברית פנחס',
    price: 20,
    available: true,
    image: '/seforim/book-11.webp',
    description:
      'In-depth learning in Hilchos Ribbis from the Bris Pinchos series.',
    sort_order: 11,
  },
  {
    id: '1193',
    title: 'ערכת היתר עיסקא כהלכתו – ברית פנחס',
    price: 50,
    available: true,
    image: '/seforim/book-12.webp',
    description:
      'A practical Bris Pinchos Heter Iska learning and document kit.',
    sort_order: 12,
  },
  {
    id: '874',
    title: 'ברית פנחס – הלכה למעשה',
    price: 20,
    available: true,
    image: '/seforim/book-13.webp',
    description:
      'Practical guidance in Hilchos Ribbis from the Bris Pinchos series.',
    sort_order: 13,
  },
  {
    id: '873',
    title: 'ספר התשובות חלק א׳ – ברית פנחס',
    price: 40,
    available: true,
    image: '/seforim/book-14.webp',
    description: 'Volume one of the Bris Pinchos responsa in Hilchos Ribbis.',
    sort_order: 14,
  },
  {
    id: '871',
    title: 'ספר התשובות חלק ב׳ – ברית פנחס',
    price: 70,
    available: true,
    image: '/seforim/book-15.webp',
    description: 'Volume two of the Bris Pinchos responsa in Hilchos Ribbis.',
    sort_order: 15,
  },
];

export async function ensureSeforim(db: any) {
  await db.prepare(SEFORIM_TABLE).run();
  for (const sql of [
    'ALTER TABLE seforim ADD COLUMN pdf_available INTEGER NOT NULL DEFAULT 0',
    'ALTER TABLE seforim ADD COLUMN pdf_price REAL NOT NULL DEFAULT 0',
    'ALTER TABLE seforim ADD COLUMN pdf_storage_key TEXT',
    'ALTER TABLE seforim ADD COLUMN pdf_filename TEXT',
  ]) {
    try {
      await db.prepare(sql).run();
    } catch {}
  }
  await db
    .prepare(
      'CREATE TABLE IF NOT EXISTS sefer_pdf_downloads (token TEXT PRIMARY KEY,sefer_id TEXT NOT NULL,payment_id TEXT NOT NULL,downloaded_at TEXT,created_at TEXT NOT NULL)',
    )
    .run();
  const row = (await db
    .prepare('SELECT COUNT(*) AS count FROM seforim')
    .first()) as { count?: number } | null;
  if (Number(row?.count || 0) === 0) {
    for (const book of initial)
      await db
        .prepare(
          'INSERT INTO seforim(id,title,price,available,image,description,sort_order,created_at) VALUES(?,?,?,?,?,?,?,?)',
        )
        .bind(
          book.id,
          book.title,
          book.price,
          book.available ? 1 : 0,
          book.image,
          book.description,
          book.sort_order,
          new Date().toISOString(),
        )
        .run();
  }
}
export async function listSeforim(db: any): Promise<SeferRecord[]> {
  await ensureSeforim(db);
  const result = await db
    .prepare(
      "SELECT id,title,price,available,image,description,sort_order,pdf_available,pdf_price,COALESCE(pdf_filename,'') pdf_filename FROM seforim ORDER BY sort_order,title",
    )
    .all();
  return (result.results as any[]).map((row) => ({
    ...row,
    price: Number(row.price),
    available: Boolean(row.available),
    sort_order: Number(row.sort_order),
    pdf_available: Boolean(row.pdf_available),
    pdf_price: Number(row.pdf_price || 0),
    pdf_filename: String(row.pdf_filename || ''),
  }));
}

export async function ensureSeforimOrders(db: any) {
  await ensureSeforim(db);
  await db
    .prepare(
      "CREATE TABLE IF NOT EXISTS sefer_orders (id TEXT PRIMARY KEY,customer_name TEXT NOT NULL,email TEXT NOT NULL,phone TEXT NOT NULL DEFAULT '',address TEXT NOT NULL DEFAULT '',city TEXT NOT NULL DEFAULT '',state TEXT NOT NULL DEFAULT '',zip TEXT NOT NULL DEFAULT '',total REAL NOT NULL,status TEXT NOT NULL,reference TEXT,created_at TEXT NOT NULL)",
    )
    .run();
  await db
    .prepare(
      'CREATE TABLE IF NOT EXISTS sefer_order_items (id TEXT PRIMARY KEY,order_id TEXT NOT NULL,sefer_id TEXT NOT NULL,title TEXT NOT NULL,format TEXT NOT NULL,quantity INTEGER NOT NULL,unit_price REAL NOT NULL)',
    )
    .run();
}
