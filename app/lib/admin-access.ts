import { cache } from 'react';
import { ensureAdminProfiles } from './admin-profile.ts';

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
    key: 'common-questions',
    title: 'Common questions',
    href: '/admin/common-questions',
    description: 'Add, update, and manage public FAQ / common questions',
  },
  {
    key: 'about-members',
    title: 'About Us Team',
    href: '/admin/about-members',
    description: 'Add, update, and manage About Us team members and specialists',
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
  if (!db) return;
  await db
    .prepare(
      "CREATE TABLE IF NOT EXISTS admin_staff_access (email TEXT PRIMARY KEY,name TEXT NOT NULL DEFAULT '',active INTEGER NOT NULL DEFAULT 1,permissions TEXT NOT NULL DEFAULT '[]',password_salt TEXT NOT NULL DEFAULT '',password_hash TEXT NOT NULL DEFAULT '',created_at TEXT NOT NULL,updated_at TEXT NOT NULL)",
    )
    .run();

  try {
    const prep = db.prepare("PRAGMA table_info('admin_staff_access')");
    if (typeof prep?.all === 'function') {
      const tableInfo = await prep.all();
      const cols = new Set((tableInfo?.results || []).map((c: any) => String(c.name).toLowerCase()));
      if (!cols.has('password_salt')) {
        await db.prepare("ALTER TABLE admin_staff_access ADD COLUMN password_salt TEXT NOT NULL DEFAULT ''").run();
      }
      if (!cols.has('password_hash')) {
        await db.prepare("ALTER TABLE admin_staff_access ADD COLUMN password_hash TEXT NOT NULL DEFAULT ''").run();
      }
    }
  } catch (error) {
    const msg = String(error).toLowerCase();
    if (!msg.includes('duplicate column')) throw error;
  }
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

export const CURRENT_PBKDF2_ITERATIONS = 100000;
export const LEGACY_PBKDF2_ITERATIONS = 120000;

async function derivePasswordHash(
  password: string,
  salt: string,
  iterations = CURRENT_PBKDF2_ITERATIONS,
) {
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
      iterations,
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

export async function createStaffPasswordCredentials(password: string) {
  const salt = randomHex(16);
  const hash = await derivePasswordHash(password, salt, CURRENT_PBKDF2_ITERATIONS);
  return { salt, hash };
}

export async function setStaffPassword(db: any, email: string, password: string) {
  const cleanEmail = email.trim().toLowerCase();
  if (isOwnerEmail(cleanEmail)) {
    throw new Error('This email belongs to an admin account and cannot be managed as staff.');
  }
  await ensureAdminStaff(db);
  const { salt, hash } = await createStaffPasswordCredentials(password);
  const now = new Date().toISOString();
  await db
    .prepare(
      'UPDATE admin_staff_access SET password_salt=?, password_hash=?, updated_at=? WHERE LOWER(email)=?',
    )
    .bind(salt, hash, now, cleanEmail)
    .run();
}

export async function setOwnerPassword(db: any, email: string, password: string) {
  const cleanEmail = email.trim().toLowerCase();
  if (!isOwnerEmail(cleanEmail)) {
    throw new Error('Email is not an authorized owner.');
  }
  await ensureAdminProfiles(db);
  const { salt, hash } = await createStaffPasswordCredentials(password);
  const now = new Date().toISOString();
  await db
    .prepare(
      'INSERT INTO admin_profiles (email, name, password_salt, password_hash, updated_at) VALUES (?, ?, ?, ?, ?) ON CONFLICT(email) DO UPDATE SET password_salt=excluded.password_salt, password_hash=excluded.password_hash, updated_at=excluded.updated_at',
    )
    .bind(cleanEmail, '', salt, hash, now)
    .run();
}

export async function setUserPassword(db: any, email: string, password: string) {
  const cleanEmail = email.trim().toLowerCase();
  if (isOwnerEmail(cleanEmail)) {
    await setOwnerPassword(db, cleanEmail, password);
  } else {
    await setStaffPassword(db, cleanEmail, password);
  }
}

export async function verifyStaffPassword(db: any, email: string, password: string): Promise<boolean> {
  const cleanEmail = email.trim().toLowerCase();

  // Owner verification: only authorized owners can authenticate against admin_profiles
  if (isOwnerEmail(cleanEmail)) {
    await ensureAdminProfiles(db);
    const row = (await db
      .prepare(
        'SELECT password_salt, password_hash FROM admin_profiles WHERE LOWER(email)=?',
      )
      .bind(cleanEmail)
      .first()) as any;

    if (!row || !row.password_salt || !row.password_hash) return false;

    const actualHash = await derivePasswordHash(
      password,
      String(row.password_salt),
      CURRENT_PBKDF2_ITERATIONS,
    );
    if (timingSafeEqual(actualHash, String(row.password_hash))) return true;

    try {
      const legacyHash = await derivePasswordHash(
        password,
        String(row.password_salt),
        LEGACY_PBKDF2_ITERATIONS,
      );
      return timingSafeEqual(legacyHash, String(row.password_hash));
    } catch {
      return false;
    }
  }

  // Staff verification: active staff in admin_staff_access
  await ensureAdminStaff(db);
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

  const actualHash = await derivePasswordHash(
    password,
    String(row.password_salt),
    CURRENT_PBKDF2_ITERATIONS,
  );
  if (timingSafeEqual(actualHash, String(row.password_hash))) return true;

  try {
    const legacyHash = await derivePasswordHash(
      password,
      String(row.password_salt),
      LEGACY_PBKDF2_ITERATIONS,
    );
    return timingSafeEqual(legacyHash, String(row.password_hash));
  } catch {
    return false;
  }
}

export async function isActiveStaffOrOwner(db: any, email: string | null | undefined): Promise<boolean> {
  if (!email) return false;
  const cleanEmail = String(email).trim().toLowerCase();
  if (isOwnerEmail(cleanEmail)) return true;
  await ensureAdminStaff(db);
  const row = (await db
    .prepare(
      'SELECT active FROM admin_staff_access WHERE LOWER(TRIM(email))=? AND active=1',
    )
    .bind(cleanEmail)
    .first()) as any;
  return Boolean(row);
}

export function parsePermissions(value: unknown): string[] {
  if (!value) return [];
  let rawList: unknown[] = [];
  if (Array.isArray(value)) {
    rawList = value;
  } else if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) return [];
    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) {
        rawList = parsed;
      } else if (typeof parsed === 'string') {
        try {
          const secondParse = JSON.parse(parsed);
          if (Array.isArray(secondParse)) {
            rawList = secondParse;
          } else {
            rawList = [parsed];
          }
        } catch {
          rawList = [parsed];
        }
      }
    } catch {
      rawList = trimmed.split(',').map((s) => s.trim()).filter(Boolean);
    }
  } else if (typeof value === 'object' && value !== null) {
    rawList = Object.values(value);
  }

  return rawList
    .map((x) => String(x || '').trim().toLowerCase())
    .filter((x) =>
      ADMIN_SECTIONS.some(
        (section) =>
          section.key.toLowerCase() === x &&
          !('delegatable' in section && section.delegatable === false),
      ),
    );
}

