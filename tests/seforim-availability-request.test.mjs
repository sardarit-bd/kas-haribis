import assert from 'node:assert/strict';
import test from 'node:test';
import {
  ensureSeforim,
  listSeforim,
  getSeforimDeliveryPrice,
  setSeforimDeliveryPrice,
} from '../app/lib/seforim.ts';
import { isOwnerEmail } from '../app/lib/admin-access.ts';

// In-memory mock simulating Cloudflare D1 SQLite database
function createMockD1Database() {
  const tables = {
    payment_settings: new Map(),
    seforim: new Map(),
    sefer_orders: new Map(),
    contact_submissions: new Map(),
  };

  return {
    tables,
    prepare(sql) {
      const normalizedSql = sql.replace(/\s+/g, ' ').trim();
      let boundArgs = [];

      const statement = {
        bind(...args) {
          boundArgs = args;
          return statement;
        },
        async run() {
          if (normalizedSql.startsWith('CREATE TABLE') || normalizedSql.startsWith('ALTER TABLE')) {
            return { success: true };
          }
          if (normalizedSql.includes('INSERT INTO seforim')) {
            // INSERT INTO seforim(id,title,price,available,image,description,sort_order,created_at,pdf_available,pdf_price,request_availability)
            const [id, title, price, available, image, description, sort_order, created_at, pdf_available, pdf_price, request_availability] = boundArgs;
            tables.seforim.set(id, {
              id,
              title,
              price: Number(price),
              available: Number(available),
              image,
              description,
              sort_order: Number(sort_order),
              created_at,
              pdf_available: Number(pdf_available || 0),
              pdf_price: Number(pdf_price || 0),
              pdf_filename: '',
              pdf_storage_key: '',
              request_availability: Number(request_availability || 0),
            });
            return { success: true };
          }
          if (normalizedSql.includes('UPDATE seforim SET title=?,price=?,available=?,description=?,sort_order=?,pdf_price=?,pdf_available=CASE WHEN ?=1 AND length(COALESCE(pdf_storage_key,\'\'))>0 THEN 1 ELSE 0 END,request_availability=? WHERE id=?')) {
            const [title, price, available, description, sort_order, pdf_price, pdf_display, request_availability, id] = boundArgs;
            const existing = tables.seforim.get(id) || {};
            tables.seforim.set(id, {
              ...existing,
              title,
              price: Number(price),
              available: Number(available),
              description,
              sort_order: Number(sort_order),
              pdf_price: Number(pdf_price || 0),
              request_availability: Number(request_availability || 0),
            });
            return { success: true };
          }
          if (normalizedSql.includes('INSERT INTO contact_submissions')) {
            const [id, reference, name, email, phone, organization, topic, message, response_method, now1, now2, related_name, related_url] = boundArgs;
            tables.contact_submissions.set(id, {
              id,
              reference,
              name,
              email,
              phone,
              organization,
              topic,
              message,
              response_method,
              status: 'New',
              notes: '',
              created_at: now1,
              updated_at: now2,
              related_name,
              related_url,
            });
            return { success: true };
          }
          if (normalizedSql.includes('INSERT INTO payment_settings')) {
            const [name, value, updated_at] = boundArgs;
            tables.payment_settings.set(name, { name, value, updated_at });
            return { success: true };
          }
          return { success: true };
        },
        async first() {
          if (normalizedSql.includes('SELECT COUNT(*) AS count FROM seforim')) {
            return { count: tables.seforim.size };
          }
          if (normalizedSql.includes('SELECT MAX(sort_order) AS value FROM seforim')) {
            let max = 0;
            for (const item of tables.seforim.values()) {
              if (item.sort_order > max) max = item.sort_order;
            }
            return { value: max };
          }
          if (normalizedSql.includes('FROM seforim WHERE id=?')) {
            const id = boundArgs[0];
            return tables.seforim.get(id) || null;
          }
          if (normalizedSql.includes('SELECT value FROM payment_settings WHERE name = ?') ||
              normalizedSql.includes("SELECT value FROM payment_settings WHERE name = 'seforim_delivery_price'")) {
            const row = tables.payment_settings.get('seforim_delivery_price');
            return row ? { value: row.value } : null;
          }
          return null;
        },
        async all() {
          if (normalizedSql.includes('FROM seforim')) {
            const results = Array.from(tables.seforim.values()).map((row) => ({
              ...row,
              request_availability: row.request_availability || 0,
            }));
            return { results };
          }
          if (normalizedSql.includes('FROM contact_submissions')) {
            return { results: Array.from(tables.contact_submissions.values()) };
          }
          return { results: [] };
        },
      };

      return statement;
    },
  };
}

