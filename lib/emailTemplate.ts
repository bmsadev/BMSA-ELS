interface EmailTemplateParams {
  recipientName: string;
  subject: string;
  bodyHtml: string;
}

function textToHtml(text: string): string {
  // If text already contains HTML tags, return as-is
  if (/<[a-z][\s\S]*>/i.test(text)) {
    return text;
  }
  // Convert plain text to HTML paragraphs
  return text
    .split(/\n\n+/)
    .map(para => `<p>${para.replace(/\n/g, '<br/>')}</p>`)
    .join('\n');
}

export function buildEmailHtml(params: EmailTemplateParams): string {
  const bodyContent = textToHtml(params.bodyHtml || '');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(params.subject)}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #F5F5F5; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #F5F5F5;">
    <tr>
      <td align="center" style="padding: 30px 15px;">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width: 600px; width: 100%;">
          
          <!-- Header -->
          <tr>
            <td align="center" style="background-color: #FFFFFF; padding: 30px 20px; border-radius: 12px 12px 0 0;">
              <img src="https://csatbeqttgywxsauawxu.supabase.co/storage/v1/object/public/assets/bmsa-logo-horizontal.png" alt="BMSA" style="max-width: 220px; height: auto; display: block;" />
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="background-color: #FFFFFF; padding: 40px 35px;">
              <!-- Greeting -->
              <p style="margin: 0 0 8px 0; font-size: 16px; color: #212121; line-height: 1.6;">
                Dear <strong>{{name}}</strong>,
              </p>

              <!-- Subject as heading -->
              <h1 style="margin: 20px 0 16px 0; font-size: 22px; font-weight: 700; color: #B71C1C; line-height: 1.3;">
                ${escapeHtml(params.subject)}
              </h1>

              <!-- Divider -->
              <hr style="border: none; border-top: 2px solid #F5A623; margin: 16px 0 24px 0; width: 60px;" align="left" />

              <!-- Email body content -->
              <div style="font-size: 15px; color: #212121; line-height: 1.7;">
                ${bodyContent}
              </div>

              <!-- Warm regards -->
              <p style="margin: 30px 0 0 0; font-size: 15px; color: #212121; line-height: 1.6;">
                Warm regards,<br/>
                <strong style="color: #B71C1C;">BMSA Team</strong>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="background-color: #2C2C2C; padding: 25px 20px; border-radius: 0 0 12px 12px;">
              <p style="margin: 0; font-size: 13px; color: #F5A623; line-height: 1.5; font-weight: 500;">
                Beni-Suef Medical Students' Association &middot; BMSA
              </p>
              <p style="margin: 8px 0 0 0; font-size: 11px; color: #999999; line-height: 1.4;">
                &copy; 2025 BMSA. Developed by <strong style="color: #cccccc;">Mahmoud Ahmed</strong>, All rights reserved.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export function buildPreviewHtml(subject: string, bodyHtml: string): string {
  return buildEmailHtml({
    recipientName: 'Member Name',
    subject,
    bodyHtml,
  });
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
