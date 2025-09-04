# Hệ thống quản lý tin tức (News Management)

## Tổng quan
Hệ thống quản lý tin tức cho phép admin duyệt và quản lý các bài viết, tin tức, khuyến mãi trên website. Hệ thống được xây dựng dựa trên cấu trúc bảng `news` có sẵn trong database.

## Tính năng chính

### 1. Quản lý tin tức
- **Xem danh sách**: Hiển thị tất cả tin tức với phân trang
- **Thêm mới**: Tạo tin tức mới với đầy đủ thông tin
- **Chỉnh sửa**: Cập nhật thông tin tin tức
- **Xóa**: Xóa tin tức (soft delete)
- **Xem chi tiết**: Modal hiển thị đầy đủ thông tin

### 2. Lọc và tìm kiếm
- **Lọc theo loại**: Tin tức, Khuyến mãi, Hướng dẫn, Công thức, Sức khỏe
- **Tìm kiếm**: Tìm kiếm theo tiêu đề hoặc nội dung
- **Phân trang**: Hiển thị 10, 20, hoặc 50 tin tức mỗi trang

### 3. Thống kê
- **Tổng tin tức**: Số lượng tin tức trong hệ thống
- **Đã xuất bản**: Tin tức có đầy đủ hình ảnh và tóm tắt
- **Tin nháp**: Tin tức thiếu thông tin
- **Lượt xem**: Tổng số lượt xem
- **Lượt thích**: Tổng số lượt thích
- **Bình luận**: Tổng số bình luận

## Cấu trúc Database

### Bảng `news`
```sql
- id: int (PK, auto increment)
- name: varchar(255) - Tiêu đề tin tức
- summary: text - Tóm tắt
- description: text - Nội dung chi tiết
- images: text - Hình ảnh
- views: int - Lượt xem
- likes: int - Lượt thích
- comments_count: int - Số bình luận
- author_id: int (FK) - ID tác giả
- category_id: int (FK) - ID danh mục
- type: varchar(50) - Loại tin tức
- createdAt: datetime - Ngày tạo
- updatedAt: datetime - Ngày cập nhật
- deletedAt: datetime - Ngày xóa (soft delete)
```

## API Endpoints

### 1. GET `/api/news`
Lấy danh sách tin tức với phân trang và lọc
```typescript
// Query parameters
- category_id: string - Lọc theo danh mục
- type: string - Lọc theo loại tin
- author_id: string - Lọc theo tác giả
- search: string - Tìm kiếm
- page: number - Trang hiện tại
- limit: number - Số lượng mỗi trang
```

### 2. POST `/api/news`
Tạo tin tức mới
```typescript
// Body
{
  name: string,        // Bắt buộc
  summary?: string,    // Tùy chọn
  description: string, // Bắt buộc
  images?: string,     // Tùy chọn
  author_id?: string,  // Tùy chọn
  category_id?: string,// Tùy chọn
  type?: string        // Tùy chọn
}
```

### 3. GET `/api/news/[id]`
Lấy chi tiết tin tức theo ID

### 4. PUT `/api/news/[id]`
Cập nhật tin tức
```typescript
// Body (tương tự POST)
```

### 5. DELETE `/api/news/[id]`
Xóa tin tức (soft delete)

### 6. GET `/api/news/stats`
Lấy thống kê tin tức
```typescript
// Response
{
  total: number,      // Tổng tin tức
  published: number,  // Đã xuất bản
  draft: number,      // Tin nháp
  views: number,      // Tổng lượt xem
  likes: number,      // Tổng lượt thích
  comments: number    // Tổng bình luận
}
```

## Cách sử dụng

### 1. Truy cập trang quản lý
- Đăng nhập vào hệ thống admin
- Vào menu "Quản lý tin tức" hoặc truy cập `/article`

### 2. Xem danh sách tin tức
- Hệ thống sẽ hiển thị danh sách tin tức với phân trang
- Sử dụng bộ lọc để tìm kiếm tin tức cụ thể
- Thay đổi số lượng hiển thị mỗi trang

### 3. Thêm tin tức mới
- Click nút "Thêm tin tức"
- Điền đầy đủ thông tin bắt buộc
- Upload hình ảnh (nếu có)
- Lưu tin tức

### 4. Chỉnh sửa tin tức
- Click nút chỉnh sửa (biểu tượng bút chì)
- Cập nhật thông tin cần thiết
- Lưu thay đổi

### 5. Xóa tin tức
- Click nút xóa (biểu tượng thùng rác)
- Xác nhận hành động xóa
- Tin tức sẽ được đánh dấu là đã xóa (không hiển thị trên website)

## Trạng thái tin tức

### 1. Đã xuất bản (Published)
- Có đầy đủ hình ảnh
- Có tóm tắt
- Hiển thị trên website

### 2. Tin nháp (Draft)
- Thiếu hình ảnh hoặc tóm tắt
- Chưa hoàn thiện
- Không hiển thị trên website

## Lưu ý quan trọng

1. **Soft Delete**: Tin tức khi xóa sẽ không bị xóa hoàn toàn khỏi database, chỉ đánh dấu `deletedAt`

2. **Validation**: Hệ thống yêu cầu tiêu đề và nội dung khi tạo/cập nhật tin tức

3. **Hình ảnh**: Hình ảnh được lưu dưới dạng URL string, không lưu trực tiếp file

4. **Phân quyền**: Chỉ admin mới có thể truy cập và quản lý tin tức

5. **Performance**: Hệ thống sử dụng indexing để tối ưu hiệu suất truy vấn

## Troubleshooting

### Lỗi thường gặp

1. **Không thể lấy danh sách tin tức**
   - Kiểm tra kết nối database
   - Kiểm tra quyền truy cập bảng `news`

2. **Không thể tạo tin tức mới**
   - Kiểm tra thông tin bắt buộc (tiêu đề, nội dung)
   - Kiểm tra định dạng dữ liệu

3. **Hình ảnh không hiển thị**
   - Kiểm tra URL hình ảnh có hợp lệ không
   - Kiểm tra quyền truy cập hình ảnh

### Hỗ trợ kỹ thuật
Nếu gặp vấn đề, vui lòng kiểm tra:
- Console log của trình duyệt
- Network tab để xem API calls
- Database connection
- File permissions

## Phát triển tương lai

1. **Rich Text Editor**: Tích hợp editor WYSIWYG cho nội dung
2. **Image Upload**: Hỗ trợ upload và quản lý hình ảnh
3. **SEO Tools**: Tối ưu hóa SEO cho tin tức
4. **Scheduling**: Lên lịch xuất bản tin tức
5. **Analytics**: Thống kê chi tiết về hiệu suất tin tức
