import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database';

// POST - Thêm sản phẩm mới
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      name, 
      description, 
      price, 
      category_id, 
      brand_id, 
      images, 
      stock, 
      status,
      admin_id 
    } = body;

    // Validation
    if (!name || !description || !price || !admin_id) {
      return NextResponse.json(
        { error: 'Thiếu thông tin bắt buộc: name, description, price, admin_id' }, 
        { status: 400 }
      );
    }

    if (price <= 0) {
      return NextResponse.json(
        { error: 'Giá sản phẩm phải lớn hơn 0' }, 
        { status: 400 }
      );
    }

    // Kiểm tra xem tên sản phẩm đã tồn tại chưa
    const checkSql = 'SELECT id FROM product WHERE name = ? AND deletedAt IS NULL';
    const existingProduct = await query(checkSql, [name]);
    
    if (existingProduct.length > 0) {
      return NextResponse.json(
        { error: 'Tên sản phẩm đã tồn tại' }, 
        { status: 400 }
      );
    }

    // Tạo sản phẩm mới
    const sql = `
      INSERT INTO product (
        name, description, price, category_id, brand_id, 
        images, stock, status, avg_rating, total_reviews,
        created_by, updated_by, createdAt, updatedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, 0, ?, ?, NOW(), NOW())
    `;
    
    const result = await query(sql, [
      name,
      description,
      parseFloat(price),
      category_id || null,
      brand_id || null,
      images ? JSON.stringify(images) : null,
      stock || 0,
      status || 'active',
      admin_id,
      admin_id
    ]);
    
    const productId = result.insertId;

    // Tạo thống kê sản phẩm
    try {
      const statsSql = `
        INSERT INTO product_stats (product_id, total_articles, total_reviews, total_orders, created_at, updated_at)
        VALUES (?, 0, 0, 0, NOW(), NOW())
      `;
      await query(statsSql, [productId]);
    } catch (error) {
      console.log('Không thể tạo product_stats, có thể bảng chưa tồn tại');
    }

    // Cập nhật thống kê tổng thể
    try {
      const updateSystemSql = `
        UPDATE system_stats 
        SET total_products = total_products + 1, updated_at = NOW()
        WHERE id = 1
      `;
      await query(updateSystemSql);
    } catch (error) {
      console.log('Không thể cập nhật system_stats, có thể bảng chưa tồn tại');
    }

    // Log hoạt động
    try {
      const logSql = `
        INSERT INTO admin_activity_log (admin_id, action, table_name, record_id, details, created_at)
        VALUES (?, 'INSERT', 'product', ?, ?, NOW())
      `;
      await query(logSql, [admin_id, productId.toString(), `Thêm sản phẩm: ${name}`]);
    } catch (error) {
      console.log('Không thể log hoạt động, có thể bảng chưa tồn tại');
    }

    return NextResponse.json({ 
      id: productId,
      message: 'Sản phẩm đã được tạo thành công',
      product: {
        id: productId.toString(),
        name,
        description,
        price: parseFloat(price),
        category_id,
        brand_id,
        images,
        stock: stock || 0,
        status: status || 'active',
        avg_rating: 0,
        total_reviews: 0
      }
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json(
      { error: 'Không thể tạo sản phẩm', details: error instanceof Error ? error.message : 'Unknown error' }, 
      { status: 500 }
    );
  }
}

// GET - Lấy danh sách sản phẩm
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category_id = searchParams.get('category_id');
    const brand_id = searchParams.get('brand_id');
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;

    // Xây dựng câu SQL với điều kiện lọc
    let whereConditions = ['p.deletedAt IS NULL'];
    let queryParams: any[] = [];

    if (category_id && category_id.trim() !== '') {
      whereConditions.push('p.category_id = ?');
      queryParams.push(category_id);
    }

    if (brand_id && brand_id.trim() !== '') {
      whereConditions.push('p.brand_id = ?');
      queryParams.push(brand_id);
    }

    if (status && status.trim() !== '') {
      whereConditions.push('p.status = ?');
      queryParams.push(status);
    }

    if (search && search.trim() !== '') {
      whereConditions.push('(p.name LIKE ? OR p.description LIKE ?)');
      queryParams.push(`%${search}%`, `%${search}%`);
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    // Đếm tổng số sản phẩm
    const countSql = `
      SELECT COUNT(*) as count
      FROM product p
      ${whereClause}
    `;
    
    let countResult;
    if (queryParams.length > 0) {
      countResult = await query(countSql, queryParams);
    } else {
      countResult = await query(countSql);
    }
    const total = countResult[0].count;

    // Lấy danh sách sản phẩm với phân trang
    let sql = `
      SELECT 
        p.id, p.name, p.description, p.price, p.images, p.stock, p.status,
        p.avg_rating, p.total_reviews, p.category_id, p.brand_id,
        p.createdAt, p.updatedAt,
        c.name as category_name,
        b.name as brand_name
      FROM product p
      LEFT JOIN category c ON p.category_id = c.id
      LEFT JOIN brand b ON p.brand_id = b.id
      ${whereClause}
      ORDER BY p.createdAt DESC
    `;

    // Thêm LIMIT và OFFSET vào câu SQL
    sql += ` LIMIT ${limit} OFFSET ${offset}`;

    let products;
    if (queryParams.length > 0) {
      products = await query(sql, queryParams);
    } else {
      products = await query(sql);
    }
    
    const formattedProducts = products.map((item: any) => ({
      id: item.id.toString(),
      name: item.name,
      description: item.description,
      price: parseFloat(item.price),
      images: item.images ? JSON.parse(item.images) : [],
      stock: item.stock,
      status: item.status,
      avgRating: item.avg_rating || 0,
      totalReviews: item.total_reviews || 0,
      categoryId: item.category_id ? item.category_id.toString() : '',
      categoryName: item.category_name || '',
      brandId: item.brand_id ? item.brand_id.toString() : '',
      brandName: item.brand_name || '',
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    }));

    return NextResponse.json({
      products: formattedProducts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { error: 'Không thể lấy danh sách sản phẩm', details: error instanceof Error ? error.message : 'Unknown error' }, 
      { status: 500 }
    );
  }
}
