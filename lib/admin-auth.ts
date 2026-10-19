import { cookies } from 'next/headers';
import crypto from 'crypto';

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'bapu2003';
const SECRET_KEY = process.env.ADMIN_JWT_SECRET || 'jtech_mart_secret_bapu2003_secure_token_987654321';
const COOKIE_NAME = 'jtech_admin_session';

export function signToken(payload: string): string {
  const hmac = crypto.createHmac('sha256', SECRET_KEY);
  hmac.update(payload);
  const signature = hmac.digest('hex');
  return `${payload}.${signature}`;
}

export function verifyToken(token: string): boolean {
  if (!token || !token.includes('.')) return false;
  const [payload, signature] = token.split('.');
  
  const hmac = crypto.createHmac('sha256', SECRET_KEY);
  hmac.update(payload);
  const expectedSignature = hmac.digest('hex');

  // Verify signature and expiration (7 days validity)
  if (signature !== expectedSignature) return false;

  try {
    const data = JSON.parse(Buffer.from(payload, 'base64').toString('utf8'));
    if (!data.exp || data.exp < Date.now()) return false;
    return data.role === 'admin';
  } catch {
    return false;
  }
}

export function createAdminSessionToken(): string {
  const payload = Buffer.from(
    JSON.stringify({
      role: 'admin',
      iat: Date.now(),
      exp: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
    })
  ).toString('base64');

  return signToken(payload);
}

export async function isAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return false;
  return verifyToken(token);
}

export { ADMIN_PASSWORD, COOKIE_NAME };
