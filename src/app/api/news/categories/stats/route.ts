import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database';

// GET - Lấy thống kê về phân loại bài viết
export async function GET(request: NextRequest) {
  try {
    // Lấy tổng số phân loại
    const totalCategoriesSql = 'SELECT COUNT(*) as count FROM categories WHERE deletedAt IS NULL';
    const totalCategories = await query(totalCategoriesSql);
    
    // Lấy số phân loại có bài viết
    const activeCategoriesSql = `
      SELECT COUNT(DISTINCT c.id) as count 
      FROM categories c 
      INNER JOIN news n ON c.id = n.category_id 
      WHERE c.deletedAt IS NULL AND n.deletedAt IS NULL
    `;
    const activeCategories = await query(activeCategoriesSql);
    
    // Lấy số phân loại không có bài viết
    const emptyCategoriesSql = `
      SELECT COUNT(*) as count 
      FROM categories c 
      WHERE c.deletedAt IS NULL 
      AND NOT EXISTS (
        SELECT 1 FROM news n 
        WHERE n.category_id = c.id AND n.deletedAt IS NULL
      )
    `;
    const emptyCategories = await query(emptyCategoriesSql);
    
    // Lấy top 5 phân loại có nhiều bài viết nhất
    const topCategoriesSql = `
      SELECT 
        c.id, c.name, c.color, c.icon,
        COUNT(n.id) as newsCount,
        SUM(n.views) as totalViews,
        SUM(n.likes) as totalLikes,
        SUM(n.comments_count) as totalComments
      FROM categories c
      LEFT JOIN news n ON c.id = n.category_id AND n.deletedAt IS NULL
      WHERE c.deletedAt IS NULL
      GROUP BY c.id
      ORDER BY newsCount DESC, totalViews DESC
      LIMIT 5
    `;
    const topCategories = await query(topCategoriesSql);
    
    // Lấy phân loại mới nhất
    const recentCategoriesSql = `
      SELECT 
        c.id, c.name, c.color, c.icon, c.createdAt,
        COUNT(n.id) as newsCount
      FROM categories c
      LEFT JOIN news n ON c.id = n.category_id AND n.deletedAt IS NULL
      WHERE c.deletedAt IS NULL
      GROUP BY c.id
      ORDER BY c.createdAt DESC
      LIMIT 5
    `;
    const recentCategories = await query(recentCategoriesSql);
    
    // Lấy thống kê theo tháng (phân loại được tạo)
    const monthlyStatsSql = `
      SELECT 
        DATE_FORMAT(createdAt, '%Y-%m') as month,
        COUNT(*) as count
      FROM categories 
      WHERE deletedAt IS NULL 
      AND createdAt >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
      GROUP BY DATE_FORMAT(createdAt, '%Y-%m')
      ORDER BY month DESC
    `;
    const monthlyStats = await query(monthlyStatsSql);
    
    const formattedTopCategories = topCategories.map((item: any) => ({
      id: item.id.toString(),
      name: item.name,
      color: item.color || '#3B82F6',
      icon: item.icon || '📰',
      newsCount: item.newsCount || 0,
      totalViews: item.totalViews || 0,
      totalLikes: item.totalLikes || 0,
      totalComments: item.totalComments || 0,
    }));
    
    const formattedRecentCategories = recentCategories.map((item: any) => ({
      id: item.id.toString(),
      name: item.name,
      color: item.color || '#3B82F6',
      icon: item.icon || '📰',
      newsCount: item.newsCount || 0,
      createdAt: item.createdAt,
    }));
    
    const formattedMonthlyStats = monthlyStats.map((item: any) => ({
      month: item.month,
      count: item.count,
    }));

    return NextResponse.json({
      overview: {
        totalCategories: totalCategories[0].count,
        activeCategories: activeCategories[0].count,
        emptyCategories: emptyCategories[0].count,
        utilizationRate: totalCategories[0].count > 0 
          ? Math.round((activeCategories[0].count / totalCategories[0].count) * 100) 
          : 0
      },
      topCategories: formattedTopCategories,
      recentCategories: formattedRecentCategories,
      monthlyStats: formattedMonthlyStats
    });

  } catch (error) {
    console.error('Error fetching category stats:', error);
    return NextResponse.json(
      { error: 'Không thể lấy thống kê phân loại', details: error instanceof Error ? error.message : 'Unknown error' }, 
      { status: 500 }
    );
  }
}
