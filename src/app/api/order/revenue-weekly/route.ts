import { NextResponse } from 'next/server';
import { query } from '@/lib/database';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const year = searchParams.get('year') || new Date().getFullYear();
    const month = searchParams.get('month') || new Date().getMonth() + 1;

    // Lấy doanh thu theo tuần trong tháng
    const result = await query(`
      SELECT 
        WEEK(createdAt, 1) - WEEK(DATE(CONCAT(?, '-', ?, '-01')), 1) + 1 as week_of_month,
        SUM(total_price) as revenue
      FROM \`order\` 
      WHERE YEAR(createdAt) = ? 
      AND MONTH(createdAt) = ?
      GROUP BY week_of_month
      ORDER BY week_of_month
    `, [year, month, year, month]);

    // Tạo mảng 5 tuần với doanh thu
    const weeklyRevenue = [0, 0, 0, 0, 0];
    
    result.forEach((row: any) => {
      const weekIndex = Math.min(row.week_of_month - 1, 4); // Đảm bảo không vượt quá index 4
      if (weekIndex >= 0 && weekIndex < 5) {
        weeklyRevenue[weekIndex] = row.revenue || 0;
      }
    });

    return NextResponse.json(weeklyRevenue);
  } catch (error) {
    console.error('Error getting weekly revenue:', error);
    return NextResponse.json([0, 0, 0, 0, 0]);
  }
}
