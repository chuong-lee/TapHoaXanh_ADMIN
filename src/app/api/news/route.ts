import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database';

// GET - Lấy danh sách tin tức
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category_id = searchParams.get('category_id');
    const type = searchParams.get('type');
    const author_id = searchParams.get('author_id');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;

    // Xây dựng câu SQL với điều kiện lọc
    let whereConditions = ['n.deletedAt IS NULL'];
    let queryParams: any[] = [];

    if (category_id && category_id.trim() !== '') {
      whereConditions.push('n.category_id = ?');
      queryParams.push(category_id);
    }

    if (type && type.trim() !== '') {
      whereConditions.push('n.type = ?');
      queryParams.push(type);
    }

    if (author_id && author_id.trim() !== '') {
      whereConditions.push('n.author_id = ?');
      queryParams.push(author_id);
    }

    if (search && search.trim() !== '') {
      whereConditions.push('(n.name LIKE ? OR n.description LIKE ?)');
      queryParams.push(`%${search}%`, `%${search}%`);
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    // Đếm tổng số tin tức
    const countSql = `
      SELECT COUNT(*) as count
      FROM news n
      ${whereClause}
    `;
    
    let countResult;
    if (queryParams.length > 0) {
      countResult = await query(countSql, queryParams);
    } else {
      countResult = await query(countSql);
    }
    const total = countResult[0].count;

    // Lấy danh sách tin tức với phân trang và thông tin phân loại
    let sql = `
      SELECT 
        n.id, n.name, n.summary, n.description, n.images, n.views, 
        n.likes, n.comments_count, n.author_id, n.category_id, n.type,
        n.createdAt, n.updatedAt, n.deletedAt,
        u.name as authorName, u.image as authorAvatar
      FROM news n
      LEFT JOIN users u ON n.author_id = u.id
      ${whereClause}
      ORDER BY n.createdAt DESC
    `;

    // Thêm LIMIT và OFFSET vào câu SQL
    sql += ` LIMIT ${limit} OFFSET ${offset}`;

    let news;
    if (queryParams.length > 0) {
      news = await query(sql, queryParams);
    } else {
      news = await query(sql);
    }
    
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
      categoryName: getCategoryName(item.category_id, item.type),
      categoryDescription: getCategoryDescription(item.type),
      categoryColor: getCategoryColor(item.type),
      categoryIcon: getCategoryIcon(item.type),
      type: item.type || 'Tin tức',
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
      deletedAt: item.deletedAt,
    }));

    return NextResponse.json({
      news: formattedNews,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Error fetching news:', error);
    return NextResponse.json(
      { error: 'Không thể lấy danh sách tin tức', details: error instanceof Error ? error.message : 'Unknown error' }, 
      { status: 500 }
    );
  }
}

// POST - Tạo tin tức mới
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, summary, description, images, author_id, category_id, type } = body;

    // Validation
    if (!name || !description) {
      return NextResponse.json(
        { error: 'Thiếu thông tin bắt buộc' }, 
        { status: 400 }
      );
    }

    const sql = `
      INSERT INTO news (name, summary, description, images, author_id, category_id, type, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
    `;
    
    const result = await query(sql, [
      name, 
      summary || '', 
      description, 
      images || '', 
      author_id ? parseInt(author_id) : null, 
      category_id ? parseInt(category_id) : null, 
      type || ''
    ]);
    
    return NextResponse.json({ 
      id: result.insertId, 
      message: 'Tin tức đã được tạo thành công' 
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating news:', error);
    return NextResponse.json(
      { error: 'Không thể tạo tin tức', details: error instanceof Error ? error.message : 'Unknown error' }, 
      { status: 500 }
    );
  }
}

// Hàm helper để lấy tên phân loại dựa trên type
function getCategoryName(categoryId: any, type: string): string {
  if (categoryId) {
    // Nếu có category_id, có thể là tên phân loại cụ thể
    return 'Phân loại ' + categoryId;
  }
  
  const typeLabels: { [key: string]: string } = {
    'news': 'Tin tức',
    'promotion': 'Khuyến mãi',
    'guide': 'Hướng dẫn',
    'recipe': 'Công thức',
    'health': 'Sức khỏe',
    'lifestyle': 'Lối sống',
    'business': 'Kinh doanh',
    'technology': 'Công nghệ',
    'education': 'Giáo dục',
    'entertainment': 'Giải trí'
  };
  
  return typeLabels[type?.toLowerCase()] || 'Không phân loại';
}

// Hàm helper để lấy mô tả phân loại
function getCategoryDescription(type: string): string {
  const descriptions: { [key: string]: string } = {
    'news': 'Các tin tức mới nhất và cập nhật',
    'promotion': 'Các chương trình khuyến mãi và ưu đãi',
    'guide': 'Hướng dẫn và tips hữu ích',
    'recipe': 'Các công thức nấu ăn ngon',
    'health': 'Thông tin về sức khỏe và dinh dưỡng',
    'lifestyle': 'Phong cách sống và xu hướng',
    'business': 'Tin tức về kinh doanh và thị trường',
    'technology': 'Công nghệ mới và xu hướng',
    'education': 'Thông tin giáo dục và học tập',
    'entertainment': 'Tin tức giải trí và văn hóa'
  };
  
  return descriptions[type?.toLowerCase()] || 'Loại tin tức chung';
}

// Hàm helper để lấy màu phân loại
function getCategoryColor(type: string): string {
  const colors: { [key: string]: string } = {
    'news': '#3B82F6',
    'promotion': '#EF4444',
    'guide': '#10B981',
    'recipe': '#F59E0B',
    'health': '#8B5CF6',
    'lifestyle': '#EC4899',
    'business': '#06B6D4',
    'technology': '#84CC16',
    'education': '#F97316',
    'entertainment': '#A855F7'
  };
  
  return colors[type?.toLowerCase()] || '#6B7280';
}

// Hàm helper để lấy icon phân loại
function getCategoryIcon(type: string): string {
  const icons: { [key: string]: string } = {
    'news': '📰',
    'promotion': '🎉',
    'guide': '📚',
    'recipe': '👨‍🍳',
    'health': '💚',
    'lifestyle': '🌟',
    'business': '💼',
    'technology': '💻',
    'education': '🎓',
    'entertainment': '🎭'
  };
  
  return icons[type?.toLowerCase()] || '📰';
}
