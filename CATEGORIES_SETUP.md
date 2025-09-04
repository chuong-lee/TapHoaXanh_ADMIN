# Hướng dẫn thiết lập hệ thống phân loại bài viết

## Vấn đề hiện tại
API news đang bị lỗi vì bảng `categories` chưa tồn tại trong database.

## Giải pháp

### 1. Tạo bảng categories
Chạy script SQL sau để tạo bảng categories:

```sql
-- Tạo bảng categories cho quản lý phân loại bài viết
CREATE TABLE IF NOT EXISTS `categories` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `description` text,
  `slug` varchar(100) UNIQUE,
  `color` varchar(7) DEFAULT '#3B82F6',
  `icon` varchar(10) DEFAULT '📰',
  `createdAt` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deletedAt` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_name` (`name`),
  KEY `idx_slug` (`slug`),
  KEY `idx_created_at` (`createdAt`),
  KEY `idx_deleted_at` (`deletedAt`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Thêm dữ liệu mẫu cho categories
INSERT INTO `categories` (
  `name`, `description`, `slug`, `color`, `icon`
) VALUES 
('Tin tức', 'Các tin tức mới nhất và cập nhật', 'tin-tuc', '#3B82F6', '📰'),
('Khuyến mãi', 'Các chương trình khuyến mãi và ưu đãi', 'khuyen-mai', '#EF4444', '🎉'),
('Hướng dẫn', 'Hướng dẫn và tips hữu ích', 'huong-dan', '#10B981', '📚'),
('Công thức', 'Các công thức nấu ăn ngon', 'cong-thuc', '#F59E0B', '👨‍🍳'),
('Sức khỏe', 'Thông tin về sức khỏe và dinh dưỡng', 'suc-khoe', '#8B5CF6', '💚'),
('Lối sống', 'Phong cách sống và xu hướng', 'loi-song', '#EC4899', '🌟'),
('Kinh doanh', 'Tin tức về kinh doanh và thị trường', 'kinh-doanh', '#06B6D4', '💼'),
('Công nghệ', 'Công nghệ mới và xu hướng', 'cong-nghe', '#84CC16', '💻'),
('Giáo dục', 'Thông tin giáo dục và học tập', 'giao-duc', '#F97316', '🎓'),
('Giải trí', 'Tin tức giải trí và văn hóa', 'giai-tri', '#A855F7', '🎭');

-- Thêm indexes để tối ưu hiệu suất
CREATE INDEX `idx_categories_status_created` ON `categories` (`deletedAt`, `createdAt`);
CREATE INDEX `idx_categories_name_status` ON `categories` (`name`, `deletedAt`);
```

### 2. Các API endpoints đã có

#### API News chính (`/api/news`)
- ✅ Lấy danh sách tin tức với thông tin phân loại
- ✅ Hỗ trợ lọc theo `category_id`, `type`, `author_id`, `search`
- ✅ Trả về: `categoryName`, `categoryDescription`, `categoryColor`, `categoryIcon`

#### API Phân loại (`/api/news/categories`)
- ✅ Lấy danh sách tất cả phân loại
- ✅ Tạo phân loại mới
- ✅ Hỗ trợ tìm kiếm và phân trang
- ✅ Fallback về dữ liệu mẫu nếu bảng chưa tồn tại

#### API Loại tin tức (`/api/news/types`)
- ✅ Lấy danh sách các loại tin tức có sẵn
- ✅ Chuyển đổi type thành label tiếng Việt

#### API Bài viết theo loại (`/api/news/by-type/[type]`)
- ✅ Lấy bài viết theo loại cụ thể
- ✅ Hỗ trợ phân trang

#### API Bài viết theo phân loại (`/api/news/by-category/[categoryId]`)
- ✅ Lấy bài viết theo phân loại cụ thể
- ✅ Hỗ trợ phân trang

### 3. Cách sử dụng

#### Lấy tất cả bài viết với phân loại:
```bash
GET /api/news
```

#### Lấy danh sách phân loại:
```bash
GET /api/news/categories
```

#### Lấy bài viết theo loại:
```bash
GET /api/news/by-type/news
GET /api/news/by-type/promotion
GET /api/news/by-type/guide
```

#### Lấy bài viết theo phân loại:
```bash
GET /api/news/by-category/1
```

### 4. Cấu trúc dữ liệu trả về

#### Bài viết với phân loại:
```json
{
  "id": "1",
  "name": "Tên bài viết",
  "category_id": "1",
  "categoryName": "Tin tức",
  "categoryDescription": "Các tin tức mới nhất và cập nhật",
  "categoryColor": "#3B82F6",
  "categoryIcon": "📰",
  "type": "news"
}
```

#### Phân loại:
```json
{
  "id": "1",
  "name": "Tin tức",
  "description": "Các tin tức mới nhất và cập nhật",
  "slug": "tin-tuc",
  "color": "#3B82F6",
  "icon": "📰",
  "newsCount": 5
}
```

### 5. Các loại tin tức hỗ trợ

| Type | Label | Mô tả | Màu | Icon |
|------|-------|-------|-----|------|
| news | Tin tức | Các tin tức mới nhất và cập nhật | #3B82F6 | 📰 |
| promotion | Khuyến mãi | Các chương trình khuyến mãi và ưu đãi | #EF4444 | 🎉 |
| guide | Hướng dẫn | Hướng dẫn và tips hữu ích | #10B981 | 📚 |
| recipe | Công thức | Các công thức nấu ăn ngon | #F59E0B | 👨‍🍳 |
| health | Sức khỏe | Thông tin về sức khỏe và dinh dưỡng | #8B5CF6 | 💚 |
| lifestyle | Lối sống | Phong cách sống và xu hướng | #EC4899 | 🌟 |

### 6. Lưu ý

- API sẽ tự động fallback về dữ liệu mẫu nếu bảng `categories` chưa tồn tại
- Để có đầy đủ tính năng, hãy chạy script tạo bảng `categories` trước
- Tất cả API đều hỗ trợ phân trang và tìm kiếm
- Hỗ trợ soft delete cho categories
