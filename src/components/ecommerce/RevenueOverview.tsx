"use client";
import api from "@/app/lib/axios";
import { ArrowUpIcon, ArrowDownIcon, TrendingUpIcon, CalendarIcon, ClockIcon } from "lucide-react";
import { useEffect, useState } from "react";
import Badge from "../ui/badge/Badge";

interface RevenueData {
  current: number;
  previous: number;
  percentageChange: number;
}

export const RevenueOverview = () => {
  const [todayRevenue, setTodayRevenue] = useState<RevenueData>({ current: 0, previous: 0, percentageChange: 0 });
  const [weekRevenue, setWeekRevenue] = useState<RevenueData>({ current: 0, previous: 0, percentageChange: 0 });
  const [monthRevenue, setMonthRevenue] = useState<RevenueData>({ current: 0, previous: 0, percentageChange: 0 });

  useEffect(() => {
    const fetchRevenueData = async () => {
      try {
        // Lấy doanh thu hôm nay và hôm qua
        const todayResponse = await api.get("/order/revenue-today");
        const yesterdayResponse = await api.get("/order/revenue-yesterday");
        
        const todayData = {
          current: todayResponse.data,
          previous: yesterdayResponse.data,
          percentageChange: calculatePercentageChange(todayResponse.data, yesterdayResponse.data)
        };
        setTodayRevenue(todayData);

        // Lấy doanh thu tuần này và tuần trước
        const weekResponse = await api.get("/order/revenue-week");
        const lastWeekResponse = await api.get("/order/revenue-last-week");
        
        const weekData = {
          current: weekResponse.data,
          previous: lastWeekResponse.data,
          percentageChange: calculatePercentageChange(weekResponse.data, lastWeekResponse.data)
        };
        setWeekRevenue(weekData);

        // Lấy doanh thu tháng này và tháng trước
        const monthResponse = await api.get("/order/revenue-month-current");
        const lastMonthResponse = await api.get("/order/revenue-last-month");
        
        const monthData = {
          current: monthResponse.data,
          previous: lastMonthResponse.data,
          percentageChange: calculatePercentageChange(monthResponse.data, lastMonthResponse.data)
        };
        setMonthRevenue(monthData);
      } catch (error) {
        console.error("Lỗi khi lấy dữ liệu doanh thu:", error);
        setTodayRevenue({ current: 0, previous: 0, percentageChange: 0 });
        setWeekRevenue({ current: 0, previous: 0, percentageChange: 0 });
        setMonthRevenue({ current: 0, previous: 0, percentageChange: 0 });
      }
    };

    fetchRevenueData();
  }, []);

  // Hàm tính phần trăm thay đổi
  const calculatePercentageChange = (current: number, previous: number): number => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return Math.round(((current - previous) / previous) * 100 * 10) / 10; // Làm tròn 1 chữ số thập phân
  };

  function formatNumberWithComma(num: number): string {
    return num.toLocaleString("vi-VN");
  }

  // Hàm render badge với màu sắc và icon phù hợp
  const renderBadge = (percentageChange: number) => {
    const isPositive = percentageChange >= 0;
    const color = isPositive ? "success" : "error";
    const icon = isPositive ? <ArrowUpIcon /> : <ArrowDownIcon />;
    const sign = isPositive ? "+" : "";
    
    return (
      <Badge color={color}>
        {icon}
        {sign}{percentageChange}%
      </Badge>
    );
  };

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 md:gap-6">
      {/* Doanh thu hôm nay */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
        <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-xl dark:bg-green-900/20">
          <CalendarIcon className="text-green-600 size-6 dark:text-green-400" />
        </div>

        <div className="flex items-end justify-between mt-5">
          <div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Doanh thu hôm nay
            </span>
            <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
              {formatNumberWithComma(todayRevenue.current)} ₫
            </h4>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Hôm qua: {formatNumberWithComma(todayRevenue.previous)} ₫
            </p>
          </div>
          {renderBadge(todayRevenue.percentageChange)}
        </div>
      </div>

      {/* Doanh thu tuần này */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
        <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-xl dark:bg-blue-900/20">
          <ClockIcon className="text-blue-600 size-6 dark:text-blue-400" />
        </div>

        <div className="flex items-end justify-between mt-5">
          <div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Doanh thu tuần này
            </span>
            <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
              {formatNumberWithComma(weekRevenue.current)} ₫
            </h4>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Tuần trước: {formatNumberWithComma(weekRevenue.previous)} ₫
            </p>
          </div>
          {renderBadge(weekRevenue.percentageChange)}
        </div>
      </div>

      {/* Doanh thu tháng này */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
        <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-xl dark:bg-purple-900/20">
          <TrendingUpIcon className="text-purple-600 size-6 dark:text-purple-400" />
        </div>

        <div className="flex items-end justify-between mt-5">
          <div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Doanh thu tháng này
            </span>
            <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
              {formatNumberWithComma(monthRevenue.current)} ₫
            </h4>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Tháng trước: {formatNumberWithComma(monthRevenue.previous)} ₫
            </p>
          </div>
          {renderBadge(monthRevenue.percentageChange)}
        </div>
      </div>
    </div>
  );
};
