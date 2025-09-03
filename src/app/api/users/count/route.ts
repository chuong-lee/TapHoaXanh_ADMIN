import { NextResponse } from 'next/server';
import { query } from '@/lib/database';

export async function GET() {
  try {
    // Sửa lại để đếm từ bảng users thay vì order
    const result = await query('SELECT COUNT(*) as count FROM `users` WHERE deletedAt IS NULL');
    return NextResponse.json(result[0].count);
  } catch (error) {
    console.error('Error getting user count:', error);
    return NextResponse.json(0);
  }
}
