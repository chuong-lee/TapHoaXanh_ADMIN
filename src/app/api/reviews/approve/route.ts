import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database';

// POST - Duyệt hoặc từ chối đánh giá
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { reviewId, action, rejectionReason, adminId } = body;

    // Validation
    if (!reviewId || !action || !adminId) {
      return NextResponse.json(
        { error: 'Thiếu thông tin bắt buộc' }, 
        { status: 400 }
      );
    }

    if (!['approve', 'reject'].includes(action)) {
      return NextResponse.json(
        { error: 'Hành động không hợp lệ' }, 
        { status: 400 }
      );
    }

    // Kiểm tra xem đánh giá có tồn tại không
    const checkSql = 'SELECT id, status FROM rating WHERE id = ? AND deletedAt IS NULL';
    const existingReview = await query(checkSql, [reviewId]);
    
    if (existingReview.length === 0) {
      return NextResponse.json(
        { error: 'Không tìm thấy đánh giá' }, 
        { status: 404 }
      );
    }

    const review = existingReview[0];
    
    // Kiểm tra xem đánh giá đã được xử lý chưa
    if (review.status !== 'pending') {
      return NextResponse.json(
        { error: 'Đánh giá đã được xử lý trước đó' }, 
        { status: 400 }
      );
    }

    // Cập nhật trạng thái đánh giá
    let sql: string;
    let params: any[];

    if (action === 'approve') {
      sql = `
        UPDATE rating 
        SET status = 'approved', admin_id = ?, reviewedAt = NOW(), updatedAt = NOW()
        WHERE id = ?
      `;
      params = [adminId, reviewId];
    } else {
      if (!rejectionReason) {
        return NextResponse.json(
          { error: 'Lý do từ chối là bắt buộc' }, 
          { status: 400 }
        );
      }
      
      sql = `
        UPDATE rating 
        SET status = 'rejected', rejectionReason = ?, admin_id = ?, reviewedAt = NOW(), updatedAt = NOW()
        WHERE id = ?
      `;
      params = [rejectionReason, adminId, reviewId];
    }

    const result = await query(sql, params);
    
    if (result.affectedRows === 0) {
      return NextResponse.json(
        { error: 'Không thể cập nhật đánh giá' }, 
        { status: 500 }
      );
    }

    // Lấy thông tin đánh giá đã cập nhật
    const updatedReviewSql = `
      SELECT 
        r.id, r.rating, r.comment, r.status, r.rejectionReason, 
        r.admin_id, r.reviewedAt, r.createdAt, r.updatedAt,
        r.user_id, r.product_id,
        p.name as productName,
        u.name as userName, u.image as userImage,
        a.name as adminName
      FROM rating r
      LEFT JOIN product p ON r.product_id = p.id
      LEFT JOIN users u ON r.user_id = u.id
      LEFT JOIN users a ON r.admin_id = a.id
      WHERE r.id = ?
    `;
    
    const updatedReview = await query(updatedReviewSql, [reviewId]);
    
    if (updatedReview.length === 0) {
      return NextResponse.json(
        { error: 'Không thể lấy thông tin đánh giá đã cập nhật' }, 
        { status: 500 }
      );
    }

    const reviewData = updatedReview[0];
    
    const formattedReview = {
      id: reviewData.id.toString(),
      productId: reviewData.product_id ? reviewData.product_id.toString() : '',
      productName: reviewData.productName || 'Sản phẩm không xác định',
      userId: reviewData.user_id ? reviewData.user_id.toString() : '',
      userName: reviewData.userName || 'Người dùng không xác định',
      userAvatar: reviewData.userImage || "/images/user/default-avatar.jpg",
      rating: reviewData.rating,
      comment: reviewData.comment,
      status: reviewData.status,
      rejectionReason: reviewData.rejectionReason,
      adminId: reviewData.admin_id ? reviewData.admin_id.toString() : undefined,
      adminName: reviewData.adminName,
      reviewedAt: reviewData.reviewedAt,
      createdAt: reviewData.createdAt,
      updatedAt: reviewData.updatedAt,
    };

    return NextResponse.json({
      message: action === 'approve' ? 'Đánh giá đã được duyệt' : 'Đánh giá đã bị từ chối',
      review: formattedReview
    });

  } catch (error) {
    console.error('Error updating review status:', error);
    return NextResponse.json(
      { error: 'Không thể cập nhật trạng thái đánh giá', details: error instanceof Error ? error.message : 'Unknown error' }, 
      { status: 500 }
    );
  }
}
