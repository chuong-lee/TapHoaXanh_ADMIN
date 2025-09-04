-- Cập nhật bảng rating để hỗ trợ đầy đủ tính năng quản lý đánh giá
-- Chạy các câu lệnh này để nâng cấp database schema

-- 1. Thêm các trường mới cho quản lý trạng thái
ALTER TABLE `rating` 
ADD COLUMN `isApproved` TINYINT(1) DEFAULT 0 AFTER `comment`,
ADD COLUMN `isRejected` TINYINT(1) DEFAULT 0 AFTER `isApproved`,
ADD COLUMN `rejectionReason` TEXT NULL AFTER `isRejected`;

-- 2. Thêm trường images cho đánh giá (nếu cần)
ALTER TABLE `rating` 
ADD COLUMN `images` JSON NULL AFTER `rejectionReason`;

-- 3. Thêm indexes để tối ưu hiệu suất
CREATE INDEX `idx_rating_status` ON `rating` (`isApproved`, `isRejected`);
CREATE INDEX `idx_rating_status_created` ON `rating` (`isApproved`, `isRejected`, `createdAt`);
CREATE INDEX `idx_rating_product_status` ON `rating` (`product_id`, `isApproved`, `isRejected`);

-- 4. Cập nhật dữ liệu hiện tại - đánh dấu tất cả đánh giá cũ là "đã duyệt"
UPDATE `rating` 
SET `isApproved` = 1, `isRejected` = 0 
WHERE `deletedAt` IS NULL;

-- 5. Kiểm tra kết quả
SELECT 
  COUNT(*) as total_reviews,
  SUM(CASE WHEN `isApproved` = 1 THEN 1 ELSE 0 END) as approved,
  SUM(CASE WHEN `isRejected` = 1 THEN 1 ELSE 0 END) as rejected,
  SUM(CASE WHEN `isApproved` = 0 AND `isRejected` = 0 THEN 1 ELSE 0 END) as pending
FROM `rating` 
WHERE `deletedAt` IS NULL;