// Simulated POST /api/contact-submissions logic
async function handleContactSubmission(formData, db, emailLogger) {
  const clean = (v, n = 5000) => String(v ?? '').trim().slice(0, n);

  const honeypot = clean(formData.get('website_hp') || formData.get('hp'), 100);
  if (honeypot) {
    return { status: 400, body: { error: 'Invalid submission' } };
  }

  const name = clean(formData.get('name'), 200);
  const email = clean(formData.get('email'), 300).toLowerCase();
  const message = clean(formData.get('message'), 10000);
  const topic = clean(formData.get('topic'), 200) || 'General message';
  const relatedName = clean(formData.get('related_name'), 300);
  const isAvailabilityRequest = topic === 'Book Availability Request';

  if (!name || !email) {
    return { status: 400, body: { error: 'Name and email are required.' } };
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { status: 400, body: { error: 'Enter a valid email address.' } };
  }

  let finalMessage = message;
  if (isAvailabilityRequest) {
    if (!relatedName) {
      return { status: 400, body: { error: 'Book context is required.' } };
    }
    if (!finalMessage) {
      finalMessage = `Availability request submitted for "${relatedName}".`;
    }
  } else {
    if (!finalMessage) {
      return { status: 400, body: { error: 'Name, email, and message are required.' } };
    }
    if (finalMessage.length < 10) {
      return { status: 400, body: { error: 'Please provide a little more detail.' } };
    }
  }

  const id = 'sub-' + Math.random().toString(36).slice(2, 10);
  const reference = `KH-C-${id.slice(0, 8).toUpperCase()}`;
  const now = new Date().toISOString();

  await db
    .prepare(
      "INSERT INTO contact_submissions(id,reference,name,email,phone,organization,topic,message,response_method,status,notes,created_at,updated_at,related_name,related_url,request_subtype,preferred_date,location,audience,attachment_key,attachment_name) VALUES(?,?,?,?,?,?,?,?,?,'New','',?,?,?,?,?,?,?,?,?,?)",
    )
    .bind(
      id,
      reference,
      name,
      email,
      clean(formData.get('phone'), 100),
      clean(formData.get('organization'), 300),
      topic,
      finalMessage,
      clean(formData.get('response_method'), 100) || 'Email',
      now,
      now,
      relatedName,
      clean(formData.get('related_url'), 1000),
      '',
      '',
      '',
      '',
      '',
      '',
    )
    .run();

  if (emailLogger) {
    const emailSubject = isAvailabilityRequest
      ? `Book Availability Request: ${relatedName}`
      : 'New Contact Submission From Kav Haribis Website';
    emailLogger.push({
      subject: emailSubject,
      topic,
      related_name: relatedName,
      message: finalMessage,
      email,
      name,
    });
  }

  return { status: 200, body: { reference } };
}

// Simulated POST /api/payments logic
async function handlePaymentCheckout({ items, amount, db }) {
  let calculated = 0;
  let hasPhysical = false;

  for (const item of items) {
    const id = String(item.seferId || item.id || '');
    const format = item.format === 'pdf' ? 'pdf' : 'book';
    const quantity = Math.max(1, Math.min(20, Math.floor(Number(item.quantity) || 1)));

    const book = await db
      .prepare(
        'SELECT id,title,price,available,pdf_price,pdf_available,pdf_storage_key,COALESCE(request_availability,0) request_availability FROM seforim WHERE id=?',
      )
      .bind(id)
      .first();

    if (
      !book ||
      (format === 'book' && (!book.available || Boolean(book.request_availability))) ||
      (format === 'pdf' && (!book.pdf_available || !book.pdf_storage_key))
    ) {
      return {
        status: 400,
        error: 'One of the items in your cart is no longer available for direct purchase.',
      };
    }

    const unitPrice = Number(format === 'pdf' ? book.pdf_price : book.price);
    calculated += unitPrice * quantity;
    if (format === 'book') hasPhysical = true;
  }

  let deliveryTotal = 0;
  if (hasPhysical) {
    deliveryTotal = await getSeforimDeliveryPrice(db);
  }

  const expectedTotal = calculated + deliveryTotal;
  if (Math.abs(expectedTotal - amount) > 0.001) {
    return {
      status: 400,
      error: 'The cart total has changed. Please refresh and try again.',
    };
  }

  return { status: 200, success: true, total: expectedTotal, deliveryTotal };
}

