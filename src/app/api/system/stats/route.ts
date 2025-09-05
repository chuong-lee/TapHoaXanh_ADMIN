import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database';

// GET - Lấy thống kê tổng thể của hệ thống
export async function GET(request: NextRequest) {
  try {
    // Lấy thống kê tổng quan từ bảng system_stats
    let systemStats: any = {
      totalProducts: 0,
      totalArticles: 0,
      totalReviews: 0,
      totalOrders: 0,
      totalUsers: 0,
      totalRevenue: 0,
    };

    try {
      const systemStatsSql = 'SELECT * FROM system_stats WHERE id = 1';
      const statsResult = await query(systemStatsSql);
      
      if (statsResult.length > 0) {
        const stats = statsResult[0];
        systemStats = {
          totalProducts: stats.total_products || 0,
          totalArticles: stats.total_articles || 0,
          totalReviews: stats.total_reviews || 0,
          totalOrders: stats.total_orders || 0,
          totalUsers: stats.total_users || 0,
          totalRevenue: parseFloat(stats.total_revenue) || 0,
          updatedAt: stats.updated_at,
        };
      }
    } catch (error) {
      console.log('Bảng system_stats chưa tồn tại, sử dụng thống kê thủ công');
    }

    // Nếu không có bảng system_stats, tính toán thủ công
    if (systemStats.totalProducts === 0) {
      try {
        // Đếm sản phẩm
        const productsCountSql = 'SELECT COUNT(*) as count FROM product WHERE deletedAt IS NULL';
        const productsCount = await query(productsCountSql);
        systemStats.totalProducts = productsCount[0].count || 0;
      } catch (error) {
        console.log('Không thể đếm sản phẩm');
      }
    }

    if (systemStats.totalArticles === 0) {
      try {
        // Đếm bài viết
        const articlesCountSql = 'SELECT COUNT(*) as count FROM articles WHERE deletedAt IS NULL';
        const articlesCount = await query(articlesCountSql);
        systemStats.totalArticles = articlesCount[0].count || 0;
      } catch (error) {
        console.log('Không thể đếm bài viết');
      }
    }

    if (systemStats.totalReviews === 0) {
      try {
        // Đếm đánh giá
        const reviewsCountSql = 'SELECT COUNT(*) as count FROM rating WHERE deletedAt IS NULL';
        const reviewsCount = await query(reviewsCountSql);
        systemStats.totalReviews = reviewsCount[0].count || 0;
      } catch (error) {
        console.log('Không thể đếm đánh giá');
      }
    }

    if (systemStats.totalUsers === 0) {
      try {
        // Đếm người dùng
        const usersCountSql = 'SELECT COUNT(*) as count FROM users WHERE deletedAt IS NULL';
        const usersCount = await query(usersCountSql);
        systemStats.totalUsers = usersCount[0].count || 0;
      } catch (error) {
        console.log('Không thể đếm người dùng');
      }
    }

    // Lấy thống kê theo ngày (7 ngày gần nhất)
    const dailyStatsSql = `
      SELECT 
        DATE(createdAt) as date,
        COUNT(*) as count,
        'products' as type
      FROM product 
      WHERE deletedAt IS NULL 
      AND createdAt >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
      GROUP BY DATE(createdAt)
      
      UNION ALL
      
      SELECT 
        DATE(createdAt) as date,
        COUNT(*) as count,
        'articles' as type
      FROM articles 
      WHERE deletedAt IS NULL 
      AND createdAt >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
      GROUP BY DATE(createdAt)
      
      UNION ALL
      
      SELECT 
        DATE(createdAt) as date,
        COUNT(*) as count,
        'reviews' as type
      FROM rating 
      WHERE deletedAt IS NULL 
      AND createdAt >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
      GROUP BY DATE(createdAt)
      
      ORDER BY date DESC, type
    `;
    
    const dailyStats = await query(dailyStatsSql);
    
    // Lấy thống kê theo tháng (12 tháng gần nhất)
    const monthlyStatsSql = `
      SELECT 
        DATE_FORMAT(createdAt, '%Y-%m') as month,
        COUNT(*) as products_created,
        'products' as type
      FROM product 
      WHERE deletedAt IS NULL 
      AND createdAt >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
      GROUP BY DATE_FORMAT(createdAt, '%Y-%m')
      
      UNION ALL
      
      SELECT 
        DATE_FORMAT(createdAt, '%Y-%m') as month,
        COUNT(*) as articles_created,
        'articles' as type
      FROM articles 
      WHERE deletedAt IS NULL 
      AND createdAt >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
      GROUP BY DATE_FORMAT(createdAt, '%Y-%m')
      
      UNION ALL
      
      SELECT 
        DATE_FORMAT(createdAt, '%Y-%m') as month,
        COUNT(*) as reviews_created,
        'reviews' as type
      FROM rating 
      WHERE deletedAt IS NULL 
      AND createdAt >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
      GROUP BY DATE_FORMAT(createdAt, '%Y-%m')
      
      ORDER BY month DESC, type
    `;
    
    const monthlyStats = await query(monthlyStatsSql);
    
    // Lấy top admin hoạt động nhiều nhất
    let topAdmins: any[] = [];
    try {
      const topAdminsSql = `
        SELECT 
          u.id, u.name, u.image,
          COUNT(*) as activity_count,
          MAX(a.created_at) as last_activity
        FROM users u
        LEFT JOIN admin_activity_log a ON u.id = a.admin_id
        WHERE u.deletedAt IS NULL
        GROUP BY u.id
        HAVING activity_count > 0
        ORDER BY activity_count DESC
        LIMIT 10
      `;
      
      topAdmins = await query(topAdminsSql);
    } catch (error) {
      console.log('Bảng admin_activity_log chưa tồn tại');
    }

    // Lấy hoạt động gần đây
    let recentActivities: any[] = [];
    try {
      const recentActivitiesSql = `
        SELECT 
          a.action, a.table_name, a.record_id, a.details, a.created_at,
          u.name as admin_name, u.image as admin_image
        FROM admin_activity_log a
        LEFT JOIN users u ON a.admin_id = u.id
        ORDER BY a.created_at DESC
        LIMIT 20
      `;
      
      recentActivities = await query(recentActivitiesSql);
    } catch (error) {
      console.log('Bảng admin_activity_log chưa tồn tại');
    }

    // Format dữ liệu
    const formattedTopAdmins = topAdmins.map((item: any) => ({
      id: item.id.toString(),
      name: item.name,
      image: item.image || '/images/user/default-avatar.jpg',
      activityCount: item.activity_count,
      lastActivity: item.last_activity,
    }));
    
    const formattedRecentActivities = recentActivities.map((item: any) => ({
      action: item.action,
      tableName: item.table_name,
      recordId: item.record_id,
      details: item.details,
      adminName: item.admin_name || 'Admin không xác định',
      adminImage: item.admin_image || '/images/user/default-avatar.jpg',
      createdAt: item.created_at,
    }));

    // Tổ chức dữ liệu thống kê theo ngày
    const dailyStatsMap = new Map();
    dailyStats.forEach((item: any) => {
      const date = item.date;
      if (!dailyStatsMap.has(date)) {
        dailyStatsMap.set(date, {
          date,
          products: 0,
          articles: 0,
          reviews: 0,
        });
      }
      
      const stats = dailyStatsMap.get(date);
      if (item.type === 'products') stats.products = item.count;
      else if (item.type === 'articles') stats.articles = item.count;
      else if (item.type === 'reviews') stats.reviews = item.count;
    });

    const formattedDailyStats = Array.from(dailyStatsMap.values())
      .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());

    // Tổ chức dữ liệu thống kê theo tháng
    const monthlyStatsMap = new Map();
    monthlyStats.forEach((item: any) => {
      const month = item.month;
      if (!monthlyStatsMap.has(month)) {
        monthlyStatsMap.set(month, {
          month,
          products: 0,
          articles: 0,
          reviews: 0,
        });
      }
      
      const stats = monthlyStatsMap.get(month);
      if (item.type === 'products') stats.products = item.count;
      else if (item.type === 'articles') stats.articles = item.count;
      else if (item.type === 'reviews') stats.reviews = item.count;
    });

    const formattedMonthlyStats = Array.from(monthlyStatsMap.values())
      .sort((a: any, b: any) => new Date(b.month).getTime() - new Date(a.month).getTime());

    return NextResponse.json({
      overview: systemStats,
      dailyStats: formattedDailyStats,
      monthlyStats: formattedMonthlyStats,
      topAdmins: formattedTopAdmins,
      recentActivities: formattedRecentActivities
    });

  } catch (error) {
    console.error('Error fetching system stats:', error);
    return NextResponse.json(
      { error: 'Không thể lấy thống kê hệ thống', details: error instanceof Error ? error.message : 'Unknown error' }, 
      { status: 500 }
    );
  }
}
