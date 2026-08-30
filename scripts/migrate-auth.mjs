import fs from 'node:fs';
import path from 'node:path';

const apiRoot = path.resolve('app/api');

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(fullPath) : [fullPath];
  });
}

function relativeImport(filePath) {
  const depth = path.relative('app', path.dirname(filePath)).split(path.sep).length;
  return `${'../'.repeat(depth)}lib/request-auth`;
}

function adminImport(filePath) {
  const depth = path.relative('app', path.dirname(filePath)).split(path.sep).length;
  return `${'../'.repeat(depth)}lib/admin-access`;
}

function ensureImports(content, filePath) {
  const requestImport = `import { getRequestEmail, isOwnerRequest } from '${relativeImport(filePath)}';`;
  const adminImportLine = `import { ADMIN_OWNER } from '${adminImport(filePath)}';`;
  let next = content;
  const needsRequest = next.includes('getRequestEmail(') || next.includes('isOwnerRequest(');
  const needsAdmin =
    next.includes('ADMIN_OWNER') &&
    !next.includes("from '../lib/admin-access'") &&
    !next.includes("from '../../lib/admin-access'") &&
    !next.includes("from '../../../lib/admin-access'");

  if (needsAdmin && !next.includes(adminImportLine)) {
    next = `${adminImportLine}\n${next}`;
  }
  if (needsRequest && !next.includes(requestImport)) {
    next = `${requestImport}\n${next}`;
  }
  return next;
}

function transform(content, filePath) {
  if (
    !content.includes('oai-authenticated-user-email') &&
    !content.includes('kavharibis@gmail.com')
  ) {
    return content;
  }

  let next = content;

  next = next.replace(/const owner = 'kavharibis@gmail\.com',?\r?\n/g, 'const owner = ADMIN_OWNER,\n');
  next = next.replace(/const owner = 'kavharibis@gmail\.com';\r?\n/g, 'const owner = ADMIN_OWNER;\n');
  next = next.replace(/const OWNER = 'kavharibis@gmail\.com',?\r?\n/g, 'const OWNER = ADMIN_OWNER,\n');
  next = next.replace(/const OWNER = 'kavharibis@gmail\.com';\r?\n/g, 'const OWNER = ADMIN_OWNER;\n');
  next = next.replaceAll("'kavharibis@gmail.com'", 'ADMIN_OWNER');

  const ownerEq = [
    /request\.headers\.get\('oai-authenticated-user-email'\)\?\.toLowerCase\(\)\s*===\s*owner/g,
    /request\.headers\.get\('oai-authenticated-user-email'\)\?\.toLowerCase\(\)\s*===\s*ADMIN_OWNER/g,
    /r\.headers\.get\('oai-authenticated-user-email'\)\?\.toLowerCase\(\)\s*===\s*ADMIN_OWNER/g,
    /request\.headers\.get\('oai-authenticated-user-email'\)\?\.toLowerCase\(\)\s*===/g,
    /r\.headers\.get\('oai-authenticated-user-email'\)\?\.toLowerCase\(\)\s*===/g,
    /clean\(r\.headers\.get\('oai-authenticated-user-email'\)\)\.toLowerCase\(\)\s*===\s*OWNER/g,
    /clean\(request\.headers\.get\('oai-authenticated-user-email'\)\)\.toLowerCase\(\)\s*===\s*OWNER/g,
    /clean\(request\.headers\.get\('oai-authenticated-user-email'\)\)\.toLowerCase\(\)\s*===\s*ADMIN_OWNER/g,
  ];
  for (const pattern of ownerEq) {
    next = next.replace(
      pattern,
      (match, offset, string) => {
        const requestName = match.startsWith('r.') || string.slice(Math.max(0, offset - 20), offset).includes('(r)')
          ? 'r'
          : 'request';
        return `(await isOwnerRequest(${requestName}))`;
      },
    );
  }

  const ownerNe = [
    /request\.headers\.get\('oai-authenticated-user-email'\)\?\.toLowerCase\(\)\s*!==\s*owner/g,
    /request\.headers\.get\('oai-authenticated-user-email'\)\?\.toLowerCase\(\)\s*!==\s*ADMIN_OWNER/g,
    /r\.headers\.get\('oai-authenticated-user-email'\)\?\.toLowerCase\(\)\s*!==\s*ADMIN_OWNER/g,
    /request\.headers\.get\('oai-authenticated-user-email'\)\?\.toLowerCase\(\)\s*!==/g,
    /r\.headers\.get\('oai-authenticated-user-email'\)\?\.toLowerCase\(\)\s*!==/g,
  ];
  for (const pattern of ownerNe) {
    next = next.replace(
      pattern,
      (match) => {
        const requestName = match.startsWith('r.') ? 'r' : 'request';
        return `!(await isOwnerRequest(${requestName}))`;
      },
    );
  }

  next = next.replace(
    /const email = request\.headers\.get\('oai-authenticated-user-email'\);\s*if \(email\?\.toLowerCase\(\) !== ADMIN_OWNER\)/g,
    'if (!(await isOwnerRequest(request)))',
  );
  next = next.replace(
    /const email = request\.headers\.get\('oai-authenticated-user-email'\);\s*if \(email\?\.toLowerCase\(\) !== owner\)/g,
    'if (!(await isOwnerRequest(request)))',
  );
  next = next.replace(
    /clean\(request\.headers\.get\('oai-authenticated-user-email'\), 300\)\.toLowerCase\(\)/g,
    'await getRequestEmail(request)',
  );
  next = next.replace(
    /String\(r\.headers\.get\('oai-authenticated-user-email'\) \|\| ''\)\s*\.trim\(\)\s*\.toLowerCase\(\)/g,
    'await getRequestEmail(r)',
  );
  next = next.replace(
    /String\(request\.headers\.get\('oai-authenticated-user-email'\) \|\| ''\)\s*\.trim\(\)\s*\.toLowerCase\(\)/g,
    'await getRequestEmail(request)',
  );

  next = ensureImports(next, filePath);
  return next;
}

for (const file of walk(apiRoot)) {
  if (!file.endsWith('.ts')) continue;
  const original = fs.readFileSync(file, 'utf8');
  const updated = transform(original, file);
  if (updated !== original) {
    fs.writeFileSync(file, updated);
    console.log(`updated ${path.relative(process.cwd(), file)}`);
  }
}

const staffAccess = path.resolve('app/api/admin-staff-access/route.ts');
if (fs.existsSync(staffAccess)) {
  let content = fs.readFileSync(staffAccess, 'utf8');
  content = content.replace(
    /clean\(request\.headers\.get\('oai-authenticated-user-email'\)\)\.toLowerCase\(\)\s*===\s*ADMIN_OWNER/g,
    '(await getRequestEmail(request)) === ADMIN_OWNER.toLowerCase()',
  );
  content = ensureImports(content, staffAccess);
  fs.writeFileSync(staffAccess, content);
}

console.log('done');
