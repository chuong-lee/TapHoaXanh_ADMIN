# 📊 API Endpoints cho Báo cáo Doanh thu

## 🎯 Tổng quan
Dự án đã được cập nhật với các báo cáo doanh thu theo ngày, tuần và tháng, bao gồm tính năng so sánh phần trăm tăng/giảm và lịch sử doanh thu chi tiết. **Lưu ý quan trọng**: Tất cả các biểu đồ chỉ hiển thị dữ liệu cho thời gian đã qua, không hiển thị các tháng/ngày chưa đến.

## 📈 Các API Endpoints cần thiết

### 1. **Doanh thu theo ngày trong tuần**
```
GET /order/revenue-daily
Params:
- year: number (năm hiện tại)
- week: number (tuần hiện tại)

Response: number[] (7 số tương ứng 7 ngày trong tuần)
```

### 2. **Doanh thu theo tuần trong tháng**
```
GET /order/revenue-weekly
Params:
- year: number (năm hiện tại)
- month: number (tháng hiện tại)

Response: number[] (5 số tương ứng 5 tuần trong tháng)
```

### 3. **Doanh thu hôm nay**
```
GET /order/revenue-today
Response: number (tổng doanh thu hôm nay)
```

### 4. **Doanh thu hôm qua**
```
GET /order/revenue-yesterday
Response: number (tổng doanh thu hôm qua)
```

### 5. **Doanh thu tuần này**
```
GET /order/revenue-week
Response: number (tổng doanh thu tuần hiện tại)
```

### 6. **Doanh thu tuần trước**
```
GET /order/revenue-last-week
Response: number (tổng doanh thu tuần trước)
```

### 7. **Doanh thu tháng này**
```
GET /order/revenue-month-current
Response: number (tổng doanh thu tháng hiện tại)
```

### 8. **Doanh thu tháng trước**
```
GET /order/revenue-last-month
Response: number (tổng doanh thu tháng trước)
```

### 9. **Doanh thu theo tháng (từ tháng 5)**
```
GET /order/revenue-month-range
Params:
- year: number (năm hiện tại)
- startMonth: number (5 - tháng bắt đầu)
- endMonth: number (tháng hiện tại)

Response: number[] (doanh thu từ tháng 5 đến tháng hiện tại)
```

### 10. **Lịch sử doanh thu theo ngày**
```
GET /order/revenue-daily-history
Params:
- year: number (năm được chọn)
- month: number (tháng được chọn)

Response: number[] (doanh thu từng ngày trong tháng, chỉ hiển thị đến ngày hiện tại nếu là tháng hiện tại)
```

### 11. **Lịch sử doanh thu theo tuần**
```
GET /order/revenue-weekly-history
Params:
- year: number (năm được chọn)
- month: number (tháng được chọn)

Response: number[] (doanh thu từng tuần trong tháng, chỉ hiển thị đến tuần hiện tại nếu là tháng hiện tại)
```

### 12. **Lịch sử doanh thu theo tháng**
```
GET /order/revenue-monthly-history
Params:
- year: number (năm được chọn)

Response: number[] (doanh thu từng tháng trong năm, chỉ hiển thị đến tháng hiện tại nếu là năm hiện tại)
```

## 🔧 API Endpoints hiện có (đã hoạt động)

### 1. **Tổng doanh thu**
```
GET /order/revenue
Response: number (tổng doanh thu tất cả thời gian)
```

### 2. **Doanh thu theo tháng (cũ)**
```
GET /order/revenue-month
Params:
- year: number

Response: number[] (12 số tương ứng 12 tháng)
```

### 3. **Số lượng đơn hàng**
```
GET /order/count
Response: number (tổng số đơn hàng)
```

### 4. **Số lượng khách hàng**
```
GET /users/count
Response: number (tổng số khách hàng)
```

## 🎨 Components đã tạo

### 1. **DailyRevenueChart** (`src/components/ecommerce/DailyRevenueChart.tsx`)
- Biểu đồ đường hiển thị doanh thu theo ngày trong tuần
- Sử dụng ApexCharts với màu xanh lá
- Hiển thị 7 ngày: Thứ 2 đến Chủ nhật

### 2. **WeeklyRevenueChart** (`src/components/ecommerce/WeeklyRevenueChart.tsx`)
- Biểu đồ area hiển thị doanh thu theo tuần trong tháng
- Sử dụng ApexCharts với màu cam
- Hiển thị 5 tuần trong tháng

