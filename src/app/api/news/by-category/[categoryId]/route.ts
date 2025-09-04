import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database';

// GET - Lấy bài viết theo phân loại
export async function GET(
  request: NextRequest,
  { params }: { params: { categoryId: string } }
) {
  try {
    const { categoryId } = params;
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;

    // Lấy thông tin phân loại
    const categorySql = `
      SELECT 
        c.id, c.name, c.description, c.slug, c.color, c.icon,
        c.createdAt, c.updatedAt
      FROM categories c
      WHERE c.id = ? AND c.deletedAt IS NULL
    `;
    
    const categories = await query(categorySql, [categoryId]);
    
    if (categories.length === 0) {
      return NextResponse.json(
        { error: 'Không tìm thấy phân loại' }, 
        { status: 404 }
      );
    }

    const category = categories[0];

    // Đếm tổng số bài viết theo phân loại
    const countSql = `
      SELECT COUNT(*) as count
      FROM news n
      WHERE n.category_id = ? AND n.deletedAt IS NULL
    `;
    
    const countResult = await query(countSql, [categoryId]);
    const total = countResult[0].count;

    // Lấy danh sách bài viết theo phân loại với phân trang
    const sql = `
      SELECT 
        n.id, n.name, n.summary, n.description, n.images, n.views, 
        n.likes, n.comments_count, n.author_id, n.category_id, n.type,
        n.createdAt, n.updatedAt,
        u.name as authorName, u.image as authorAvatar
      FROM news n
      LEFT JOIN users u ON n.author_id = u.id
      WHERE n.category_id = ? AND n.deletedAt IS NULL
      ORDER BY n.createdAt DESC
      LIMIT ${limit} OFFSET ${offset}
    `;
    
    const news = await query(sql, [categoryId]);
    
    const formattedNews = news.map((item: any) => ({
      id: item.id.toString(),
      name: item.name,
      summary: item.summary,
      description: item.description,
      images: item.images,
      views: item.views || 0,
      likes: item.likes || 0,
      comments_count: item.comments_count || 0,
      author_id: item.author_id ? item.author_id.toString() : '',
      authorName: item.authorName || 'Tác giả không xác định',
      authorAvatar: item.authorAvatar || "/images/user/default-avatar.jpg",
      category_id: item.category_id ? item.category_id.toString() : '',
      categoryName: category.name,
      categoryDescription: category.description || '',
      categoryColor: category.color || '#3B82F6',
      categoryIcon: category.icon || '📰',
      type: item.type || 'Tin tức',
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    }));

    const formattedCategory = {
      id: category.id.toString(),
      name: category.name,
      description: category.description || '',
      slug: category.slug || '',
      color: category.color || '#3B82F6',
      icon: category.icon || '📰',
      createdAt: category.createdAt,
      updatedAt: category.updatedAt,
    };

    return NextResponse.json({
      category: formattedCategory,
      news: formattedNews,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Error fetching news by category:', error);
    return NextResponse.json(
      { error: 'Không thể lấy bài viết theo phân loại', details: error instanceof Error ? error.message : 'Unknown error' }, 
      { status: 500 }
    );
  }
}