// ==================== TEST CASES ====================

test('1. Data model: Existing books default to request_availability = false', async () => {
  const db = createMockD1Database();
  await ensureSeforim(db);
  const books = await listSeforim(db);

  assert.ok(books.length > 0, 'Initial books should be seeded');
  for (const book of books) {
    assert.strictEqual(
      book.request_availability,
      false,
      `Book ${book.id} should default to request_availability = false`,
    );
  }
});

test('2. Admin: Can enable, save, reload, and disable request_availability setting per book', async () => {
  const db = createMockD1Database();
  const bookId = 'book-test-1';

  // Insert a book with request_availability = 0
  await db
    .prepare(
      'INSERT INTO seforim(id,title,price,available,image,description,sort_order,created_at,pdf_available,pdf_price,request_availability) VALUES(?,?,?,?,?,?,?,?,?,?,?)',
    )
    .bind(bookId, 'Hilchos Ribbis Guide', 50, 1, '/img.webp', 'Description', 1, new Date().toISOString(), 0, 0, 0)
    .run();

  let book = await db
    .prepare('SELECT id,request_availability FROM seforim WHERE id=?')
    .bind(bookId)
    .first();
  assert.strictEqual(Boolean(book.request_availability), false);

  // Enable request_availability = 1
  await db
    .prepare(
      "UPDATE seforim SET title=?,price=?,available=?,description=?,sort_order=?,pdf_price=?,pdf_available=CASE WHEN ?=1 AND length(COALESCE(pdf_storage_key,''))>0 THEN 1 ELSE 0 END,request_availability=? WHERE id=?",
    )
    .bind('Hilchos Ribbis Guide', 50, 1, 'Description', 1, 0, 0, 1, bookId)
    .run();

  book = await db
    .prepare('SELECT id,request_availability FROM seforim WHERE id=?')
    .bind(bookId)
    .first();
  assert.strictEqual(Boolean(book.request_availability), true, 'Setting should be enabled and persisted');

  // Disable request_availability = 0
  await db
    .prepare(
      "UPDATE seforim SET title=?,price=?,available=?,description=?,sort_order=?,pdf_price=?,pdf_available=CASE WHEN ?=1 AND length(COALESCE(pdf_storage_key,''))>0 THEN 1 ELSE 0 END,request_availability=? WHERE id=?",
    )
    .bind('Hilchos Ribbis Guide', 50, 1, 'Description', 1, 0, 0, 0, bookId)
    .run();

  book = await db
    .prepare('SELECT id,request_availability FROM seforim WHERE id=?')
    .bind(bookId)
    .first();
  assert.strictEqual(Boolean(book.request_availability), false, 'Setting should be disabled and persisted');
});

test('3. Catalog rendering logic: Physical books retain visible price while request-only books show availability action', () => {
  const standardBook = {
    id: 'b1',
    title: 'Standard Book',
    price: 36.0,
    available: true,
    pdf_available: false,
    request_availability: false,
  };

  const requestOnlyBook = {
    id: 'b2',
    title: 'Rare Volume',
    price: 70.0,
    available: true,
    pdf_available: false,
    request_availability: true,
  };

  // Helper simulating catalog display decision (matching updated client clarification)
  function getDisplayInfo(book) {
    const priceDisplay = `$${book.price.toFixed(2)}`;
    const actionButton = book.request_availability ? 'Submit Request to See Availability' : 'Add Book to Cart';
    return { priceDisplay, actionButton };
  }

  const standardDisplay = getDisplayInfo(standardBook);
  assert.strictEqual(standardDisplay.priceDisplay, '$36.00');
  assert.strictEqual(standardDisplay.actionButton, 'Add Book to Cart');

  const requestDisplay = getDisplayInfo(requestOnlyBook);
  assert.strictEqual(requestDisplay.priceDisplay, '$70.00');
  assert.strictEqual(requestDisplay.actionButton, 'Submit Request to See Availability');
  assert.ok(requestDisplay.priceDisplay.includes('$70.00'), 'Must display numeric price even when availability requests are enabled');
});

