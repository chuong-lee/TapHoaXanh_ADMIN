import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database';

// GET - Lấy chi tiết tin tức
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const sql = `
      SELECT 
        n.id, n.name, n.summary, n.description, n.images, n.views, 
        n.likes, n.comments_count, n.author_id, n.category_id, n.type,
        n.createdAt, n.updatedAt, n.deletedAt,
        u.name as authorName, u.image as authorAvatar
      FROM news n
      LEFT JOIN users u ON n.author_id = u.id
      WHERE n.id = ? AND n.deletedAt IS NULL
    `;
    
    const news = await query(sql, [parseInt(params.id)]);
    
    if (news.length === 0) {
      return NextResponse.json({ error: 'Không tìm thấy tin tức' }, { status: 404 });
    }
    
    const item = news[0];
    const formattedNews = {
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
      type: item.type,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
      deletedAt: item.deletedAt,
    };
    
    return NextResponse.json(formattedNews);
  } catch (error) {
    console.error('Error fetching news:', error);
    return NextResponse.json(
      { error: 'Không thể lấy thông tin tin tức', details: error instanceof Error ? error.message : 'Unknown error' }, 
      { status: 500 }
    );
  }
}

// PUT - Cập nhật tin tức
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
      UPDATE news 
      SET name = ?, summary = ?, description = ?, images = ?, 
          author_id = ?, category_id = ?, type = ?, updatedAt = NOW()
      WHERE id = ? AND deletedAt IS NULL
    `;
    
    const result = await query(sql, [
      name, 
      summary || '', 
      description, 
      images || '', 
      author_id ? parseInt(author_id) : null, 
      category_id ? parseInt(category_id) : null, 
      type || '', 
      parseInt(params.id)
    ]);
    
    if (result.affectedRows === 0) {
      return NextResponse.json({ error: 'Không tìm thấy tin tức để cập nhật' }, { status: 404 });
    }
    
    return NextResponse.json({ message: 'Tin tức đã được cập nhật thành công' });
  } catch (error) {
    console.error('Error updating news:', error);
    return NextResponse.json(
      { error: 'Không thể cập nhật tin tức', details: error instanceof Error ? error.message : 'Unknown error' }, 
      { status: 500 }
    );
  }
}

// DELETE - Xóa tin tức (soft delete)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const sql = `
      UPDATE news 
      SET deletedAt = NOW(), updatedAt = NOW()
      WHERE id = ? AND deletedAt IS NULL
    `;
    
    const result = await query(sql, [parseInt(params.id)]);
    
    if (result.affectedRows === 0) {
      return NextResponse.json({ error: 'Không tìm thấy tin tức để xóa' }, { status: 404 });
    }
    
    return NextResponse.json({ message: 'Tin tức đã được xóa thành công' });
  } catch (error) {
    console.error('Error deleting news:', error);
    return NextResponse.json(
      { error: 'Không thể xóa tin tức', details: error instanceof Error ? error.message : 'Unknown error' }, 
      { status: 500 }
    );
  }
}
