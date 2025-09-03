import DailyRevenueHistory from "@/components/ecommerce/DailyRevenueHistory";
import WeeklyRevenueHistory from "@/components/ecommerce/WeeklyRevenueHistory";
import MonthlyRevenueHistory from "@/components/ecommerce/MonthlyRevenueHistory";

export default function RevenueHistoryPage() {
  return (
    <div className="grid grid-cols-12 gap-4 md:gap-6">
      <div className="col-span-12 xl:col-span-12">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white/90">
            Lịch sử doanh thu
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Xem chi tiết lịch sử doanh thu theo ngày, tuần và tháng
          </p>
        </div>
      </div>

      <div className="col-span-12 xl:col-span-12">
        <DailyRevenueHistory />
      </div>

      <div className="col-span-12 xl:col-span-12">
        <WeeklyRevenueHistory />
      </div>

      <div className="col-span-12 xl:col-span-12">
        <MonthlyRevenueHistory />
      </div>
    </div>
  );
}
