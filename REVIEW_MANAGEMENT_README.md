# HƯỚNG DẪN SỬ DỤNG CHỨC NĂNG QUẢN LÝ ĐÁNH GIÁ

## Tổng quan

Chức năng quản lý đánh giá cho phép admin duyệt, từ chối và quản lý các đánh giá sản phẩm từ khách hàng. Hệ thống hỗ trợ đầy đủ các tính năng CRUD với giao diện thân thiện và thống kê chi tiết.

## Cấu trúc dự án

```
src/
├── app/
│   ├── (admin)/
│   │   └── review/
│   │       └── page.tsx              # Giao diện quản lý đánh giá
│   └── api/
│       └── reviews/
│           ├── route.ts              # API lấy danh sách và tạo đánh giá
│           ├── count/route.ts        # API thống kê đánh giá
│           └── [id]/route.ts         # API cập nhật/xóa đánh giá
├── components/
│   └── review/
│       └── ReviewStats.tsx           # Component hiển thị thống kê
└── interface/
    └── IReview.tsx                   # Định nghĩa kiểu dữ liệu
```

## Cài đặt và thiết lập

### 1. Cài đặt dependencies

```bash
npm install
```

### 2. Thiết lập database

Chạy file SQL để tạo bảng rating:

```sql
-- Tạo bảng rating với đầy đủ trường
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
```

### 3. Cấu hình database

Cập nhật thông tin kết nối database trong `src/lib/database.ts`:

```typescript
const dbConfig = {
  host: 'your_host',
  port: your_port,
  user: 'your_username',
  password: 'your_password',
  database: 'your_database',
  ssl: {
    rejectUnauthorized: false
  }
};
```

## Tính năng chính

### 1. Thống kê đánh giá
- Tổng số đánh giá
- Số đánh giá đã duyệt/chờ duyệt/bị từ chối
- Tỷ lệ duyệt và đánh giá trung bình
- Phân bố số sao (1-5)

### 2. Quản lý đánh giá
- **Xem danh sách**: Hiển thị tất cả đánh giá với phân trang
- **Lọc**: Theo số sao, trạng thái, sản phẩm
- **Tìm kiếm**: Theo tên sản phẩm, người dùng, nội dung
- **Duyệt**: Chấp nhận đánh giá
- **Từ chối**: Từ chối với lý do cụ thể
- **Xóa**: Xóa đánh giá (soft delete)
- **Xem chi tiết**: Modal hiển thị thông tin đầy đủ

### 3. Phân trang và hiệu suất
- Phân trang với 10/20/50 items mỗi trang
- Lazy loading dữ liệu
- Indexes database để tối ưu truy vấn

## API Endpoints

### GET /api/reviews
Lấy danh sách đánh giá với phân trang và lọc

**Query parameters:**
- `page`: Số trang (mặc định: 1)
- `limit`: Số lượng mỗi trang (mặc định: 20)
- `rating`: Lọc theo số sao (1-5)
- `status`: Lọc theo trạng thái (approved/rejected/pending)
- `productId`: Lọc theo sản phẩm

**Response:**
```json
{
  "reviews": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

### POST /api/reviews
Tạo đánh giá mới

**Body:**
```json
{
  "productId": "uuid",
  "userId": "uuid",
  "rating": 5,
  "comment": "Sản phẩm rất tốt!",
  "images": ["url1", "url2"]
}
```

### PUT /api/reviews/[id]
Cập nhật đánh giá

**Actions:**
- `approve`: Duyệt đánh giá
- `reject`: Từ chối đánh giá
- `update`: Cập nhật thông tin

### DELETE /api/reviews/[id]
Xóa đánh giá (soft delete)

### GET /api/reviews/count
Lấy thống kê đánh giá

**Response:**
```json
{
  "total": 100,
  "approved": 80,
  "pending": 15,
  "rejected": 5,
  "ratingCounts": {
    "5": 50,
    "4": 30,
    "3": 15,
    "2": 3,
    "1": 2
  },
  "summary": {
    "approvalRate": 80,
    "averageRating": 4.2
  }
}
```

## Sử dụng giao diện

### 1. Truy cập trang quản lý
- Đăng nhập với quyền admin
- Vào menu "Quản lý đánh giá" trong sidebar

### 2. Xem thống kê
- Thống kê tổng quan hiển thị ở đầu trang
- Các chỉ số được cập nhật real-time

### 3. Tìm kiếm và lọc
- Sử dụng thanh tìm kiếm để tìm đánh giá cụ thể
- Áp dụng bộ lọc theo số sao và trạng thái
- Chọn số lượng hiển thị mỗi trang

### 4. Quản lý đánh giá
- **Duyệt**: Click nút ✓ (màu xanh) để duyệt
- **Từ chối**: Click nút ✗ (màu đỏ) và nhập lý do
- **Xem chi tiết**: Click nút 👁 (màu xanh) để xem thông tin đầy đủ
- **Xóa**: Click nút 🗑 (màu đỏ) để xóa

### 5. Phân trang
- Sử dụng nút "Trước/Sau" để di chuyển giữa các trang
- Click số trang cụ thể để chuyển nhanh

## Xử lý lỗi

### 1. Lỗi kết nối database
- Kiểm tra thông tin kết nối
- Đảm bảo database server đang hoạt động
- Kiểm tra firewall và network

### 2. Lỗi validation
- Đánh giá phải từ 1-5 sao
- Lý do từ chối không được để trống
- User chỉ được đánh giá mỗi sản phẩm một lần

### 3. Lỗi quyền truy cập
- Đảm bảo user có quyền admin
- Kiểm tra middleware authentication

## Tùy chỉnh và mở rộng

### 1. Thêm trường mới
- Cập nhật interface `IReview`
- Thêm trường vào database
- Cập nhật API và giao diện

### 2. Thêm tính năng mới
- Tạo component mới trong `src/components/review/`
- Thêm API endpoint mới
- Cập nhật giao diện chính

### 3. Tùy chỉnh giao diện
- Sửa đổi CSS classes trong Tailwind
- Thay đổi layout và responsive design
- Tùy chỉnh icons và màu sắc

## Bảo mật

### 1. Authentication
- Kiểm tra quyền admin trước khi cho phép truy cập
- Validate session và token

### 2. Input validation
- Sanitize input từ user
- Kiểm tra quyền sở hữu trước khi sửa/xóa
- Sử dụng prepared statements để tránh SQL injection

### 3. Rate limiting
- Giới hạn số request từ mỗi IP
- Log các hoạt động quan trọng

## Troubleshooting

### 1. Đánh giá không hiển thị
- Kiểm tra kết nối database
- Kiểm tra quyền truy cập bảng
- Xem log lỗi trong console

### 2. Không thể duyệt/từ chối
- Kiểm tra quyền admin
- Kiểm tra trạng thái đánh giá
- Xem log API response

### 3. Hiệu suất chậm
- Kiểm tra indexes database
- Tối ưu queries
- Sử dụng caching nếu cần

## Liên hệ hỗ trợ

Nếu gặp vấn đề hoặc cần hỗ trợ, vui lòng:
1. Kiểm tra log lỗi
2. Xem documentation này
3. Liên hệ team development

---

**Phiên bản**: 1.0.0  
**Cập nhật lần cuối**: 2024  
**Tác giả**: Development Team
