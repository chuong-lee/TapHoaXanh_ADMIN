import { NextResponse } from 'next/server';
import { query } from '@/lib/database';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const year = searchParams.get('year') || new Date().getFullYear();
    const startMonth = searchParams.get('startMonth') || 5;
    const endMonth = searchParams.get('endMonth') || new Date().getMonth() + 1;

    // Lấy doanh thu theo tháng trong khoảng thời gian
    const result = await query(`
      SELECT 
        MONTH(createdAt) as month,
        SUM(total_price) as revenue
      FROM \`order\` 
      WHERE YEAR(createdAt) = ? 
      AND MONTH(createdAt) >= ? 
      AND MONTH(createdAt) <= ?
      GROUP BY MONTH(createdAt)
      ORDER BY month
    `, [year, startMonth, endMonth]);

    // Tạo mảng doanh thu theo tháng
    const monthlyRevenue: number[] = [];
    const start = parseInt(startMonth);
    const end = parseInt(endMonth);
    
    for (let month = start; month <= end; month++) {
      const monthData = result.find((row: any) => row.month === month);
      monthlyRevenue.push(monthData ? monthData.revenue : 0);
    }

    return NextResponse.json(monthlyRevenue);
  } catch (error) {
    console.error('Error getting monthly revenue range:', error);
    return NextResponse.json([]);
  }
}
