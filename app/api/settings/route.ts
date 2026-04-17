import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('settings')
      .select('*')
      .single();

    if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows

    return NextResponse.json({
      sender_name: data?.sender_name || process.env.DEFAULT_SENDER_NAME || 'BMSA',
      sender_email: data?.sender_email || process.env.DEFAULT_SENDER_EMAIL || 'bmsa@example.com',
    });
  } catch (error: any) {
    return NextResponse.json({
      sender_name: process.env.DEFAULT_SENDER_NAME || 'BMSA',
      sender_email: process.env.DEFAULT_SENDER_EMAIL || 'bmsa@example.com',
    });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { sender_name, sender_email } = await request.json();

    // Upsert settings (single row)
    const { error } = await supabase
      .from('settings')
      .upsert({
        id: 1,
        sender_name,
        sender_email,
        updated_at: new Date().toISOString(),
      });

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
