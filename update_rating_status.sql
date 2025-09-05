-- Cập nhật bảng rating để thêm trường status cho quản lý trạng thái đánh giá
-- Trường status sẽ thay thế isApproved và isRejected để dễ quản lý hơn

-- Thêm trường status mới
ALTER TABLE `rating` 
ADD COLUMN `status` ENUM('pending', 'approved', 'rejected') DEFAULT 'pending' AFTER `rejectionReason`;

-- Cập nhật dữ liệu hiện tại dựa trên isApproved và isRejected
UPDATE `rating` 
SET `status` = CASE 
  WHEN `isApproved` = 1 THEN 'approved'
  WHEN `isRejected` = 1 THEN 'rejected'
  ELSE 'pending'
END;

-- Thêm index cho trường status mới
CREATE INDEX `idx_rating_status` ON `rating` (`status`);
CREATE INDEX `idx_rating_status_created` ON `rating` (`status`, `createdAt`);

-- Thêm comment để giải thích các giá trị
ALTER TABLE `rating` 
MODIFY COLUMN `status` ENUM('pending', 'approved', 'rejected') 
DEFAULT 'pending' 
COMMENT 'Trạng thái đánh giá: pending=chờ duyệt, approved=đã duyệt, rejected=bị từ chối';

-- Cập nhật comment cho các trường liên quan
ALTER TABLE `rating` 
MODIFY COLUMN `isApproved` tinyint(1) DEFAULT 0 COMMENT 'Đánh giá đã được duyệt (1=đã duyệt, 0=chưa duyệt)';

ALTER TABLE `rating` 
MODIFY COLUMN `isRejected` tinyint(1) DEFAULT 0 COMMENT 'Đánh giá bị từ chối (1=bị từ chối, 0=không bị từ chối)';

ALTER TABLE `rating` 
MODIFY COLUMN `rejectionReason` text DEFAULT NULL COMMENT 'Lý do từ chối đánh giá';

-- Thêm trường admin_id để lưu thông tin admin duyệt/từ chối
ALTER TABLE `rating` 
ADD COLUMN `admin_id` varchar(36) DEFAULT NULL AFTER `rejectionReason`,
ADD COLUMN `reviewedAt` timestamp NULL DEFAULT NULL AFTER `admin_id`;

-- Thêm comment cho trường mới
ALTER TABLE `rating` 
MODIFY COLUMN `admin_id` varchar(36) DEFAULT NULL COMMENT 'ID của admin duyệt/từ chối đánh giá';

ALTER TABLE `rating` 
MODIFY COLUMN `reviewedAt` timestamp NULL DEFAULT NULL COMMENT 'Thời gian admin duyệt/từ chối đánh giá';

-- Thêm index cho admin_id
CREATE INDEX `idx_rating_admin` ON `rating` (`admin_id`);

-- Thêm foreign key constraint cho admin_id (nếu có bảng admins)
-- ALTER TABLE `rating` 
-- ADD CONSTRAINT `fk_rating_admin` FOREIGN KEY (`admin_id`) REFERENCES `admins` (`id`) ON DELETE SET NULL;

-- Cập nhật view hoặc tạo view mới để dễ dàng truy vấn
CREATE OR REPLACE VIEW `rating_summary` AS
SELECT 
  COUNT(*) as total_reviews,
  SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) as approved_count,
  SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) as rejected_count,
  SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending_count,
  ROUND(SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 2) as approved_percentage,
  ROUND(SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 2) as rejected_percentage,
  ROUND(SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 2) as pending_percentage
FROM `rating` 
WHERE `deletedAt` IS NULL;

-- Hiển thị kết quả cập nhật
SELECT 
  'Cập nhật hoàn tất' as message,
  COUNT(*) as total_ratings,
  SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) as approved,
  SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) as rejected,
  SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending
FROM `rating`;
