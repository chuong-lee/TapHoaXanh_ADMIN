# Hướng dẫn khắc phục lỗi API Backend

## Vấn đề hiện tại
- Frontend đang cố gắng gọi API từ backend nhưng backend chưa được chạy
- Port 5000 trên macOS bị chiếm bởi AirTunes service
- Hiện tại đang sử dụng mock data để test UI

## Giải pháp

### Cách 1: Chạy Backend Server
1. Đảm bảo bạn có backend server (Node.js/Express, Laravel, Django, etc.)
2. Chạy backend trên port khác ngoài 5000 (ví dụ: 3001, 8000)
3. Cập nhật file `.env.local` với đúng API URL
4. Uncomment API call trong `BasicTableOne.tsx`

### Cách 2: Tắt AirTunes trên macOS (để dùng port 5000)
```bash
sudo launchctl unload -w /System/Library/LaunchDaemons/com.apple.AirPlayXPCHelper.plist
```

### Cách 3: Sử dụng JSON Server để mock API
```bash
# Cài đặt json-server
npm install -g json-server

# Tạo file db.json với mock data
# Chạy server
json-server --watch db.json --port 3001
```

## File cần cập nhật khi backend ready

### 1. Uncomment API call trong BasicTableOne.tsx
- Comment phần mock data
- Uncomment phần API call thật

### 2. Đảm bảo backend API response đúng format
```json
{
  "products": [
    {
      "id": 1,
      "name": "Product name",
      "price": 10000,
      "barcode": "123456789",
      "images": "image_url",
      "quantity": 100
      // ... other fields
    }
  ]
}
```

hoặc

```json
[
  {
    "id": 1,
    "name": "Product name",
    // ... other fields
  }
]
```

## Kiểm tra kết nối
```bash
curl http://localhost:YOUR_PORT/products
```
