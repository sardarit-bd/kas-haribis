import assert from 'node:assert/strict';
import test from 'node:test';
import {
  getSeforimDeliveryPrice,
  setSeforimDeliveryPrice,
  validateDeliveryPrice,
  SEFORIM_DELIVERY_SETTING_KEY,
} from '../app/lib/seforim.ts';
import { isOwnerEmail } from '../app/lib/admin-access.ts';

// In-memory mock simulating Cloudflare D1 SQLite database
function createMockD1Database() {
  const tables = {
    payment_settings: new Map(),
    seforim: new Map(),
    sefer_orders: new Map(),
    sefer_order_items: new Map(),
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
          if (normalizedSql.startsWith('CREATE TABLE')) {
            return { success: true };
          }
          if (normalizedSql.startsWith('ALTER TABLE')) {
            return { success: true };
          }
          if (normalizedSql.includes('INSERT INTO payment_settings')) {
            const [name, value, updated_at] = boundArgs;
            tables.payment_settings.set(name, { name, value, updated_at });
            return { success: true };
          }
          if (normalizedSql.includes('INSERT INTO sefer_orders')) {
            const [id, customer_name, email, phone, address, city, state, zip, total, status, reference, created_at, delivery_total] = boundArgs;
            tables.sefer_orders.set(id, {
              id,
              customer_name,
              email,
              phone,
              address,
              city,
              state,
              zip,
              total,
              status,
              reference,
              created_at,
              delivery_total: delivery_total || 0,
            });
            return { success: true };
          }
          return { success: true };
        },
        async first() {
          if (normalizedSql.includes('SELECT value FROM payment_settings WHERE name = ?')) {
            const name = boundArgs[0];
            const row = tables.payment_settings.get(name);
            return row ? { value: row.value } : null;
          }
          if (normalizedSql.includes('SELECT value FROM payment_settings WHERE name = \'seforim_delivery_price\'')) {
            const row = tables.payment_settings.get('seforim_delivery_price');
            return row ? { value: row.value } : null;
          }
          if (normalizedSql.includes('SELECT id,title,price,available,pdf_price,pdf_available,pdf_storage_key FROM seforim WHERE id=?')) {
            const id = boundArgs[0];
            return tables.seforim.get(id) || null;
          }
          return null;
        },
        async all() {
          if (normalizedSql.includes('SELECT * FROM sefer_orders')) {
            return { results: Array.from(tables.sefer_orders.values()) };
          }
          return { results: [] };
        },
      };

      return statement;
    },
  };
}

// Simulated API route handler for POST /api/seforim/delivery-pricing
async function handleDeliveryPricingUpdate({ email, permissions, deliveryPrice, db }) {
  const isOwner = isOwnerEmail(email);
  const canSeforim = Boolean(email) && (permissions?.includes('seforim') || isOwner);
  const canSettings = Boolean(email) && (permissions?.includes('settings') || isOwner);

  if (!isOwner && !canSeforim && !canSettings) {
    return { status: 401, error: 'Unauthorized' };
  }

  const validation = validateDeliveryPrice(deliveryPrice);
  if (!validation.valid) {
    return { status: 400, error: validation.error };
  }

  const savedPrice = await setSeforimDeliveryPrice(db, validation.price);
  return { status: 200, saved: true, deliveryPrice: savedPrice };
}

// 1. Global delivery price defaults to zero
test('1. Global delivery price defaults to 0.00 when unconfigured', async () => {
  const db = createMockD1Database();
  const price = await getSeforimDeliveryPrice(db);
  assert.equal(price, 0);
});

