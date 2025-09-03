import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database';

export async function GET() {
  try {
            const sql = `
          SELECT 
            r.id, r.rating, r.comment, r.createdAt, r.updatedAt,
            r.user_id, r.product_id,
            p.name as productName,
            u.name as userName
          FROM rating r
          LEFT JOIN product p ON r.product_id = p.id
          LEFT JOIN users u ON r.user_id = u.id
          WHERE r.deletedAt IS NULL
          ORDER BY r.createdAt DESC
        `;
    
    const reviews = await query(sql);
    
            const formattedReviews = reviews.map((review: any) => ({
          id: review.id,
          productId: review.product_id,
          productName: review.productName || 'Sản phẩm không xác định',
          userId: review.user_id,
          userName: review.userName || 'Người dùng không xác định',
          userAvatar: review.userAvatar || "/images/user/default-avatar.jpg",
          rating: review.rating,
          comment: review.comment,
          images: [], // Bảng rating không có trường images
          isApproved: true, // Mặc định đã duyệt vì không có trường này
          isRejected: false,
          rejectionReason: undefined,
          createdAt: review.createdAt,
          updatedAt: review.updatedAt,
        }));
    
    return NextResponse.json(formattedReviews);
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500 });
  }
}
