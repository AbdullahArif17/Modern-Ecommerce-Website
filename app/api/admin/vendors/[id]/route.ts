import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { sql, formatVendorRow } from '@/lib/db';
import { isAuthenticated } from '@/lib/admin-auth';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await params;
    const body = await request.json();
    const {
      name,
      company,
      contactPerson,
      phone,
      email,
      address,
      paymentTerms,
      leadTimeDays,
      balanceDue,
      notes,
      isActive,
    } = body;

    const result = await sql`
      UPDATE vendors SET
        name = COALESCE(${name}, name),
        company = COALESCE(${company}, company),
        contact_person = COALESCE(${contactPerson}, contact_person),
        phone = COALESCE(${phone}, phone),
        email = COALESCE(${email}, email),
        address = COALESCE(${address}, address),
        payment_terms = COALESCE(${paymentTerms}, payment_terms),
        lead_time_days = COALESCE(${leadTimeDays !== undefined ? Number(leadTimeDays) : null}, lead_time_days),
        balance_due = COALESCE(${balanceDue !== undefined ? Number(balanceDue) : null}, balance_due),
        notes = COALESCE(${notes}, notes),
        is_active = COALESCE(${isActive !== undefined ? Boolean(isActive) : null}, is_active),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id}
      RETURNING *
    `;

    if (result.length === 0) {
      return NextResponse.json({ error: 'Vendor not found' }, { status: 404 });
    }

    // Cascade name update to products if vendor name changed
    if (name) {
      await sql`UPDATE products SET vendor_name = ${name} WHERE vendor_id = ${id}`;
    }

    try {
      revalidatePath('/admin');
    } catch {}

    return NextResponse.json({
      success: true,
      vendor: formatVendorRow(result[0]),
    });
  } catch (error: any) {
    console.error('[Admin PUT Vendor Error]:', error);
    return NextResponse.json({ error: error.message || 'Failed to update vendor' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await params;

    // Disassociate products from this vendor first
    await sql`UPDATE products SET vendor_id = NULL, vendor_name = NULL WHERE vendor_id = ${id}`;

    const result = await sql`DELETE FROM vendors WHERE id = ${id} RETURNING id`;
    if (result.length === 0) {
      return NextResponse.json({ error: 'Vendor not found' }, { status: 404 });
    }

    try {
      revalidatePath('/admin');
    } catch {}

    return NextResponse.json({ success: true, id });
  } catch (error: any) {
    console.error('[Admin DELETE Vendor Error]:', error);
    return NextResponse.json({ error: error.message || 'Failed to delete vendor' }, { status: 500 });
  }
}