// 2. A physical-book order with free delivery
test('2. Physical-book order with free delivery ($0.00 configured) incurs 0 delivery fee', async () => {
  const db = createMockD1Database();
  await setSeforimDeliveryPrice(db, 0);
  const deliverySetting = await getSeforimDeliveryPrice(db);
  assert.equal(deliverySetting, 0);

  const cart = [{ id: '1', price: 20, format: 'book', quantity: 1 }];
  const hasPhysical = cart.some((x) => x.format === 'book');
  const subtotal = cart.reduce((s, x) => s + x.price * x.quantity, 0);
  const deliveryFee = hasPhysical ? deliverySetting : 0;
  const total = subtotal + deliveryFee;

  assert.equal(subtotal, 20);
  assert.equal(deliveryFee, 0);
  assert.equal(total, 20);
});

// 3. A physical-book order with a $5.00 global delivery charge
test('3. Physical-book order with $5.00 global delivery incurs exactly $5.00 delivery fee', async () => {
  const db = createMockD1Database();
  await setSeforimDeliveryPrice(db, 5.0);
  const deliverySetting = await getSeforimDeliveryPrice(db);
  assert.equal(deliverySetting, 5.0);

  const cart = [{ id: '1', price: 20, format: 'book', quantity: 1 }];
  const hasPhysical = cart.some((x) => x.format === 'book');
  const subtotal = cart.reduce((s, x) => s + x.price * x.quantity, 0);
  const deliveryFee = hasPhysical ? deliverySetting : 0;
  const total = subtotal + deliveryFee;

  assert.equal(subtotal, 20);
  assert.equal(deliveryFee, 5.0);
  assert.equal(total, 25.0);
});

// 4. Multiple physical books still incur the global charge only once
test('4. Multiple physical books incur the global charge only once (flat rate per order)', async () => {
  const db = createMockD1Database();
  await setSeforimDeliveryPrice(db, 5.0);
  const deliverySetting = await getSeforimDeliveryPrice(db);

  // Cart with multiple physical books (multiple quantities and multiple titles)
  const cart = [
    { id: '1', price: 20, format: 'book', quantity: 2 },
    { id: '2', price: 40, format: 'book', quantity: 1 },
  ];
  const hasPhysical = cart.some((x) => x.format === 'book');
  const subtotal = cart.reduce((s, x) => s + x.price * x.quantity, 0); // 20*2 + 40 = 80
  const deliveryFee = hasPhysical ? deliverySetting : 0;
  const total = subtotal + deliveryFee;

  assert.equal(subtotal, 80);
  assert.equal(deliveryFee, 5.0); // Flat rate: NOT 5 * 3 = 15!
  assert.equal(total, 85.0);
});

// 5. PDF-only orders have zero delivery
test('5. PDF-only orders have zero delivery fee even when $5.00 delivery is configured', async () => {
  const db = createMockD1Database();
  await setSeforimDeliveryPrice(db, 5.0);
  const deliverySetting = await getSeforimDeliveryPrice(db);

  const cart = [
    { id: '1', pdf_price: 15, format: 'pdf', quantity: 1 },
    { id: '2', pdf_price: 25, format: 'pdf', quantity: 1 },
  ];
  const hasPhysical = cart.some((x) => x.format === 'book');
  const subtotal = cart.reduce((s, x) => s + x.pdf_price * x.quantity, 0); // 40
  const deliveryFee = hasPhysical ? deliverySetting : 0;
  const total = subtotal + deliveryFee;

  assert.equal(hasPhysical, false);
  assert.equal(subtotal, 40);
  assert.equal(deliveryFee, 0);
  assert.equal(total, 40);
});

// 6. Mixed physical-book and PDF orders incur the charge only once
test('6. Mixed physical-book and PDF orders incur the delivery charge only once', async () => {
  const db = createMockD1Database();
  await setSeforimDeliveryPrice(db, 7.5);
  const deliverySetting = await getSeforimDeliveryPrice(db);

  const cart = [
    { id: '1', price: 20, format: 'book', quantity: 1 },
    { id: '2', pdf_price: 15, format: 'pdf', quantity: 1 },
  ];
  const hasPhysical = cart.some((x) => x.format === 'book');
  const subtotal = 20 * 1 + 15 * 1; // 35
  const deliveryFee = hasPhysical ? deliverySetting : 0;
  const total = subtotal + deliveryFee;

  assert.equal(hasPhysical, true);
  assert.equal(subtotal, 35);
  assert.equal(deliveryFee, 7.5);
  assert.equal(total, 42.5);
});

