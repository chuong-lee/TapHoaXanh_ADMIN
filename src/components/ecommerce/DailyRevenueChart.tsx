"use client";
import api from "@/app/lib/axios";
import { useEffect, useState } from "react";

interface TitleHeaderProps {
  year?: number | null;
  month?: number | null;
  startDate?: string | null;
  endDate?: string | null;
}

interface DailyRevenueData {
  date: string;
  revenue: number;
}

export const DailyRevenueChart = ({
  year,
  month,
  startDate,
  endDate,
}: TitleHeaderProps) => {
  const [dailyRevenue, setDailyRevenue] = useState<DailyRevenueData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getDailyRevenue = async () => {
      try {
        setLoading(true);
        const response = await api.get("/order/daily-revenue", {
          params: {
            year,
            month,
            start_date: startDate,
            end_date: endDate,
          },
        });
        setDailyRevenue(response.data);
      } catch (error) {
        console.error("Lỗi khi lấy doanh thu theo ngày:", error);
        setDailyRevenue([]);
      } finally {
        setLoading(false);
      }
    };

    getDailyRevenue();
  }, [year, month, startDate, endDate]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500 dark:text-gray-400">
            Đang tải dữ liệu...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          Doanh thu theo ngày
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Biểu đồ thể hiện doanh thu từng ngày
        </p>
      </div>

      {dailyRevenue.length === 0 ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500 dark:text-gray-400">
            Không có dữ liệu doanh thu
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Danh sách doanh thu theo ngày */}
          <div className="max-h-64 overflow-y-auto">
            <div className="space-y-2">
              {dailyRevenue.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <span className="text-sm font-medium text-gray-800 dark:text-white/90">
                      {formatDate(item.date)}
                    </span>
                  </div>
                  <span className="text-sm font-semibold text-gray-800 dark:text-white/90">
                    {formatCurrency(item.revenue)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Thống kê tổng quan */}
      {dailyRevenue.length > 0 && (
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Tổng doanh thu
            </div>
            <div className="text-lg font-semibold text-gray-800 dark:text-white/90">
              {formatCurrency(
                dailyRevenue.reduce((sum, item) => sum + item.revenue, 0)
              )}
            </div>
          </div>
          <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Doanh thu trung bình
            </div>
            <div className="text-lg font-semibold text-gray-800 dark:text-white/90">
              {formatCurrency(
                dailyRevenue.reduce((sum, item) => sum + item.revenue, 0) /
                  dailyRevenue.length
              )}
            </div>
          </div>
          <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Ngày cao nhất
            </div>
            <div className="text-lg font-semibold text-gray-800 dark:text-white/90">
              {formatCurrency(
                Math.max(...dailyRevenue.map((item) => item.revenue))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