### 3. **RevenueOverview** (`src/components/ecommerce/RevenueOverview.tsx`) - **ĐÃ CẬP NHẬT**
- Cards hiển thị tổng quan doanh thu với so sánh phần trăm
- Doanh thu hôm nay vs hôm qua (màu xanh lá)
- Doanh thu tuần này vs tuần trước (màu xanh dương)
- Doanh thu tháng này vs tháng trước (màu tím)
- Hiển thị phần trăm tăng/giảm với màu sắc và icon phù hợp

### 4. **RevenueComparisonChart** (`src/components/ecommerce/RevenueComparisonChart.tsx`) - **MỚI**
- Biểu đồ so sánh doanh thu tuần này vs tuần trước
- Sử dụng ApexCharts với 2 đường màu khác nhau
- Hiển thị tổng doanh thu và phần trăm thay đổi
- Legend để phân biệt 2 chuỗi dữ liệu

### 5. **MonthlySalesChart** (`src/components/ecommerce/MonthlySalesChart.tsx`) - **ĐÃ CẬP NHẬT**
- Biểu đồ cột hiển thị doanh thu từ tháng 5 đến tháng hiện tại
- Sử dụng ApexCharts với màu xanh dương
- **Logic thông minh**: Chỉ hiển thị từ tháng 5 đến tháng hiện tại
- API mới: `/order/revenue-month-range`

### 6. **DailyRevenueHistory** (`src/components/ecommerce/DailyRevenueHistory.tsx`) - **MỚI**
- Biểu đồ cột hiển thị lịch sử doanh thu theo từng ngày trong tháng
- Sử dụng ApexCharts với màu xanh dương
- **Dropdown thông minh**: Chỉ hiển thị tháng đã qua hoặc tháng hiện tại
- **Logic thông minh**: Nếu là tháng hiện tại, chỉ hiển thị đến ngày hiện tại
- Hiển thị tổng doanh thu và trung bình/ngày
- API: `/order/revenue-daily-history`

### 7. **WeeklyRevenueHistory** (`src/components/ecommerce/WeeklyRevenueHistory.tsx`) - **MỚI**
- Biểu đồ area hiển thị lịch sử doanh thu theo từng tuần trong tháng
- Sử dụng ApexCharts với màu cam
- **Dropdown thông minh**: Chỉ hiển thị tháng đã qua hoặc tháng hiện tại
- **Logic thông minh**: Nếu là tháng hiện tại, chỉ hiển thị đến tuần hiện tại
- Hiển thị tổng doanh thu và trung bình/tuần
- API: `/order/revenue-weekly-history`

### 8. **MonthlyRevenueHistory** (`src/components/ecommerce/MonthlyRevenueHistory.tsx`) - **MỚI**
- Biểu đồ đường hiển thị lịch sử doanh thu theo từng tháng trong năm
- Sử dụng ApexCharts với màu tím
- **Dropdown thông minh**: Chỉ hiển thị năm đã qua hoặc năm hiện tại
- **Logic thông minh**: Nếu là năm hiện tại, chỉ hiển thị đến tháng hiện tại
- Hiển thị tổng, trung bình, cao nhất, thấp nhất
- API: `/order/revenue-monthly-history`

## 📱 Layout Dashboard

Dashboard hiện tại có layout như sau:

```
┌─────────────────────────────────────┐
│           EcommerceMetrics          │ (Tổng quan: khách hàng, đơn hàng, doanh thu)
├─────────────────────────────────────┤
│        RevenueOverview              │ (Doanh thu: hôm nay, tuần, tháng + % thay đổi)
├─────────────────┬───────────────────┤
│ DailyRevenue    │ WeeklyRevenue     │ (Biểu đồ ngày + tuần)
├─────────────────┴───────────────────┤
│        RevenueComparisonChart       │ (So sánh tuần này vs tuần trước)
├─────────────────────────────────────┤
│           MonthlySalesChart         │ (Biểu đồ tháng từ T5 đến hiện tại)
├─────────────────────────────────────┤
│           RecentOrders              │ (Top sản phẩm bán chạy)
└─────────────────────────────────────┘
```

## 📊 Trang Lịch sử Doanh thu

