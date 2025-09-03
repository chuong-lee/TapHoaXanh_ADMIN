"use client";
import api from "@/app/lib/axios";
import { ApexOptions } from "apexcharts";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

// Dynamically import the ReactApexChart component
const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

export default function MonthlyRevenueHistory() {
  const [monthlyHistory, setMonthlyHistory] = useState<number[]>([]);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  // Lấy tháng và năm hiện tại
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1;
  const currentYear = currentDate.getFullYear();

  // Tạo danh sách tháng cho biểu đồ
  const getMonthCategories = () => {
    const monthNames = ["T1", "T2", "T3", "T4", "T5", "T6", "T7", "T8", "T9", "T10", "T11", "T12"];
    
    // Nếu là năm hiện tại, chỉ hiển thị đến tháng hiện tại
    const maxMonth = (selectedYear === currentYear) ? currentMonth : 12;
    
    return monthNames.slice(0, maxMonth);
  };

  useEffect(() => {
    const fetchMonthlyHistory = async () => {
      try {
        const response = await api.get("/order/revenue-monthly-history", {
          params: { 
            year: selectedYear
          },
        });
        setMonthlyHistory(response.data);
      } catch (error) {
        console.error("Lỗi khi lấy lịch sử doanh thu theo tháng:", error);
        setMonthlyHistory([]);
      }
    };

    fetchMonthlyHistory();
  }, [selectedYear]);

  const options: ApexOptions = {
    colors: ["#8b5cf6"],
    chart: {
      fontFamily: "Outfit, sans-serif",
      type: "line",
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
      width: 4,
      colors: ["#8b5cf6"],
      curve: "smooth",
    },
    xaxis: {
      categories: getMonthCategories(),
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
      title: {
        text: "Tháng trong năm",
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
        gradientToColors: ["#8b5cf6"],
        inverseColors: false,
        opacityFrom: 0.8,
        opacityTo: 0.1,
        stops: [0, 100],
      },
    },
    tooltip: {
      x: {
        show: true,
        formatter: (val: number) => `Tháng ${val}`,
      },
      y: {
        formatter: (val: number) => `${val.toLocaleString('vi-VN')} ₫`,
      },
    },
    markers: {
      size: 6,
      colors: ["#8b5cf6"],
      strokeColors: "#ffffff",
      strokeWidth: 2,
      hover: {
        size: 8,
      },
    },
  };

  const series = [
    {
      name: "Doanh thu",
      data: monthlyHistory,
    },
  ];

  // Tính tổng doanh thu trong năm
  const totalRevenue = monthlyHistory.reduce((sum, val) => sum + val, 0);
  const averageRevenue = monthlyHistory.length > 0 ? totalRevenue / monthlyHistory.length : 0;
  const maxRevenue = monthlyHistory.length > 0 ? Math.max(...monthlyHistory) : 0;
  const minRevenue = monthlyHistory.length > 0 ? Math.min(...monthlyHistory) : 0;

  const handleYearChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedYear(parseInt(event.target.value));
  };

  // Tạo danh sách năm có thể chọn
  const getAvailableYears = () => {
    const years = [];
    const currentYear = new Date().getFullYear();
    
    for (let year = 2024; year <= currentYear; year++) {
      years.push(year);
    }
    return years;
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-5 pt-5 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 sm:pt-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          Lịch sử doanh thu theo tháng
        </h3>
        <div className="flex gap-2">
          <select
            value={selectedYear}
            onChange={handleYearChange}
            className="px-3 py-1 border border-gray-300 rounded-md text-sm dark:border-gray-600 dark:bg-gray-800"
          >
            {getAvailableYears().map(year => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg">
          <div className="text-sm text-purple-600 dark:text-purple-400">Tổng doanh thu</div>
          <div className="text-lg font-semibold text-purple-800 dark:text-purple-200">
            {totalRevenue.toLocaleString('vi-VN')} ₫
          </div>
        </div>
        <div className="bg-indigo-50 dark:bg-indigo-900/20 p-3 rounded-lg">
          <div className="text-sm text-indigo-600 dark:text-indigo-400">Trung bình/tháng</div>
          <div className="text-lg font-semibold text-indigo-800 dark:text-indigo-200">
            {averageRevenue.toLocaleString('vi-VN')} ₫
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
          <div className="text-sm text-green-600 dark:text-green-400">Cao nhất</div>
          <div className="text-lg font-semibold text-green-800 dark:text-green-200">
            {maxRevenue.toLocaleString('vi-VN')} ₫
          </div>
        </div>
        <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
          <div className="text-sm text-red-600 dark:text-red-400">Thấp nhất</div>
          <div className="text-lg font-semibold text-red-800 dark:text-red-200">
            {minRevenue.toLocaleString('vi-VN')} ₫
          </div>
        </div>
      </div>

      <div className="max-w-full overflow-x-auto custom-scrollbar">
        <div className="-ml-5 min-w-[650px] xl:min-w-full pl-2">
          <ReactApexChart
            options={options}
            series={series}
            type="line"
            height={300}
          />
        </div>
      </div>
    </div>
  );
}
