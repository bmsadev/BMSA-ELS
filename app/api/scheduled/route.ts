import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
import { supabase } from '@/lib/supabase';
import { v4 as uuidv4 } from 'uuid';

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('scheduled_emails')
      .select('*')
      .order('scheduled_at', { ascending: true });

    if (error) throw error;

    return NextResponse.json({ scheduled: data || [] });
  } catch (error: any) {
    return NextResponse.json({ error: error.message, scheduled: [] }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { subject, bodyHtml, audienceGroups, scheduledAt } = await request.json();

    if (!subject || !bodyHtml || !audienceGroups || !scheduledAt) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('scheduled_emails')
      .insert({
        id: uuidv4(),
        subject,
        html_body: bodyHtml,
        audience_groups: audienceGroups,
        scheduled_at: scheduledAt,
        status: 'pending',
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ scheduled: data, success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
