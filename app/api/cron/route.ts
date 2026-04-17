import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { sendBatchEmails } from '@/lib/brevo';
import { buildEmailHtml } from '@/lib/emailTemplate';
import { getFilteredRecipients } from '@/lib/audience';
import { Member, AudienceGroup } from '@/types';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// This endpoint should be called by a cron job (e.g., Vercel Cron)
// to process scheduled emails that are due
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  const urlKey = request.nextUrl.searchParams.get('key');
  
  // Protect the route in production but allow local testing
  if (
    process.env.NODE_ENV === 'production' &&
    authHeader !== `Bearer ${process.env.CRON_SECRET}` &&
    urlKey !== process.env.CRON_SECRET
  ) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const now = new Date().toISOString();

    // Find pending emails that are due
    const { data: dueEmails, error } = await supabase
      .from('scheduled_emails')
      .select('*')
      .eq('status', 'pending')
      .lte('scheduled_at', now);

    if (error) throw error;

    if (!dueEmails || dueEmails.length === 0) {
      return NextResponse.json({ message: 'No emails to process', processed: 0 });
    }

    // Get all members
    const { data: members } = await supabase.from('members').select('*');
    const activeMembers = (members || []).filter((m: Member) => m.status === 'Active');

    // Get sender settings
    const { data: settings } = await supabase.from('settings').select('*').single();
    const senderName = settings?.sender_name || process.env.DEFAULT_SENDER_NAME || 'BMSA';
    const senderEmail = settings?.sender_email || process.env.DEFAULT_SENDER_EMAIL || 'bmsa@example.com';

    let processed = 0;

    for (const email of dueEmails) {
      const recipients = getFilteredRecipients(
        email.audience_groups as AudienceGroup[],
        activeMembers
      );

      if (recipients.length === 0) {
        // Mark as sent with 0 recipients
        await supabase
          .from('scheduled_emails')
          .update({ status: 'sent' })
          .eq('id', email.id);
        continue;
      }

      const fullHtml = buildEmailHtml({
        recipientName: '{{name}}',
        subject: email.subject,
        bodyHtml: email.html_body,
      });

      const result = await sendBatchEmails(
        recipients.map((r: Member) => ({ email: r.email, name: r.name })),
        email.subject,
        fullHtml,
        senderName,
        senderEmail,
        ''
      );

      // Update scheduled email status
      await supabase
        .from('scheduled_emails')
        .update({ status: 'sent' })
        .eq('id', email.id);

      // Log to history
      await supabase.from('sent_history').insert({
        subject: email.subject,
        audience_groups: email.audience_groups,
        recipient_count: recipients.length,
        status: result.success ? 'sent' : 'error',
        brevo_message_id: result.messageId || null,
        sent_at: new Date().toISOString(),
      });

      processed++;
    }

    return NextResponse.json({ message: `Processed ${processed} scheduled emails`, processed });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
