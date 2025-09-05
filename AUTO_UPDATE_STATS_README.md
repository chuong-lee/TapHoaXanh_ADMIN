# Hệ thống tự động cập nhật thống kê sản phẩm và bài viết

## Tổng quan
Hệ thống này tự động cập nhật số lượng bài viết, đánh giá và các thống kê khác khi admin thêm/xóa sản phẩm, bài viết hoặc đánh giá.

## Các tính năng

### 1. **Trigger tự động**
- ✅ Tự động cập nhật khi thêm sản phẩm mới
- ✅ Tự động cập nhật khi xóa sản phẩm (soft delete)
- ✅ Tự động cập nhật khi thêm bài viết mới
- ✅ Tự động cập nhật khi xóa bài viết
- ✅ Tự động cập nhật khi thêm đánh giá mới
- ✅ Tự động cập nhật khi xóa đánh giá
- ✅ Tự động cập nhật rating trung bình của sản phẩm

### 2. **Bảng thống kê**
- ✅ `product_stats` - Thống kê từng sản phẩm
- ✅ `system_stats` - Thống kê tổng thể hệ thống
- ✅ `admin_activity_log` - Log hoạt động của admin

### 3. **API endpoints**
- ✅ `/api/products/stats` - Thống kê sản phẩm
- ✅ `/api/system/stats` - Thống kê tổng thể hệ thống

## Cài đặt

### Bước 1: Chạy script tạo trigger và bảng
```sql
-- Copy nội dung từ file create_product_triggers.sql và chạy trong database
```

### Bước 2: Kiểm tra trigger đã được tạo
```sql
SHOW TRIGGERS;
```

## Cách hoạt động

### 1. **Khi thêm sản phẩm mới:**
```sql
INSERT INTO product (name, price, ...) VALUES (...);
```
**Trigger sẽ:**
- Tạo record mới trong `product_stats`
- Tăng `total_products` trong `system_stats`
- Log hoạt động vào `admin_activity_log`

### 2. **Khi thêm bài viết mới:**
```sql
INSERT INTO articles (title, content, ...) VALUES (...);
```
**Trigger sẽ:**
- Tăng `total_articles` trong `product_stats`
- Tăng `total_articles` trong `system_stats`
- Log hoạt động

### 3. **Khi thêm đánh giá mới:**
```sql
INSERT INTO rating (rating, comment, ...) VALUES (...);
```
**Trigger sẽ:**
- Tăng `total_reviews` trong `product_stats`
- Tăng `total_reviews` trong `system_stats`
- Cập nhật `avg_rating` và `total_reviews` trong bảng `product`
- Log hoạt động

### 4. **Khi xóa (soft delete):**
```sql
UPDATE product SET deletedAt = NOW() WHERE id = ?;
```
**Trigger sẽ:**
- Giảm số lượng tương ứng trong `system_stats`
- Log hoạt động xóa

## Sử dụng API

### 1. **Lấy thống kê sản phẩm cụ thể:**
```bash
GET /api/products/stats?productId=123
```

**Response:**
```json
{
  "product": {
    "id": "123",
    "name": "Tên sản phẩm",
    "avgRating": 4.5,
    "totalReviews": 25
  },
  "stats": {
    "totalArticles": 5,
    "totalReviews": 25,
    "totalOrders": 12,
    "totalViews": 150
  },
  "recentArticles": [...],
  "recentReviews": [...]
}
```

### 2. **Lấy thống kê tổng quan:**
```bash
GET /api/products/stats
```

**Response:**
```json
{
  "overview": {
    "totalProducts": 150,
    "highRatedProducts": 45,
    "mediumRatedProducts": 80,
    "lowRatedProducts": 25,
    "overallAvgRating": 3.8,
    "totalReviews": 1250
  },
  "topArticles": [...],
  "topReviews": [...],
  "monthlyStats": [...]
}
```

### 3. **Lấy thống kê hệ thống:**
```bash
GET /api/system/stats
```

**Response:**
```json
{
  "overview": {
    "totalProducts": 150,
    "totalArticles": 45,
    "totalReviews": 1250,
    "totalOrders": 89,
    "totalUsers": 234,
    "totalRevenue": 12500.50
  },
  "dailyStats": [...],
  "monthlyStats": [...],
  "topAdmins": [...],
  "recentActivities": [...]
}
```

## Cấu trúc bảng

### 1. **product_stats**
```sql
CREATE TABLE `product_stats` (
  `id` int NOT NULL AUTO_INCREMENT,
  `product_id` varchar(36) NOT NULL,
  `total_articles` int DEFAULT 0,
  `total_reviews` int DEFAULT 0,
  `total_orders` int DEFAULT 0,
  `total_views` int DEFAULT 0,
  `total_likes` int DEFAULT 0,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_product_id` (`product_id`)
);
```

### 2. **system_stats**
```sql
CREATE TABLE `system_stats` (
  `id` int NOT NULL DEFAULT 1,
  `total_products` int DEFAULT 0,
  `total_articles` int DEFAULT 0,
  `total_reviews` int DEFAULT 0,
  `total_orders` int DEFAULT 0,
  `total_users` int DEFAULT 0,
  `total_revenue` decimal(15,2) DEFAULT 0.00,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
);
```

### 3. **admin_activity_log**
```sql
CREATE TABLE `admin_activity_log` (
  `id` int NOT NULL AUTO_INCREMENT,
  `admin_id` varchar(36) NOT NULL,
  `action` varchar(50) NOT NULL,
  `table_name` varchar(50) NOT NULL,
  `record_id` varchar(36) NOT NULL,
  `details` text,
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
);
```

## Lợi ích

### 1. **Hiệu suất cao:**
- Không cần tính toán thống kê mỗi lần truy vấn
- Dữ liệu được cập nhật real-time
- Giảm tải cho database

### 2. **Tính chính xác:**
- Số liệu luôn được cập nhật tự động
- Không có dữ liệu bị thiếu hoặc sai
- Đồng bộ giữa các bảng

### 3. **Dễ bảo trì:**
- Logic được tập trung trong trigger
- Không cần sửa code khi thay đổi logic
- Dễ dàng debug và theo dõi

### 4. **Bảo mật:**
- Log đầy đủ hoạt động của admin
- Theo dõi được ai làm gì, khi nào
- Hỗ trợ audit trail

## Lưu ý

### 1. **Performance:**
- Trigger có thể ảnh hưởng đến hiệu suất INSERT/UPDATE
- Nên có index phù hợp cho các bảng thống kê
- Monitor thời gian thực thi trigger

### 2. **Backup:**
- Backup thường xuyên các bảng thống kê
- Có thể rebuild thống kê từ dữ liệu gốc nếu cần

### 3. **Monitoring:**
- Theo dõi log hoạt động admin
- Kiểm tra tính nhất quán của dữ liệu
- Alert khi có lỗi trong trigger

## Troubleshooting

### 1. **Trigger không hoạt động:**
```sql
-- Kiểm tra trigger
SHOW TRIGGERS;

-- Kiểm tra log lỗi
SHOW ENGINE INNODB STATUS;
```

### 2. **Dữ liệu không đồng bộ:**
```sql
-- Rebuild thống kê
CALL rebuild_product_stats();
CALL rebuild_system_stats();
```

### 3. **Performance chậm:**
```sql
-- Kiểm tra index
SHOW INDEX FROM product_stats;
SHOW INDEX FROM system_stats;

-- Tối ưu query
EXPLAIN SELECT * FROM product_stats WHERE product_id = ?;
```
