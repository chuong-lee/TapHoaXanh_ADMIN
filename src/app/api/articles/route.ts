import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database';

// GET - Lấy danh sách articles
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;

    // Xây dựng câu SQL với điều kiện lọc
    let whereConditions = ['a.deletedAt IS NULL'];
    let queryParams: any[] = [];

    if (category && category.trim() !== '') {
      whereConditions.push('a.category = ?');
      queryParams.push(category);
    }

    if (status === 'published') {
      whereConditions.push('a.isPublished = 1 AND a.isApproved = 1');
    } else if (status === 'pending') {
      whereConditions.push('a.isApproved = 0 AND a.isRejected = 0');
    } else if (status === 'approved') {
      whereConditions.push('a.isApproved = 1 AND a.isRejected = 0');
    } else if (status === 'rejected') {
      whereConditions.push('a.isRejected = 1');
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    // Đếm tổng số bài viết
    const countSql = `
      SELECT COUNT(*) as count
      FROM articles a
      ${whereClause}
    `;
    
    let countResult;
    if (queryParams.length > 0) {
      countResult = await query(countSql, queryParams);
    } else {
      countResult = await query(countSql);
    }
    const total = countResult[0].count;

    // Lấy danh sách bài viết với phân trang
    let sql = `
      SELECT 
        a.id, a.title, a.content, a.summary, a.authorId, a.category, 
        a.tags, a.featuredImage, a.images, a.isPublished, a.isApproved, 
        a.isRejected, a.rejectionReason, a.publishedAt, a.viewCount, 
        a.likeCount, a.createdAt, a.updatedAt,
        u.name as authorName, u.image as authorAvatar
      FROM articles a
      LEFT JOIN users u ON a.authorId = u.id
      ${whereClause}
      ORDER BY a.createdAt DESC
    `;

    // Thêm LIMIT và OFFSET vào câu SQL
    sql += ` LIMIT ${limit} OFFSET ${offset}`;

    let articles;
    if (queryParams.length > 0) {
      articles = await query(sql, queryParams);
    } else {
      articles = await query(sql);
    }
    
    const formattedArticles = articles.map((article: any) => ({
      id: article.id.toString(),
      title: article.title,
      content: article.content,
      summary: article.summary,
      authorId: article.authorId ? article.authorId.toString() : '',
      authorName: article.authorName || 'Tác giả không xác định',
      authorAvatar: article.authorAvatar || "/images/user/default-avatar.jpg",
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
      createdAt: article.createdAt,
      updatedAt: article.updatedAt,
    }));

    return NextResponse.json({
      articles: formattedArticles,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Error fetching articles:', error);
    return NextResponse.json(
      { error: 'Không thể lấy danh sách bài viết', details: error instanceof Error ? error.message : 'Unknown error' }, 
      { status: 500 }
    );
  }
}

// POST - Tạo article mới
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, content, summary, category, tags, featuredImage, images, authorId } = body;

    // Validation
    if (!title || !content || !category || !authorId) {
      return NextResponse.json(
        { error: 'Thiếu thông tin bắt buộc' }, 
        { status: 400 }
      );
    }

    const sql = `
      INSERT INTO articles (title, content, summary, authorId, category, tags, featuredImage, images, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
    `;
    
    const result = await query(sql, [
      title, 
      content, 
      summary || '', 
      parseInt(authorId), 
      category, 
      tags ? JSON.stringify(tags) : '[]', 
      featuredImage || '', 
      images ? JSON.stringify(images) : '[]'
    ]);
    
    return NextResponse.json({ 
      id: result.insertId, 
      message: 'Bài viết đã được tạo thành công' 
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating article:', error);
    return NextResponse.json(
      { error: 'Không thể tạo bài viết', details: error instanceof Error ? error.message : 'Unknown error' }, 
      { status: 500 }
    );
  }
}
