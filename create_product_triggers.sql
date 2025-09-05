-- Tạo trigger để tự động cập nhật số lượng bài viết khi thêm/xóa sản phẩm

-- 1. Trigger khi thêm sản phẩm mới
DELIMITER //
CREATE TRIGGER after_product_insert
AFTER INSERT ON product
FOR EACH ROW
BEGIN
    -- Cập nhật thống kê tổng quan
    INSERT INTO product_stats (product_id, total_articles, total_reviews, total_orders, created_at, updated_at)
    VALUES (NEW.id, 0, 0, 0, NOW(), NOW())
    ON DUPLICATE KEY UPDATE
        updated_at = NOW();
    
    -- Cập nhật thống kê tổng thể
    UPDATE system_stats 
    SET total_products = total_products + 1,
        updated_at = NOW()
    WHERE id = 1;
    
    -- Log hoạt động
    INSERT INTO admin_activity_log (admin_id, action, table_name, record_id, details, created_at)
    VALUES (NEW.created_by, 'INSERT', 'product', NEW.id, CONCAT('Thêm sản phẩm: ', NEW.name), NOW());
END //
DELIMITER ;

-- 2. Trigger khi cập nhật sản phẩm
DELIMITER //
CREATE TRIGGER after_product_update
AFTER UPDATE ON product
FOR EACH ROW
BEGIN
    -- Cập nhật thống kê sản phẩm
    UPDATE product_stats 
    SET updated_at = NOW()
    WHERE product_id = NEW.id;
    
    -- Log hoạt động
    INSERT INTO admin_activity_log (admin_id, action, table_name, record_id, details, created_at)
    VALUES (NEW.updated_by, 'UPDATE', 'product', NEW.id, CONCAT('Cập nhật sản phẩm: ', NEW.name), NOW());
END //
DELIMITER ;

-- 3. Trigger khi xóa sản phẩm (soft delete)
DELIMITER //
CREATE TRIGGER after_product_delete
AFTER UPDATE ON product
FOR EACH ROW
BEGIN
    IF NEW.deletedAt IS NOT NULL AND OLD.deletedAt IS NULL THEN
        -- Sản phẩm bị xóa (soft delete)
        
        -- Cập nhật thống kê tổng thể
        UPDATE system_stats 
        SET total_products = total_products - 1,
            updated_at = NOW()
        WHERE id = 1;
        
        -- Log hoạt động
        INSERT INTO admin_activity_log (admin_id, action, table_name, record_id, details, created_at)
        VALUES (NEW.deleted_by, 'DELETE', 'product', NEW.id, CONCAT('Xóa sản phẩm: ', NEW.name), NOW());
    END IF;
END //
DELIMITER ;

-- 4. Trigger khi thêm bài viết mới
DELIMITER //
CREATE TRIGGER after_article_insert
AFTER INSERT ON articles
FOR EACH ROW
BEGIN
    -- Cập nhật số lượng bài viết của sản phẩm
    UPDATE product_stats 
    SET total_articles = total_articles + 1,
        updated_at = NOW()
    WHERE product_id = NEW.productId;
    
    -- Cập nhật thống kê tổng thể
    UPDATE system_stats 
    SET total_articles = total_articles + 1,
        updated_at = NOW()
    WHERE id = 1;
    
    -- Log hoạt động
    INSERT INTO admin_activity_log (admin_id, action, table_name, record_id, details, created_at)
    VALUES (NEW.authorId, 'INSERT', 'articles', NEW.id, CONCAT('Thêm bài viết: ', NEW.title), NOW());
END //
DELIMITER ;

-- 5. Trigger khi xóa bài viết (soft delete)
DELIMITER //
CREATE TRIGGER after_article_delete
AFTER UPDATE ON articles
FOR EACH ROW
BEGIN
    IF NEW.deletedAt IS NOT NULL AND OLD.deletedAt IS NULL THEN
        -- Bài viết bị xóa (soft delete)
        
        -- Cập nhật số lượng bài viết của sản phẩm
        UPDATE product_stats 
        SET total_articles = total_articles - 1,
            updated_at = NOW()
        WHERE product_id = OLD.productId;
        
        -- Cập nhật thống kê tổng thể
        UPDATE system_stats 
        SET total_articles = total_articles - 1,
            updated_at = NOW()
        WHERE id = 1;
        
        -- Log hoạt động
        INSERT INTO admin_activity_log (admin_id, action, table_name, record_id, details, created_at)
        VALUES (NEW.deleted_by, 'DELETE', 'articles', NEW.id, CONCAT('Xóa bài viết: ', NEW.title), NOW());
    END IF;
END //
DELIMITER ;

