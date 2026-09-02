export const ADMIN_OWNER = ['mdemong87@gmail.com',"kavharibis@gmail.com","sardarit.bd.official@gmail.com"];

export function isOwnerEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  const cleanEmail = String(email).trim().toLowerCase();
  return ADMIN_OWNER.some(
    (owner) => String(owner).trim().toLowerCase() === cleanEmail,
  );
}

export const ADMIN_SECTIONS = [
  {
    key: 'analytics',
    title: 'Visitor analytics',
    href: '/admin/analytics',
    description: 'Track visits, popular pages and sponsor-advertisement clicks',
  },
  {
    key: 'invoices',
    title: 'Invoice manager',
    href: '/admin/invoices',
    description:
      'Create customer invoices, generate polished PDFs and track payment status',
  },
  {
    key: 'certification',
    title: 'Investment certification',
    href: '/admin/certification',
    description:
      'Review applications, documents, statuses, outcomes and private notes',
  },
  {
    key: 'submissions',
    title: 'Contact submissions',
    href: '/admin/submissions',
    description:
      'Review messages, bank updates, program requests and service inquiries',
  },
  {
    key: 'bank-research',
    title: 'Bank research review',
    href: '/admin/bank-research',
    description:
      'Manage researchers, review lender reports, and approve listings before they go live',
    delegatable: false,
  },
  {
    key: 'genealogy',
    title: 'Genealogy requests',
    href: '/admin/genealogy',
    description:
      'Review genealogy and ownership-research requests, documents, statuses and private notes',
  },
  {
    key: 'articles',
    title: 'Articles & gilyonos',
    href: '/admin/articles',
    description: 'Upload, edit, publish and organize two-page PDF publications',
  },
  {
    key: 'educational-center',
    title: 'Educational Center',
    href: '/admin/educational-center',
    description:
      'Upload and publish coloring pages, pamphlets and classroom resources',
  },
  {
    key: 'alerts',
    title: 'Ribbis alerts',
    href: '/admin/alerts',
    description:
      'Add, edit, prioritize and publish warnings and community updates',
  },
  {
    key: 'alert-tips',
    title: 'Alert tip inbox',
    href: '/admin/alert-tips',
    description:
      'Review private tips submitted directly from the Ribbis Alerts page',
  },
  {
    key: 'alert-subscribers',
    title: 'Alert subscribers',
    href: '/admin/alert-subscribers',
    description:
      'Review and manage people who requested Ribbis Alerts by email',
  },
  {
    key: 'questions',
    title: 'Question inbox',
    href: '/admin/questions',
    description: 'Read and organize Bais Horaah submissions',
  },
  {
    key: 'heter-iska',
    title: 'Heter Iska files',
    href: '/admin/heter-iska',
    description: 'Manage previews, protected files and downloads',
  },
  {
    key: 'sponsors',
    title: 'Sponsor manager',
    href: '/admin/sponsors',
    description: 'Add logo, image and detailed popup advertisements',
  },
  {
    key: 'donations',
    title: 'Donation records',
    href: '/admin/donations',
    description: 'Review Cardknox and Zelle contributions',
  },
  {
    key: 'seforim',
    title: 'Seforim manager',
    href: '/admin/seforim',
    description:
      'Manage printed books, protected PDFs, separate prices, covers and availability',
  },
  {
    key: 'banks',
    title: 'Bank manager',
    href: '/admin/banks',
    description: 'Add, edit, classify and remove financial institutions',
  },
  {
    key: 'businesses',
    title: 'Business directory',
    href: '/admin/businesses',
    description: 'Add, edit, publish and remove businesses with a Heter Iska',
  },
  {
    key: 'loan-services',
    title: 'Kosher loan services',
    href: '/admin/loan-services',
    description:
      'Manage brokers, lenders, contact details and kosher oversight',
  },
  {
    key: 'savings',
    title: 'High-yield savings',
    href: '/admin/savings',
    description:
      'Manage account details, rates, logos and account-opening links',
  },
  {
    key: 'investments',
    title: 'Investment opportunities',
    href: '/admin/investments',
    description:
      'Manage sponsors, terms, disclosures, kosher reviews and opportunity links',
  },
  {
    key: 'audio',
    title: 'Audio manager',
    href: '/admin/audio',
    description: 'Add, rename, upload and remove shiurim',
  },
  {
    key: 'orders',
    title: 'Book orders',
    href: '/admin/orders',
    description: 'Track paid PDF and physical-book orders',
  },
  {
    key: 'settings',
    title: 'Payment settings',
    href: '/admin/settings',
    description: 'Check Cardknox connection readiness',
  },
] as const;

export type AdminSectionKey = (typeof ADMIN_SECTIONS)[number]['key'];

