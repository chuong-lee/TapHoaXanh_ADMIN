"use client";
import api from "@/app/lib/axios";
import { ApexOptions } from "apexcharts";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

// Dynamically import the ReactApexChart component
const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

export default function WeeklyRevenueHistory() {
  const [weeklyHistory, setWeeklyHistory] = useState<number[]>([]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  // Lấy tháng và năm hiện tại
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1;
  const currentYear = currentDate.getFullYear();

  useEffect(() => {
    const fetchWeeklyHistory = async () => {
      try {
        const response = await api.get("/order/revenue-weekly-history", {
          params: { 
            year: selectedYear,
            month: selectedMonth
          },
        });
        setWeeklyHistory(response.data);
      } catch (error) {
        console.error("Lỗi khi lấy lịch sử doanh thu theo tuần:", error);
        setWeeklyHistory([]);
      }
    };

    fetchWeeklyHistory();
  }, [selectedMonth, selectedYear]);

  // Tạo danh sách tuần theo tháng được chọn
  const getWeekCategories = () => {
    const daysInMonth = new Date(selectedYear, selectedMonth, 0).getDate();
    const firstDayOfMonth = new Date(selectedYear, selectedMonth - 1, 1);
    const lastDayOfMonth = new Date(selectedYear, selectedMonth, 0);
    
    // Tính tuần đầu tiên và cuối cùng của tháng
    const firstWeek = Math.ceil((firstDayOfMonth.getDate() + firstDayOfMonth.getDay()) / 7);
    const lastWeek = Math.ceil((lastDayOfMonth.getDate() + firstDayOfMonth.getDay()) / 7);
    const totalWeeks = lastWeek - firstWeek + 1;
    
    // Nếu là tháng hiện tại, chỉ hiển thị đến tuần hiện tại
    let maxWeeks = totalWeeks;
    if (selectedYear === currentYear && selectedMonth === currentMonth) {
      const currentWeek = Math.ceil((currentDate.getDate() + firstDayOfMonth.getDay()) / 7);
      maxWeeks = currentWeek - firstWeek + 1;
    }
    
    const weeks = [];
    for (let week = 1; week <= Math.min(maxWeeks, 5); week++) {
      weeks.push(`Tuần ${week}`);
    }
    return weeks;
  };

  const options: ApexOptions = {
    colors: ["#f59e0b"],
    chart: {
      fontFamily: "Outfit, sans-serif",
      type: "area",
      height: 300,
      toolbar: {
        show: false,
      },
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      show: true,
      width: 3,
      colors: ["#f59e0b"],
    },
    xaxis: {
      categories: getWeekCategories(),
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
      title: {
        text: "Tuần trong tháng",
      },
    },
    legend: {
      show: false,
    },
    yaxis: {
      title: {
        text: "Doanh thu (VNĐ)",
      },
    },
    grid: {
      yaxis: {
        lines: {
          show: true,
        },
      },
    },
    fill: {
      type: "gradient",
      gradient: {
        shade: "light",
        type: "vertical",
        shadeIntensity: 0.4,
        gradientToColors: ["#f59e0b"],
        inverseColors: false,
        opacityFrom: 0.6,
        opacityTo: 0.1,
        stops: [0, 100],
      },
    },
    tooltip: {
      x: {
        show: true,
        formatter: (val: number) => val,
      },
      y: {
        formatter: (val: number) => `${val.toLocaleString('vi-VN')} ₫`,
      },
    },
  };

  const series = [
    {
      name: "Doanh thu",
      data: weeklyHistory,
    },
  ];

  // Tính tổng doanh thu trong tháng
  const totalRevenue = weeklyHistory.reduce((sum, val) => sum + val, 0);
  const averageRevenue = weeklyHistory.length > 0 ? totalRevenue / weeklyHistory.length : 0;

  const handleMonthChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedMonth(parseInt(event.target.value));
  };

  const handleYearChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedYear(parseInt(event.target.value));
  };

  // Tạo danh sách tháng có thể chọn (chỉ hiển thị tháng đã qua hoặc tháng hiện tại)
  const getAvailableMonths = () => {
    const months = [];
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;
    
    for (let month = 1; month <= 12; month++) {
      // Chỉ hiển thị tháng đã qua hoặc tháng hiện tại
      if (selectedYear < currentYear || (selectedYear === currentYear && month <= currentMonth)) {
        months.push(month);
      }
    }
    return months;
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-5 pt-5 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 sm:pt-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          Lịch sử doanh thu theo tuần - Tháng {selectedMonth}/{selectedYear}
        </h3>
        <div className="flex gap-2">
          <select
            value={selectedMonth}
            onChange={handleMonthChange}
            className="px-3 py-1 border border-gray-300 rounded-md text-sm dark:border-gray-600 dark:bg-gray-800"
          >
            {getAvailableMonths().map(month => (
              <option key={month} value={month}>
                Tháng {month}
              </option>
            ))}
          </select>
          <select
            value={selectedYear}
            onChange={handleYearChange}
            className="px-3 py-1 border border-gray-300 rounded-md text-sm dark:border-gray-600 dark:bg-gray-800"
          >
            <option value={2024}>2024</option>
            <option value={2025}>2025</option>
            <option value={2026}>2026</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-orange-50 dark:bg-orange-900/20 p-3 rounded-lg">
          <div className="text-sm text-orange-600 dark:text-orange-400">Tổng doanh thu</div>
          <div className="text-lg font-semibold text-orange-800 dark:text-orange-200">
            {totalRevenue.toLocaleString('vi-VN')} ₫
          </div>
        </div>
        <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg">
          <div className="text-sm text-yellow-600 dark:text-yellow-400">Trung bình/tuần</div>
          <div className="text-lg font-semibold text-yellow-800 dark:text-yellow-200">
            {averageRevenue.toLocaleString('vi-VN')} ₫
          </div>
        </div>
      </div>

      <div className="max-w-full overflow-x-auto custom-scrollbar">
        <div className="-ml-5 min-w-[650px] xl:min-w-full pl-2">
          <ReactApexChart
            options={options}
            series={series}
            type="area"
            height={300}
          />
        </div>
      </div>
    </div>
  );
}
