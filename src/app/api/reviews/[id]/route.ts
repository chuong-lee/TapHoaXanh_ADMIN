import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const sql = `
      SELECT 
        r.id, r.rating, r.comment, r.createdAt, r.updatedAt,
        r.user_id, r.product_id,
        p.name as productName, p.images as productImages,
        u.name as userName, u.image as userImage
      FROM rating r
      LEFT JOIN product p ON r.product_id = p.id
      LEFT JOIN users u ON r.user_id = u.id
      WHERE r.id = ? AND r.deletedAt IS NULL
    `;

    const reviews = await query(sql, [parseInt(id)]);

    if (reviews.length === 0) {
      return NextResponse.json(
        { error: 'Không tìm thấy đánh giá' }, 
        { status: 404 }
      );
    }

    const review = reviews[0];
    const formattedReview = {
      id: review.id.toString(),
      productId: review.product_id ? review.product_id.toString() : '',
      productName: review.productName || 'Sản phẩm không xác định',
      productImage: review.productImages ? review.productImages.split(',')[0] : '/images/product/default.jpg', // Lấy ảnh đầu tiên
      userId: review.user_id ? review.user_id.toString() : '',
      userName: review.userName || 'Người dùng không xác định',
      userAvatar: review.userImage || "/images/user/default-avatar.jpg",
      rating: review.rating,
      comment: review.comment,
      images: [], // Bảng rating hiện tại không có trường images
      isApproved: true, // Mặc định đã duyệt vì chưa có trường này
      isRejected: false,
      rejectionReason: undefined,
      createdAt: review.createdAt,
      updatedAt: review.updatedAt,
    };

    return NextResponse.json(formattedReview);

  } catch (error) {
    console.error('Error fetching review:', error);
    return NextResponse.json(
      { error: 'Không thể lấy thông tin đánh giá', details: error instanceof Error ? error.message : 'Unknown error' }, 
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const { action, rejectionReason } = body;

    // Kiểm tra đánh giá có tồn tại không
    const existingReview = await query(
      'SELECT id FROM rating WHERE id = ? AND deletedAt IS NULL',
      [parseInt(id)]
    );

    if (existingReview.length === 0) {
      return NextResponse.json(
        { error: 'Không tìm thấy đánh giá' }, 
        { status: 404 }
      );
    }

    // Vì chưa có trường status, chúng ta chỉ có thể cập nhật rating và comment
    if (action === 'update') {
      const { rating, comment } = body;
      
      // Validation
      if (rating && (rating < 1 || rating > 5)) {
        return NextResponse.json(
          { error: 'Đánh giá phải từ 1-5 sao' }, 
          { status: 400 }
        );
      }

      let updateFields = [];
      let updateParams = [];

      if (rating !== undefined) {
        updateFields.push('rating = ?');
        updateParams.push(rating);
      }

      if (comment !== undefined) {
        updateFields.push('comment = ?');
        updateParams.push(comment);
      }

      if (updateFields.length === 0) {
        return NextResponse.json(
          { error: 'Không có dữ liệu nào để cập nhật' }, 
          { status: 400 }
        );
      }

      updateFields.push('updatedAt = NOW()');
      updateParams.push(parseInt(id));

      const sql = `UPDATE rating SET ${updateFields.join(', ')} WHERE id = ?`;
      await query(sql, updateParams);

      return NextResponse.json({ 
        message: 'Đánh giá đã được cập nhật thành công',
        reviewId: id 
      });
    }

    // Các action khác chưa được hỗ trợ vì chưa có trường status
    return NextResponse.json(
      { error: 'Hành động này chưa được hỗ trợ. Vui lòng cập nhật database schema trước.' }, 
      { status: 400 }
    );

  } catch (error) {
    console.error('Error updating review:', error);
    return NextResponse.json(
      { error: 'Không thể cập nhật đánh giá', details: error instanceof Error ? error.message : 'Unknown error' }, 
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Kiểm tra đánh giá có tồn tại không
    const existingReview = await query(
      'SELECT id FROM rating WHERE id = ? AND deletedAt IS NULL',
      [parseInt(id)]
    );

    if (existingReview.length === 0) {
      return NextResponse.json(
        { error: 'Không tìm thấy đánh giá' }, 
        { status: 400 }
      );
    }

    // Soft delete thay vì hard delete
    const sql = `UPDATE rating SET deletedAt = NOW() WHERE id = ?`;
    await query(sql, [parseInt(id)]);
    
    return NextResponse.json({ 
      message: 'Đánh giá đã được xóa thành công',
      reviewId: id 
    });

  } catch (error) {
    console.error('Error deleting review:', error);
    return NextResponse.json(
      { error: 'Không thể xóa đánh giá', details: error instanceof Error ? error.message : 'Unknown error' }, 
      { status: 500 }
    );
  }
}