export async function ensureAdminStaff(db: any) {
  await db
    .prepare(
      "CREATE TABLE IF NOT EXISTS admin_staff_access (email TEXT PRIMARY KEY,name TEXT NOT NULL DEFAULT '',active INTEGER NOT NULL DEFAULT 1,permissions TEXT NOT NULL DEFAULT '[]',password_salt TEXT NOT NULL DEFAULT '',password_hash TEXT NOT NULL DEFAULT '',created_at TEXT NOT NULL,updated_at TEXT NOT NULL)",
    )
    .run();

  try {
    await db.prepare("ALTER TABLE admin_staff_access ADD COLUMN password_salt TEXT NOT NULL DEFAULT ''").run();
  } catch {}
  try {
    await db.prepare("ALTER TABLE admin_staff_access ADD COLUMN password_hash TEXT NOT NULL DEFAULT ''").run();
  } catch {}
}

const bytesToHex = (bytes: Uint8Array) =>
  Array.from(bytes)
    .map((value) => value.toString(16).padStart(2, '0'))
    .join('');

const hexToBytes = (hex: string) =>
  new Uint8Array(
    (hex.match(/.{1,2}/g) || []).map((value) => Number.parseInt(value, 16)),
  );

const randomHex = (length: number) => {
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  return bytesToHex(bytes);
};

async function derivePasswordHash(password: string, salt: string) {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(password),
    'PBKDF2',
    false,
    ['deriveBits'],
  );
  const bits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      hash: 'SHA-256',
      salt: hexToBytes(salt),
      iterations: 120000,
    },
    key,
    256,
  );
  return bytesToHex(new Uint8Array(bits));
}

function timingSafeEqual(a: string, b: string) {
  if (a.length !== b.length) return false;
  let difference = 0;
  for (let index = 0; index < a.length; index++) {
    difference |= a.charCodeAt(index) ^ b.charCodeAt(index);
  }
  return difference === 0;
}

export async function setStaffPassword(db: any, email: string, password: string) {
  await ensureAdminStaff(db);
  const cleanEmail = email.trim().toLowerCase();
  const salt = randomHex(16);
  const hash = await derivePasswordHash(password, salt);
  const now = new Date().toISOString();
  await db
    .prepare(
      'UPDATE admin_staff_access SET password_salt=?, password_hash=?, updated_at=? WHERE LOWER(email)=?',
    )
    .bind(salt, hash, now, cleanEmail)
    .run();
}

export async function verifyStaffPassword(db: any, email: string, password: string): Promise<boolean> {
  await ensureAdminStaff(db);
  const cleanEmail = email.trim().toLowerCase();
  const row = (await db
    .prepare(
      'SELECT password_salt, password_hash, active FROM admin_staff_access WHERE LOWER(email)=?',
    )
    .bind(cleanEmail)
    .first()) as any;

  if (!row) return false;
  // Account must be active
  if (row.active === 0) return false;
  if (!row.password_salt || !row.password_hash) return false;

  const actualHash = await derivePasswordHash(password, String(row.password_salt));
  return timingSafeEqual(actualHash, String(row.password_hash));
}

export async function isActiveStaffOrOwner(db: any, email: string | null | undefined): Promise<boolean> {
  if (!email) return false;
  const cleanEmail = String(email).trim().toLowerCase();
  if (isOwnerEmail(cleanEmail)) return true;
  await ensureAdminStaff(db);
  const row = (await db
    .prepare(
      'SELECT active FROM admin_staff_access WHERE LOWER(email)=? AND active=1',
    )
    .bind(cleanEmail)
    .first()) as any;
  return Boolean(row);
}

export function parsePermissions(value: unknown) {
  try {
    const parsed = JSON.parse(String(value || '[]'));
    return Array.isArray(parsed)
      ? parsed.filter(
          (x: unknown) =>
            typeof x === 'string' &&
            ADMIN_SECTIONS.some(
              (section) =>
                section.key === x &&
                !('delegatable' in section && section.delegatable === false),
            ),
        )
      : [];
  } catch {
    return [];
  }
}

export async function staffPermissions(db: any, email: string) {
  await ensureAdminStaff(db);
  const row = (await db
    .prepare(
      'SELECT permissions FROM admin_staff_access WHERE LOWER(email)=? AND active=1',
    )
    .bind(email.trim().toLowerCase())
    .first()) as any;
  return parsePermissions(row?.permissions);
}

export async function canAccessSection(
  db: any,
  email: string | null | undefined,
  sectionKey: string,
): Promise<boolean> {
  if (!email) return false;
  const cleanEmail = String(email).trim().toLowerCase();
  if (isOwnerEmail(cleanEmail)) return true;
  const permissions = await staffPermissions(db, cleanEmail);
  return permissions.includes(sectionKey);
}


