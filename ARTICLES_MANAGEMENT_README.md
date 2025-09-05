# Hướng dẫn quản lý bài viết

## Tổng quan
Hệ thống quản lý bài viết cho phép admin tạo, chỉnh sửa, xóa và quản lý các bài viết trên website.

## Các tính năng đã triển khai

### 1. **API Endpoints**

#### `/api/articles` (GET, POST)
- **GET**: Lấy danh sách bài viết với phân trang và lọc
- **POST**: Tạo bài viết mới

#### `/api/articles/[id]` (GET, PUT, DELETE)
- **GET**: Lấy thông tin chi tiết bài viết
- **PUT**: Cập nhật bài viết
- **DELETE**: Xóa bài viết (soft delete)

### 2. **Trang quản lý bài viết** (`/articles`)
- ✅ Danh sách bài viết với bảng hiển thị
- ✅ Tìm kiếm theo tiêu đề, nội dung
- ✅ Lọc theo phân loại và trạng thái
- ✅ Phân trang
- ✅ Nút "Thêm bài viết" và "Chỉnh sửa"

### 3. **Modal thêm/sửa bài viết**
- ✅ Form nhập thông tin đầy đủ
- ✅ Quản lý tags
- ✅ Chọn phân loại
- ✅ Upload ảnh đại diện
- ✅ Tùy chọn xuất bản ngay

## Cách sử dụng

### 1. **Truy cập trang quản lý**
```
http://localhost:3000/articles
```

### 2. **Thêm bài viết mới**
1. Click nút "Thêm bài viết" (màu xanh)
2. Điền thông tin:
   - **Tiêu đề**: Bắt buộc
   - **Nội dung**: Bắt buộc
   - **Tóm tắt**: Tùy chọn
   - **Phân loại**: Chọn từ dropdown
   - **Tags**: Thêm tags bằng cách nhập và nhấn Enter
   - **Ảnh đại diện**: URL ảnh
   - **Xuất bản ngay**: Checkbox
3. Click "Tạo bài viết"

### 3. **Chỉnh sửa bài viết**
1. Click icon "Chỉnh sửa" (màu xanh) trong cột "Thao tác"
2. Modal sẽ mở với thông tin hiện tại
3. Chỉnh sửa thông tin cần thiết
4. Click "Cập nhật"

### 4. **Xóa bài viết**
1. Click icon "Xóa" (màu đỏ) trong cột "Thao tác"
2. Xác nhận xóa
3. Bài viết sẽ bị xóa (soft delete)

### 5. **Tìm kiếm và lọc**
- **Tìm kiếm**: Nhập từ khóa và nhấn Enter hoặc click "Tìm"
- **Lọc theo phân loại**: Chọn từ dropdown
- **Lọc theo trạng thái**: Chọn trạng thái
- **Số lượng hiển thị**: Chọn 10, 20, hoặc 50 bài viết/trang

## Cấu trúc dữ liệu

### Bài viết (Article)
```typescript
interface Article {
  id: string;
  title: string;           // Tiêu đề
  content: string;         // Nội dung
  summary?: string;        // Tóm tắt
  category: string;        // Phân loại
  tags: string[];          // Tags
  featuredImage?: string;  // Ảnh đại diện
  isPublished: boolean;    // Đã xuất bản
  isApproved: boolean;     // Đã duyệt
  isRejected: boolean;     // Bị từ chối
  viewCount: number;       // Lượt xem
  likeCount: number;       // Lượt thích
  authorName: string;      // Tên tác giả
  authorImage: string;     // Ảnh tác giả
  createdAt: string;       // Ngày tạo
  updatedAt: string;       // Ngày cập nhật
}
```

## Các phân loại có sẵn
- Tin tức
- Khuyến mãi
- Hướng dẫn
- Công thức
- Sức khỏe
- Lối sống
- Kinh doanh
- Công nghệ
- Giáo dục
- Giải trí

## Trạng thái bài viết
- **Bản nháp**: Chưa xuất bản
- **Đã duyệt**: Đã được admin duyệt
- **Đã xuất bản**: Đã hiển thị công khai
- **Bị từ chối**: Bị admin từ chối

## Lưu ý kỹ thuật

### 1. **Database**
- Sử dụng bảng `articles` đã có sẵn
- Hỗ trợ soft delete với trường `deletedAt`
- Tự động cập nhật `createdAt` và `updatedAt`

### 2. **API Response**
```json
{
  "articles": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

### 3. **Error Handling**
- Validation đầu vào
- Xử lý lỗi database
- Thông báo lỗi thân thiện

## Mở rộng trong tương lai

### 1. **Tính năng có thể thêm**
- Upload ảnh trực tiếp
- Editor WYSIWYG
- Preview bài viết
- Lịch sử chỉnh sửa
- Phân quyền tác giả
- SEO metadata

### 2. **Tối ưu hóa**
- Cache API response
- Lazy loading
- Virtual scrolling cho danh sách lớn
- Search với debounce

## Troubleshooting

### 1. **Lỗi thường gặp**
- **"Không thể lấy danh sách bài viết"**: Kiểm tra kết nối database
- **"Thiếu thông tin bắt buộc"**: Đảm bảo điền đầy đủ tiêu đề và nội dung
- **"Tác giả không tồn tại"**: Kiểm tra authorId trong request

### 2. **Debug**
- Kiểm tra console log trong browser
- Kiểm tra network tab trong DevTools
- Kiểm tra server logs

## Kết luận
Hệ thống quản lý bài viết đã được triển khai đầy đủ với các tính năng cơ bản. Admin có thể dễ dàng tạo, chỉnh sửa và quản lý bài viết thông qua giao diện thân thiện.

