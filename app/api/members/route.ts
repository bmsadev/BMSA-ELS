import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
import { supabase } from '@/lib/supabase';
import { parseExcelBuffer } from '@/lib/excel';

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('members')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json({ members: data || [] });
  } catch (error: any) {
    return NextResponse.json({ error: error.message, members: [] }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get('content-type') || '';

    // Handle Excel file upload
    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      const file = formData.get('file') as File;

      if (!file) {
        return NextResponse.json({ error: 'No file provided' }, { status: 400 });
      }

      const buffer = Buffer.from(await file.arrayBuffer());
      const result = parseExcelBuffer(buffer);

      if (result.members.length === 0 && result.errors.length > 0) {
        return NextResponse.json({ errors: result.errors, preview: [] }, { status: 400 });
      }

      // Return preview for confirmation
      return NextResponse.json({
        preview: result.members,
        errors: result.errors,
        totalRows: result.totalRows,
      });
    }

    // Handle confirmed upload (JSON body)
    if (contentType.includes('application/json')) {
      const { members, confirm } = await request.json();

      if (confirm && members && Array.isArray(members)) {
        // Upsert members (update existing by email, insert new)
        const { data, error } = await supabase
          .from('members')
          .upsert(
            members.map((m: any) => ({
              id: m.id,
              name: m.name,
              email: m.email,
              committee: m.committee,
              role: m.role,
              status: m.status,
              created_at: new Date().toISOString(),
            })),
            { onConflict: 'email' }
          )
          .select();

        if (error) throw error;

        // Fetch all members after upsert
        const { data: allMembers } = await supabase
          .from('members')
          .select('*')
          .order('created_at', { ascending: false });

        return NextResponse.json({ members: allMembers || [], added: members.length });
      }
    }

    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
