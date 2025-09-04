-- Tạo bảng rating với đầy đủ trường cho quản lý đánh giá
CREATE TABLE IF NOT EXISTS `rating` (
  `id` varchar(36) NOT NULL,
  `user_id` varchar(36) NOT NULL,
  `product_id` varchar(36) NOT NULL,
  `rating` int NOT NULL CHECK (rating >= 1 AND rating <= 5),
  `comment` text,
  `images` json DEFAULT NULL,
  `isApproved` tinyint(1) DEFAULT 0,
  `isRejected` tinyint(1) DEFAULT 0,
  `rejectionReason` text DEFAULT NULL,
  `createdAt` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deletedAt` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_product_id` (`product_id`),
  KEY `idx_rating` (`rating`),
  KEY `idx_status` (`isApproved`, `isRejected`),
  KEY `idx_created_at` (`createdAt`),
  CONSTRAINT `fk_rating_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_rating_product` FOREIGN KEY (`product_id`) REFERENCES `product` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Thêm indexes để tối ưu hiệu suất
CREATE INDEX `idx_rating_status_created` ON `rating` (`isApproved`, `isRejected`, `createdAt`);
CREATE INDEX `idx_rating_product_status` ON `rating` (`product_id`, `isApproved`, `isRejected`);
