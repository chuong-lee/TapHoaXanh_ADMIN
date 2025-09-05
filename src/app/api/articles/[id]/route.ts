import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database';

// GET - Lấy thông tin chi tiết bài viết
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const sql = `
      SELECT 
        a.id, a.title, a.content, a.summary, a.category, a.tags, 
        a.featuredImage, a.images, a.isPublished, a.isApproved, a.isRejected,
        a.rejectionReason, a.publishedAt, a.viewCount, a.likeCount,
        a.createdAt, a.updatedAt, a.deletedAt,
        u.name as authorName, u.image as authorImage
      FROM articles a
      LEFT JOIN users u ON a.authorId = u.id
      WHERE a.id = ? AND a.deletedAt IS NULL
    `;

    const articles = await query(sql, [id]);

    if (articles.length === 0) {
      return NextResponse.json(
        { error: 'Không tìm thấy bài viết' }, 
        { status: 404 }
      );
    }

    const article = articles[0];

    const formattedArticle = {
      id: article.id.toString(),
      title: article.title,
      content: article.content,
      summary: article.summary,
      category: article.category,
      tags: article.tags ? JSON.parse(article.tags) : [],
      featuredImage: article.featuredImage,
      images: article.images ? JSON.parse(article.images) : [],
      isPublished: Boolean(article.isPublished),
      isApproved: Boolean(article.isApproved),
      isRejected: Boolean(article.isRejected),
      rejectionReason: article.rejectionReason,
      publishedAt: article.publishedAt,
      viewCount: article.viewCount || 0,
      likeCount: article.likeCount || 0,
      authorId: article.authorId ? article.authorId.toString() : '',
      authorName: article.authorName || 'Tác giả không xác định',
      authorAvatar: article.authorImage || '/images/user/default-avatar.jpg',
      createdAt: article.createdAt,
      updatedAt: article.updatedAt,
    };

    return NextResponse.json(formattedArticle);

  } catch (error) {
    console.error('Error fetching article:', error);
    return NextResponse.json(
      { error: 'Không thể lấy thông tin bài viết', details: error instanceof Error ? error.message : 'Unknown error' }, 
      { status: 500 }
    );
  }
}

// PUT - Cập nhật bài viết
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const { 
      title, 
      content, 
      summary, 
      category, 
      tags, 
      featuredImage, 
      images, 
      isPublished 
    } = body;

    // Validation
    if (!title || !content) {
      return NextResponse.json(
        { error: 'Thiếu thông tin bắt buộc' }, 
        { status: 400 }
      );
    }

    // Kiểm tra xem bài viết có tồn tại không
    const existingArticle = await query(
      'SELECT id FROM articles WHERE id = ? AND deletedAt IS NULL',
      [id]
    );

    if (existingArticle.length === 0) {
      return NextResponse.json(
        { error: 'Không tìm thấy bài viết' }, 
        { status: 404 }
      );
    }

    // Cập nhật bài viết
    const sql = `
          UPDATE articles 
      SET title = ?, content = ?, summary = ?, category = ?, tags = ?, 
          featuredImage = ?, images = ?, isPublished = ?, isApproved = ?, 
          updatedAt = NOW()
      WHERE id = ? AND deletedAt IS NULL
    `;

    const result = await query(sql, [
      title,
      content,
      summary || '',
      category || 'Tin tức',
      tags ? JSON.stringify(tags) : null,
      featuredImage || '',
      images ? JSON.stringify(images) : null,
      isPublished ? 1 : 0,
      isPublished ? 1 : 0, // Tự động approve nếu publish
      id
    ]);

    if (result.affectedRows === 0) {
      return NextResponse.json(
        { error: 'Không thể cập nhật bài viết' }, 
        { status: 500 }
      );
    }

    // Lấy thông tin bài viết đã cập nhật
    const updatedArticleSql = `
      SELECT 
        a.id, a.title, a.content, a.summary, a.category, a.tags, 
        a.featuredImage, a.images, a.isPublished, a.isApproved, a.isRejected,
        a.rejectionReason, a.publishedAt, a.viewCount, a.likeCount,
        a.createdAt, a.updatedAt,
        u.name as authorName, u.image as authorImage
      FROM articles a
      LEFT JOIN users u ON a.authorId = u.id
      WHERE a.id = ?
    `;

    const updatedArticle = await query(updatedArticleSql, [id]);

    if (updatedArticle.length === 0) {
      return NextResponse.json(
        { error: 'Không thể lấy thông tin bài viết đã cập nhật' }, 
        { status: 500 }
      );
    }

    const article = updatedArticle[0];

    const formattedArticle = {
      id: article.id.toString(),
      title: article.title,
      content: article.content,
      summary: article.summary,
      category: article.category,
      tags: article.tags ? JSON.parse(article.tags) : [],
      featuredImage: article.featuredImage,
      images: article.images ? JSON.parse(article.images) : [],
      isPublished: Boolean(article.isPublished),
      isApproved: Boolean(article.isApproved),
      isRejected: Boolean(article.isRejected),
      rejectionReason: article.rejectionReason,
      publishedAt: article.publishedAt,
      viewCount: article.viewCount || 0,
      likeCount: article.likeCount || 0,
      authorId: article.authorId ? article.authorId.toString() : '',
      authorName: article.authorName || 'Tác giả không xác định',
      authorAvatar: article.authorImage || '/images/user/default-avatar.jpg',
      createdAt: article.createdAt,
      updatedAt: article.updatedAt,
    };

    return NextResponse.json({
      message: 'Bài viết đã được cập nhật thành công',
      article: formattedArticle
    });

  } catch (error) {
    console.error('Error updating article:', error);
    return NextResponse.json(
      { error: 'Không thể cập nhật bài viết', details: error instanceof Error ? error.message : 'Unknown error' }, 
      { status: 500 }
    );
  }
}

// DELETE - Xóa bài viết (soft delete)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Kiểm tra xem bài viết có tồn tại không
    const existingArticle = await query(
      'SELECT id, title FROM articles WHERE id = ? AND deletedAt IS NULL',
      [id]
    );

    if (existingArticle.length === 0) {
      return NextResponse.json(
        { error: 'Không tìm thấy bài viết' }, 
        { status: 404 }
      );
    }

    // Xóa bài viết (soft delete)
    const sql = `
      UPDATE articles 
      SET deletedAt = NOW(), updatedAt = NOW()
      WHERE id = ? AND deletedAt IS NULL
    `;

    const result = await query(sql, [id]);

    if (result.affectedRows === 0) {
      return NextResponse.json(
        { error: 'Không thể xóa bài viết' }, 
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'Bài viết đã được xóa thành công'
    });

  } catch (error) {
    console.error('Error deleting article:', error);
    return NextResponse.json(
      { error: 'Không thể xóa bài viết', details: error instanceof Error ? error.message : 'Unknown error' }, 
      { status: 500 }
    );
  }
}