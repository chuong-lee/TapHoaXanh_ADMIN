import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database';

// GET - Lấy danh sách articles
export async function GET() {
  try {
    const sql = `
      SELECT 
        a.id, a.title, a.content, a.summary, a.authorId, a.category, 
        a.tags, a.featuredImage, a.images, a.isPublished, a.isApproved, 
        a.isRejected, a.rejectionReason, a.publishedAt, a.viewCount, 
        a.likeCount, a.createdAt, a.updatedAt,
        u.name as authorName, u.avatar as authorAvatar
      FROM articles a
      LEFT JOIN users u ON a.authorId = u.id
      ORDER BY a.createdAt DESC
    `;
    
    const articles = await query(sql);
    
    const formattedArticles = articles.map((article: any) => ({
      id: article.id,
      title: article.title,
      content: article.content,
      summary: article.summary,
      authorId: article.authorId,
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
    
    return NextResponse.json(formattedArticles);
  } catch (error) {
    console.error('Error fetching articles:', error);
    return NextResponse.json({ error: 'Failed to fetch articles' }, { status: 500 });
  }
}

// POST - Tạo article mới
export async function POST(request: Request) {
  try {
    const body: { title: string; content: string; summary?: string; category?: string; tags?: string[]; featuredImage?: string; images?: string[] } = await request.json();
    const { title, content, summary, category, tags, featuredImage, images } = body;
    
    const sql = `
      INSERT INTO articles (title, content, summary, authorId, category, tags, featuredImage, images, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
    `;
    
    const result = await query(sql, [title, content, summary, authorId, category, JSON.stringify(tags), featuredImage, JSON.stringify(images)]);
    
    return NextResponse.json({ id: result.insertId, message: 'Article created successfully' });
  } catch (error) {
    console.error('Error creating article:', error);
    return NextResponse.json({ error: 'Failed to create article' }, { status: 500 });
  }
}
