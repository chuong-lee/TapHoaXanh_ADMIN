import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const rating = searchParams.get('rating');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;

    // Xây dựng câu SQL với điều kiện lọc
    let whereConditions = ['r.deletedAt IS NULL'];
    let queryParams: any[] = [];

    if (rating && rating.trim() !== '') {
      whereConditions.push('r.rating = ?');
      queryParams.push(parseInt(rating));
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    // Đếm tổng số đánh giá
    const countSql = `
      SELECT COUNT(*) as count
      FROM rating r
      ${whereClause}
    `;
    
    let countResult;
    if (queryParams.length > 0) {
      countResult = await query(countSql, queryParams);
    } else {
      countResult = await query(countSql);
    }
    const total = countResult[0].count;

    // Lấy danh sách đánh giá với phân trang - sử dụng cấu trúc bảng hiện tại
    let sql = `
      SELECT 
        r.id, r.rating, r.comment, r.createdAt, r.updatedAt,
        r.user_id, r.product_id,
        p.name as productName, p.images as productImages,
        u.name as userName, u.image as userImage
      FROM rating r
      LEFT JOIN product p ON r.product_id = p.id
      LEFT JOIN users u ON r.user_id = u.id
      ${whereClause}
      ORDER BY r.createdAt DESC
    `;

    // Thêm LIMIT và OFFSET vào câu SQL
    sql += ` LIMIT ${limit} OFFSET ${offset}`;

    let reviews;
    if (queryParams.length > 0) {
      reviews = await query(sql, queryParams);
    } else {
      reviews = await query(sql);
    }

    // Format dữ liệu trả về - mặc định tất cả đánh giá đều "đã duyệt" vì chưa có trường status
    const formattedReviews = reviews.map((review: any) => ({
      id: review.id.toString(), // Chuyển int thành string
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
    }));

    return NextResponse.json({
      reviews: formattedReviews,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Error fetching reviews:', error);
    return NextResponse.json(
      { error: 'Không thể lấy danh sách đánh giá', details: error instanceof Error ? error.message : 'Unknown error' }, 
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { productId, userId, rating, comment, images } = body;

    // Validation
    if (!productId || !userId || !rating || rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'Dữ liệu không hợp lệ' }, 
        { status: 400 }
      );
    }

    // Kiểm tra xem user đã đánh giá sản phẩm này chưa
    const existingReview = await query(
      'SELECT id FROM rating WHERE user_id = ? AND product_id = ? AND deletedAt IS NULL',
      [parseInt(userId), parseInt(productId)]
    );

    if (existingReview.length > 0) {
      return NextResponse.json(
        { error: 'Bạn đã đánh giá sản phẩm này rồi' }, 
        { status: 400 }
      );
    }

    // Tạo đánh giá mới - sử dụng cấu trúc bảng hiện tại
    const sql = `
      INSERT INTO rating (user_id, product_id, rating, comment, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, NOW(), NOW())
    `;

    const result = await query(sql, [parseInt(userId), parseInt(productId), rating, comment]);
    const reviewId = result.insertId;

    return NextResponse.json({ 
      message: 'Đánh giá đã được tạo thành công',
      reviewId 
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating review:', error);
    return NextResponse.json(
      { error: 'Không thể tạo đánh giá', details: error instanceof Error ? error.message : 'Unknown error' }, 
      { status: 500 }
    );
  }
}
