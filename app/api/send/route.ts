import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { sendBatchEmails } from '@/lib/brevo';
import { buildEmailHtml } from '@/lib/emailTemplate';
import { getFilteredRecipients } from '@/lib/audience';
import { Member, AudienceGroup } from '@/types';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: NextRequest) {
  try {
    const { subject, bodyHtml, audienceGroups, attachments } = await request.json();

    if (!subject || !bodyHtml || !audienceGroups || audienceGroups.length === 0) {
      return NextResponse.json({ error: 'Subject, body, and audience are required' }, { status: 400 });
    }

    // Get members
    const { data: members, error: membersError } = await supabase
      .from('members')
      .select('*');

    if (membersError) throw membersError;

    const activeMembers = (members || []).filter((m: Member) => m.status === 'Active');
    const recipients = getFilteredRecipients(audienceGroups as AudienceGroup[], activeMembers);

    if (recipients.length === 0) {
      return NextResponse.json({ error: 'No recipients match the selected audience' }, { status: 400 });
    }

    // Get sender settings
    const { data: settings } = await supabase
      .from('settings')
      .select('*')
      .single();

    const senderName = settings?.sender_name || process.env.DEFAULT_SENDER_NAME || 'BMSA';
    const senderEmail = settings?.sender_email || process.env.DEFAULT_SENDER_EMAIL || 'bmsa@example.com';

    // Build email HTML template (with {{name}} placeholder)
    const fullHtml = buildEmailHtml({
      recipientName: '{{name}}',
      subject,
      bodyHtml,
    });

    // Send emails
    const result = await sendBatchEmails(
      recipients.map(r => ({ email: r.email, name: r.name })),
      subject,
      fullHtml,
      senderName,
      senderEmail,
      '',
      attachments?.map((a: any) => ({ name: a.name, content: a.content })) || []
    );

    // Log to history
    await supabase.from('sent_history').insert({
      id: uuidv4(),
      subject,
      audience_groups: audienceGroups,
      recipient_count: recipients.length,
      status: result.success ? 'sent' : 'error',
      brevo_message_id: result.messageId || null,
      sent_at: new Date().toISOString(),
    });

    return NextResponse.json({
      success: result.success,
      sentCount: result.sentCount,
      failedCount: result.failedCount,
      error: result.error,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
