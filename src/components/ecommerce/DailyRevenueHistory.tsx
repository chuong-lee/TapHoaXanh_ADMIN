"use client";
import api from "@/app/lib/axios";
import { ApexOptions } from "apexcharts";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

// Dynamically import the ReactApexChart component
const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

export default function DailyRevenueHistory() {
  const [dailyHistory, setDailyHistory] = useState<number[]>([]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  // Lấy tháng và năm hiện tại
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1;
  const currentYear = currentDate.getFullYear();

  useEffect(() => {
    const fetchDailyHistory = async () => {
      try {
        const response = await api.get("/order/revenue-daily-history", {
          params: { 
            year: selectedYear,
            month: selectedMonth
          },
        });
        setDailyHistory(response.data);
      } catch (error) {
        console.error("Lỗi khi lấy lịch sử doanh thu theo ngày:", error);
        setDailyHistory([]);
      }
    };

    fetchDailyHistory();
  }, [selectedMonth, selectedYear]);

  // Tạo danh sách ngày trong tháng được chọn
  const getDaysInMonth = () => {
    const daysInMonth = new Date(selectedYear, selectedMonth, 0).getDate();
    const days = [];
    
    // Nếu là tháng hiện tại, chỉ hiển thị đến ngày hiện tại
    // Nếu là tháng khác, hiển thị tất cả ngày trong tháng đó
    const maxDay = (selectedYear === currentYear && selectedMonth === currentMonth) 
      ? currentDate.getDate() 
      : daysInMonth;
    
    for (let day = 1; day <= maxDay; day++) {
      days.push(day.toString());
    }
    return days;
  };

  const options: ApexOptions = {
    colors: ["#3b82f6"],
    chart: {
      fontFamily: "Outfit, sans-serif",
      type: "bar",
      height: 300,
      toolbar: {
        show: false,
      },
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "70%",
        borderRadius: 4,
        borderRadiusApplication: "end",
      },
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      show: true,
      width: 2,
      colors: ["transparent"],
    },
    xaxis: {
      categories: getDaysInMonth(),
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
      title: {
        text: "Ngày trong tháng",
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
      opacity: 1,
    },
    tooltip: {
      x: {
        show: true,
        formatter: (val: number) => `Ngày ${val}`,
      },
      y: {
        formatter: (val: number) => `${val.toLocaleString('vi-VN')} ₫`,
      },
    },
  };

  const series = [
    {
      name: "Doanh thu",
      data: dailyHistory,
    },
  ];

  // Tính tổng doanh thu trong tháng
  const totalRevenue = dailyHistory.reduce((sum, val) => sum + val, 0);
  const averageRevenue = dailyHistory.length > 0 ? totalRevenue / dailyHistory.length : 0;

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
          Lịch sử doanh thu theo ngày - Tháng {selectedMonth}/{selectedYear}
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
        <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
          <div className="text-sm text-blue-600 dark:text-blue-400">Tổng doanh thu</div>
          <div className="text-lg font-semibold text-blue-800 dark:text-blue-200">
            {totalRevenue.toLocaleString('vi-VN')} ₫
          </div>
        </div>
        <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
          <div className="text-sm text-green-600 dark:text-green-400">Trung bình/ngày</div>
          <div className="text-lg font-semibold text-green-800 dark:text-green-200">
            {averageRevenue.toLocaleString('vi-VN')} ₫
          </div>
        </div>
      </div>

      <div className="max-w-full overflow-x-auto custom-scrollbar">
        <div className="-ml-5 min-w-[650px] xl:min-w-full pl-2">
          <ReactApexChart
            options={options}
            series={series}
            type="bar"
            height={300}
          />
        </div>
      </div>
    </div>
  );
}
