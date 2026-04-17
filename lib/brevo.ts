const BREVO_API_KEY = process.env.BREVO_API_KEY || '';

interface SendEmailParams {
  to: { email: string; name: string }[];
  subject: string;
  htmlContent: string;
  senderName: string;
  senderEmail: string;
  attachment?: { name: string; content: string }[];
}

interface BrevoResponse {
  messageId?: string;
  success: boolean;
  error?: string;
}

export async function sendEmail(params: SendEmailParams): Promise<BrevoResponse> {
  if (!BREVO_API_KEY || BREVO_API_KEY === 'your-brevo-api-key-here') {
    console.warn('⚠️ Brevo API key not configured. Email not sent.');
    return {
      success: false,
      error: 'Brevo API key not configured. Please add your API key to .env.local',
    };
  }

  try {
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'api-key': BREVO_API_KEY,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        sender: {
          name: params.senderName,
          email: params.senderEmail,
        },
        to: params.to,
        subject: params.subject,
        htmlContent: params.htmlContent,
        ...(params.attachment && params.attachment.length > 0 ? { attachment: params.attachment } : {}),
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      return {
        success: false,
        error: error.message || `Brevo API error: ${response.status}`,
      };
    }

    const data = await response.json();
    return {
      success: true,
      messageId: data.messageId,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Failed to send email',
    };
  }
}

export async function sendBatchEmails(
  recipients: { email: string; name: string }[],
  subject: string,
  htmlBodyTemplate: string,
  senderName: string,
  senderEmail: string,
  logoBase64: string,
  attachments?: { name: string; content: string }[]
): Promise<{ success: boolean; messageId?: string; error?: string; failedCount: number; sentCount: number }> {
  let sentCount = 0;
  let failedCount = 0;
  let lastMessageId = '';
  let lastError = '';

  // Send individual emails for personalization (Dear [Name])
  for (const recipient of recipients) {
    const personalizedHtml = htmlBodyTemplate.replace(/\{\{name\}\}/g, recipient.name);

    const result = await sendEmail({
      to: [{ email: recipient.email, name: recipient.name }],
      subject,
      htmlContent: personalizedHtml,
      senderName,
      senderEmail,
      attachment: attachments,
    });

    if (result.success) {
      sentCount++;
      if (result.messageId) lastMessageId = result.messageId;
    } else {
      failedCount++;
      lastError = result.error || 'Unknown error';
    }

    // Small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  return {
    success: failedCount === 0,
    messageId: lastMessageId,
    error: failedCount > 0 ? `${failedCount} emails failed. Last error: ${lastError}` : undefined,
    failedCount,
    sentCount,
  };
}
