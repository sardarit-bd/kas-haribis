import source from '../data/current-site.json';
export const BANKS_TABLE =
  'CREATE TABLE IF NOT EXISTS banks (id TEXT PRIMARY KEY,title TEXT NOT NULL,status TEXT NOT NULL,summary TEXT NOT NULL,sort_order INTEGER NOT NULL DEFAULT 0,created_at TEXT NOT NULL)';
export const AUDIO_TABLE =
  'CREATE TABLE IF NOT EXISTS audio_items (id TEXT PRIMARY KEY,title TEXT NOT NULL,series TEXT NOT NULL,audio_url TEXT NOT NULL,sort_order INTEGER NOT NULL DEFAULT 0,created_at TEXT NOT NULL)';
export async function ensureBanks(db: any) {
  await db.prepare(BANKS_TABLE).run();
  const columns = await db.prepare('PRAGMA table_info(banks)').all();
  const names = new Set(
    (columns.results as Array<{ name: string }>).map((column) => column.name),
  );
  const additions = [
    ['comment', "TEXT NOT NULL DEFAULT ''"],
    ['last_updated', "TEXT NOT NULL DEFAULT ''"],
    ['full_report', "TEXT NOT NULL DEFAULT ''"],
    ['institution_type', "TEXT NOT NULL DEFAULT ''"],
    ['website', "TEXT NOT NULL DEFAULT ''"],
    ['logo_url', "TEXT NOT NULL DEFAULT ''"],
    ['researcher', "TEXT NOT NULL DEFAULT ''"],
    ['source_urls', "TEXT NOT NULL DEFAULT ''"],
    ['ownership_details', "TEXT NOT NULL DEFAULT ''"],
    ['iska_details', "TEXT NOT NULL DEFAULT ''"],
    ['internal_notes', "TEXT NOT NULL DEFAULT ''"],
  ] as const;
  for (const [name, type] of additions)
    if (!names.has(name))
      await db.prepare(`ALTER TABLE banks ADD COLUMN ${name} ${type}`).run();
  const row = (await db
    .prepare('SELECT COUNT(*) AS count FROM banks')
    .first()) as { count?: number } | null;
  if (Number(row?.count || 0) === 0) {
    const items = source.banks.map((bank, index) =>
      db
        .prepare(
          'INSERT INTO banks(id,title,status,summary,sort_order,created_at) VALUES(?,?,?,?,?,?)',
        )
        .bind(
          `legacy-${bank.id}`,
          bank.title,
          bank.status,
          bank.summary,
          index,
          new Date().toISOString(),
        ),
    );
    for (let i = 0; i < items.length; i += 50)
      await db.batch(items.slice(i, i + 50));
  }
}
export async function ensureBankReportTables(db: any) {
  await ensureBanks(db);
  await db.batch([
    db.prepare(
      'CREATE TABLE IF NOT EXISTS bank_report_codes (id TEXT PRIMARY KEY, bank_id TEXT NOT NULL, code_hash TEXT NOT NULL UNIQUE, code_hint TEXT NOT NULL, active INTEGER NOT NULL DEFAULT 1, created_at TEXT NOT NULL)',
    ),
    db.prepare(
      'CREATE TABLE IF NOT EXISTS bank_report_access (token TEXT PRIMARY KEY, bank_id TEXT NOT NULL, payment_id TEXT, method TEXT NOT NULL, created_at TEXT NOT NULL)',
    ),
  ]);
}
export async function listBanks(db: any) {
  await ensureBanks(db);
  const result = await db
    .prepare(
      'SELECT id,title,status,summary,comment,last_updated,institution_type,website,logo_url,CASE WHEN length(full_report)>0 THEN 1 ELSE 0 END AS has_full_report,sort_order FROM banks ORDER BY title COLLATE NOCASE ASC',
    )
    .all();
  return result.results as any[];
}
export async function listBanksAdmin(db: any) {
  await ensureBanks(db);
  const result = await db
    .prepare('SELECT * FROM banks ORDER BY title COLLATE NOCASE ASC')
    .all();
  return result.results as any[];
}

