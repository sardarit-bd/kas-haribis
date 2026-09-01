import { getRequestEmail, isOwnerRequest } from '../../../lib/request-auth';
import { isOwnerEmail } from '../../../lib/admin-access';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { ensureInvoices } from '../../../lib/invoices';

const cardUrl = 'https://secure.cardknox.com/congregationkavharibis';
const heterIskaUrl = 'https://kavharibis.com/heter-iska/',
  brisPinchasUrl =
    'https://heter-iska.com/wp-content/uploads/2025/05/Heter-iska-Jared.pdf';
const safe = (value: unknown) =>
  String(value ?? '').replace(/[^\x20-\x7E\xA0-\xFF]/g, '?');
function lines(text: string, max = 72) {
  const words = safe(text).replace(/\s+/g, ' ').trim().split(' '),
    out: string[] = [];
  let line = '';
  for (const word of words) {
    const next = line ? `${line} ${word}` : word;
    if (next.length > max) {
      if (line) out.push(line);
      line = word;
    } else line = next;
  }
  if (line) out.push(line);
  return out;
}
export async function GET(request: Request) {
  if (
    !(await isOwnerRequest(request))
  )
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  const { env } = await import('cloudflare:workers');
  await ensureInvoices(env.DB);
  const id = new URL(request.url).searchParams.get('id') || '',
    invoice = (await env.DB.prepare('SELECT * FROM invoices WHERE id=?')
      .bind(id)
      .first()) as any;
  if (!invoice)
    return Response.json({ error: 'Invoice not found' }, { status: 404 });
  const receipt = invoice.document_type === 'Donation Receipt',
    pdf = await PDFDocument.create(),
    page = pdf.addPage([612, 792]),
    regular = await pdf.embedFont(StandardFonts.Helvetica),
    bold = await pdf.embedFont(StandardFonts.HelveticaBold),
    serif = await pdf.embedFont(StandardFonts.TimesRomanBold),
    navy = rgb(0.055, 0.16, 0.25),
    gold = rgb(0.76, 0.58, 0.25),
    ink = rgb(0.12, 0.17, 0.22),
    muted = rgb(0.38, 0.45, 0.5),
    cream = rgb(0.97, 0.95, 0.9);
  page.drawRectangle({ x: 0, y: 682, width: 612, height: 110, color: navy });
  page.drawRectangle({ x: 0, y: 677, width: 612, height: 5, color: gold });
  page.drawText('KH', { x: 42, y: 724, size: 30, font: serif, color: gold });
  page.drawText('CONGREGATION KAV HARIBIS INC.', {
    x: 95,
    y: 739,
    size: 13,
    font: bold,
    color: rgb(1, 1, 1),
  });
  page.drawText('Torah guidance for responsible commerce', {
    x: 95,
    y: 720,
    size: 9,
    font: regular,
    color: rgb(0.78, 0.84, 0.87),
  });
  page.drawText(receipt ? 'DONATION RECEIPT' : 'INVOICE', {
    x: receipt ? 374 : 462,
    y: 723,
    size: receipt ? 17 : 22,
    font: serif,
    color: rgb(1, 1, 1),
  });
  page.drawText(
    `${receipt ? 'Receipt' : 'Invoice'} ${safe(invoice.invoice_number)}`,
    { x: 42, y: 642, size: 20, font: serif, color: navy },
  );
  page.drawText(`Status: ${safe(invoice.status)}`, {
    x: 448,
    y: 646,
    size: 10,
    font: bold,
    color: gold,
  });
  page.drawText(receipt ? 'RECEIVED FROM' : 'BILL TO', {
    x: 42,
    y: 605,
    size: 8,
    font: bold,
    color: gold,
  });
  page.drawText(safe(invoice.customer_name), {
    x: 42,
    y: 585,
    size: 13,
    font: bold,
    color: ink,
  });
  let y = 568;
  for (const value of [
    invoice.company,
    invoice.customer_email,
    ...lines(invoice.address || '', 45),
  ])
    if (value) {
      page.drawText(safe(value), {
        x: 42,
        y,
        size: 9,
        font: regular,
        color: muted,
      });
      y -= 14;
    }
  page.drawText(receipt ? 'DONATION DATE' : 'ISSUE DATE', {
    x: receipt ? 380 : 390,
    y: 605,
    size: 8,
    font: bold,
    color: gold,
  });
  page.drawText(safe(invoice.issue_date), {
    x: 390,
    y: 586,
    size: 10,
    font: regular,
    color: ink,
  });
  if (!receipt) {
    page.drawText('DUE DATE', {
      x: 490,
      y: 605,
      size: 8,
      font: bold,
      color: gold,
    });
    page.drawText(safe(invoice.due_date || 'Upon receipt'), {
      x: 490,
      y: 586,
      size: 10,
      font: regular,
      color: ink,
    });
  }
  page.drawRectangle({ x: 42, y: 490, width: 528, height: 42, color: navy });
  page.drawText(receipt ? 'CONTRIBUTION' : 'DESCRIPTION', {
    x: 56,
    y: 506,
    size: 9,
    font: bold,
    color: rgb(1, 1, 1),
  });
  page.drawText('AMOUNT', {
    x: 492,
    y: 506,
    size: 9,
    font: bold,
    color: rgb(1, 1, 1),
  });
  const descriptionLines = lines(invoice.description, 70).slice(0, 8);
  let descriptionY = 462;
  for (const line of descriptionLines) {
    page.drawText(line, {
      x: 56,
      y: descriptionY,
      size: 10,
      font: regular,
      color: ink,
    });
    descriptionY -= 15;
  }
  page.drawText(`$${Number(invoice.amount).toFixed(2)}`, {
    x: 490,
    y: 462,
    size: 13,
    font: bold,
    color: ink,
  });
  const boxBottom = Math.min(390, descriptionY - 15);
  page.drawLine({
    start: { x: 42, y: boxBottom },
    end: { x: 570, y: boxBottom },
    thickness: 1,
    color: rgb(0.84, 0.86, 0.87),
  });
  page.drawRectangle({
    x: 354,
    y: boxBottom - 60,
    width: 216,
    height: 48,
    color: cream,
  });
  page.drawText(receipt ? 'DONATION RECEIVED' : 'AMOUNT DUE', {
    x: 370,
    y: boxBottom - 32,
    size: 9,
    font: bold,
    color: muted,
  });
  page.drawText(`$${Number(invoice.amount).toFixed(2)}`, {
    x: 468,
    y: boxBottom - 36,
    size: 18,
    font: serif,
    color: navy,
  });
  const paymentTop = boxBottom - 98;
  if (receipt) {
    page.drawText('PAYMENT DETAILS', {
      x: 42,
      y: paymentTop,
      size: 11,
      font: bold,
      color: gold,
    });
    page.drawText(
      `Method: ${safe(invoice.payment_method || 'Not specified')}`,
      { x: 42, y: paymentTop - 27, size: 10, font: regular, color: ink },
    );
    if (invoice.payment_reference)
      page.drawText(`Reference: ${safe(invoice.payment_reference)}`, {
        x: 42,
        y: paymentTop - 45,
        size: 9,
        font: regular,
        color: muted,
      });
    page.drawRectangle({
      x: 42,
      y: paymentTop - 102,
      width: 528,
      height: 40,
      color: rgb(0.95, 0.96, 0.96),
    });
    let statementY = paymentTop - 79;
    for (const line of lines(
      invoice.goods_services ||
        'No goods or services were provided in exchange for this contribution.',
      94,
    ).slice(0, 2)) {
      page.drawText(line, {
        x: 56,
        y: statementY,
        size: 9,
        font: bold,
        color: navy,
      });
      statementY -= 13;
    }
  } else {
    page.drawText('PAYMENT OPTIONS', {
      x: 42,
      y: paymentTop,
      size: 11,
      font: bold,
      color: gold,
    });
    page.drawText('Zelle', {
      x: 42,
      y: paymentTop - 26,
      size: 11,
      font: bold,
      color: navy,
    });
    page.drawText('Send payment to 732-606-7923', {
      x: 42,
      y: paymentTop - 43,
      size: 10,
      font: regular,
      color: ink,
    });
    page.drawText('Recipient: Congregation Kav Haribis Inc.', {
      x: 42,
      y: paymentTop - 58,
      size: 9,
      font: regular,
      color: muted,
    });
    page.drawText('Credit Card', {
      x: 320,
      y: paymentTop - 26,
      size: 11,
      font: bold,
      color: navy,
    });
    page.drawText('Pay securely online:', {
      x: 320,
      y: paymentTop - 43,
      size: 10,
      font: regular,
      color: ink,
    });
    page.drawText(cardUrl, {
      x: 320,
      y: paymentTop - 58,
      size: 8,
      font: regular,
      color: rgb(0.08, 0.32, 0.62),
    });
    page.drawRectangle({
      x: 42,
      y: paymentTop - 105,
      width: 528,
      height: 30,
      color: rgb(0.95, 0.96, 0.96),
    });
    page.drawText(
      'Need another payment method? Contact Kav Haribis and we will be happy to assist.',
      { x: 56, y: paymentTop - 94, size: 9, font: regular, color: muted },
    );
  }
  if (invoice.notes) {
    page.drawText('NOTES', {
      x: 42,
      y: paymentTop - 135,
      size: 8,
      font: bold,
      color: gold,
    });
    let noteY = paymentTop - 152;
    for (const line of lines(invoice.notes, 92).slice(0, 2)) {
      page.drawText(line, {
        x: 42,
        y: noteY,
        size: 8,
        font: regular,
        color: muted,
      });
      noteY -= 12;
    }
  }
  page.drawRectangle({
    x: 42,
    y: 44,
    width: 528,
    height: 76,
    color: rgb(0.975, 0.965, 0.935),
  });
  page.drawText('HETER ISKA NOTICE', {
    x: 54,
    y: 105,
    size: 7,
    font: bold,
    color: gold,
  });
  let noticeY = 92;
  for (const line of lines(
    'All transactions, sales, and credit extensions executed by Kav Haribis that potentially violate the halachic prohibition of ribis (interest) are strictly governed by the most updated version of the Bris Pinchas Heter Iska.',
    112,
  ).slice(0, 3)) {
    page.drawText(line, {
      x: 54,
      y: noticeY,
      size: 6.6,
      font: regular,
      color: ink,
    });
    noticeY -= 9;
  }
  page.drawText(`Kav Haribis: ${heterIskaUrl}`, {
    x: 54,
    y: 58,
    size: 6.2,
    font: regular,
    color: rgb(0.08, 0.32, 0.62),
  });
  page.drawText(`Bris Pinchas Heter Iska: ${brisPinchasUrl}`, {
    x: 254,
    y: 58,
    size: 6.2,
    font: regular,
    color: rgb(0.08, 0.32, 0.62),
  });
  page.drawLine({
    start: { x: 42, y: 34 },
    end: { x: 570, y: 34 },
    thickness: 1,
    color: rgb(0.82, 0.78, 0.68),
  });
  page.drawText(
    'Congregation Kav Haribis Inc.  |  EIN 33-3357711  |  Lakewood, New Jersey',
    { x: 42, y: 18, size: 7, font: regular, color: muted },
  );
  page.drawText(
    receipt
      ? 'Thank you for your generous support.'
      : 'Thank you for supporting the work of Kav Haribis.',
    { x: receipt ? 430 : 405, y: 18, size: 7, font: bold, color: navy },
  );
  const preview = new URL(request.url).searchParams.get('preview') === '1',
    bytes = await pdf.save();
  return new Response(bytes as any, {
    headers: {
      'content-type': 'application/pdf',
      'content-disposition': `${preview ? 'inline' : 'attachment'}; filename="${invoice.invoice_number}.pdf"`,
      'cache-control': 'no-store',
    },
  });
}
