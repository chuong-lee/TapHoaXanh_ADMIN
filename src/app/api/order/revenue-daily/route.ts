import { NextResponse } from 'next/server';
import { query } from '@/lib/database';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const year = searchParams.get('year') || new Date().getFullYear();
    const week = searchParams.get('week') || 1;

    // Lấy doanh thu theo ngày trong tuần hiện tại
    const result = await query(`
      SELECT 
        DAYOFWEEK(createdAt) as day_of_week,
        SUM(total_price) as revenue
      FROM \`order\` 
      WHERE YEAR(createdAt) = ? 
      AND WEEK(createdAt) = ?
      GROUP BY DAYOFWEEK(createdAt)
      ORDER BY day_of_week
    `, [year, week]);

    // Tạo mảng 7 ngày với doanh thu (bắt đầu từ thứ 2)
    const dailyRevenue = [0, 0, 0, 0, 0, 0, 0]; // Thứ 2 đến Chủ nhật
    
    result.forEach((row: any) => {
      // MySQL DAYOFWEEK: 1=Chủ nhật, 2=Thứ 2, ..., 7=Thứ 7
      // Chuyển đổi để bắt đầu từ thứ 2 (index 0)
      const dayIndex = row.day_of_week === 1 ? 6 : row.day_of_week - 2;
      dailyRevenue[dayIndex] = row.revenue || 0;
    });

    return NextResponse.json(dailyRevenue);
  } catch (error) {
    console.error('Error getting daily revenue:', error);
    return NextResponse.json([0, 0, 0, 0, 0, 0, 0]);
  }
}
