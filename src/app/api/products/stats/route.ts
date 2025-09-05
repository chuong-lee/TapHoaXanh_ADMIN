import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database';

// GET - Lấy thống kê sản phẩm
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;

    if (productId) {
      // Lấy thống kê cho một sản phẩm cụ thể
      const productStatsSql = `
        SELECT 
          p.id, p.name, p.images, p.price, p.avg_rating, p.total_reviews,
          ps.total_articles, ps.total_reviews as stats_reviews, ps.total_orders,
          ps.total_views, ps.total_likes, ps.created_at, ps.updated_at
        FROM product p
        LEFT JOIN product_stats ps ON p.id = ps.product_id
        WHERE p.id = ? AND p.deletedAt IS NULL
      `;
      
      const productStats = await query(productStatsSql, [productId]);
      
      if (productStats.length === 0) {
        return NextResponse.json(
          { error: 'Không tìm thấy sản phẩm' }, 
          { status: 404 }
        );
      }

      const stats = productStats[0];
      
      // Lấy danh sách bài viết của sản phẩm
      const articlesSql = `
        SELECT 
          a.id, a.title, a.summary, a.isPublished, a.createdAt,
          u.name as authorName
        FROM articles a
        LEFT JOIN users u ON a.authorId = u.id
        WHERE a.category = ? AND a.deletedAt IS NULL
        ORDER BY a.createdAt DESC
        LIMIT 10
      `;
      
      const articles = await query(articlesSql, [stats.name]);
      
      // Lấy danh sách đánh giá gần đây
      const reviewsSql = `
        SELECT 
          r.id, r.rating, r.comment, r.createdAt,
          u.name as userName, u.image as userImage
        FROM rating r
        LEFT JOIN users u ON r.user_id = u.id
        WHERE r.product_id = ? AND r.deletedAt IS NULL
        ORDER BY r.createdAt DESC
        LIMIT 10
      `;
      
      const reviews = await query(reviewsSql, [productId]);

      const formattedStats = {
        product: {
          id: stats.id.toString(),
          name: stats.name,
          image: stats.images ? stats.images.split(',')[0] : '/images/product/default.jpg',
          price: stats.price,
          avgRating: stats.avg_rating || 0,
          totalReviews: stats.total_reviews || 0,
        },
        stats: {
          totalArticles: stats.total_articles || 0,
          totalReviews: stats.stats_reviews || 0,
          totalOrders: stats.total_orders || 0,
          totalViews: stats.total_views || 0,
          totalLikes: stats.total_likes || 0,
          createdAt: stats.created_at,
          updatedAt: stats.updated_at,
        },
        recentArticles: articles.map((article: any) => ({
          id: article.id.toString(),
          title: article.title,
          summary: article.summary,
          isPublished: article.isPublished,
          authorName: article.authorName,
          createdAt: article.createdAt,
        })),
        recentReviews: reviews.map((review: any) => ({
          id: review.id.toString(),
          rating: review.rating,
          comment: review.comment,
          userName: review.userName || 'Người dùng không xác định',
          userImage: review.userImage || '/images/user/default-avatar.jpg',
          createdAt: review.createdAt,
        })),
      };

      return NextResponse.json(formattedStats);
    } else {
      // Lấy thống kê tổng quan cho tất cả sản phẩm
      const overviewSql = `
        SELECT 
          COUNT(*) as total_products,
          SUM(CASE WHEN avg_rating >= 4 THEN 1 ELSE 0 END) as high_rated_products,
          SUM(CASE WHEN avg_rating >= 3 AND avg_rating < 4 THEN 1 ELSE 0 END) as medium_rated_products,
          SUM(CASE WHEN avg_rating < 3 THEN 1 ELSE 0 END) as low_rated_products,
          AVG(avg_rating) as overall_avg_rating,
          SUM(total_reviews) as total_reviews
        FROM product 
        WHERE deletedAt IS NULL
      `;
      
      const overview = await query(overviewSql);
      
      // Lấy top sản phẩm có nhiều bài viết
      const topArticlesSql = `
        SELECT 
          p.id, p.name, p.images, p.avg_rating,
          ps.total_articles, ps.total_reviews
        FROM product p
        LEFT JOIN product_stats ps ON p.id = ps.product_id
        WHERE p.deletedAt IS NULL
        HAVING ps.total_articles > 0
        ORDER BY ps.total_articles DESC, ps.total_reviews DESC
        LIMIT 10
      `;
      
      const topArticles = await query(topArticlesSql);
      
      // Lấy top sản phẩm có nhiều đánh giá
      const topReviewsSql = `
        SELECT 
          p.id, p.name, p.images, p.avg_rating,
          ps.total_reviews, ps.total_articles
        FROM product p
        LEFT JOIN product_stats ps ON p.id = ps.product_id
        WHERE p.deletedAt IS NULL
        HAVING ps.total_reviews > 0
        ORDER BY ps.total_reviews DESC, p.avg_rating DESC
        LIMIT 10
      `;
      
      const topReviews = await query(topReviewsSql);
      
      // Lấy thống kê theo tháng
      const monthlyStatsSql = `
        SELECT 
          DATE_FORMAT(p.createdAt, '%Y-%m') as month,
          COUNT(*) as products_created,
          AVG(p.avg_rating) as avg_rating,
          SUM(p.total_reviews) as total_reviews
        FROM product p
        WHERE p.deletedAt IS NULL 
        AND p.createdAt >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
        GROUP BY DATE_FORMAT(p.createdAt, '%Y-%m')
        ORDER BY month DESC
      `;
      
      const monthlyStats = await query(monthlyStatsSql);

      const formattedTopArticles = topArticles.map((item: any) => ({
        id: item.id.toString(),
        name: item.name,
        image: item.images ? item.images.split(',')[0] : '/images/product/default.jpg',
        avgRating: item.avg_rating || 0,
        totalArticles: item.total_articles || 0,
        totalReviews: item.total_reviews || 0,
      }));
      
      const formattedTopReviews = topReviews.map((item: any) => ({
        id: item.id.toString(),
        name: item.name,
        image: item.images ? item.images.split(',')[0] : '/images/product/default.jpg',
        avgRating: item.avg_rating || 0,
        totalReviews: item.total_reviews || 0,
        totalArticles: item.total_articles || 0,
      }));
      
      const formattedMonthlyStats = monthlyStats.map((item: any) => ({
        month: item.month,
        productsCreated: item.products_created,
        avgRating: Math.round(item.avg_rating * 10) / 10,
        totalReviews: item.total_reviews || 0,
      }));

      return NextResponse.json({
        overview: {
          totalProducts: overview[0].total_products || 0,
          highRatedProducts: overview[0].high_rated_products || 0,
          mediumRatedProducts: overview[0].medium_rated_products || 0,
          lowRatedProducts: overview[0].low_rated_products || 0,
          overallAvgRating: Math.round((overview[0].overall_avg_rating || 0) * 10) / 10,
          totalReviews: overview[0].total_reviews || 0,
        },
        topArticles: formattedTopArticles,
        topReviews: formattedTopReviews,
        monthlyStats: formattedMonthlyStats
      });
    }

  } catch (error) {
    console.error('Error fetching product stats:', error);
    return NextResponse.json(
      { error: 'Không thể lấy thống kê sản phẩm', details: error instanceof Error ? error.message : 'Unknown error' }, 
      { status: 500 }
    );
  }
}
