import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database';

// GET - Lấy danh sách phân loại bài viết
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = (page - 1) * limit;

    // Kiểm tra xem bảng categories có tồn tại không
    let categories: any[] = [];
    let total = 0;
    
    try {
      // Thử lấy từ bảng categories
      const countSql = 'SELECT COUNT(*) as count FROM categories WHERE deletedAt IS NULL';
      const countResult = await query(countSql);
      total = countResult[0].count;
      
      if (total > 0) {
        // Xây dựng câu SQL với điều kiện lọc
        let whereConditions = ['c.deletedAt IS NULL'];
        let queryParams: any[] = [];

        if (search && search.trim() !== '') {
          whereConditions.push('(c.name LIKE ? OR c.description LIKE ?)');
          queryParams.push(`%${search}%`, `%${search}%`);
        }

        const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

        // Lấy danh sách phân loại với phân trang
        let sql = `
          SELECT 
            c.id, c.name, c.description, c.slug, c.color, c.icon,
            c.createdAt, c.updatedAt, c.deletedAt,
            COUNT(n.id) as newsCount
          FROM categories c
          LEFT JOIN news n ON c.id = n.category_id AND n.deletedAt IS NULL
          ${whereClause}
          GROUP BY c.id
          ORDER BY c.name ASC
        `;

        // Thêm LIMIT và OFFSET vào câu SQL
        sql += ` LIMIT ${limit} OFFSET ${offset}`;

        if (queryParams.length > 0) {
          categories = await query(sql, queryParams);
        } else {
          categories = await query(sql);
        }
      }
    } catch (error) {
      console.log('Bảng categories chưa tồn tại, sử dụng dữ liệu mẫu');
    }

    // Nếu không có bảng categories hoặc không có dữ liệu, sử dụng dữ liệu mẫu
    if (categories.length === 0) {
      const sampleCategories = [
        {
          id: 1,
          name: 'Tin tức',
          description: 'Các tin tức mới nhất và cập nhật',
          slug: 'tin-tuc',
          color: '#3B82F6',
          icon: '📰',
          newsCount: 0,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: 2,
          name: 'Khuyến mãi',
          description: 'Các chương trình khuyến mãi và ưu đãi',
          slug: 'khuyen-mai',
          color: '#EF4444',
          icon: '🎉',
          newsCount: 0,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: 3,
          name: 'Hướng dẫn',
          description: 'Hướng dẫn và tips hữu ích',
          slug: 'huong-dan',
          color: '#10B981',
          icon: '📚',
          newsCount: 0,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: 4,
          name: 'Công thức',
          description: 'Các công thức nấu ăn ngon',
          slug: 'cong-thuc',
          color: '#F59E0B',
          icon: '👨‍🍳',
          newsCount: 0,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: 5,
          name: 'Sức khỏe',
          description: 'Thông tin về sức khỏe và dinh dưỡng',
          slug: 'suc-khoe',
          color: '#8B5CF6',
          icon: '💚',
          newsCount: 0,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];
      
      categories = sampleCategories.slice(offset, offset + limit);
      total = sampleCategories.length;
    }
    
    const formattedCategories = categories.map((item: any) => ({
      id: item.id.toString(),
      name: item.name,
      description: item.description || '',
      slug: item.slug || '',
      color: item.color || '#3B82F6',
      icon: item.icon || '📰',
      newsCount: item.newsCount || 0,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
      deletedAt: item.deletedAt,
    }));

    return NextResponse.json({
      categories: formattedCategories,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      { error: 'Không thể lấy danh sách phân loại', details: error instanceof Error ? error.message : 'Unknown error' }, 
      { status: 500 }
    );
  }
}

// POST - Tạo phân loại mới
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, slug, color, icon } = body;

    // Validation
    if (!name) {
      return NextResponse.json(
        { error: 'Tên phân loại là bắt buộc' }, 
        { status: 400 }
      );
    }

    // Kiểm tra xem bảng categories có tồn tại không
    try {
      // Thử lấy từ bảng categories
      const checkSql = 'SELECT id FROM categories WHERE name = ? AND deletedAt IS NULL';
      const existingCategory = await query(checkSql, [name]);
      
      if (existingCategory.length > 0) {
        return NextResponse.json(
          { error: 'Tên phân loại đã tồn tại' }, 
          { status: 400 }
        );
      }

      const sql = `
        INSERT INTO categories (name, description, slug, color, icon, createdAt, updatedAt)
        VALUES (?, ?, ?, ?, ?, NOW(), NOW())
      `;
      
      const result = await query(sql, [
        name, 
        description || '', 
        slug || name.toLowerCase().replace(/\s+/g, '-'),
        color || '#3B82F6',
        icon || '📰'
      ]);
      
      return NextResponse.json({ 
        id: result.insertId, 
        message: 'Phân loại đã được tạo thành công' 
      }, { status: 201 });

    } catch (error) {
      return NextResponse.json(
        { error: 'Bảng categories chưa được tạo. Vui lòng chạy script tạo bảng trước.' }, 
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Error creating category:', error);
    return NextResponse.json(
      { error: 'Không thể tạo phân loại', details: error instanceof Error ? error.message : 'Unknown error' }, 
      { status: 500 }
    );
  }
}