-- 6. Trigger khi thêm đánh giá mới
DELIMITER //
CREATE TRIGGER after_review_insert
AFTER INSERT ON rating
FOR EACH ROW
BEGIN
    -- Cập nhật số lượng đánh giá của sản phẩm
    UPDATE product_stats 
    SET total_reviews = total_reviews + 1,
        updated_at = NOW()
    WHERE product_id = NEW.product_id;
    
    -- Cập nhật thống kê tổng thể
    UPDATE system_stats 
    SET total_reviews = total_reviews + 1,
        updated_at = NOW()
    WHERE id = 1;
    
    -- Cập nhật rating trung bình của sản phẩm
    UPDATE product 
    SET avg_rating = (
        SELECT AVG(rating) 
        FROM rating 
        WHERE product_id = NEW.product_id AND deletedAt IS NULL
    ),
    total_reviews = (
        SELECT COUNT(*) 
        FROM rating 
        WHERE product_id = NEW.product_id AND deletedAt IS NULL
    )
    WHERE id = NEW.product_id;
END //
DELIMITER ;

-- 7. Trigger khi cập nhật đánh giá
DELIMITER //
CREATE TRIGGER after_review_update
AFTER UPDATE ON rating
FOR EACH ROW
BEGIN
    IF NEW.rating != OLD.rating THEN
        -- Rating thay đổi, cập nhật rating trung bình
        UPDATE product 
        SET avg_rating = (
            SELECT AVG(rating) 
            FROM rating 
            WHERE product_id = NEW.product_id AND deletedAt IS NULL
        )
        WHERE id = NEW.product_id;
    END IF;
    
    -- Cập nhật thống kê sản phẩm
    UPDATE product_stats 
    SET updated_at = NOW()
    WHERE product_id = NEW.product_id;
END //
DELIMITER ;

-- 8. Trigger khi xóa đánh giá (soft delete)
DELIMITER //
CREATE TRIGGER after_review_delete
AFTER UPDATE ON rating
FOR EACH ROW
BEGIN
    IF NEW.deletedAt IS NOT NULL AND OLD.deletedAt IS NULL THEN
        -- Đánh giá bị xóa (soft delete)
        
        -- Cập nhật số lượng đánh giá của sản phẩm
        UPDATE product_stats 
        SET total_reviews = total_reviews - 1,
            updated_at = NOW()
        WHERE product_id = OLD.product_id;
        
        -- Cập nhật thống kê tổng thể
        UPDATE system_stats 
        SET total_reviews = total_reviews - 1,
            updated_at = NOW()
        WHERE id = 1;
        
        -- Cập nhật rating trung bình của sản phẩm
        UPDATE product 
        SET avg_rating = (
            SELECT AVG(rating) 
            FROM rating 
            WHERE product_id = OLD.product_id AND deletedAt IS NULL
        ),
        total_reviews = (
            SELECT COUNT(*) 
            FROM rating 
            WHERE product_id = OLD.product_id AND deletedAt IS NULL
        )
        WHERE id = OLD.product_id;
    END IF;
END //
DELIMITER ;

-- Tạo bảng product_stats để lưu thống kê sản phẩm
CREATE TABLE IF NOT EXISTS `product_stats` (
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
  UNIQUE KEY `uk_product_id` (`product_id`),
  KEY `idx_total_articles` (`total_articles`),
  KEY `idx_total_reviews` (`total_reviews`),
  KEY `idx_total_orders` (`total_orders`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tạo bảng system_stats để lưu thống kê tổng thể
CREATE TABLE IF NOT EXISTS `system_stats` (
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tạo bảng admin_activity_log để lưu log hoạt động
CREATE TABLE IF NOT EXISTS `admin_activity_log` (
  `id` int NOT NULL AUTO_INCREMENT,
  `admin_id` varchar(36) NOT NULL,
  `action` varchar(50) NOT NULL,
  `table_name` varchar(50) NOT NULL,
  `record_id` varchar(36) NOT NULL,
  `details` text,
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_admin_id` (`admin_id`),
  KEY `idx_action` (`action`),
  KEY `idx_table_name` (`table_name`),
  KEY `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Khởi tạo dữ liệu cho system_stats
INSERT INTO `system_stats` (id, total_products, total_articles, total_reviews, total_orders, total_users, total_revenue)
SELECT 1, 
       COUNT(*) as total_products,
       0 as total_articles,
       0 as total_reviews,
       0 as total_orders,
       0 as total_users,
       0.00 as total_revenue
FROM product 
WHERE deletedAt IS NULL
ON DUPLICATE KEY UPDATE
    total_products = VALUES(total_products),
    updated_at = NOW();

-- Khởi tạo dữ liệu cho product_stats
INSERT INTO `product_stats` (product_id, total_articles, total_reviews, total_orders)
SELECT 
    p.id,
    0 as total_articles,
    COALESCE(r.review_count, 0) as total_reviews,
    0 as total_orders
FROM product p
LEFT JOIN (
    SELECT product_id, COUNT(*) as review_count
    FROM rating 
    WHERE deletedAt IS NULL
    GROUP BY product_id
) r ON p.id = r.product_id
WHERE p.deletedAt IS NULL
ON DUPLICATE KEY UPDATE
    total_reviews = VALUES(total_reviews),
    updated_at = NOW();

-- Cập nhật thống kê tổng thể
UPDATE system_stats 
SET total_reviews = (
    SELECT COUNT(*) 
    FROM rating 
    WHERE deletedAt IS NULL
),
updated_at = NOW()
WHERE id = 1;
