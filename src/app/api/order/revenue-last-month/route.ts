import { NextResponse } from 'next/server';
import { query } from '@/lib/database';

export async function GET() {
  try {
    const result = await query(`
      SELECT SUM(total_price) as total 
      FROM \`order\` 
      WHERE YEAR(createdAt) = YEAR(DATE_SUB(CURDATE(), INTERVAL 1 MONTH)) 
      AND MONTH(createdAt) = MONTH(DATE_SUB(CURDATE(), INTERVAL 1 MONTH))
    `);
    return NextResponse.json(result[0].total || 0);
  } catch (error) {
    console.error('Error getting last month revenue:', error);
    return NextResponse.json(0);
  }
}
