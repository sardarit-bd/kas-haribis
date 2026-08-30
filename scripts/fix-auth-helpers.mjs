import fs from 'node:fs';
import path from 'node:path';

const apiRoot = path.resolve('app/api');

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(fullPath) : [fullPath];
  });
}

function fix(content) {
  let next = content;

  next = next.replace(
    /const (?:admin|isAdmin|owner|authorized) = \(request: Request\) =>\s*\n?\s*\(await isOwnerRequest\(request\)\)(?: && !request\.headers\.get\('x-kh-staff-email'\))?;?\s*\n/g,
    '',
  );
  next = next.replace(
    /const (?:admin|isAdmin|owner|authorized) = \(r: Request\) =>\s*\n?\s*\(await isOwnerRequest\(r\)\)(?: && !r\.headers\.get\('x-kh-staff-email'\))?;?,?\s*\n/g,
    '',
  );
  next = next.replace(
    /(?:admin|owner) = \(r: Request\) =>\s*\n?\s*\(await isOwnerRequest\(request\)\);?,?\s*\n/g,
    '',
  );

  const requestNames = ['request', 'r'];
  for (const name of requestNames) {
    next = next.replaceAll(
      `!(await isOwnerRequest(${name})) &&`,
      `!(await isOwnerRequest(${name}))`,
    );
    next = next.replaceAll(`!admin(${name})`, `!(await isOwnerRequest(${name}))`);
    next = next.replaceAll(`!isAdmin(${name})`, `!(await isOwnerRequest(${name}))`);
    next = next.replaceAll(`!owner(${name})`, `!(await isOwnerRequest(${name}))`);
    next = next.replaceAll(`!authorized(${name})`, `!(await isOwnerRequest(${name}))`);
    next = next.replaceAll(
      `admin(${name})`,
      `(await isOwnerRequest(${name}))`,
    );
    next = next.replaceAll(
      `isAdmin(${name})`,
      `(await isOwnerRequest(${name}))`,
    );
    next = next.replaceAll(
      `owner(${name})`,
      `(await isOwnerRequest(${name})) && !${name}.headers.get('x-kh-staff-email')`,
    );
    next = next.replaceAll(
      `authorized(${name})`,
      `(await isOwnerRequest(${name}))`,
    );
  }

  return next;
}

for (const file of walk(apiRoot)) {
  if (!file.endsWith('.ts')) continue;
  const original = fs.readFileSync(file, 'utf8');
  const updated = fix(original);
  if (updated !== original) {
    fs.writeFileSync(file, updated);
    console.log(`fixed ${path.relative(process.cwd(), file)}`);
  }
}

console.log('done');
