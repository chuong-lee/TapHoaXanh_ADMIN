import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database';

// GET - Lấy thống kê đánh giá
export async function GET(request: NextRequest) {
  try {
    // Kiểm tra cấu trúc bảng rating thực tế
    let hasStatusField = false;
    let hasApprovedFields = false;
    
    try {
      // Kiểm tra trường status
      const checkStatusSql = 'SHOW COLUMNS FROM rating LIKE "status"';
      const statusFieldCheck = await query(checkStatusSql);
      hasStatusField = statusFieldCheck.length > 0;
      
      // Kiểm tra trường isApproved
      const checkApprovedSql = 'SHOW COLUMNS FROM rating LIKE "isApproved"';
      const approvedFieldCheck = await query(checkApprovedSql);
      hasApprovedFields = approvedFieldCheck.length > 0;
      
      console.log('Bảng rating - hasStatusField:', hasStatusField, 'hasApprovedFields:', hasApprovedFields);
    } catch (error) {
      console.log('Không thể kiểm tra cấu trúc bảng rating:', error);
    }

    let statsSql: string;
    let statsResult: any;
    
    if (hasStatusField) {
      // Sử dụng trường status mới
      statsSql = `
        SELECT 
          COUNT(*) as total_reviews,
          SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) as approved_count,
          SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) as rejected_count,
          SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending_count,
          ROUND(SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 2) as approved_percentage,
          ROUND(SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 2) as rejected_percentage,
          ROUND(SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 2) as pending_percentage
        FROM rating 
        WHERE deletedAt IS NULL
      `;
    } else if (hasApprovedFields) {
      // Sử dụng trường isApproved và isRejected cũ
      statsSql = `
        SELECT 
          COUNT(*) as total_reviews,
          SUM(CASE WHEN isApproved = 1 THEN 1 ELSE 0 END) as approved_count,
          SUM(CASE WHEN isRejected = 1 THEN 1 ELSE 0 END) as rejected_count,
          SUM(CASE WHEN isApproved = 0 AND isRejected = 0 THEN 1 ELSE 0 END) as pending_count,
          ROUND(SUM(CASE WHEN isApproved = 1 THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 2) as approved_percentage,
          ROUND(SUM(CASE WHEN isRejected = 1 THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 2) as rejected_percentage,
          ROUND(SUM(CASE WHEN isApproved = 0 AND isRejected = 0 THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 2) as pending_percentage
        FROM rating 
        WHERE deletedAt IS NULL
      `;
    } else {
      // Bảng cơ bản - tất cả đánh giá đều là pending
      statsSql = `
        SELECT 
          COUNT(*) as total_reviews,
          0 as approved_count,
          0 as rejected_count,
          COUNT(*) as pending_count,
          0 as approved_percentage,
          0 as rejected_percentage,
          100 as pending_percentage
        FROM rating 
        WHERE deletedAt IS NULL
      `;
    }
    
    statsResult = await query(statsSql);
    const stats = statsResult[0];
    
    // Lấy thống kê theo rating
    const ratingStatsSql = `
      SELECT 
        rating,
        COUNT(*) as count,
        ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM rating WHERE deletedAt IS NULL), 2) as percentage
      FROM rating 
      WHERE deletedAt IS NULL
      GROUP BY rating
      ORDER BY rating DESC
    `;
    
    const ratingStats = await query(ratingStatsSql);
    
    // Lấy thống kê theo tháng
    let monthlyStatsSql: string;
    
    if (hasStatusField) {
      monthlyStatsSql = `
        SELECT 
          DATE_FORMAT(createdAt, '%Y-%m') as month,
          COUNT(*) as count,
          SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) as approved,
          SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) as rejected,
          SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending
        FROM rating 
        WHERE deletedAt IS NULL 
        AND createdAt >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
        GROUP BY DATE_FORMAT(createdAt, '%Y-%m')
        ORDER BY month DESC
      `;
    } else if (hasApprovedFields) {
      monthlyStatsSql = `
        SELECT 
          DATE_FORMAT(createdAt, '%Y-%m') as month,
          COUNT(*) as count,
          SUM(CASE WHEN isApproved = 1 THEN 1 ELSE 0 END) as approved,
          SUM(CASE WHEN isRejected = 1 THEN 1 ELSE 0 END) as rejected,
          SUM(CASE WHEN isApproved = 0 AND isRejected = 0 THEN 1 ELSE 0 END) as pending
        FROM rating 
        WHERE deletedAt IS NULL 
        AND createdAt >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
        GROUP BY DATE_FORMAT(createdAt, '%Y-%m')
        ORDER BY month DESC
      `;
    } else {
      monthlyStatsSql = `
        SELECT 
          DATE_FORMAT(createdAt, '%Y-%m') as month,
          COUNT(*) as count,
          0 as approved,
          0 as rejected,
          COUNT(*) as pending
        FROM rating 
        WHERE deletedAt IS NULL 
        AND createdAt >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
        GROUP BY DATE_FORMAT(createdAt, '%Y-%m')
        ORDER BY month DESC
      `;
    }
    
    const monthlyStats = await query(monthlyStatsSql);
    
    // Lấy top sản phẩm có nhiều đánh giá
    let topProductsSql: string;
    
    if (hasStatusField) {
      topProductsSql = `
        SELECT 
          p.id, p.name, p.images,
          COUNT(r.id) as review_count,
          AVG(r.rating) as avg_rating,
          SUM(CASE WHEN r.status = 'approved' THEN 1 ELSE 0 END) as approved_count,
          SUM(CASE WHEN r.status = 'rejected' THEN 1 ELSE 0 END) as rejected_count,
          SUM(CASE WHEN r.status = 'pending' THEN 1 ELSE 0 END) as pending_count
        FROM product p
        LEFT JOIN rating r ON p.id = r.product_id AND r.deletedAt IS NULL
        WHERE p.deletedAt IS NULL
        GROUP BY p.id
        HAVING review_count > 0
        ORDER BY review_count DESC, avg_rating DESC
        LIMIT 10
      `;
    } else if (hasApprovedFields) {
      topProductsSql = `
        SELECT 
          p.id, p.name, p.images,
          COUNT(r.id) as review_count,
          AVG(r.rating) as avg_rating,
          SUM(CASE WHEN r.isApproved = 1 THEN 1 ELSE 0 END) as approved_count,
          SUM(CASE WHEN r.isRejected = 1 THEN 1 ELSE 0 END) as rejected_count,
          SUM(CASE WHEN r.isApproved = 0 AND r.isRejected = 0 THEN 1 ELSE 0 END) as pending_count
        FROM product p
        LEFT JOIN rating r ON p.id = r.product_id AND r.deletedAt IS NULL
        WHERE p.deletedAt IS NULL
        GROUP BY p.id
        HAVING review_count > 0
        ORDER BY review_count DESC, avg_rating DESC
        LIMIT 10
      `;
    } else {
      topProductsSql = `
        SELECT 
          p.id, p.name, p.images,
          COUNT(r.id) as review_count,
          AVG(r.rating) as avg_rating,
          0 as approved_count,
          0 as rejected_count,
          COUNT(r.id) as pending_count
        FROM product p
        LEFT JOIN rating r ON p.id = r.product_id AND r.deletedAt IS NULL
        WHERE p.deletedAt IS NULL
        GROUP BY p.id
        HAVING review_count > 0
        ORDER BY review_count DESC, avg_rating DESC
        LIMIT 10
      `;
    }
    
    const topProducts = await query(topProductsSql);
    
    // Lấy top người dùng có nhiều đánh giá
    let topUsersSql: string;
    
    if (hasStatusField) {
      topUsersSql = `
        SELECT 
          u.id, u.name, u.image,
          COUNT(r.id) as review_count,
          AVG(r.rating) as avg_rating,
          SUM(CASE WHEN r.status = 'approved' THEN 1 ELSE 0 END) as approved_count,
          SUM(CASE WHEN r.status = 'rejected' THEN 1 ELSE 0 END) as rejected_count,
          SUM(CASE WHEN r.status = 'pending' THEN 1 ELSE 0 END) as pending_count
        FROM users u
        LEFT JOIN rating r ON u.id = r.user_id AND r.deletedAt IS NULL
        WHERE u.deletedAt IS NULL
        GROUP BY u.id
        HAVING review_count > 0
        ORDER BY review_count DESC, avg_rating DESC
        LIMIT 10
      `;
    } else if (hasApprovedFields) {
      topUsersSql = `
        SELECT 
          u.id, u.name, u.image,
          COUNT(r.id) as review_count,
          AVG(r.rating) as avg_rating,
          SUM(CASE WHEN r.isApproved = 1 THEN 1 ELSE 0 END) as approved_count,
          SUM(CASE WHEN r.isRejected = 1 THEN 1 ELSE 0 END) as rejected_count,
          SUM(CASE WHEN r.isApproved = 0 AND r.isRejected = 0 THEN 1 ELSE 0 END) as pending_count
        FROM users u
        LEFT JOIN rating r ON u.id = r.user_id AND r.deletedAt IS NULL
        WHERE u.deletedAt IS NULL
        GROUP BY u.id
        HAVING review_count > 0
        ORDER BY review_count DESC, avg_rating DESC
        LIMIT 10
      `;
    } else {
      topUsersSql = `
        SELECT 
          u.id, u.name, u.image,
          COUNT(r.id) as review_count,
          AVG(r.rating) as avg_rating,
          0 as approved_count,
          0 as rejected_count,
          COUNT(r.id) as pending_count
        FROM users u
        LEFT JOIN rating r ON u.id = r.user_id AND r.deletedAt IS NULL
        WHERE u.deletedAt IS NULL
        GROUP BY u.id
        HAVING review_count > 0
        ORDER BY review_count DESC, avg_rating DESC
        LIMIT 10
        `;
    }
    
    const topUsers = await query(topUsersSql);

    const formattedTopProducts = topProducts.map((item: any) => ({
      id: item.id.toString(),
      name: item.name,
      image: item.images ? item.images.split(',')[0] : '/images/product/default.jpg',
      reviewCount: item.review_count,
      avgRating: Math.round(item.avg_rating * 10) / 10,
      approvedCount: item.approved_count,
      rejectedCount: item.rejected_count,
      pendingCount: item.pending_count,
    }));
    
    const formattedTopUsers = topUsers.map((item: any) => ({
      id: item.id.toString(),
      name: item.name,
      image: item.image || '/images/user/default-avatar.jpg',
      reviewCount: item.review_count,
      avgRating: Math.round(item.avg_rating * 10) / 10,
      approvedCount: item.approved_count,
      rejectedCount: item.rejected_count,
      pendingCount: item.pending_count,
    }));
    
    const formattedMonthlyStats = monthlyStats.map((item: any) => ({
      month: item.month,
      count: item.count,
      approved: item.approved,
      rejected: item.rejected,
      pending: item.pending,
    }));

    const formattedRatingStats = ratingStats.map((item: any) => ({
      rating: item.rating,
      count: item.count,
      percentage: item.percentage,
    }));

    return NextResponse.json({
      overview: {
        total: stats.total_reviews || 0,
        approved: stats.approved_count || 0,
        rejected: stats.rejected_count || 0,
        pending: stats.pending_count || 0,
        approvedPercentage: stats.approved_percentage || 0,
        rejectedPercentage: stats.rejected_percentage || 0,
        pendingPercentage: stats.pending_percentage || 0,
      },
      ratingStats: formattedRatingStats,
      monthlyStats: formattedMonthlyStats,
      topProducts: formattedTopProducts,
      topUsers: formattedTopUsers
    });

  } catch (error) {
    console.error('Error fetching review stats:', error);
    return NextResponse.json(
      { error: 'Không thể lấy thống kê đánh giá', details: error instanceof Error ? error.message : 'Unknown error' }, 
      { status: 500 }
    );
  }
}
