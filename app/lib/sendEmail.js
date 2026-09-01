import nodemailer from "nodemailer";
import {
  contactSubmissionEmailTemplate,
  statusUpdateEmailTemplate,
} from "./emailTemplates.js";


const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

const sendEmail = async (emails, subject, data, templateType) => {
  try {
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
      default:
        throw new Error(`Invalid email template type: ${templateType}`);
    }

    // 3. Mail Options Setup
    const mailOptions = {
      from: `"Kav Haribis" <${process.env.EMAIL_USER}>`,
      to: recipientList.length === 1 ? recipientList[0] : undefined,
      bcc: recipientList.length > 1 ? recipientList : undefined,
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