import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { sql, formatVendorRow, dbGetVendors } from '@/lib/db';
import { isAuthenticated } from '@/lib/admin-auth';

function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-');
}

export async function GET() {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const vendors = await dbGetVendors();
    return NextResponse.json({ vendors });
  } catch (error: any) {
    console.error('[Admin GET Vendors Error]:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch vendors' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const {
      name,
      company = '',
      contactPerson = '',
      phone = '',
      email = '',
      address = '',
      paymentTerms = 'Net 30',
      leadTimeDays = 7,
      balanceDue = 0,
      notes = '',
      isActive = true,
    } = body;

    if (!name || name.trim() === '') {
      return NextResponse.json({ error: 'Vendor name is required.' }, { status: 400 });
    }

    const id = `ven-${slugify(name)}-${Date.now().toString().slice(-4)}`;

    const result = await sql`
      INSERT INTO vendors (
        id, name, company, contact_person, phone, email, address,
        payment_terms, lead_time_days, balance_due, notes, is_active
      ) VALUES (
        ${id}, ${name}, ${company}, ${contactPerson}, ${phone}, ${email}, ${address},
        ${paymentTerms}, ${Number(leadTimeDays) || 7}, ${Number(balanceDue) || 0}, ${notes}, ${Boolean(isActive)}
      )
      RETURNING *
    `;

    try {
      revalidatePath('/admin');
    } catch {}

    return NextResponse.json({
      success: true,
      vendor: formatVendorRow(result[0]),
    });
  } catch (error: any) {
    console.error('[Admin POST Vendor Error]:', error);
    return NextResponse.json({ error: error.message || 'Failed to create vendor' }, { status: 500 });
  }
}
