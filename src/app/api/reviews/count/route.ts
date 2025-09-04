import { NextResponse } from 'next/server';
import { query } from '@/lib/database';

export async function GET() {
  try {
    // Đếm tổng số đánh giá
    const totalResult = await query('SELECT COUNT(*) as count FROM rating WHERE deletedAt IS NULL');
    const total = totalResult[0].count;

    // Vì chưa có trường status, tất cả đánh giá đều được coi là "đã duyệt"
    const approved = total;
    const pending = 0;
    const rejected = 0;

    // Đếm theo số sao
    const ratingStats = await query(`
      SELECT rating, COUNT(*) as count 
      FROM rating 
      WHERE deletedAt IS NULL 
      GROUP BY rating 
      ORDER BY rating DESC
    `);

    const ratingCounts = ratingStats.reduce((acc: any, item: any) => {
      acc[item.rating] = item.count;
      return acc;
    }, {});

    return NextResponse.json({
      total,
      approved,
      pending,
      rejected,
      ratingCounts,
      summary: {
        approvalRate: total > 0 ? 100 : 0, // 100% vì tất cả đều "đã duyệt"
        averageRating: total > 0 ? 
          ratingStats.reduce((sum: number, item: any) => sum + (item.rating * item.count), 0) / total : 0
      }
    });

  } catch (error) {
    console.error('Error getting review counts:', error);
    return NextResponse.json(
      { error: 'Không thể lấy thống kê đánh giá' }, 
      { status: 500 }
    );
  }
}
