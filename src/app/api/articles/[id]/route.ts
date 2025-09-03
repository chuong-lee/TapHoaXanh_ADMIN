import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database';

// PUT - Cập nhật article
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body: { action?: string; rejectionReason?: string; [key: string]: unknown } = await request.json();
    const { action, rejectionReason, ...updateData } = body;
    
    let sql: string;
    let params_array: any[];
    
    switch (action) {
      case 'approve':
        sql = `
          UPDATE articles 
          SET isApproved = 1, isRejected = 0, rejectionReason = NULL, updatedAt = NOW()
          WHERE id = ?
        `;
        params_array = [params.id];
        break;
        
      case 'reject':
        sql = `
          UPDATE articles 
          SET isApproved = 0, isRejected = 1, rejectionReason = ?, updatedAt = NOW()
          WHERE id = ?
        `;
        params_array = [rejectionReason, params.id];
        break;
        
      case 'publish':
        sql = `
          UPDATE articles 
          SET isPublished = 1, publishedAt = NOW(), updatedAt = NOW()
          WHERE id = ?
        `;
        params_array = [params.id];
        break;
        
      case 'unpublish':
        sql = `
          UPDATE articles 
          SET isPublished = 0, publishedAt = NULL, updatedAt = NOW()
          WHERE id = ?
        `;
        params_array = [params.id];
        break;
        
      case 'update':
        sql = `
          UPDATE articles 
          SET title = ?, content = ?, summary = ?, category = ?, tags = ?, 
              featuredImage = ?, images = ?, updatedAt = NOW()
          WHERE id = ?
        `;
        params_array = [
          updateData.title, updateData.content, updateData.summary, updateData.category, 
          JSON.stringify(updateData.tags), updateData.featuredImage, 
          JSON.stringify(updateData.images), params.id
        ];
        break;
        
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
    
    await query(sql, params_array);
    
    return NextResponse.json({ message: 'Article updated successfully' });
  } catch (error) {
    console.error('Error updating article:', error);
    return NextResponse.json({ error: 'Failed to update article' }, { status: 500 });
  }
}

// DELETE - Xóa article
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const sql = `DELETE FROM articles WHERE id = ?`;
    await query(sql, [params.id]);
    
    return NextResponse.json({ message: 'Article deleted successfully' });
  } catch (error) {
    console.error('Error deleting article:', error);
    return NextResponse.json({ error: 'Failed to delete article' }, { status: 500 });
  }
}