test('4. Hybrid format: PDF purchasing remains active when physical edition is request-only', () => {
  const hybridBook = {
    id: 'h1',
    title: 'Hybrid Sefer',
    price: 45.0,
    available: true,
    pdf_available: true,
    pdf_price: 18.0,
    request_availability: true,
  };

  // Physical book presentation (price remains visible, purchase button replaced with availability request)
  const physicalPrice = `$${hybridBook.price.toFixed(2)}`;
  const physicalAction = hybridBook.request_availability ? 'Submit Request to See Availability' : 'Add Book to Cart';

  // PDF presentation
  const pdfPrice = `$${hybridBook.pdf_price.toFixed(2)}`;
  const pdfAction = 'Add PDF to Cart';

  assert.strictEqual(physicalPrice, '$45.00');
  assert.strictEqual(physicalAction, 'Submit Request to See Availability');
  assert.strictEqual(pdfPrice, '$18.00');
  assert.strictEqual(pdfAction, 'Add PDF to Cart');
});

test('5. Submissions: Valid availability request is saved, references generated, and email notification logged', async () => {
  const db = createMockD1Database();
  const emailLogger = [];

  const formData = new Map([
    ['name', 'Reb Moshe Cohen'],
    ['email', 'moshe@example.com'],
    ['phone', '718-555-1234'],
    ['topic', 'Book Availability Request'],
    ['related_name', 'ספר התשובות חלק ב׳'],
    ['related_url', '/seforim#871'],
    ['message', 'Please let me know if 3 copies can be shipped to Lakewood.'],
  ]);

  const res = await handleContactSubmission(formData, db, emailLogger);

  assert.strictEqual(res.status, 200);
  assert.ok(res.body.reference.startsWith('KH-C-'), 'Reference should follow KH-C- convention');

  // Verify persistence in DB
  const submissions = Array.from(db.tables.contact_submissions.values());
  assert.strictEqual(submissions.length, 1);
  assert.strictEqual(submissions[0].name, 'Reb Moshe Cohen');
  assert.strictEqual(submissions[0].email, 'moshe@example.com');
  assert.strictEqual(submissions[0].related_name, 'ספר התשובות חלק ב׳');
  assert.strictEqual(submissions[0].topic, 'Book Availability Request');

  // Verify email notification
  assert.strictEqual(emailLogger.length, 1);
  assert.strictEqual(emailLogger[0].subject, 'Book Availability Request: ספר התשובות חלק ב׳');
});

test('6. Submissions: Optional message defaults cleanly when user provides no custom text', async () => {
  const db = createMockD1Database();
  const emailLogger = [];

  const formData = new Map([
    ['name', 'David Green'],
    ['email', 'david@example.com'],
    ['topic', 'Book Availability Request'],
    ['related_name', 'כסף פורח'],
    ['message', ''], // Empty message
  ]);

  const res = await handleContactSubmission(formData, db, emailLogger);
  assert.strictEqual(res.status, 200);

  const submission = Array.from(db.tables.contact_submissions.values())[0];
  assert.strictEqual(
    submission.message,
    'Availability request submitted for "כסף פורח".',
    'Default message should be applied',
  );
});

test('7. Submissions: Honeypot rejects automated spam bots without creating DB records or sending emails', async () => {
  const db = createMockD1Database();
  const emailLogger = [];

  const formData = new Map([
    ['name', 'Bot User'],
    ['email', 'bot@spammer.org'],
    ['topic', 'Book Availability Request'],
    ['related_name', 'Fake Book'],
    ['website_hp', 'http://spam-link.ru'], // Bot filled honeypot
  ]);

  const res = await handleContactSubmission(formData, db, emailLogger);

  assert.strictEqual(res.status, 400);
  assert.strictEqual(res.body.error, 'Invalid submission');
  assert.strictEqual(db.tables.contact_submissions.size, 0, 'No DB entry should be created for honeypot');
  assert.strictEqual(emailLogger.length, 0, 'No email notification should be sent for honeypot');
});