export const BANK_RESEARCH_TABLE = `CREATE TABLE IF NOT EXISTS bank_research_submissions (id TEXT PRIMARY KEY,reference TEXT NOT NULL UNIQUE,researcher_email TEXT NOT NULL,researcher_name TEXT NOT NULL DEFAULT '',title TEXT NOT NULL,institution_type TEXT NOT NULL DEFAULT '',status_recommendation TEXT NOT NULL DEFAULT 'unknown',website TEXT NOT NULL DEFAULT '',summary TEXT NOT NULL DEFAULT '',public_comment TEXT NOT NULL DEFAULT '',last_updated TEXT NOT NULL DEFAULT '',full_report TEXT NOT NULL DEFAULT '',source_urls TEXT NOT NULL DEFAULT '',ownership_details TEXT NOT NULL DEFAULT '',iska_details TEXT NOT NULL DEFAULT '',internal_notes TEXT NOT NULL DEFAULT '',logo_key TEXT NOT NULL DEFAULT '',logo_name TEXT NOT NULL DEFAULT '',report_key TEXT NOT NULL DEFAULT '',report_name TEXT NOT NULL DEFAULT '',workflow_status TEXT NOT NULL DEFAULT 'Draft',review_notes TEXT NOT NULL DEFAULT '',published_bank_id TEXT NOT NULL DEFAULT '',created_at TEXT NOT NULL,updated_at TEXT NOT NULL,submitted_at TEXT NOT NULL DEFAULT '',approved_at TEXT NOT NULL DEFAULT '')`;
export const BANK_RESEARCHERS_TABLE = `CREATE TABLE IF NOT EXISTS bank_researchers (email TEXT PRIMARY KEY,name TEXT NOT NULL DEFAULT '',active INTEGER NOT NULL DEFAULT 1,created_at TEXT NOT NULL)`;
export const BANK_RESEARCH_REVIEWERS_TABLE = `CREATE TABLE IF NOT EXISTS bank_research_reviewers (email TEXT PRIMARY KEY,name TEXT NOT NULL DEFAULT '',active INTEGER NOT NULL DEFAULT 1,created_at TEXT NOT NULL)`;
export async function ensureBankResearch(db: any) {
  await db.batch([
    db.prepare(BANK_RESEARCH_TABLE),
    db.prepare(BANK_RESEARCHERS_TABLE),
    db.prepare(BANK_RESEARCH_REVIEWERS_TABLE),
  ]);
  const columns = await db
    .prepare('PRAGMA table_info(bank_research_submissions)')
    .all();
  const names = new Set(
    (columns.results as Array<{ name: string }>).map((column) => column.name),
  );
  const additions = [
    ['reviewer_email', "TEXT NOT NULL DEFAULT ''"],
    ['reviewer_name', "TEXT NOT NULL DEFAULT ''"],
    ['reviewed_at', "TEXT NOT NULL DEFAULT ''"],
  ] as const;
  for (const [name, type] of additions)
    if (!names.has(name))
      await db
        .prepare(
          `ALTER TABLE bank_research_submissions ADD COLUMN ${name} ${type}`,
        )
        .run();
}
export async function ensureAudio(db: any) {
  await db.prepare(AUDIO_TABLE).run();
  const row = (await db
    .prepare('SELECT COUNT(*) AS count FROM audio_items')
    .first()) as { count?: number } | null;
  if (Number(row?.count || 0) === 0) {
    const items = source.audios.map((item, index) =>
      db
        .prepare(
          'INSERT INTO audio_items(id,title,series,audio_url,sort_order,created_at) VALUES(?,?,?,?,?,?)',
        )
        .bind(
          `legacy-${item.id}`,
          item.title,
          item.series,
          item.audioUrl,
          index,
          new Date().toISOString(),
        ),
    );
    for (let i = 0; i < items.length; i += 50)
      await db.batch(items.slice(i, i + 50));
  }
}
export async function listAudio(db: any) {
  await ensureAudio(db);
  const result = await db
    .prepare(
      'SELECT id,title,series,audio_url AS audioUrl,sort_order FROM audio_items ORDER BY sort_order,title',
    )
    .all();
  return result.results as Array<{
    id: string;
    title: string;
    series: string;
    audioUrl: string;
    sort_order: number;
  }>;
}

