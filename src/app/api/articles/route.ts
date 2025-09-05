import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database';

// GET - Lấy danh sách bài viết
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const authorId = searchParams.get('authorId');
    const isPublished = searchParams.get('isPublished');
    const search = searchParams.get('search');
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

    if (authorId && authorId.trim() !== '') {
      whereConditions.push('a.authorId = ?');
      queryParams.push(parseInt(authorId));
    }

    if (isPublished !== null && isPublished !== '') {
      whereConditions.push('a.isPublished = ?');
      queryParams.push(isPublished === 'true' ? 1 : 0);
    }

    if (search && search.trim() !== '') {
      whereConditions.push('(a.title LIKE ? OR a.content LIKE ? OR a.summary LIKE ?)');
      queryParams.push(`%${search}%`, `%${search}%`, `%${search}%`);
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
        a.id, a.title, a.content, a.summary, a.category, a.tags, 
        a.featuredImage, a.images, a.isPublished, a.isApproved, a.isRejected,
        a.rejectionReason, a.publishedAt, a.viewCount, a.likeCount,
        a.createdAt, a.updatedAt, a.deletedAt,
        u.name as authorName, u.image as authorImage
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

    // Format dữ liệu trả về
    const formattedArticles = articles.map((article: any) => ({
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

// POST - Tạo bài viết mới
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      title, 
      content, 
      summary, 
      category, 
      tags, 
      featuredImage, 
      images, 
      authorId, 
      isPublished = false 
    } = body;

    // Validation
    if (!title || !content || !authorId) {
      return NextResponse.json(
        { error: 'Thiếu thông tin bắt buộc' }, 
        { status: 400 }
      );
    }

    // Kiểm tra xem tác giả có tồn tại không
    const authorCheck = await query(
      'SELECT id FROM users WHERE id = ? AND deletedAt IS NULL',
      [parseInt(authorId)]
    );

    if (authorCheck.length === 0) {
      return NextResponse.json(
        { error: 'Tác giả không tồn tại' }, 
        { status: 400 }
      );
    }

    // Tạo bài viết mới
    const sql = `
      INSERT INTO articles (
        title, content, summary, authorId, category, tags, 
        featuredImage, images, isPublished, isApproved, 
        createdAt, updatedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
    `;

    const result = await query(sql, [
      title,
      content,
      summary || '',
      parseInt(authorId),
      category || 'Tin tức',
      tags ? JSON.stringify(tags) : null,
      featuredImage || '',
      images ? JSON.stringify(images) : null,
      isPublished ? 1 : 0,
      isPublished ? 1 : 0, // Tự động approve nếu publish
    ]);

    const articleId = result.insertId;

    // Lấy thông tin bài viết vừa tạo
    const newArticleSql = `
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

    const newArticle = await query(newArticleSql, [articleId]);

    if (newArticle.length === 0) {
      return NextResponse.json(
        { error: 'Không thể lấy thông tin bài viết vừa tạo' }, 
        { status: 500 }
      );
    }

    const article = newArticle[0];

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
      message: 'Bài viết đã được tạo thành công',
      article: formattedArticle
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating article:', error);
    return NextResponse.json(
      { error: 'Không thể tạo bài viết', details: error instanceof Error ? error.message : 'Unknown error' }, 
      { status: 500 }
    );
  }
}