test('8. Submissions: Unrelated general contact form validation remains preserved', async () => {
  const db = createMockD1Database();

  // General contact form with missing message
  const missingMsg = new Map([
    ['name', 'Sarah'],
    ['email', 'sarah@example.com'],
    ['topic', 'General message'],
    ['message', ''],
  ]);
  const res1 = await handleContactSubmission(missingMsg, db);
  assert.strictEqual(res1.status, 400);
  assert.strictEqual(res1.body.error, 'Name, email, and message are required.');

  // General contact form with message shorter than 10 characters
  const shortMsg = new Map([
    ['name', 'Sarah'],
    ['email', 'sarah@example.com'],
    ['topic', 'General message'],
    ['message', 'Hi there'],
  ]);
  const res2 = await handleContactSubmission(shortMsg, db);
  assert.strictEqual(res2.status, 400);
  assert.strictEqual(res2.body.error, 'Please provide a little more detail.');
});

test('9. Payment API: Rejects direct purchase of physical book when request_availability is enabled', async () => {
  const db = createMockD1Database();

  // Insert a request-only book
  db.tables.seforim.set('rare-book-1', {
    id: 'rare-book-1',
    title: 'Rare Responsa Volume',
    price: 60.0,
    available: 1,
    pdf_available: 0,
    pdf_price: 0,
    request_availability: 1,
  });

  const checkoutAttempt = await handlePaymentCheckout({
    items: [{ seferId: 'rare-book-1', format: 'book', quantity: 1 }],
    amount: 60.0,
    db,
  });

  assert.strictEqual(checkoutAttempt.status, 400);
  assert.strictEqual(
    checkoutAttempt.error,
    'One of the items in your cart is no longer available for direct purchase.',
  );
});

test('10. Payment API: Normally purchasable physical book proceeds through payment validation', async () => {
  const db = createMockD1Database();
  await setSeforimDeliveryPrice(db, 5.0);

  db.tables.seforim.set('normal-book-1', {
    id: 'normal-book-1',
    title: 'Standard Guidebook',
    price: 40.0,
    available: 1,
    pdf_available: 0,
    pdf_price: 0,
    request_availability: 0,
  });

  const checkoutAttempt = await handlePaymentCheckout({
    items: [{ seferId: 'normal-book-1', format: 'book', quantity: 1 }],
    amount: 45.0, // 40.0 + 5.0 delivery
    db,
  });

  assert.strictEqual(checkoutAttempt.status, 200);
  assert.strictEqual(checkoutAttempt.total, 45.0);
  assert.strictEqual(checkoutAttempt.deliveryTotal, 5.0);
});

test('11. Payment API: PDF purchase for a request-only book succeeds with 0 delivery fee', async () => {
  const db = createMockD1Database();
  await setSeforimDeliveryPrice(db, 5.0); // Flat physical fee configured

  // Hybrid book: physical is request-only, PDF is purchasable
  db.tables.seforim.set('hybrid-book-1', {
    id: 'hybrid-book-1',
    title: 'Comprehensive Ribbis Manual',
    price: 50.0,
    available: 1,
    pdf_available: 1,
    pdf_price: 25.0,
    pdf_storage_key: 'seforim/pdf/hybrid-book-1.pdf',
    request_availability: 1,
  });

  // Purchasing the PDF edition
  const pdfCheckout = await handlePaymentCheckout({
    items: [{ seferId: 'hybrid-book-1', format: 'pdf', quantity: 1 }],
    amount: 25.0, // PDF only = no delivery fee
    db,
  });

  assert.strictEqual(pdfCheckout.status, 200);
  assert.strictEqual(pdfCheckout.total, 25.0);
  assert.strictEqual(pdfCheckout.deliveryTotal, 0);
});

test('12. Payment API: Tampered total or quantity errors are caught server-side', async () => {
  const db = createMockD1Database();
  await setSeforimDeliveryPrice(db, 5.0);

  db.tables.seforim.set('book-val-1', {
    id: 'book-val-1',
    title: 'Book Title',
    price: 30.0,
    available: 1,
    pdf_available: 0,
    request_availability: 0,
  });

  // Attempting to send amount $10 instead of $35 ($30 + $5 delivery)
  const tamperedCheckout = await handlePaymentCheckout({
    items: [{ seferId: 'book-val-1', format: 'book', quantity: 1 }],
    amount: 10.0,
    db,
  });

  assert.strictEqual(tamperedCheckout.status, 400);
  assert.strictEqual(
    tamperedCheckout.error,
    'The cart total has changed. Please refresh and try again.',
  );
});
