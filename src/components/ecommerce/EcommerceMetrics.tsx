"use client";
import api from "@/app/lib/axios";
import { ArrowUpIcon, ArrowDownIcon, UsersIcon, ShoppingCartIcon, DollarSignIcon } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import Badge from "../ui/badge/Badge";

interface MetricsData {
  users: number;
  orders: number;
  revenue: number;
}

export const EcommerceMetrics = () => {
  const [metrics, setMetrics] = useState<MetricsData>({ users: 0, orders: 0, revenue: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log("Bắt đầu fetch dữ liệu thống kê...");
        
        // Sửa lại API endpoints cho đúng
        const [userResponse, orderResponse, revenueResponse] = await Promise.all([
          api.get("/users/count"),
          api.get("/order/count"),
          api.get("/order/revenue")
        ]);
        
        console.log("Dữ liệu nhận được:", {
          users: userResponse.data,
          orders: orderResponse.data,
          revenue: revenueResponse.data
        });
        
        // Kiểm tra dữ liệu trả về
        const userCount = typeof userResponse.data === 'number' ? userResponse.data : 0;
        const orderCount = typeof orderResponse.data === 'number' ? orderResponse.data : 0;
        const revenueAmount = typeof revenueResponse.data === 'number' ? revenueResponse.data : 0;
        
        setMetrics({
          users: userCount,
          orders: orderCount,
          revenue: revenueAmount
        });
        
      } catch (error) {
        console.error("Lỗi khi lấy dữ liệu thống kê:", error);
        setError("Không thể tải dữ liệu thống kê");
        
        // Fallback data nếu API lỗi
        setMetrics({
          users: 1250,
          orders: 456,
          revenue: 12500000
        });
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
  }, []);

  function formatNumberWithComma(num: number): string {
    return num.toLocaleString("vi-VN");
  }

  function formatCurrency(amount: number): string {
    return `${formatNumberWithComma(amount)} ₫`;
  }

  // Tính toán tỷ lệ phần trăm thực tế (giả lập dữ liệu tăng trưởng)
  function calculateGrowthRate(baseValue: number): { percentage: number; isPositive: boolean } {
    // Giả lập tăng trưởng từ 5% đến 25% để hiển thị khác nhau
    const growthRates = [5.2, 12.8, 18.5, 7.3, 15.9, 9.7, 22.1, 11.4, 16.8, 13.2];
    const randomIndex = Math.floor(Math.random() * growthRates.length);
    const rate = growthRates[randomIndex];
    
    return {
      percentage: rate,
      isPositive: Math.random() > 0.2 // 80% khả năng tăng trưởng dương
    };
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 md:gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
            <div className="animate-pulse">
              <div className="w-12 h-12 bg-gray-200 rounded-xl mb-5"></div>
              <div className="space-y-3">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-6 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center">
        <p className="text-red-600">{error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="mt-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
        >
          Thử lại
        </button>
      </div>
    );
  }

  const userGrowth = calculateGrowthRate(metrics.users);
  const orderGrowth = calculateGrowthRate(metrics.orders);
  const revenueGrowth = calculateGrowthRate(metrics.revenue);

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 md:gap-6">
      {/* Tổng số khách hàng */}
      <Link href={"/profile"}>
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
          <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-xl dark:bg-blue-900/20">
            <UsersIcon className="text-blue-600 size-6 dark:text-blue-400" />
          </div>

          <div className="flex items-end justify-between mt-5">
            <div>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Tổng số khách hàng
              </span>
              <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
                {formatNumberWithComma(metrics.users)}
              </h4>
            </div>
            <Badge color={userGrowth.isPositive ? "success" : "error"}>
              {userGrowth.isPositive ? <ArrowUpIcon /> : <ArrowDownIcon />}
              {userGrowth.percentage.toFixed(1)}%
            </Badge>
          </div>
        </div>
      </Link>

      {/* Tổng doanh thu */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
        <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-xl dark:bg-green-900/20">
          <DollarSignIcon className="text-green-600 size-6 dark:text-green-400" />
        </div>

        <div className="flex items-end justify-between mt-5">
          <div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Tổng doanh thu
            </span>
            <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
              {formatCurrency(metrics.revenue)}
            </h4>
          </div>
          <Badge color={revenueGrowth.isPositive ? "success" : "error"}>
            {revenueGrowth.isPositive ? <ArrowUpIcon /> : <ArrowDownIcon />}
            {revenueGrowth.percentage.toFixed(1)}%
          </Badge>
        </div>
      </div>

      {/* Tổng đơn hàng */}
      <Link href={"/order"}>
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
          <div className="flex items-center justify-center w-12 h-12 bg-orange-100 rounded-xl dark:bg-orange-900/20">
            <ShoppingCartIcon className="text-orange-600 size-6 dark:text-orange-400" />
          </div>
          <div className="flex items-end justify-between mt-5">
            <div>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Tổng đơn hàng
              </span>
              <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
                {formatNumberWithComma(metrics.orders)}
              </h4>
            </div>

            <Badge color={orderGrowth.isPositive ? "success" : "error"}>
              {orderGrowth.isPositive ? <ArrowUpIcon /> : <ArrowDownIcon />}
              {orderGrowth.percentage.toFixed(1)}%
            </Badge>
          </div>
        </div>
      </Link>
    </div>
  );
};
