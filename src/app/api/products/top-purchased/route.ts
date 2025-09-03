import { NextResponse } from 'next/server';
import { query } from '@/lib/database';

export async function GET() {
  try {
    const result = await query(`
      SELECT 
        p.id,
        p.name,
        p.barcode,
        p.images,
        COALESCE(SUM(oi.quantity), 0) as purchase
      FROM product p
      LEFT JOIN order_item oi ON p.id = oi.productVariant_id
      LEFT JOIN \`order\` o ON oi.order_id = o.id
      GROUP BY p.id, p.name, p.barcode, p.images
      ORDER BY purchase DESC
      LIMIT 10
    `);
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error getting top purchased products:', error);
    return NextResponse.json([]);
  }
}
