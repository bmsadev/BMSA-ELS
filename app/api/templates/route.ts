import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { v4 as uuidv4 } from 'uuid';

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('templates')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json({ templates: data || [] });
  } catch (error: any) {
    return NextResponse.json({ error: error.message, templates: [] }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name, subject, html_body } = await request.json();

    if (!name) {
      return NextResponse.json({ error: 'Template name is required' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('templates')
      .insert({
        id: uuidv4(),
        name,
        subject: subject || '',
        html_body: html_body || '',
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ template: data, success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
