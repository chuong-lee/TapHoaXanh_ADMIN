// Mock API service cho testing
import api from "./axios";

// Mock data helpers
const randomInt = (min: number, max: number): number => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

// Mock data cho doanh thu theo ngày trong tháng
const mockDailyHistory = (year: number, month: number): number[] => {
  const daysInMonth = new Date(year, month, 0).getDate();
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1;
  const currentDay = currentDate.getDate();
  
  const maxDay = (year === currentYear && month === currentMonth) ? currentDay : daysInMonth;
  
  const data = [];
  for (let day = 1; day <= maxDay; day++) {
    data.push(randomInt(500_000, 3_000_000));
  }
  return data;
};

// Mock data cho doanh thu theo tuần trong tháng
const mockWeeklyHistory = (year: number, month: number): number[] => {
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1;
  const firstDayOfMonth = new Date(year, month - 1, 1);
  const lastDayOfMonth = new Date(year, month, 0);
  const firstWeek = Math.ceil((firstDayOfMonth.getDate() + firstDayOfMonth.getDay()) / 7);
  const lastWeek = Math.ceil((lastDayOfMonth.getDate() + firstDayOfMonth.getDay()) / 7);
  const totalWeeks = lastWeek - firstWeek + 1;

  let maxWeeks = totalWeeks;
  if (year === currentYear && month === currentMonth) {
    const currentWeek = Math.ceil((currentDate.getDate() + firstDayOfMonth.getDay()) / 7);
    maxWeeks = currentWeek - firstWeek + 1;
  }
  
  const data = [];
  for (let week = 1; week <= Math.min(maxWeeks, 5); week++) {
    data.push(randomInt(5_000_000, 15_000_000));
  }
  return data;
};

// Mock data cho doanh thu theo tháng trong năm
const mockMonthlyHistory = (year: number): number[] => {
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1;
  const maxMonth = (year === currentYear) ? currentMonth : 12;
  const data = [];
  for (let month = 1; month <= maxMonth; month++) {
    data.push(randomInt(20_000_000, 80_000_000));
  }
  return data;
};

// Mock data theo ngày trong tuần
const mockDailyRevenue = (): number[] => {
  return [
    randomInt(800_000, 1_800_000),
    randomInt(1_000_000, 2_000_000),
    randomInt(1_200_000, 2_200_000),
    randomInt(900_000, 1_900_000),
    randomInt(1_500_000, 2_500_000),
    randomInt(1_800_000, 2_800_000),
    randomInt(1_400_000, 2_400_000),
  ];
};

// Mock data theo tuần trong tháng
const mockWeeklyRevenue = (): number[] => {
  return [
    randomInt(8_000_000, 13_000_000),
    randomInt(9_000_000, 14_000_000),
    randomInt(7_000_000, 12_000_000),
    randomInt(10_000_000, 15_000_000),
    randomInt(8_500_000, 13_500_000),
  ];
};

// Mock data theo tháng (từ tháng 5)
const mockMonthlyRevenue = (): number[] => {
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1;
  const startMonth = 5;
  const endMonth = currentMonth;
  const data = [];
  for (let month = startMonth; month <= endMonth; month++) {
    data.push(randomInt(3_000_000, 8_000_000));
  }
  return data;
};

// Mock helpers khác
const mockCurrentRevenue = (): number => randomInt(1_000_000, 3_000_000);
const mockPreviousRevenue = (): number => randomInt(800_000, 2_800_000);

// Products top purchased
const mockTopPurchasedProducts = () => {
  const sample = [
    { id: 1, name: "Táo Mỹ", barcode: "APL-001", purchase: "1,245", images: "/public/product/product-01.jpg" },
    { id: 2, name: "Cam Sành", barcode: "ORG-021", purchase: "1,102", images: "/public/product/product-02.jpg" },
    { id: 3, name: "Bơ Đà Lạt", barcode: "AVO-115", purchase: "986", images: "/public/product/product-03.jpg" },
    { id: 4, name: "Dưa hấu", barcode: "WML-019", purchase: "874", images: "/public/product/product-04.jpg" },
    { id: 5, name: "Ổi", barcode: "GUA-044", purchase: "812", images: "/public/product/product-05.jpg" },
  ];
  return sample.map(p => ({ ...p, purchase: (Number(p.purchase) + randomInt(0, 120)).toString(), images: p.images.replace("/public", "") }));
};

// Override axios để sử dụng mock data
const mockApi = {
  get: async (url: string, config?: any) => {
    await new Promise(resolve => setTimeout(resolve, 200));
    const params = config?.params || {};
    switch (url) {
      case "/users/count":
        return { data: randomInt(1200, 3500) };
      case "/order/count":
        return { data: randomInt(300, 1200) };
      case "/order/revenue":
        return { data: randomInt(50_000_000, 180_000_000) };

      case "/products/top-purchased":
        return { data: mockTopPurchasedProducts() };

      case "/order/revenue-daily-history":
        return { data: mockDailyHistory(params.year, params.month) };
      case "/order/revenue-weekly-history":
        return { data: mockWeeklyHistory(params.year, params.month) };
      case "/order/revenue-monthly-history":
        return { data: mockMonthlyHistory(params.year) };

      case "/order/revenue-daily":
        return { data: mockDailyRevenue() };
      case "/order/revenue-weekly":
        return { data: mockWeeklyRevenue() };
      case "/order/revenue-month-range":
        return { data: mockMonthlyRevenue() };

      case "/order/revenue-today":
        return { data: mockCurrentRevenue() };
      case "/order/revenue-yesterday":
        return { data: mockPreviousRevenue() };
      case "/order/revenue-week":
        return { data: mockCurrentRevenue() * 7 };
      case "/order/revenue-last-week":
        return { data: mockPreviousRevenue() * 7 };
      case "/order/revenue-month-current":
        return { data: mockCurrentRevenue() * 30 };
      case "/order/revenue-last-month":
        return { data: mockPreviousRevenue() * 30 };

      default:
        return api.get(url, config);
    }
  },
  post: async (url: string, data?: any, config?: any) => api.post(url, data, config),
  put: async (url: string, data?: any, config?: any) => api.put(url, data, config),
  delete: async (url: string, config?: any) => api.delete(url, config),
};

export default mockApi;
