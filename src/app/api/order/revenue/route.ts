import { NextResponse } from 'next/server';
import { query } from '@/lib/database';

export async function GET() {
  try {
    // Tính tổng doanh thu từ tất cả orders, có thể thêm điều kiện status nếu cần
    const result = await query('SELECT SUM(total_price) as total FROM `order` WHERE deletedAt IS NULL AND total_price IS NOT NULL');
    return NextResponse.json(result[0].total || 0);
  } catch (error) {
    console.error('Error getting total revenue:', error);
    return NextResponse.json(0);
  }
}
