import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { sql, formatTransactionRow, dbGetStoreTransactions, dbGetStoreMetrics } from '@/lib/db';
import { isAuthenticated } from '@/lib/admin-auth';

export async function GET() {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const [transactions, metrics] = await Promise.all([
      dbGetStoreTransactions(100),
      dbGetStoreMetrics(),
    ]);

    return NextResponse.json({ transactions, metrics });
  } catch (error: any) {
    console.error('[Admin GET Store Transactions Error]:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch store CRM data' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const {
      type, // 'sale', 'expense', 'purchase_order', 'refund'
      title,
      amount,
      category = 'General',
      vendorId = null,
      vendorName = null,
      productId = null,
      quantity = 1,
      customerName = '',
      paymentMethod = 'Cash / COD',
      status = 'completed',
      notes = '',
      transactionDate = new Date().toISOString().split('T')[0],
    } = body;

    if (!type || !title || amount === undefined || Number(amount) < 0) {
      return NextResponse.json({ error: 'Type, title and valid amount are required.' }, { status: 400 });
    }

    const id = `tx-${type}-${Date.now().toString().slice(-6)}`;

    const result = await sql`
      INSERT INTO store_transactions (
        id, type, title, amount, category, vendor_id, vendor_name, product_id,
        quantity, customer_name, payment_method, status, notes, transaction_date
      ) VALUES (
        ${id}, ${type}, ${title}, ${Number(amount)}, ${category}, ${vendorId}, ${vendorName}, ${productId},
        ${Number(quantity) || 1}, ${customerName}, ${paymentMethod}, ${status}, ${notes}, ${transactionDate}::date
      )
      RETURNING *
    `;

    // If type is sale and productId is specified, decrease stock_quantity
    if (type === 'sale' && productId) {
      await sql`
        UPDATE products 
        SET stock_quantity = GREATEST(0, stock_quantity - ${Number(quantity) || 1})
        WHERE id = ${productId}
      `;
    }

    // If type is purchase_order and productId is specified, increase stock_quantity
    if (type === 'purchase_order' && productId) {
      await sql`
        UPDATE products 
        SET stock_quantity = stock_quantity + ${Number(quantity) || 1}
        WHERE id = ${productId}
      `;
    }

    try {
      revalidatePath('/admin');
    } catch {}

    const metrics = await dbGetStoreMetrics();

    return NextResponse.json({
      success: true,
      transaction: formatTransactionRow(result[0]),
      metrics,
    });
  } catch (error: any) {
    console.error('[Admin POST Store Transaction Error]:', error);
    return NextResponse.json({ error: error.message || 'Failed to record store transaction' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'Transaction ID is required' }, { status: 400 });
    }

    await sql`DELETE FROM store_transactions WHERE id = ${id}`;

    try {
      revalidatePath('/admin');
    } catch {}

    const metrics = await dbGetStoreMetrics();

    return NextResponse.json({ success: true, id, metrics });
  } catch (error: any) {
    console.error('[Admin DELETE Store Transaction Error]:', error);
    return NextResponse.json({ error: error.message || 'Failed to delete transaction' }, { status: 500 });
  }
}