import { AsyncLocalStorage } from 'node:async_hooks';

const requestStorage = new AsyncLocalStorage<Map<string, any>>();

export function withRequestScope<T>(fn: () => Promise<T>): Promise<T> {
  const store = new Map<string, any>();
  return requestStorage.run(store, fn);
}

export interface StaffProfile {
  name: string;
  permissions: string[];
}

async function queryStaffProfile(db: any, email: string): Promise<StaffProfile | null> {
  if (!db || !email) return null;
  const cleanEmail = String(email).trim().toLowerCase();
  if (isOwnerEmail(cleanEmail)) return null;

  const query =
    'SELECT name, permissions FROM admin_staff_access WHERE LOWER(TRIM(email))=? AND active=1';
  try {
    const row = (await db.prepare(query).bind(cleanEmail).first()) as any;
    if (!row) return null;
    return {
      name: String(row.name || '').trim(),
      permissions: parsePermissions(row.permissions),
    };
  } catch (err: any) {
    if (String(err).toLowerCase().includes('no such table')) {
      await ensureAdminStaff(db);
      const row = (await db.prepare(query).bind(cleanEmail).first()) as any;
      if (!row) return null;
      return {
        name: String(row.name || '').trim(),
        permissions: parsePermissions(row.permissions),
      };
    }
    throw err;
  }
}

const cachedQueryStaffProfile = cache(queryStaffProfile);

export async function getRequestStaffProfile(db: any, email: string): Promise<StaffProfile | null> {
  const store = requestStorage.getStore();
  if (store) {
    const cleanEmail = String(email || '').trim().toLowerCase();
    const key = `staff_profile:${cleanEmail}`;
    if (store.has(key)) {
      return store.get(key);
    }
    const promise = cachedQueryStaffProfile(db, email);
    store.set(key, promise);
    return promise;
  }
  return cachedQueryStaffProfile(db, email);
}

