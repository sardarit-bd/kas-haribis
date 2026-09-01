// ইনপুট থেকে ক্ষতিকর HTML ট্যাগ সরানোর জন্য একটি সিম্পল হেল্পার ফাংশন
const sanitize = (text) => 
  text ? String(text).replace(/</g, "&lt;").replace(/>/g, "&gt;") : "";

export const contactSubmissionEmailTemplate = (data = {}) => {
return `
        <div style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px;">
            <div style="max-width: 650px; margin: 0 auto; background-color: #ffffff; padding: 25px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                
                <!-- Header -->
                <div style="border-bottom: 2px solid #eaeaea; padding-bottom: 15px; margin-bottom: 20px;">
                    <span style="background-color: #e3f2fd; color: #0d47a1; padding: 5px 10px; font-size: 12px; font-weight: bold; border-radius: 4px;">
                        ${sanitize(data.reference) || "NEW SUBMISSION"}
                    </span>
                    <h2 style="color: #333333; margin: 10px 0 5px 0;">
                        ${sanitize(data.request_subtype) || sanitize(data.topic) || "New Contact Request"}
                    </h2>
                </div>

                <!-- Submission Message Box -->
                ${data.message ? `
                <div style="background-color: #fcf8e3; border-left: 4px solid #f0ad4e; padding: 15px; margin-bottom: 20px; border-radius: 4px;">
                    <p style="font-size: 12px; font-weight: bold; color: #8a6d3b; margin: 0 0 5px 0; text-transform: uppercase;">Submission Message</p>
                    <p style="color: #333333; font-size: 14px; margin: 0; white-space: pre-line;">${sanitize(data.message)}</p>
                </div>
                ` : ''}

                <!-- Contact & Request Details -->
                <h3 style="color: #444444; font-size: 16px; border-bottom: 1px solid #eee; padding-bottom: 8px; margin-bottom: 15px;">Contact & Request Details</h3>
                
                <table style="width: 100%; border-collapse: collapse; font-size: 14px; color: #555555;">
                    <tr>
                        <td style="padding: 8px 0; width: 40%;"><strong>Name:</strong></td>
                        <td style="padding: 8px 0; width: 60%;">${sanitize(data.name) || "N/A"}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px 0;"><strong>Email:</strong></td>
                        <td style="padding: 8px 0;"><a href="mailto:${sanitize(data.email)}" style="color: #007bff; text-decoration: none;">${sanitize(data.email) || "N/A"}</a></td>
                    </tr>
                    ${data.phone ? `
                    <tr>
                        <td style="padding: 8px 0;"><strong>Phone:</strong></td>
                        <td style="padding: 8px 0;">${sanitize(data.phone)}</td>
                    </tr>` : ''}
                    ${data.organization ? `
                    <tr>
                        <td style="padding: 8px 0;"><strong>Organization:</strong></td>
                        <td style="padding: 8px 0;">${sanitize(data.organization)}</td>
                    </tr>` : ''}
                    ${data.related_name ? `
                    <tr>
                        <td style="padding: 8px 0;"><strong>Related Business/Bank:</strong></td>
                        <td style="padding: 8px 0;">${sanitize(data.related_name)}</td>
                    </tr>` : ''}
                    ${data.related_url ? `
                    <tr>
                        <td style="padding: 8px 0;"><strong>Related URL:</strong></td>
                        <td style="padding: 8px 0;"><a href="${sanitize(data.related_url)}" target="_blank" style="color: #007bff;">${sanitize(data.related_url)}</a></td>
                    </tr>` : ''}
                    ${data.preferred_date ? `
                    <tr>
                        <td style="padding: 8px 0;"><strong>Preferred Date:</strong></td>
                        <td style="padding: 8px 0;">${sanitize(data.preferred_date)}</td>
                    </tr>` : ''}
                    ${data.location ? `
                    <tr>
                        <td style="padding: 8px 0;"><strong>Location:</strong></td>
                        <td style="padding: 8px 0;">${sanitize(data.location)}</td>
                    </tr>` : ''}
                    ${data.audience ? `
                    <tr>
                        <td style="padding: 8px 0;"><strong>Audience:</strong></td>
                        <td style="padding: 8px 0;">${sanitize(data.audience)}</td>
                    </tr>` : ''}
                    <tr>
                        <td style="padding: 8px 0;"><strong>Preferred Response:</strong></td>
                        <td style="padding: 8px 0;">${sanitize(data.response_method) || "Email"}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px 0;"><strong>Received At:</strong></td>
                        <td style="padding: 8px 0;">${sanitize(data.created_at)}</td>
                    </tr>
                </table>

                <!-- Attachment Section (যদি অ্যাটাচমেন্ট থাকে) -->
                ${data.attachmentKey ? `
                <div style="margin-top: 20px; padding-top: 15px; border-top: 1px solid #eee;">
                    <p style="font-size: 14px; margin-bottom: 8px;"><strong>Attachment:</strong></p>
                    <a href="${sanitize(data.attachmentKey)}" target="_blank" style="background-color: #007bff; color: #ffffff; padding: 8px 15px; text-decoration: none; border-radius: 4px; display: inline-block; font-size: 13px; font-weight: bold;">
                        Download ${sanitize(data.attachmentName) || "File"}
                    </a>
                </div>
                ` : ''}

            </div>
        </div>
    `;
};


