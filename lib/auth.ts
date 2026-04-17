import bcrypt from 'bcryptjs';

const AUTH_SECRET = process.env.AUTH_SECRET || 'fallback-secret';
const PRESIDENT_PASSWORD = process.env.PRESIDENT_PASSWORD || 'changeme123';

export async function verifyPassword(password: string): Promise<boolean> {
  return password === PRESIDENT_PASSWORD;
}

export function generateToken(rememberMe: boolean): string {
  const expiresIn = rememberMe ? 30 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000; // 30 days or 1 day
  const expiresAt = Date.now() + expiresIn;

  const payload = {
    role: 'president',
    exp: expiresAt,
    iat: Date.now(),
    secret: AUTH_SECRET,
  };

  // Simple base64 token encoding (not a full JWT, but sufficient for single-user auth)
  const token = Buffer.from(JSON.stringify(payload)).toString('base64');
  return token;
}

export function verifyToken(token: string): boolean {
  try {
    const payload = JSON.parse(Buffer.from(token, 'base64').toString('utf-8'));

    if (payload.secret !== AUTH_SECRET) {
      return false;
    }

    if (payload.exp < Date.now()) {
      return false;
    }

    return true;
  } catch {
    return false;
  }
}
