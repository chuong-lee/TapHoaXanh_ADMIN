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