const getStatusBadgeStyle = (status = '') => {
  const currentStatus = status.trim().toLowerCase();
  switch (currentStatus) {
    case 'new':
      return 'background-color: #e3f2fd; color: #0d47a1; border: 1px solid #bbdefb;';
    case 'reviewing':
      return 'background-color: #fff3cd; color: #856404; border: 1px solid #ffeeba;';
    case 'responded':
      return 'background-color: #d4edda; color: #155724; border: 1px solid #c3e6cb;';
    case 'closed':
      return 'background-color: #e2e3e5; color: #383d41; border: 1px solid #d6d8db;';
    default:
      return 'background-color: #f8f9fa; color: #212529; border: 1px solid #dae0e5;';
  }
};

export const statusUpdateEmailTemplate = (data = {}) => {
  const name = sanitize(data.name) || "Valued Customer";
  const reference = sanitize(data.reference) || "N/A";
  const status = sanitize(data.status) || "New";
  const requestTitle = sanitize(data.request_subtype) || sanitize(data.topic) || "Contact Request";
  const notes = sanitize(data.notes);

  return `
    <div style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 25px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.08);">
        
        <!-- Header -->
        <div style="border-bottom: 2px solid #eaeaea; padding-bottom: 15px; margin-bottom: 20px;">
          <h2 style="color: #333333; margin: 0 0 5px 0;">Request Status Update</h2>
          <p style="color: #777777; font-size: 13px; margin: 0;">Reference ID: <strong>${reference}</strong></p>
        </div>

        <!-- Greeting -->
        <p style="color: #444444; font-size: 15px; line-height: 1.5;">
          Hello <strong>${name}</strong>,
        </p>
        <p style="color: #555555; font-size: 14px; line-height: 1.5;">
          The status of your request regarding <strong>"${requestTitle}"</strong> has been updated.
        </p>

        <!-- Status Card -->
        <div style="background-color: #f9f9f9; padding: 15px; border-radius: 6px; margin: 20px 0; text-align: center;">
          <span style="font-size: 12px; color: #666666; text-transform: uppercase; display: block; margin-bottom: 6px; font-weight: bold;">Current Status</span>
          <span style="display: inline-block; padding: 6px 18px; font-size: 14px; font-weight: bold; border-radius: 20px; ${getStatusBadgeStyle(status)}">
            ${status}
          </span>
        </div>

        <!-- Admin Notes Section -->
        ${notes ? `
        <div style="background-color: #eef7ff; border-left: 4px solid #007bff; padding: 15px; margin-bottom: 20px; border-radius: 4px;">
          <p style="font-size: 12px; font-weight: bold; color: #004085; margin: 0 0 5px 0; text-transform: uppercase;">Note from Support Team</p>
          <p style="color: #333333; font-size: 14px; margin: 0; white-space: pre-line;">${notes}</p>
        </div>
        ` : ''}

        <p style="color: #666666; font-size: 13px; line-height: 1.5; margin-top: 25px;">
          If you have any further questions, feel free to reply directly to this email.
        </p>

        <!-- Footer -->
        <div style="border-top: 1px solid #eeeeee; padding-top: 15px; margin-top: 25px; text-align: center;">
          <p style="color: #999999; font-size: 12px; margin: 0;">Thank you for contacting us.</p>
        </div>

      </div>
    </div>
  `;
};