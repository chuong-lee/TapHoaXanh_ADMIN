import { NextResponse } from 'next/server';
import { query } from '@/lib/database';

export async function GET() {
  try {
    // Đếm tất cả orders, có thể thêm điều kiện status nếu cần
    const result = await query('SELECT COUNT(*) as count FROM `order` WHERE deletedAt IS NULL');
    return NextResponse.json(result[0].count);
  } catch (error) {
    console.error('Error getting order count:', error);
    return NextResponse.json(0);
  }
}
