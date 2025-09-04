import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database';

// GET - Lấy bài viết theo loại
export async function GET(
  request: NextRequest,
  { params }: { params: { type: string } }
) {
  try {
    const { type } = params;
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;

    // Đếm tổng số bài viết theo loại
    const countSql = `
      SELECT COUNT(*) as count
      FROM news n
      WHERE n.type = ? AND n.deletedAt IS NULL
    `;
    
    const countResult = await query(countSql, [type]);
    const total = countResult[0].count;

    // Lấy danh sách bài viết theo loại với phân trang
    const sql = `
      SELECT 
        n.id, n.name, n.summary, n.description, n.images, n.views, 
        n.likes, n.comments_count, n.author_id, n.category_id, n.type,
        n.createdAt, n.updatedAt,
        u.name as authorName, u.image as authorAvatar,
        c.name as categoryName, c.description as categoryDescription,
        c.color as categoryColor, c.icon as categoryIcon
      FROM news n
      LEFT JOIN users u ON n.author_id = u.id
      LEFT JOIN categories c ON n.category_id = c.id
      WHERE n.type = ? AND n.deletedAt IS NULL
      ORDER BY n.createdAt DESC
      LIMIT ${limit} OFFSET ${offset}
    `;
    
    const news = await query(sql, [type]);
    
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
      categoryName: item.categoryName || 'Không phân loại',
      categoryDescription: item.categoryDescription || '',
      categoryColor: item.categoryColor || '#6B7280',
      categoryIcon: item.categoryIcon || '📰',
      type: item.type,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    }));

    // Lấy thông tin về loại tin tức
    const typeInfo = getTypeInfo(type);

    return NextResponse.json({
      type: type,
      typeInfo: typeInfo,
      news: formattedNews,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Error fetching news by type:', error);
    return NextResponse.json(
      { error: 'Không thể lấy bài viết theo loại', details: error instanceof Error ? error.message : 'Unknown error' }, 
      { status: 500 }
    );
  }
}

// Hàm helper để lấy thông tin về loại tin tức
function getTypeInfo(type: string) {
  const typeInfo: { [key: string]: any } = {
    'news': {
      label: 'Tin tức',
      description: 'Các tin tức mới nhất và cập nhật',
      icon: '📰',
      color: '#3B82F6'
    },
    'promotion': {
      label: 'Khuyến mãi',
      description: 'Các chương trình khuyến mãi và ưu đãi',
      icon: '🎉',
      color: '#EF4444'
    },
    'guide': {
      label: 'Hướng dẫn',
      description: 'Hướng dẫn và tips hữu ích',
      icon: '📚',
      color: '#10B981'
    },
    'recipe': {
      label: 'Công thức',
      description: 'Các công thức nấu ăn ngon',
      icon: '👨‍🍳',
      color: '#F59E0B'
    },
    'health': {
      label: 'Sức khỏe',
      description: 'Thông tin về sức khỏe và dinh dưỡng',
      icon: '💚',
      color: '#8B5CF6'
    },
    'lifestyle': {
      label: 'Lối sống',
      description: 'Phong cách sống và xu hướng',
      icon: '🌟',
      color: '#EC4899'
    }
  };
  
  return typeInfo[type.toLowerCase()] || {
    label: type,
    description: 'Loại tin tức',
    icon: '📰',
    color: '#6B7280'
  };
}