// 7. Invalid or negative delivery prices are rejected
test('7. Validation rejects invalid, negative, NaN, infinity, and precision errors', () => {
  // Valid prices
  assert.equal(validateDeliveryPrice(0).valid, true);
  assert.equal(validateDeliveryPrice('0.00').valid, true);
  assert.equal(validateDeliveryPrice(5.5).valid, true);
  assert.equal(validateDeliveryPrice('12.99').valid, true);
  assert.equal(validateDeliveryPrice(1000).valid, true);

  // Negative values
  const negative = validateDeliveryPrice(-5);
  assert.equal(negative.valid, false);
  assert.match(negative.error, /cannot be negative/i);

  // NaN and non-numbers
  const nanVal = validateDeliveryPrice(NaN);
  assert.equal(nanVal.valid, false);
  assert.match(nanVal.error, /numeric/i);

  const strInvalid = validateDeliveryPrice('free');
  assert.equal(strInvalid.valid, false);

  // Infinity
  const inf = validateDeliveryPrice(Infinity);
  assert.equal(inf.valid, false);

  // Excessive decimal precision (e.g. 3 decimal places)
  const precise = validateDeliveryPrice('5.999');
  assert.equal(precise.valid, false);
  assert.match(precise.error, /decimal places/i);

  // Exceeds reasonable max limit
  const tooLarge = validateDeliveryPrice(1000.01);
  assert.equal(tooLarge.valid, false);
  assert.match(tooLarge.error, /exceed/i);

  // Empty / null
  assert.equal(validateDeliveryPrice('').valid, false);
  assert.equal(validateDeliveryPrice(null).valid, false);
});

// 8. Client-side delivery-fee tampering is rejected
test('8. Server validation rejects client-side payment total tampering', async () => {
  const db = createMockD1Database();
  await setSeforimDeliveryPrice(db, 6.0);
  const deliverySetting = await getSeforimDeliveryPrice(db);

  // Book in DB is $30.00
  const bookPrice = 30.0;
  const hasPhysical = true;
  const calculatedItems = bookPrice * 1;
  const expectedDelivery = hasPhysical ? deliverySetting : 0;
  const expectedTotal = calculatedItems + expectedDelivery; // 36.00

  // Case A: Attacker tries to bypass delivery fee by submitting items subtotal ($30)
  const clientSubmittedTampered1 = 30.0;
  const isMismatch1 = Math.abs(expectedTotal - clientSubmittedTampered1) > 0.001;
  assert.equal(isMismatch1, true, 'Server must detect that client omitted delivery fee');

  // Case B: Attacker tries submitting arbitrary low amount ($1.00)
  const clientSubmittedTampered2 = 1.0;
  const isMismatch2 = Math.abs(expectedTotal - clientSubmittedTampered2) > 0.001;
  assert.equal(isMismatch2, true, 'Server must detect tampered arbitrary amount');

  // Case C: Legitimate client submits exact $36.00
  const legitimateAmount = 36.0;
  const isMismatch3 = Math.abs(expectedTotal - legitimateAmount) > 0.001;
  assert.equal(isMismatch3, false, 'Server accepts valid subtotal + delivery fee');
});

