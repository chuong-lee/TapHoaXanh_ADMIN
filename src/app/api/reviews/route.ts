import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const rating = searchParams.get('rating');
    const status = searchParams.get('status');
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

    // Kiểm tra cấu trúc bảng rating thực tế
    let hasStatusField = false;
    let hasApprovedFields = false;
    
    try {
      // Kiểm tra trường status
      const checkStatusSql = 'SHOW COLUMNS FROM rating LIKE "status"';
      const statusFieldCheck = await query(checkStatusSql);
      hasStatusField = statusFieldCheck.length > 0;
      
      // Kiểm tra trường isApproved
      const checkApprovedSql = 'SHOW COLUMNS FROM rating LIKE "isApproved"';
      const approvedFieldCheck = await query(checkApprovedSql);
      hasApprovedFields = approvedFieldCheck.length > 0;
      
      console.log('Bảng rating - hasStatusField:', hasStatusField, 'hasApprovedFields:', hasApprovedFields);
    } catch (error) {
      console.log('Không thể kiểm tra cấu trúc bảng rating:', error);
    }

    if (status && status.trim() !== '' && hasStatusField) {
      whereConditions.push('r.status = ?');
      queryParams.push(status);
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

    // Lấy danh sách đánh giá với phân trang - xử lý theo cấu trúc bảng thực tế
    let sql: string;
    
    if (hasStatusField) {
      // Sử dụng cấu trúc bảng mới với trường status
      sql = `
        SELECT 
          r.id, r.rating, r.comment, r.status, r.rejectionReason, 
          r.admin_id, r.reviewedAt, r.createdAt, r.updatedAt,
          r.user_id, r.product_id,
          p.name as productName, p.images as productImages,
          u.name as userName, u.image as userImage,
          a.name as adminName
        FROM rating r
        LEFT JOIN product p ON r.product_id = p.id
        LEFT JOIN users u ON r.user_id = u.id
        LEFT JOIN users a ON r.admin_id = a.id
        ${whereClause}
        ORDER BY r.createdAt DESC
      `;
    } else if (hasApprovedFields) {
      // Sử dụng cấu trúc bảng với isApproved và isRejected
      sql = `
        SELECT 
          r.id, r.rating, r.comment, r.isApproved, r.isRejected, r.rejectionReason,
          r.createdAt, r.updatedAt,
          r.user_id, r.product_id,
          p.name as productName, p.images as productImages,
          u.name as userName, u.image as userImage
        FROM rating r
        LEFT JOIN product p ON r.product_id = p.id
        LEFT JOIN users u ON r.user_id = u.id
        ${whereClause}
        ORDER BY r.createdAt DESC
      `;
    } else {
      // Sử dụng cấu trúc bảng cơ bản (chỉ có các trường cơ bản)
      sql = `
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
    }

    // Thêm LIMIT và OFFSET vào câu SQL
    sql += ` LIMIT ${limit} OFFSET ${offset}`;

    let reviews;
    if (queryParams.length > 0) {
      reviews = await query(sql, queryParams);
    } else {
      reviews = await query(sql);
    }

    // Format dữ liệu trả về - xử lý theo cấu trúc bảng thực tế
    const formattedReviews = reviews.map((review: any) => {
      let reviewStatus = 'pending';
      let rejectionReason = undefined;
      let adminId = undefined;
      let adminName = undefined;
      let reviewedAt = undefined;

      if (hasStatusField) {
        // Sử dụng trường status mới
        reviewStatus = review.status || 'pending';
        rejectionReason = review.rejectionReason;
        adminId = review.admin_id ? review.admin_id.toString() : undefined;
        adminName = review.adminName;
        reviewedAt = review.reviewedAt;
      } else if (hasApprovedFields) {
        // Chuyển đổi từ isApproved/isRejected sang status
        if (review.isApproved) {
          reviewStatus = 'approved';
        } else if (review.isRejected) {
          reviewStatus = 'rejected';
        } else {
          reviewStatus = 'pending';
        }
        rejectionReason = review.rejectionReason;
      } else {
        // Bảng cơ bản - mặc định là pending
        reviewStatus = 'pending';
      }

      return {
        id: review.id.toString(),
        productId: review.product_id ? review.product_id.toString() : '',
        productName: review.productName || 'Sản phẩm không xác định',
        productImage: review.productImages ? review.productImages.split(',')[0] : '/images/product/default.jpg',
        userId: review.user_id ? review.user_id.toString() : '',
        userName: review.userName || 'Người dùng không xác định',
        userAvatar: review.userImage || "/images/user/default-avatar.jpg",
        rating: review.rating,
        comment: review.comment,
        images: [], // Bảng rating hiện tại không có trường images
        status: reviewStatus,
        rejectionReason: rejectionReason,
        adminId: adminId,
        adminName: adminName,
        reviewedAt: reviewedAt,
        createdAt: review.createdAt,
        updatedAt: review.updatedAt,
      };
    });

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
