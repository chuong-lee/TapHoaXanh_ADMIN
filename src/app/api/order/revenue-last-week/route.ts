import { NextResponse } from 'next/server';
import { query } from '@/lib/database';

export async function GET() {
  try {
    const result = await query(`
      SELECT SUM(total_price) as total 
      FROM \`order\` 
      WHERE YEARWEEK(createdAt) = YEARWEEK(DATE_SUB(CURDATE(), INTERVAL 1 WEEK))
    `);
    return NextResponse.json(result[0].total || 0);
  } catch (error) {
    console.error('Error getting last week revenue:', error);
    return NextResponse.json(0);
  }
}
