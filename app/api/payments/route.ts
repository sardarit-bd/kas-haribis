import { getPaymentSettings } from '../../lib/payment-settings';
import { ensureHeterTables } from '../../lib/heter-documents';
import { ensureBankReportTables } from '../../lib/directories';
import { ensureSeforim, ensureSeforimOrders } from '../../lib/seforim';

type PaymentRequest = {
  kind?:
    'donation' | 'heter-iska' | 'bank-report' | 'sefer-pdf' | 'seforim-order';
  amount?: number;
  name?: string;
  email?: string;
  dedication?: string;
  anonymous?: boolean;
  cardToken?: string;
  cvvToken?: string;
  expiration?: string;
  documentId?: string;
  bankId?: string;
  seferId?: string;
  items?: Array<{ seferId?: string; format?: string; quantity?: number }>;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
};

const clean = (value: unknown, max = 300) =>
  String(value || '')
    .trim()
    .slice(0, max);

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as PaymentRequest;
    const kind = body.kind;
    const amount = Number(body.amount);
    const name = clean(body.name, 100);
    const email = clean(body.email, 160).toLowerCase();
    const expiration = clean(body.expiration, 4);
    const cardToken = clean(body.cardToken, 500);
    const cvvToken = clean(body.cvvToken, 500);
    const documentId = clean(body.documentId, 60);
    const bankId = clean(body.bankId, 80);
    const seferId = clean(body.seferId, 80);

    if (
      kind !== 'donation' &&
      kind !== 'heter-iska' &&
      kind !== 'bank-report' &&
      kind !== 'sefer-pdf' &&
      kind !== 'seforim-order'
    )
      return Response.json({ error: 'Invalid payment type.' }, { status: 400 });
    if (!name || !/^\S+@\S+\.\S+$/.test(email))
      return Response.json(
        { error: 'Please enter your name and a valid email.' },
        { status: 400 },
      );
    if (!/^\d{4}$/.test(expiration))
      return Response.json(
        { error: 'Select a valid expiration month and year.' },
        { status: 400 },
      );
    if (!cardToken || !cvvToken)
      return Response.json(
        {
          error:
            'Cardknox could not secure the card details. Please re-enter them.',
        },
        { status: 400 },
      );
    if (kind === 'heter-iska' && amount !== 25)
      return Response.json(
        { error: 'The Heter Iska download price is $25.' },
        { status: 400 },
      );
    if (kind === 'bank-report' && amount !== 15)
      return Response.json(
        { error: 'Full bank report access is $15.' },
        { status: 400 },
      );
    if (
      kind === 'donation' &&
      (!Number.isFinite(amount) || amount < 1 || amount > 100000)
    )
      return Response.json(
        { error: 'Enter a donation amount between $1 and $100,000.' },
        { status: 400 },
      );

    const settings = await getPaymentSettings();
    if (!settings.apiKey || !settings.ifieldsKey)
      return Response.json(
        { error: 'Payment setup is incomplete.' },
        { status: 503 },
      );
    if (kind === 'heter-iska') {
      await ensureHeterTables(settings.env.DB);
      const document = await settings.env.DB.prepare(
        'SELECT id FROM heter_documents WHERE id=? AND active=1',
      )
        .bind(documentId)
        .first();
      if (!document)
        return Response.json(
          { error: 'Select an available Heter Iska document.' },
          { status: 400 },
        );
    }
    if (kind === 'bank-report') {
      await ensureBankReportTables(settings.env.DB);
      const bank = await settings.env.DB.prepare(
        'SELECT id FROM banks WHERE id=? AND length(full_report)>0',
      )
        .bind(bankId)
        .first();
      if (!bank)
        return Response.json(
          { error: 'This full bank report is not available.' },
          { status: 400 },
        );
    }
    let sefer: any = null;
    if (kind === 'sefer-pdf') {
      await ensureSeforim(settings.env.DB);
      sefer = await settings.env.DB.prepare(
        'SELECT id,title,pdf_price,pdf_storage_key FROM seforim WHERE id=? AND pdf_available=1 AND length(pdf_storage_key)>0',
      )
        .bind(seferId)
        .first();
      if (!sefer)
        return Response.json(
          { error: 'This PDF book is not available.' },
          { status: 400 },
        );
      if (Math.abs(Number(sefer.pdf_price) - amount) > 0.001)
        return Response.json(
          { error: 'The PDF book price has changed. Please refresh the page.' },
          { status: 400 },
        );
    }
    const validatedItems: Array<{
      seferId: string;
      title: string;
      format: 'book' | 'pdf';
      quantity: number;
      unitPrice: number;
    }> = [];
    let hasPhysical = false;
    if (kind === 'seforim-order') {
      await ensureSeforimOrders(settings.env.DB);
      const requested = Array.isArray(body.items)
        ? body.items.slice(0, 30)
        : [];
      if (!requested.length)
        return Response.json({ error: 'Your cart is empty.' }, { status: 400 });
      let calculated = 0;
      for (const item of requested) {
        const id = clean(item.seferId, 80),
          format = item.format === 'pdf' ? 'pdf' : 'book',
          quantity =
            format === 'pdf'
              ? 1
              : Math.max(
                  1,
                  Math.min(20, Math.floor(Number(item.quantity) || 1)),
                ),
          book = (await settings.env.DB.prepare(
            'SELECT id,title,price,available,pdf_price,pdf_available,pdf_storage_key FROM seforim WHERE id=?',
          )
            .bind(id)
            .first()) as any;
        if (
          !book ||
          (format === 'book' && !book.available) ||
          (format === 'pdf' && (!book.pdf_available || !book.pdf_storage_key))
        )
          return Response.json(
            { error: 'One of the items in your cart is no longer available.' },
            { status: 400 },
          );
        const unitPrice = Number(
          format === 'pdf' ? book.pdf_price : book.price,
        );
        validatedItems.push({
          seferId: id,
          title: clean(book.title, 240),
          format,
          quantity,
          unitPrice,
        });
        calculated += unitPrice * quantity;
        if (format === 'book') hasPhysical = true;
      }
      if (Math.abs(calculated - amount) > 0.001)
        return Response.json(
          {
            error: 'The cart total has changed. Please refresh and try again.',
          },
          { status: 400 },
        );
      if (
        hasPhysical &&
        (!clean(body.address, 180) ||
          !clean(body.city, 80) ||
          !clean(body.state, 50) ||
          !clean(body.zip, 20))
      )
        return Response.json(
          { error: 'Enter the complete shipping address for printed books.' },
          { status: 400 },
        );
    }
    const prefix =
      kind === 'donation'
        ? 'DON'
        : kind === 'heter-iska'
          ? 'HI'
          : kind === 'bank-report'
            ? 'BR'
            : kind === 'seforim-order'
              ? 'ORD'
              : 'PDF';
    const invoice = `${prefix}-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
    const gatewayResponse = await fetch('https://x1.cardknox.com/gatewayjson', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        xKey: settings.apiKey,
        xVersion: '5.0.0',
        xSoftwareName: 'Kav Haribis Website',
        xSoftwareVersion: '1.0.0',
        xCommand: 'cc:sale',
        xAmount: amount.toFixed(2),
        xCardNum: cardToken,
        xCVV: cvvToken,
        xExp: expiration,
        xName: name,
        xEmail: email,
        xInvoice: invoice,
        xDescription:
          kind === 'donation'
            ? 'Donation to Kav Haribis'
            : kind === 'heter-iska'
              ? 'Heter Iska protected download'
              : kind === 'bank-report'
                ? 'Full bank report access'
                : kind === 'seforim-order'
                  ? `Seforim order (${validatedItems.length} items)`
                  : `PDF sefer: ${clean(sefer?.title, 120)}`,
      }),
    });
    const gateway = (await gatewayResponse.json()) as Record<string, unknown>;
    const approved = String(gateway.xStatus || '').toLowerCase() === 'approved';
    const reference = clean(gateway.xRefNum, 100);
    const message =
      clean(gateway.xError || gateway.xErrorMessage || gateway.xMessage, 300) ||
      'Payment was not approved.';

    const db = settings.env.DB;
    await db
      .prepare(
        'CREATE TABLE IF NOT EXISTS payment_records (id TEXT PRIMARY KEY, kind TEXT NOT NULL, amount REAL NOT NULL, name TEXT NOT NULL, email TEXT NOT NULL, dedication TEXT, anonymous INTEGER NOT NULL DEFAULT 0, status TEXT NOT NULL, reference TEXT, download_token TEXT, created_at TEXT NOT NULL)',
      )
      .run();
    const paymentId = crypto.randomUUID();
    const downloadToken =
      approved && kind === 'heter-iska'
        ? `${crypto.randomUUID()}${crypto.randomUUID()}`.replaceAll('-', '')
        : null;
    await db
      .prepare(
        'INSERT INTO payment_records(id,kind,amount,name,email,dedication,anonymous,status,reference,download_token,created_at) VALUES(?,?,?,?,?,?,?,?,?,?,?)',
      )
      .bind(
        paymentId,
        kind,
        amount,
        name,
        email,
        clean(body.dedication, 500),
        body.anonymous ? 1 : 0,
        approved ? 'Paid' : 'Declined',
        reference,
        downloadToken,
        new Date().toISOString(),
      )
      .run();

    if (approved && kind === 'heter-iska' && downloadToken) {
      await ensureHeterTables(db);
      await db
        .prepare(
          'INSERT INTO heter_downloads(token,document_id,payment_id,created_at) VALUES(?,?,?,?)',
        )
        .bind(downloadToken, documentId, paymentId, new Date().toISOString())
        .run();
    }
    let reportToken: string | null = null;
    if (approved && kind === 'bank-report') {
      await ensureBankReportTables(db);
      reportToken = `${crypto.randomUUID()}${crypto.randomUUID()}`.replaceAll(
        '-',
        '',
      );
      await db
        .prepare(
          "INSERT INTO bank_report_access(token,bank_id,payment_id,method,created_at) VALUES(?,?,?,'payment',?)",
        )
        .bind(reportToken, bankId, paymentId, new Date().toISOString())
        .run();
    }
    let seferToken: string | null = null;
    if (approved && kind === 'sefer-pdf') {
      await ensureSeforim(db);
      seferToken = `${crypto.randomUUID()}${crypto.randomUUID()}`.replaceAll(
        '-',
        '',
      );
      await db
        .prepare(
          'INSERT INTO sefer_pdf_downloads(token,sefer_id,payment_id,created_at) VALUES(?,?,?,?)',
        )
        .bind(seferToken, seferId, paymentId, new Date().toISOString())
        .run();
    }
    let orderId: string | null = null;
    const downloads: Array<{ title: string; url: string }> = [];
    if (approved && kind === 'seforim-order') {
      await ensureSeforimOrders(db);
      orderId = `KH-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
      await db
        .prepare(
          'INSERT INTO sefer_orders(id,customer_name,email,phone,address,city,state,zip,total,status,reference,created_at) VALUES(?,?,?,?,?,?,?,?,?,?,?,?)',
        )
        .bind(
          orderId,
          name,
          email,
          clean(body.phone, 40),
          clean(body.address, 180),
          clean(body.city, 80),
          clean(body.state, 50),
          clean(body.zip, 20),
          amount,
          'Paid',
          reference || invoice,
          new Date().toISOString(),
        )
        .run();
      for (const item of validatedItems) {
        await db
          .prepare(
            'INSERT INTO sefer_order_items(id,order_id,sefer_id,title,format,quantity,unit_price) VALUES(?,?,?,?,?,?,?)',
          )
          .bind(
            crypto.randomUUID(),
            orderId,
            item.seferId,
            item.title,
            item.format,
            item.quantity,
            item.unitPrice,
          )
          .run();
        if (item.format === 'pdf') {
          const token =
            `${crypto.randomUUID()}${crypto.randomUUID()}`.replaceAll('-', '');
          await db
            .prepare(
              'INSERT INTO sefer_pdf_downloads(token,sefer_id,payment_id,created_at) VALUES(?,?,?,?)',
            )
            .bind(token, item.seferId, paymentId, new Date().toISOString())
            .run();
          downloads.push({
            title: item.title,
            url: `/api/sefer-pdf-download?token=${token}`,
          });
        }
      }
    }
    if (!approved) return Response.json({ error: message }, { status: 402 });
    return Response.json({
      approved: true,
      reference: reference || invoice,
      orderId,
      downloads,
      downloadUrl: downloadToken
        ? `/api/heter-download?token=${downloadToken}`
        : reportToken
          ? `/bank-directory/full-report?token=${reportToken}`
          : seferToken
            ? `/api/sefer-pdf-download?token=${seferToken}`
            : undefined,
    });
  } catch (error) {
    console.error('Payment processing error', error);
    return Response.json(
      {
        error:
          'The payment could not be processed. Please try again or contact Kav Haribis.',
      },
      { status: 500 },
    );
  }
}
