import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database';

// GET - Lấy thống kê tin tức
export async function GET(request: NextRequest) {
  try {
    // Đếm tổng số tin tức
    const totalSql = `
      SELECT COUNT(*) as count
      FROM news 
      WHERE deletedAt IS NULL
    `;
    
    // Đếm tin tức đã xuất bản (có hình ảnh và nội dung đầy đủ)
    const publishedSql = `
      SELECT COUNT(*) as count
      FROM news 
      WHERE deletedAt IS NULL AND images IS NOT NULL AND images != '' AND summary IS NOT NULL
    `;
    
    // Đếm tin tức nháp (thiếu thông tin)
    const draftSql = `
      SELECT COUNT(*) as count
      FROM news 
      WHERE deletedAt IS NULL AND (images IS NULL OR images = '' OR summary IS NULL)
    `;
    
    // Tổng lượt xem
    const viewsSql = `
      SELECT SUM(views) as total
      FROM news 
      WHERE deletedAt IS NULL
    `;
    
    // Tổng lượt thích
    const likesSql = `
      SELECT SUM(likes) as total
      FROM news 
      WHERE deletedAt IS NULL
    `;
    
    // Tổng số bình luận
    const commentsSql = `
      SELECT SUM(comments_count) as total
      FROM news 
      WHERE deletedAt IS NULL
    `;
    
    // Thực hiện các truy vấn
    const [totalResult, publishedResult, draftResult, viewsResult, likesResult, commentsResult] = await Promise.all([
      query(totalSql),
      query(publishedSql),
      query(draftSql),
      query(viewsSql),
      query(likesSql),
      query(commentsSql)
    ]);
    
    const stats = {
      total: totalResult[0].count || 0,
      published: publishedResult[0].count || 0,
      draft: draftResult[0].count || 0,
      views: viewsResult[0].total || 0,
      likes: likesResult[0].total || 0,
      comments: commentsResult[0].total || 0
    };
    
    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching news stats:', error);
    return NextResponse.json(
      { error: 'Không thể lấy thống kê tin tức', details: error instanceof Error ? error.message : 'Unknown error' }, 
      { status: 500 }
    );
  }
}