export async function staffPermissions(db: any, email: string): Promise<string[]> {
  if (!db || !email) return [];
  const cleanEmail = String(email).trim().toLowerCase();
  if (isOwnerEmail(cleanEmail)) {
    return ADMIN_SECTIONS.map((section) => section.key);
  }
  const profile = await getRequestStaffProfile(db, cleanEmail);
  return profile?.permissions || [];
}

export async function getStaffMemberName(db: any, email: string): Promise<string> {
  if (!db || !email) return '';
  const cleanEmail = String(email).trim().toLowerCase();
  if (isOwnerEmail(cleanEmail)) return '';
  const profile = await getRequestStaffProfile(db, cleanEmail);
  return profile?.name || '';
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
  const cleanKey = sectionKey.trim().toLowerCase();
  return permissions.some((p) => p.toLowerCase() === cleanKey);
}

export function sanitizeReturnTo(value: string | null | undefined): string {
  if (!value || typeof value !== 'string') return '';
  const trimmed = value.trim();
  if (!trimmed.startsWith('/') || trimmed.startsWith('//') || trimmed.startsWith('/\\')) {
    return '';
  }
  try {
    const url = new URL(trimmed, 'https://app.local');
    if (url.origin !== 'https://app.local') return '';
    if (url.pathname === '/sign-in' || url.pathname.startsWith('/api/')) return '';
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return '';
  }
}

export function isMemberAccountPath(path: string | null | undefined): boolean {
  if (!path || typeof path !== 'string') return false;
  try {
    const url = new URL(path, 'https://app.local');
    const pathname = url.pathname.replace(/\/+$/, '');
    return (
      pathname === '/membership/account' || pathname === '/membership/sign-in'
    );
  } catch {
    return false;
  }
}

export function isMemberSignInPath(path: string | null | undefined): boolean {
  if (!path || typeof path !== 'string') return false;
  try {
    const url = new URL(path, 'https://app.local');
    const pathname = url.pathname.replace(/\/+$/, '');
    return pathname === '/membership/sign-in';
  } catch {
    return false;
  }
}

export async function getPostLoginRedirect(
  db: any,
  email: string | null | undefined,
  requestedReturnTo?: string | null,
): Promise<string> {
  const cleanEmail = String(email || '').trim().toLowerCase();
  const cleanReturnTo = sanitizeReturnTo(requestedReturnTo);
  const isExplicitReturn = Boolean(cleanReturnTo && cleanReturnTo !== '/');

  if (isOwnerEmail(cleanEmail)) {
    if (isExplicitReturn && !isMemberAccountPath(cleanReturnTo)) {
      return cleanReturnTo;
    }
    return '/admin';
  }

  // Staff user
  const permissions = await staffPermissions(db, cleanEmail);
  const isStaff = permissions.length > 0;
  const firstSection = ADMIN_SECTIONS.find((section) =>
    permissions.includes(section.key),
  );
  const defaultStaffLanding = firstSection ? firstSection.href : '/sign-in?error=no_staff_access';

  if (!isExplicitReturn || (isStaff && isMemberAccountPath(cleanReturnTo))) {
    return defaultStaffLanding;
  }

  // Verify staff authorization for explicit return destination
  if (cleanReturnTo.startsWith('/admin/')) {
    const sectionKey = cleanReturnTo
      .slice('/admin/'.length)
      .split('/')[0]
      ?.split('?')[0]
      ?.toLowerCase();
    if (sectionKey && permissions.some((p) => p.toLowerCase() === sectionKey)) {
      return cleanReturnTo;
    }
    // Staff requested an admin section they are not permitted for: send to default authorized section
    return defaultStaffLanding;
  }

  if (cleanReturnTo === '/admin') {
    // /admin overview is reserved for owners: send staff to their authorized section
    return defaultStaffLanding;
  }

  // Explicit non-admin return URL (e.g. /bank-directory or /heter-iska)
  if (isMemberSignInPath(cleanReturnTo)) {
    return '/membership/account';
  }
  return cleanReturnTo;
}

export async function getMemberSignInDestination(
  db: any,
  email: string | null | undefined,
): Promise<string> {
  const cleanEmail = String(email || '').trim().toLowerCase();
  if (!cleanEmail) {
    return '/sign-in?return_to=' + encodeURIComponent('/membership/account');
  }
  return getPostLoginRedirect(db, cleanEmail, '/membership/account');
}
