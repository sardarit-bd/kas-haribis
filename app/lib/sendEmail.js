import nodemailer from "nodemailer";
import {
  baisHoraahQuestionEmailTemplate,
  certificationApplicationEmailTemplate,
  contactSubmissionEmailTemplate,
  statusUpdateEmailTemplate,
  ribbisAlertEmailTemplate,
} from "./emailTemplates.js";


async function getEmailConfig() {
  let user = process.env.EMAIL_USER || '';
  let pass = process.env.EMAIL_PASSWORD || '';
  if (!user || !pass) {
    try {
      const { env } = await import('cloudflare:workers');
      if (env) {
        user = user || env.EMAIL_USER || '';
        pass = pass || env.EMAIL_PASSWORD || '';
      }
    } catch {
      // non-worker environment fallback
    }
  }
  return { user, pass };
}

const sendEmail = async (emails, subject, data, templateType) => {
  try {
    const { user, pass } = await getEmailConfig();
    if (!user || !pass) {
      throw new Error("Email credentials (EMAIL_USER / EMAIL_PASSWORD) are not configured.");
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user, pass },
    });

    // 1. Array validation
    const recipientList = Array.isArray(emails) ? emails : [emails];
    if (recipientList.length === 0) {
      throw new Error("Emails list cannot be empty");
    }

    // 2. Template Selection
    let htmlTemplate;
    switch (templateType) {
      case "contact-submission":
        htmlTemplate = contactSubmissionEmailTemplate(data);
        break;
      case "contact-submission-update-status":
        htmlTemplate = statusUpdateEmailTemplate(data);
        break;
      case "bais-horaah-question":
        htmlTemplate = baisHoraahQuestionEmailTemplate(data);
        break;
      case "certification-application":
        htmlTemplate = certificationApplicationEmailTemplate(data);
        break;
      case "ribbis-alert":
        htmlTemplate = ribbisAlertEmailTemplate(data);
        break;
      default:
        throw new Error(`Invalid email template type: ${templateType}`);
    }

    // 3. Mail Options Setup
    const mailOptions = {
      from: `"Kav Haribis" <${user}>`,
      to: recipientList.join(', '),
      subject,
      html: htmlTemplate,
    };

    // 4. Send Email
    const info = await transporter.sendMail(mailOptions);
    console.log(`Email sent successfully. MessageId: ${info.messageId}`);
    
    return true;
  } catch (error) {
    console.error("Error sending email:", error.message);
    throw error;
  }
};

export default sendEmail;