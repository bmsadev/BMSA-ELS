import { NextRequest, NextResponse } from 'next/server';
import { verifyPassword, generateToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { password, rememberMe } = await request.json();

    if (!password) {
      return NextResponse.json({ error: 'Password is required' }, { status: 400 });
    }

    const isValid = await verifyPassword(password);

    if (!isValid) {
      return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
    }

    const token = generateToken(rememberMe);

    return NextResponse.json({ token, success: true });
  } catch (error: any) {
    return NextResponse.json({ error: 'Authentication failed' }, { status: 500 });
  }
}