Trang mới `/revenue-history` có layout như sau:

```
┌─────────────────────────────────────┐
│           DailyRevenueHistory       │ (Lịch sử theo ngày, chỉ hiển thị thời gian đã qua)
├─────────────────────────────────────┤
│           WeeklyRevenueHistory      │ (Lịch sử theo tuần, chỉ hiển thị thời gian đã qua)
├─────────────────────────────────────┤
│           MonthlyRevenueHistory     │ (Lịch sử theo tháng, chỉ hiển thị thời gian đã qua)
└─────────────────────────────────────┘
```

## 🚀 Fallback Data

Các component đã được cấu hình với fallback data để hiển thị ngay cả khi API chưa sẵn sàng:

- **DailyRevenueChart**: `[1200000, 1500000, 1800000, 1400000, 2000000, 2200000, 1900000]`
- **WeeklyRevenueChart**: `[8500000, 9200000, 7800000, 10500000, 8800000]`
- **RevenueOverview**: 
  - Hôm nay: `2,500,000 ₫` vs Hôm qua: `2,200,000 ₫` (+13.6%)
  - Tuần này: `15,000,000 ₫` vs Tuần trước: `13,500,000 ₫` (+11.1%)
  - Tháng này: `65,000,000 ₫` vs Tháng trước: `58,000,000 ₫` (+12.1%)
- **RevenueComparisonChart**: 
  - Tuần này: `[1200000, 1500000, 1800000, 1400000, 2000000, 2200000, 1900000]`
  - Tuần trước: `[1100000, 1300000, 1600000, 1200000, 1800000, 2000000, 1700000]`
- **MonthlySalesChart**: Dữ liệu ngẫu nhiên từ 3M-8M cho mỗi tháng từ T5 đến tháng hiện tại
- **DailyRevenueHistory**: Dữ liệu ngẫu nhiên từ 500k-3M cho mỗi ngày (chỉ hiển thị đến ngày hiện tại nếu là tháng hiện tại)
- **WeeklyRevenueHistory**: Dữ liệu ngẫu nhiên từ 5M-15M cho mỗi tuần (chỉ hiển thị đến tuần hiện tại nếu là tháng hiện tại)
- **MonthlyRevenueHistory**: Dữ liệu ngẫu nhiên từ 20M-80M cho mỗi tháng (chỉ hiển thị đến tháng hiện tại nếu là năm hiện tại)

## 🔄 Cách triển khai Backend

1. **Tạo các API endpoints** theo danh sách trên
2. **Tính toán doanh thu** dựa trên bảng `orders` với status = "success"
3. **Group by** theo ngày, tuần, tháng tương ứng
4. **Return** dữ liệu theo format yêu cầu
5. **Lưu ý**: Chỉ trả về dữ liệu cho thời gian đã qua

## 📊 Ví dụ SQL Query

