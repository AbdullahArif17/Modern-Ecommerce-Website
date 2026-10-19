import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { ADMIN_PASSWORD, COOKIE_NAME, createAdminSessionToken, isAuthenticated } from '@/lib/admin-auth';

export async function GET() {
  const authenticated = await isAuthenticated();
  return NextResponse.json({ authenticated });
}

export async function POST(request: Request) {
  try {
    const { password } = await request.json();

    if (!password || password !== ADMIN_PASSWORD) {
      return NextResponse.json(
        { error: 'Invalid admin password. Please try again.' },
        { status: 401 }
      );
    }

    const token = createAdminSessionToken();
    const cookieStore = await cookies();

    cookieStore.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    return NextResponse.json({
      success: true,
      message: 'Authentication successful.',
    });
  } catch (error) {
    console.error('[Admin Auth API Error]:', error);
    return NextResponse.json(
      { error: 'Internal server error during authentication.' },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  try {
    const cookieStore = await cookies();
    cookieStore.delete(COOKIE_NAME);
    return NextResponse.json({ success: true, message: 'Logged out successfully.' });
  } catch (error) {
    console.error('[Admin Logout API Error]:', error);
    return NextResponse.json({ error: 'Failed to log out.' }, { status: 500 });
  }
}