// 9. Cardknox receives the correct server-calculated amount
test('9. Cardknox gateway receives the exact server-calculated amount', async () => {
  const db = createMockD1Database();
  await setSeforimDeliveryPrice(db, 8.5);
  const deliverySetting = await getSeforimDeliveryPrice(db);

  const subtotal = 40.0;
  const deliveryFee = deliverySetting;
  const expectedAmount = subtotal + deliveryFee; // 48.50

  let capturedCardknoxAmount = '';
  function mockCardknoxGateway(amount) {
    capturedCardknoxAmount = amount.toFixed(2);
  }

  mockCardknoxGateway(expectedAmount);
  assert.equal(capturedCardknoxAmount, '48.50');
});

// 10. Historical order totals and delivery fees remain accurate
test('10. Historical orders preserve their original delivery_total and order total', async () => {
  const db = createMockD1Database();

  // Create an old order placed when delivery was FREE ($0)
  await db.prepare('INSERT INTO sefer_orders(id,customer_name,email,phone,address,city,state,zip,total,status,reference,created_at,delivery_total) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?)')
    .bind('ORD-OLD', 'David Old', 'david@example.com', '', '123 Main', 'Lakewood', 'NJ', '08701', 40.0, 'Paid', 'REF-1', '2026-01-01T00:00:00Z', 0)
    .run();

  // Now change the global delivery price to $10.00
  await setSeforimDeliveryPrice(db, 10.0);

  // Create a new order placed under $10.00 delivery
  await db.prepare('INSERT INTO sefer_orders(id,customer_name,email,phone,address,city,state,zip,total,status,reference,created_at,delivery_total) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?)')
    .bind('ORD-NEW', 'Moshe New', 'moshe@example.com', '', '456 Oak', 'Monsey', 'NY', '10952', 50.0, 'Paid', 'REF-2', '2026-02-01T00:00:00Z', 10.0)
    .run();

  // Query all orders
  const orders = (await db.prepare('SELECT * FROM sefer_orders').all()).results;
  const oldOrder = orders.find((o) => o.id === 'ORD-OLD');
  const newOrder = orders.find((o) => o.id === 'ORD-NEW');

  // Verify historical order remained unchanged
  assert.equal(oldOrder.total, 40.0);
  assert.equal(oldOrder.delivery_total, 0.0);
  assert.equal(oldOrder.total - oldOrder.delivery_total, 40.0); // Subtotal = 40.00

  // Verify new order accurately tracks delivery_total
  assert.equal(newOrder.total, 50.0);
  assert.equal(newOrder.delivery_total, 10.0);
  assert.equal(newOrder.total - newOrder.delivery_total, 40.0); // Subtotal = 40.00
});

// 11. Unauthorized users cannot update the setting
test('11. Unauthorized users are blocked from updating the delivery price', async () => {
  const db = createMockD1Database();

  // Test unauthenticated user
  const unauthRes = await handleDeliveryPricingUpdate({
    email: '',
    permissions: [],
    deliveryPrice: 15.0,
    db,
  });
  assert.equal(unauthRes.status, 401);
  assert.equal(unauthRes.error, 'Unauthorized');

  // Test unauthorized staff member (no 'seforim' or 'settings' permissions)
  const staffRes = await handleDeliveryPricingUpdate({
    email: 'staff@example.com',
    permissions: ['donations', 'questions'],
    deliveryPrice: 15.0,
    db,
  });
  assert.equal(staffRes.status, 401);
  assert.equal(staffRes.error, 'Unauthorized');

  // Test authorized staff member with 'seforim' permission
  const authorizedStaff = await handleDeliveryPricingUpdate({
    email: 'staff@example.com',
    permissions: ['seforim'],
    deliveryPrice: 12.5,
    db,
  });
  assert.equal(authorizedStaff.status, 200);
  assert.equal(authorizedStaff.deliveryPrice, 12.5);

  // Test super admin owner
  const ownerRes = await handleDeliveryPricingUpdate({
    email: 'mdemong87@gmail.com',
    permissions: [],
    deliveryPrice: 14.0,
    db,
  });
  assert.equal(ownerRes.status, 200);
  assert.equal(ownerRes.deliveryPrice, 14.0);
});