```sql
-- Doanh thu theo ngày trong tuần
SELECT 
  DAYOFWEEK(created_at) as day_of_week,
  SUM(total_amount) as daily_revenue
FROM orders 
WHERE status = 'success' 
  AND YEAR(created_at) = 2025 
  AND WEEK(created_at) = WEEK(CURDATE())
GROUP BY DAYOFWEEK(created_at)
ORDER BY day_of_week;

-- Doanh thu theo tuần trong tháng
SELECT 
  WEEK(created_at) as week_number,
  SUM(total_amount) as weekly_revenue
FROM orders 
WHERE status = 'success' 
  AND YEAR(created_at) = 2025 
  AND MONTH(created_at) = MONTH(CURDATE())
GROUP BY WEEK(created_at)
ORDER BY week_number;

-- Doanh thu theo tháng từ tháng 5 đến hiện tại
SELECT 
  MONTH(created_at) as month_number,
  SUM(total_amount) as monthly_revenue
FROM orders 
WHERE status = 'success' 
  AND YEAR(created_at) = 2025 
  AND MONTH(created_at) >= 5 
  AND MONTH(created_at) <= MONTH(CURDATE())
GROUP BY MONTH(created_at)
ORDER BY month_number;

-- Doanh thu hôm nay
SELECT SUM(total_amount) as today_revenue
FROM orders 
WHERE status = 'success' 
  AND DATE(created_at) = CURDATE();

-- Doanh thu hôm qua
SELECT SUM(total_amount) as yesterday_revenue
FROM orders 
WHERE status = 'success' 
  AND DATE(created_at) = DATE_SUB(CURDATE(), INTERVAL 1 DAY);

-- Doanh thu tuần này
SELECT SUM(total_amount) as week_revenue
FROM orders 
WHERE status = 'success' 
  AND YEARWEEK(created_at) = YEARWEEK(CURDATE());

-- Doanh thu tuần trước
SELECT SUM(total_amount) as last_week_revenue
FROM orders 
WHERE status = 'success' 
  AND YEARWEEK(created_at) = YEARWEEK(DATE_SUB(CURDATE(), INTERVAL 1 WEEK));

-- Doanh thu tháng này
SELECT SUM(total_amount) as month_revenue
FROM orders 
WHERE status = 'success' 
  AND YEAR(created_at) = YEAR(CURDATE())
  AND MONTH(created_at) = MONTH(CURDATE());

-- Doanh thu tháng trước
SELECT SUM(total_amount) as last_month_revenue
FROM orders 
WHERE status = 'success' 
  AND YEAR(created_at) = YEAR(DATE_SUB(CURDATE(), INTERVAL 1 MONTH))
  AND MONTH(created_at) = MONTH(DATE_SUB(CURDATE(), INTERVAL 1 MONTH));

-- Lịch sử doanh thu theo ngày trong tháng (chỉ hiển thị đến ngày hiện tại nếu là tháng hiện tại)
SELECT 
  DAY(created_at) as day_of_month,
  SUM(total_amount) as daily_revenue
FROM orders 
WHERE status = 'success' 
  AND YEAR(created_at) = 2025 
  AND MONTH(created_at) = 1
  AND DAY(created_at) <= CASE 
    WHEN YEAR(CURDATE()) = 2025 AND MONTH(CURDATE()) = 1 THEN DAY(CURDATE())
    ELSE DAY(LAST_DAY('2025-01-01'))
  END
GROUP BY DAY(created_at)
ORDER BY day_of_month;

-- Lịch sử doanh thu theo tuần trong tháng (chỉ hiển thị đến tuần hiện tại nếu là tháng hiện tại)
SELECT 
  WEEK(created_at) as week_number,
  SUM(total_amount) as weekly_revenue
FROM orders 
WHERE status = 'success' 
  AND YEAR(created_at) = 2025 
  AND MONTH(created_at) = 1
  AND WEEK(created_at) <= CASE 
    WHEN YEAR(CURDATE()) = 2025 AND MONTH(CURDATE()) = 1 THEN WEEK(CURDATE())
    ELSE WEEK(LAST_DAY('2025-01-01'))
  END
GROUP BY WEEK(created_at)
ORDER BY week_number;

-- Lịch sử doanh thu theo tháng trong năm (chỉ hiển thị đến tháng hiện tại nếu là năm hiện tại)
SELECT 
  MONTH(created_at) as month_number,
  SUM(total_amount) as monthly_revenue
FROM orders 
WHERE status = 'success' 
  AND YEAR(created_at) = 2025
  AND MONTH(created_at) <= CASE 
    WHEN YEAR(CURDATE()) = 2025 THEN MONTH(CURDATE())
    ELSE 12
  END
GROUP BY MONTH(created_at)
ORDER BY month_number;
```

## ✅ Hoàn thành

- ✅ Tạo component DailyRevenueChart
- ✅ Tạo component WeeklyRevenueChart  
- ✅ Tạo component RevenueOverview (với so sánh %)
- ✅ Tạo component RevenueComparisonChart (mới)
- ✅ Cập nhật MonthlySalesChart (từ tháng 5 đến hiện tại)
- ✅ Tạo component DailyRevenueHistory (mới)
- ✅ Tạo component WeeklyRevenueHistory (mới)
- ✅ Tạo component MonthlyRevenueHistory (mới)
- ✅ Tạo trang RevenueHistoryPage (mới)
- ✅ Cập nhật Dashboard layout
- ✅ Cập nhật Sidebar navigation
- ✅ Thêm fallback data
- ✅ Documentation API endpoints
- ✅ Tính năng so sánh phần trăm tăng/giảm
- ✅ Lịch sử doanh thu chi tiết
- ✅ **Logic thông minh**: Chỉ hiển thị dữ liệu cho thời gian đã qua
