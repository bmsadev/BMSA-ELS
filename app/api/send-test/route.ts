import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { sendEmail } from '@/lib/brevo';
import { buildEmailHtml } from '@/lib/emailTemplate';

export async function POST(request: NextRequest) {
  try {
    const { subject, bodyHtml, attachments } = await request.json();

    if (!subject) {
      return NextResponse.json({ error: 'Subject is required' }, { status: 400 });
    }

    // Get sender settings
    const { data: settings } = await supabase
      .from('settings')
      .select('*')
      .single();

    const senderName = settings?.sender_name || process.env.DEFAULT_SENDER_NAME || 'BMSA';
    const senderEmail = settings?.sender_email || process.env.DEFAULT_SENDER_EMAIL || 'bmsa@example.com';

    // Build test email
    const fullHtml = buildEmailHtml({
      recipientName: 'President',
      subject: `[TEST] ${subject}`,
      bodyHtml: bodyHtml || '<p>This is a test email.</p>',
    });

    const result = await sendEmail({
      to: [{ email: senderEmail, name: senderName }],
      subject: `[TEST] ${subject}`,
      htmlContent: fullHtml,
      senderName,
      senderEmail,
      attachment: attachments?.map((a: any) => ({ name: a.name, content: a.content })) || [],
    });

    return NextResponse.json({
      success: result.success,
      sentTo: senderEmail,
      error: result.error,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
