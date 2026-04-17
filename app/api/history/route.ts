import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
export const revalidate = 0;
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('sent_history')
      .select('*')
      .order('sent_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json({ history: data || [] });
  } catch (error: any) {
    return NextResponse.json({ error: error.message, history: [] }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    const { error } = await supabase
      .from('sent_history')
      .delete()
      .not('id', 'is', null);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
