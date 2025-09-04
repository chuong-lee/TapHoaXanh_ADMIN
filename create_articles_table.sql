-- Tạo bảng articles cho quản lý bài viết
CREATE TABLE IF NOT EXISTS `articles` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `content` longtext NOT NULL,
  `summary` text,
  `authorId` int NOT NULL,
  `category` varchar(100) NOT NULL,
  `tags` json DEFAULT NULL,
  `featuredImage` varchar(500) DEFAULT NULL,
  `images` json DEFAULT NULL,
  `isPublished` tinyint(1) DEFAULT 0,
  `isApproved` tinyint(1) DEFAULT 0,
  `isRejected` tinyint(1) DEFAULT 0,
  `rejectionReason` text DEFAULT NULL,
  `publishedAt` datetime DEFAULT NULL,
  `viewCount` int DEFAULT 0,
  `likeCount` int DEFAULT 0,
  `createdAt` datetime(6) DEFAULT CURRENT_TIMESTAMP(6),
  `updatedAt` datetime(6) DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  `deletedAt` datetime(6) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_author_id` (`authorId`),
  KEY `idx_category` (`category`),
  KEY `idx_status` (`isPublished`, `isApproved`, `isRejected`),
  KEY `idx_created_at` (`createdAt`),
  KEY `idx_published_at` (`publishedAt`),
  CONSTRAINT `fk_articles_author` FOREIGN KEY (`authorId`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Thêm indexes để tối ưu hiệu suất
CREATE INDEX `idx_articles_status_created` ON `articles` (`isPublished`, `isApproved`, `isRejected`, `createdAt`);
CREATE INDEX `idx_articles_category_status` ON `articles` (`category`, `isPublished`, `isApproved`);

-- Thêm dữ liệu mẫu
INSERT INTO `articles` (
  `title`, `content`, `summary`, `authorId`, `category`, `tags`, 
  `featuredImage`, `isPublished`, `isApproved`, `viewCount`, `likeCount`
) VALUES 
(
  'Hướng dẫn nấu ăn ngon và bổ dưỡng',
  'Nấu ăn là một nghệ thuật đòi hỏi sự kiên nhẫn và sáng tạo. Trong bài viết này, chúng ta sẽ tìm hiểu về các kỹ thuật nấu ăn cơ bản và nâng cao...',
  'Khám phá các bí quyết nấu ăn ngon, bổ dưỡng và an toàn cho sức khỏe gia đình.',
  1,
  'Công thức',
  '["nấu ăn", "công thức", "sức khỏe", "gia đình"]',
  'https://res.cloudinary.com/dlrqjti9s/image/upload/v1756114017/product-1_r3zkho.jpg',
  1,
  1,
  150,
  25
),
(
  'Lợi ích của rau củ hữu cơ đối với sức khỏe',
  'Rau củ hữu cơ không chỉ ngon mà còn rất tốt cho sức khỏe. Chúng chứa nhiều vitamin, khoáng chất và chất chống oxy hóa...',
  'Tìm hiểu về những lợi ích tuyệt vời của rau củ hữu cơ và cách chọn lựa sản phẩm chất lượng.',
  1,
  'Sức khỏe',
  '["rau củ", "hữu cơ", "sức khỏe", "dinh dưỡng"]',
  'https://res.cloudinary.com/dlrqjti9s/image/upload/v1756114017/product-1_r3zkho.jpg',
  1,
  1,
  89,
  12
),
(
  'Cách bảo quản thực phẩm tươi ngon lâu hơn',
  'Bảo quản thực phẩm đúng cách không chỉ giúp giữ được hương vị mà còn đảm bảo an toàn vệ sinh thực phẩm...',
  'Hướng dẫn chi tiết cách bảo quản các loại thực phẩm khác nhau để giữ được độ tươi ngon và dinh dưỡng.',
  2,
  'Hướng dẫn',
  '["bảo quản", "thực phẩm", "tươi ngon", "an toàn"]',
  'https://res.cloudinary.com/dlrqjti9s/image/upload/v1756109521/product-26_yvl5p5.jpg',
  0,
  1,
  45,
  8
),
(
  'Khuyến mãi đặc biệt tháng 12 - Giảm giá lên đến 50%',
  'Tháng 12 là thời điểm hoàn hảo để mua sắm với những ưu đãi đặc biệt. Chúng tôi mang đến cho bạn chương trình khuyến mãi hấp dẫn...',
  'Đừng bỏ lỡ cơ hội mua sắm với giá tốt nhất trong chương trình khuyến mãi đặc biệt tháng 12.',
  1,
  'Khuyến mãi',
  '["khuyến mãi", "giảm giá", "mua sắm", "tháng 12"]',
  'https://res.cloudinary.com/dlrqjti9s/image/upload/v1756109521/product-26_yvl5p5.jpg',
  1,
  1,
  234,
  67
),
(
  'Tin tức: Xu hướng tiêu dùng thực phẩm năm 2024',
  'Năm 2024 chứng kiến sự thay đổi lớn trong xu hướng tiêu dùng thực phẩm. Người tiêu dùng ngày càng quan tâm đến...',
  'Cập nhật những xu hướng mới nhất trong tiêu dùng thực phẩm và cách các doanh nghiệp thích ứng.',
  2,
  'Tin tức',
  '["xu hướng", "tiêu dùng", "thực phẩm", "2024"]',
  'https://res.cloudinary.com/dlrqjti9s/image/upload/v1756114017/product-1_r3zkho.jpg',
  0,
  0,
  12,
  3
);
