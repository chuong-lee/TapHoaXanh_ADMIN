import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database';

// GET - Lấy thông tin chi tiết phân loại
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const sql = `
      SELECT 
        c.id, c.name, c.description, c.slug, c.color, c.icon,
        c.createdAt, c.updatedAt, c.deletedAt,
        COUNT(n.id) as newsCount
      FROM categories c
      LEFT JOIN news n ON c.id = n.category_id AND n.deletedAt IS NULL
      WHERE c.id = ? AND c.deletedAt IS NULL
      GROUP BY c.id
    `;
    
    const categories = await query(sql, [id]);
    
    if (categories.length === 0) {
      return NextResponse.json(
        { error: 'Không tìm thấy phân loại' }, 
        { status: 404 }
      );
    }

    const category = categories[0];
    
    // Lấy danh sách bài viết thuộc phân loại này
    const newsSql = `
      SELECT 
        n.id, n.name, n.summary, n.views, n.likes, n.comments_count,
        n.createdAt, n.updatedAt
      FROM news n
      WHERE n.category_id = ? AND n.deletedAt IS NULL
      ORDER BY n.createdAt DESC
      LIMIT 10
    `;
    
    const news = await query(newsSql, [id]);
    
    const formattedCategory = {
      id: category.id.toString(),
      name: category.name,
      description: category.description || '',
      slug: category.slug || '',
      color: category.color || '#3B82F6',
      icon: category.icon || '📰',
      newsCount: category.newsCount || 0,
      recentNews: news.map((item: any) => ({
        id: item.id.toString(),
        name: item.name,
        summary: item.summary,
        views: item.views || 0,
        likes: item.likes || 0,
        comments_count: item.comments_count || 0,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
      })),
      createdAt: category.createdAt,
      updatedAt: category.updatedAt,
    };

    return NextResponse.json(formattedCategory);

  } catch (error) {
    console.error('Error fetching category:', error);
    return NextResponse.json(
      { error: 'Không thể lấy thông tin phân loại', details: error instanceof Error ? error.message : 'Unknown error' }, 
      { status: 500 }
    );
  }
}

// PUT - Cập nhật phân loại
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const { name, description, slug, color, icon } = body;

    // Validation
    if (!name) {
      return NextResponse.json(
        { error: 'Tên phân loại là bắt buộc' }, 
        { status: 400 }
      );
    }

    // Kiểm tra xem tên phân loại đã tồn tại chưa (trừ phân loại hiện tại)
    const checkSql = 'SELECT id FROM categories WHERE name = ? AND id != ? AND deletedAt IS NULL';
    const existingCategory = await query(checkSql, [name, id]);
    
    if (existingCategory.length > 0) {
      return NextResponse.json(
        { error: 'Tên phân loại đã tồn tại' }, 
        { status: 400 }
      );
    }

    const sql = `
      UPDATE categories 
      SET name = ?, description = ?, slug = ?, color = ?, icon = ?, updatedAt = NOW()
      WHERE id = ? AND deletedAt IS NULL
    `;
    
    const result = await query(sql, [
      name, 
      description || '', 
      slug || name.toLowerCase().replace(/\s+/g, '-'),
      color || '#3B82F6',
      icon || '📰',
      id
    ]);
    
    if (result.affectedRows === 0) {
      return NextResponse.json(
        { error: 'Không tìm thấy phân loại để cập nhật' }, 
        { status: 404 }
      );
    }
    
    return NextResponse.json({ 
      message: 'Phân loại đã được cập nhật thành công' 
    });

  } catch (error) {
    console.error('Error updating category:', error);
    return NextResponse.json(
      { error: 'Không thể cập nhật phân loại', details: error instanceof Error ? error.message : 'Unknown error' }, 
      { status: 500 }
    );
  }
}

// DELETE - Xóa phân loại (soft delete)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Kiểm tra xem có bài viết nào thuộc phân loại này không
    const checkNewsSql = 'SELECT COUNT(*) as count FROM news WHERE category_id = ? AND deletedAt IS NULL';
    const newsCount = await query(checkNewsSql, [id]);
    
    if (newsCount[0].count > 0) {
      return NextResponse.json(
        { error: 'Không thể xóa phân loại đang có bài viết' }, 
        { status: 400 }
      );
    }

    const sql = `
      UPDATE categories 
      SET deletedAt = NOW(), updatedAt = NOW()
      WHERE id = ? AND deletedAt IS NULL
    `;
    
    const result = await query(sql, [id]);
    
    if (result.affectedRows === 0) {
      return NextResponse.json(
        { error: 'Không tìm thấy phân loại để xóa' }, 
        { status: 404 }
      );
    }
    
    return NextResponse.json({ 
      message: 'Phân loại đã được xóa thành công' 
    });

  } catch (error) {
    console.error('Error deleting category:', error);
    return NextResponse.json(
      { error: 'Không thể xóa phân loại', details: error instanceof Error ? error.message : 'Unknown error' }, 
      { status: 500 }
    );
  }
}