export const BUSINESSES_TABLE = `CREATE TABLE IF NOT EXISTS businesses (id TEXT PRIMARY KEY,name TEXT NOT NULL,category TEXT NOT NULL DEFAULT '',description TEXT NOT NULL DEFAULT '',address TEXT NOT NULL DEFAULT '',city TEXT NOT NULL DEFAULT '',state TEXT NOT NULL DEFAULT '',zip TEXT NOT NULL DEFAULT '',phone TEXT NOT NULL DEFAULT '',email TEXT NOT NULL DEFAULT '',website TEXT NOT NULL DEFAULT '',logo_url TEXT NOT NULL DEFAULT '',iska_authority TEXT NOT NULL DEFAULT '',iska_details TEXT NOT NULL DEFAULT '',verification_status TEXT NOT NULL DEFAULT 'Verified',last_verified TEXT NOT NULL DEFAULT '',public_notes TEXT NOT NULL DEFAULT '',internal_notes TEXT NOT NULL DEFAULT '',source_url TEXT NOT NULL DEFAULT '',published INTEGER NOT NULL DEFAULT 1,sort_order INTEGER NOT NULL DEFAULT 0,created_at TEXT NOT NULL,updated_at TEXT NOT NULL)`;
const legacyLogos: Record<number, string> = {
  2365: '/business-logos/katz-furniture.png',
  2310: '/business-logos/the-outlet-on-9.jpeg',
  2093: '/business-logos/stam-kahalacha.png',
  2087: '/business-logos/lakewood-stam.png',
  1558: '/business-logos/ez-pekalach.jpg',
  1498: '/business-logos/park-avenue-appliance.webp',
  1495: '/business-logos/juvenile-planet.png',
};
export async function ensureBusinesses(db: any) {
  await db.prepare(BUSINESSES_TABLE).run();
  const row = (await db
    .prepare('SELECT COUNT(*) AS count FROM businesses')
    .first()) as { count?: number } | null;
  if (Number(row?.count || 0) === 0) {
    const now = new Date().toISOString();
    const items = source.businesses.map((item, index) =>
      db
        .prepare(
          'INSERT INTO businesses(id,name,description,logo_url,source_url,published,sort_order,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?,?)',
        )
        .bind(
          `legacy-${item.id}`,
          item.title,
          item.summary || '',
          legacyLogos[item.id] || '',
          item.source || '',
          1,
          index,
          now,
          now,
        ),
    );
    for (let i = 0; i < items.length; i += 50)
      await db.batch(items.slice(i, i + 50));
  }
}
export async function listBusinesses(db: any, includePrivate = false) {
  await ensureBusinesses(db);
  const fields = includePrivate
    ? '*'
    : 'id,name,category,description,address,city,state,zip,phone,email,website,logo_url,iska_authority,iska_details,verification_status,last_verified,public_notes,source_url,published,sort_order,created_at,updated_at';
  const result = await db
    .prepare(
      `SELECT ${fields} FROM businesses ${includePrivate ? '' : 'WHERE published=1'} ORDER BY name COLLATE NOCASE ASC`,
    )
    .all();
  return result.results;
}
export const LOAN_SERVICES_TABLE = `CREATE TABLE IF NOT EXISTS loan_services (id TEXT PRIMARY KEY,name TEXT NOT NULL,contact_name TEXT NOT NULL DEFAULT '',service_type TEXT NOT NULL DEFAULT '',description TEXT NOT NULL DEFAULT '',specialties TEXT NOT NULL DEFAULT '',address TEXT NOT NULL DEFAULT '',city TEXT NOT NULL DEFAULT '',state TEXT NOT NULL DEFAULT '',zip TEXT NOT NULL DEFAULT '',service_area TEXT NOT NULL DEFAULT '',phone TEXT NOT NULL DEFAULT '',email TEXT NOT NULL DEFAULT '',website TEXT NOT NULL DEFAULT '',logo_url TEXT NOT NULL DEFAULT '',rabbinical_oversight TEXT NOT NULL DEFAULT '',kosher_details TEXT NOT NULL DEFAULT '',verification_status TEXT NOT NULL DEFAULT 'Verified',last_verified TEXT NOT NULL DEFAULT '',public_notes TEXT NOT NULL DEFAULT '',internal_notes TEXT NOT NULL DEFAULT '',published INTEGER NOT NULL DEFAULT 1,featured INTEGER NOT NULL DEFAULT 0,sort_order INTEGER NOT NULL DEFAULT 0,created_at TEXT NOT NULL,updated_at TEXT NOT NULL)`;
export async function ensureLoanServices(db: any) {
  await db.prepare(LOAN_SERVICES_TABLE).run();
  const row = (await db
    .prepare('SELECT COUNT(*) AS count FROM loan_services')
    .first()) as any;
  if (Number(row?.count || 0) === 0) {
    const now = new Date().toISOString();
    await db
      .prepare(
        'INSERT INTO loan_services(id,name,service_type,description,city,state,service_area,phone,website,rabbinical_oversight,kosher_details,verification_status,published,featured,sort_order,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)',
      )
      .bind(
        'legacy-iska-mortgages',
        'ISKA MORTGAGES LLC',
        'Mortgage broker',
        'Helping clients arrange mortgage financing through loan structures that respect halachic financial requirements.',
        'Lakewood',
        'NJ',
        'New York and New Jersey',
        '732-806-5409',
        'https://iskamortgage.com',
        'Bais Horaah of Rav Pinchos Vind Shlita',
        'Works with the Bais Horaah to help arrange kosher loan structures, including a proper Heter Iska where required.',
        'Verified',
        1,
        1,
        0,
        now,
        now,
      )
      .run();
  }
}
export async function listLoanServices(db: any, includePrivate = false) {
  await ensureLoanServices(db);
  const fields = includePrivate
    ? '*'
    : 'id,name,contact_name,service_type,description,specialties,address,city,state,zip,service_area,phone,email,website,logo_url,rabbinical_oversight,kosher_details,verification_status,last_verified,public_notes,published,featured,sort_order';
  const result = await db
    .prepare(
      `SELECT ${fields} FROM loan_services ${includePrivate ? '' : 'WHERE published=1'} ORDER BY featured DESC,name COLLATE NOCASE ASC`,
    )
    .all();
  return result.results;
}
export const ARTICLES_TABLE = `CREATE TABLE IF NOT EXISTS articles (id TEXT PRIMARY KEY,title TEXT NOT NULL,hebrew_title TEXT NOT NULL DEFAULT '',publication_date TEXT NOT NULL DEFAULT '',author TEXT NOT NULL DEFAULT 'Kav Haribis',summary TEXT NOT NULL DEFAULT '',pdf_url TEXT NOT NULL DEFAULT '',cover_url TEXT NOT NULL DEFAULT '',page_count INTEGER NOT NULL DEFAULT 2,published INTEGER NOT NULL DEFAULT 1,featured INTEGER NOT NULL DEFAULT 0,sort_order INTEGER NOT NULL DEFAULT 0,created_at TEXT NOT NULL,updated_at TEXT NOT NULL)`;
export async function ensureArticles(db: any) {
  await db.prepare(ARTICLES_TABLE).run();
  const row = (await db
    .prepare('SELECT COUNT(*) AS count FROM articles')
    .first()) as any;
  if (Number(row?.count || 0) === 0) {
    const now = new Date().toISOString();
    const items = source.articles.map((x, index) =>
      db
        .prepare(
          'INSERT INTO articles(id,title,publication_date,author,summary,pdf_url,cover_url,page_count,published,featured,sort_order,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?)',
        )
        .bind(
          `legacy-${x.id}`,
          x.title,
          x.date,
          'Kav Haribis',
          x.summary ||
            'A concise Kav Haribis publication offering practical guidance in Hilchos Ribbis.',
          `/article-pdfs/${x.id}.pdf`,
          `/article-covers/${x.id}.jpg`,
          x.id === 763 ? 4 : 2,
          1,
          index === 0 ? 1 : 0,
          index,
          now,
          now,
        ),
    );
    for (let i = 0; i < items.length; i += 50)
      await db.batch(items.slice(i, i + 50));
  }
}
export async function listArticles(db: any, includePrivate = false) {
  await ensureArticles(db);
  const result = await db
    .prepare(
      `SELECT * FROM articles ${includePrivate ? '' : 'WHERE published=1'} ORDER BY featured DESC,publication_date DESC,title COLLATE NOCASE ASC`,
    )
    .all();
  return result.results;
}
export const EDUCATIONAL_RESOURCES_TABLE = `CREATE TABLE IF NOT EXISTS educational_resources (id TEXT PRIMARY KEY,title TEXT NOT NULL,description TEXT NOT NULL DEFAULT '',resource_type TEXT NOT NULL DEFAULT 'Coloring Page',audience TEXT NOT NULL DEFAULT '',file_key TEXT NOT NULL DEFAULT '',file_name TEXT NOT NULL DEFAULT '',file_type TEXT NOT NULL DEFAULT '',published INTEGER NOT NULL DEFAULT 1,featured INTEGER NOT NULL DEFAULT 0,sort_order INTEGER NOT NULL DEFAULT 0,created_at TEXT NOT NULL,updated_at TEXT NOT NULL)`;
export async function ensureEducationalResources(db: any) {
  await db.prepare(EDUCATIONAL_RESOURCES_TABLE).run();
  const now = new Date().toISOString();
  await db.batch([
    db
      .prepare(
        'INSERT OR IGNORE INTO educational_resources(id,title,description,resource_type,audience,file_key,file_name,file_type,published,featured,sort_order,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?)',
      )
      .bind(
        'coloring-interest',
        'Lending With Interest Is Not OK',
        'A printable coloring and discussion page that introduces the basic idea of Ribbis through an everyday example.',
        'Coloring Page',
        'Elementary students',
        'static:/education/lending-with-interest-coloring-page.png',
        'lending-with-interest-coloring-page.png',
        'image/png',
        1,
        1,
        1,
        now,
        now,
      ),
    db
      .prepare(
        'INSERT OR IGNORE INTO educational_resources(id,title,description,resource_type,audience,file_key,file_name,file_type,published,featured,sort_order,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?)',
      )
      .bind(
        'coloring-condition',
        'Lending With a Condition Is Not OK',
        'A printable classroom coloring page about lending kindly without asking for a favor in return.',
        'Coloring Page',
        'Elementary students',
        'static:/education/lending-with-condition-coloring-page.png',
        'lending-with-condition-coloring-page.png',
        'image/png',
        1,
        1,
        2,
        now,
        now,
      ),
    db
      .prepare(
        'INSERT OR IGNORE INTO educational_resources(id,title,description,resource_type,audience,file_key,file_name,file_type,published,featured,sort_order,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?)',
      )
      .bind(
        'neighbors-guide-ribbis',
        'A Neighbor’s Guide to Ribbis',
        'A practical 16-page guide to common Ribbis questions between neighbors, based on the psakim of HaRav Pinchos Vind shlita.',
        'PDF Pamphlet',
        'Families and community learning',
        'static:/education/neighbors-guide-to-ribbis.pdf',
        'neighbors-guide-to-ribbis.pdf',
        'application/pdf',
        1,
        1,
        3,
        now,
        now,
      ),
    db
      .prepare(
        'INSERT OR IGNORE INTO educational_resources(id,title,description,resource_type,audience,file_key,file_name,file_type,published,featured,sort_order,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?)',
      )
      .bind(
        'ribbis-stench-tumah',
        'Ribbis Gave Off a Stench of Tumah',
        'A four-page illustrated Torah story about the Maharit Algazi and Rav Yaakov Chazan, showing the spiritual seriousness of Ribbis in an engaging format.',
        'Illustrated Story',
        'Students, families, and classrooms',
        'static:/education/ribbis-gave-off-a-stench-of-tumah.pdf',
        'ribbis-gave-off-a-stench-of-tumah.pdf',
        'application/pdf',
        1,
        1,
        4,
        now,
        now,
      ),
    db
      .prepare(
        'INSERT OR IGNORE INTO educational_resources(id,title,description,resource_type,audience,file_key,file_name,file_type,published,featured,sort_order,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?)',
      )
      .bind(
        'chaims-big-dream',
        'Chaim’s Big Dream',
        'An eight-page illustrated story of tzedakah, challenge, and Hilchos Ribbis that follows Chaim from a childhood dream through business success, loss, and renewed Torah learning.',
        'Picture Book',
        'Children, families, and classrooms',
        'static:/education/chaims-big-dream-picture-book.pdf',
        'chaims-big-dream-picture-book.pdf',
        'application/pdf',
        1,
        1,
        5,
        now,
        now,
      ),
  ]);
}
export async function listEducationalResources(
  db: any,
  includePrivate = false,
) {
  await ensureEducationalResources(db);
  const result = await db
    .prepare(
      `SELECT * FROM educational_resources ${includePrivate ? '' : "WHERE published=1 AND file_key<>''"} ORDER BY featured DESC,sort_order ASC,title COLLATE NOCASE ASC`,
    )
    .all();
  return result.results;
}
export const SAVINGS_ACCOUNTS_TABLE = `CREATE TABLE IF NOT EXISTS savings_accounts (id TEXT PRIMARY KEY,institution_name TEXT NOT NULL,account_name TEXT NOT NULL DEFAULT '',description TEXT NOT NULL DEFAULT '',apy TEXT NOT NULL DEFAULT '',minimum_deposit TEXT NOT NULL DEFAULT '',monthly_fee TEXT NOT NULL DEFAULT '',fdic_status TEXT NOT NULL DEFAULT '',kosher_status TEXT NOT NULL DEFAULT 'Reviewed',kosher_details TEXT NOT NULL DEFAULT '',last_reviewed TEXT NOT NULL DEFAULT '',open_account_url TEXT NOT NULL DEFAULT '',website TEXT NOT NULL DEFAULT '',logo_url TEXT NOT NULL DEFAULT '',public_notes TEXT NOT NULL DEFAULT '',internal_notes TEXT NOT NULL DEFAULT '',published INTEGER NOT NULL DEFAULT 1,featured INTEGER NOT NULL DEFAULT 0,sort_order INTEGER NOT NULL DEFAULT 0,created_at TEXT NOT NULL,updated_at TEXT NOT NULL)`;
export async function ensureSavingsAccounts(db: any) {
  await db.prepare(SAVINGS_ACCOUNTS_TABLE).run();
  const row = (await db
    .prepare('SELECT COUNT(*) AS count FROM savings_accounts')
    .first()) as any;
  if (Number(row?.count || 0) === 0) {
    const now = new Date().toISOString();
    const items = source.savingAccounts.map((x, index) =>
      db
        .prepare(
          'INSERT INTO savings_accounts(id,institution_name,account_name,description,kosher_status,kosher_details,open_account_url,website,published,featured,sort_order,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?)',
        )
        .bind(
          `legacy-${x.id}`,
          x.title,
          'High-Yield Savings Account',
          x.summary || 'High-yield savings account research from Kav Haribis.',
          'Needs current verification',
          'Review the account structure and current terms before opening an account.',
          '',
          '',
          1,
          index === 0 ? 1 : 0,
          index,
          now,
          now,
        ),
    );
    for (let i = 0; i < items.length; i += 50)
      await db.batch(items.slice(i, i + 50));
  }
  await db
    .prepare(
      "UPDATE savings_accounts SET website='',updated_at=? WHERE id LIKE 'legacy-%' AND website LIKE 'https://kavharibis.com/saving-accounts/%'",
    )
    .bind(new Date().toISOString())
    .run();
}
export async function listSavingsAccounts(db: any, includePrivate = false) {
  await ensureSavingsAccounts(db);
  const fields = includePrivate
    ? '*'
    : 'id,institution_name,account_name,description,apy,minimum_deposit,monthly_fee,fdic_status,kosher_status,kosher_details,last_reviewed,open_account_url,website,logo_url,public_notes,published,featured,sort_order';
  const result = await db
    .prepare(
      `SELECT ${fields} FROM savings_accounts ${includePrivate ? '' : 'WHERE published=1'} ORDER BY featured DESC,sort_order ASC,institution_name COLLATE NOCASE ASC`,
    )
    .all();
  return result.results;
}
export const INVESTMENTS_TABLE = `CREATE TABLE IF NOT EXISTS investment_opportunities (id TEXT PRIMARY KEY,opportunity_name TEXT NOT NULL,sponsor_name TEXT NOT NULL DEFAULT '',investment_type TEXT NOT NULL DEFAULT '',description TEXT NOT NULL DEFAULT '',minimum_investment TEXT NOT NULL DEFAULT '',return_information TEXT NOT NULL DEFAULT '',investment_term TEXT NOT NULL DEFAULT '',location TEXT NOT NULL DEFAULT '',availability_status TEXT NOT NULL DEFAULT 'Open',kosher_status TEXT NOT NULL DEFAULT 'Reviewed',rabbinical_oversight TEXT NOT NULL DEFAULT '',kosher_details TEXT NOT NULL DEFAULT '',last_reviewed TEXT NOT NULL DEFAULT '',risk_disclosure TEXT NOT NULL DEFAULT '',contact_name TEXT NOT NULL DEFAULT '',phone TEXT NOT NULL DEFAULT '',email TEXT NOT NULL DEFAULT '',opportunity_url TEXT NOT NULL DEFAULT '',logo_url TEXT NOT NULL DEFAULT '',public_notes TEXT NOT NULL DEFAULT '',internal_notes TEXT NOT NULL DEFAULT '',published INTEGER NOT NULL DEFAULT 1,featured INTEGER NOT NULL DEFAULT 0,sort_order INTEGER NOT NULL DEFAULT 0,created_at TEXT NOT NULL,updated_at TEXT NOT NULL)`;
export async function ensureInvestments(db: any) {
  await db.prepare(INVESTMENTS_TABLE).run();
}
export async function listInvestments(db: any, includePrivate = false) {
  await ensureInvestments(db);
  const fields = includePrivate
    ? '*'
    : 'id,opportunity_name,sponsor_name,investment_type,description,minimum_investment,return_information,investment_term,location,availability_status,kosher_status,rabbinical_oversight,kosher_details,last_reviewed,risk_disclosure,contact_name,phone,email,opportunity_url,logo_url,public_notes,published,featured,sort_order';
  const result = await db
    .prepare(
      `SELECT ${fields} FROM investment_opportunities ${includePrivate ? '' : 'WHERE published=1'} ORDER BY featured DESC,sort_order ASC,opportunity_name COLLATE NOCASE ASC`,
    )
    .all();
  return result.results;
}
export const RIBBIS_ALERTS_TABLE = `CREATE TABLE IF NOT EXISTS ribbis_alerts (id TEXT PRIMARY KEY,title TEXT NOT NULL,alert_date TEXT NOT NULL DEFAULT '',category TEXT NOT NULL DEFAULT 'General Alert',severity TEXT NOT NULL DEFAULT 'Important',alert_status TEXT NOT NULL DEFAULT 'Active',reviewed_by TEXT NOT NULL DEFAULT 'Kav Haribis',expires_at TEXT NOT NULL DEFAULT '',summary TEXT NOT NULL DEFAULT '',full_details TEXT NOT NULL DEFAULT '',action_label TEXT NOT NULL DEFAULT '',action_url TEXT NOT NULL DEFAULT '',published INTEGER NOT NULL DEFAULT 1,featured INTEGER NOT NULL DEFAULT 0,sort_order INTEGER NOT NULL DEFAULT 0,created_at TEXT NOT NULL,updated_at TEXT NOT NULL)`;
export async function ensureRibbisAlerts(db: any) {
  await db.prepare(RIBBIS_ALERTS_TABLE).run();
  const row = (await db
    .prepare('SELECT COUNT(*) AS count FROM ribbis_alerts')
    .first()) as any;
  if (Number(row?.count || 0) === 0) {
    const now = new Date().toISOString(),
      seed = [
        [
          'legacy-heter-iska-guidelines',
          'New Heter Iska Guidelines',
          '2025-08-28',
          'Heter Iska',
          'Important',
          'Updated rulings have been released regarding business partnerships. Please review the new guidelines to ensure compliance.',
          'Updated guidance affecting business partnerships and Heter Iska arrangements is now available. Review the current guidelines and consult the Bais Horaah when the proper structure is unclear.',
          'Review Heter Iska resources',
          '/heter-iska',
          1,
          1,
          0,
        ],
        [
          'legacy-loan-agreement-warning',
          'Ribbis Warning on Loan Agreements',
          '2025-07-15',
          'Loans',
          'Urgent',
          'We have identified a common issue in private loan contracts that may involve Ribbis. Consult the Bais Horaah before signing new agreements.',
          'Private loan documents can contain payment terms, penalties, or other provisions that raise serious Ribbis questions. Obtain guidance before signing or advancing funds.',
          'Ask the Bais Horaah',
          '/bais-horaah',
          1,
          0,
          1,
        ],
        [
          'legacy-business-directory-update',
          'Certified Businesses List Updated',
          '2025-06-30',
          'Directory Update',
          'Update',
          'The directory of businesses operating under a proper Heter Iska has been refreshed. Please check the new list before engaging in transactions.',
          'The Kav Haribis business directory was refreshed with updated Heter Iska information. Always review the current listing and its stated conditions.',
          'View the business directory',
          '/businesses-with-a-heter-iska',
          1,
          0,
          2,
        ],
      ];
    for (const x of seed)
      await db
        .prepare(
          'INSERT INTO ribbis_alerts(id,title,alert_date,category,severity,summary,full_details,action_label,action_url,published,featured,sort_order,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?)',
        )
        .bind(...x, now, now)
        .run();
  }
  await db
    .prepare(
      "UPDATE ribbis_alerts SET alert_status='Archived',featured=0,updated_at=? WHERE expires_at<>'' AND expires_at<? AND alert_status='Active'",
    )
    .bind(new Date().toISOString(), new Date().toISOString().slice(0, 10))
    .run();
}
export async function listRibbisAlerts(db: any, includePrivate = false) {
  await ensureRibbisAlerts(db);
  const result = await db
    .prepare(
      `SELECT * FROM ribbis_alerts ${includePrivate ? '' : 'WHERE published=1'} ORDER BY featured DESC,alert_date DESC,sort_order ASC,title COLLATE NOCASE ASC`,
    )
    .all();
  return result.results;
}
export const ALERT_TIPS_TABLE = `CREATE TABLE IF NOT EXISTS alert_tips (id TEXT PRIMARY KEY,reference TEXT NOT NULL UNIQUE,name TEXT NOT NULL DEFAULT '',email TEXT NOT NULL DEFAULT '',phone TEXT NOT NULL DEFAULT '',topic TEXT NOT NULL DEFAULT '',organization TEXT NOT NULL DEFAULT '',tip TEXT NOT NULL,source_url TEXT NOT NULL DEFAULT '',status TEXT NOT NULL DEFAULT 'New',notes TEXT NOT NULL DEFAULT '',created_at TEXT NOT NULL,updated_at TEXT NOT NULL)`;
export async function ensureAlertTips(db: any) {
  await db.prepare(ALERT_TIPS_TABLE).run();
}
export const ALERT_SUBSCRIBERS_TABLE = `CREATE TABLE IF NOT EXISTS alert_subscribers (id TEXT PRIMARY KEY,email TEXT NOT NULL UNIQUE,name TEXT NOT NULL DEFAULT '',active INTEGER NOT NULL DEFAULT 1,created_at TEXT NOT NULL)`;
export async function ensureAlertSubscribers(db: any) {
  await db.prepare(ALERT_SUBSCRIBERS_TABLE).run();
}
