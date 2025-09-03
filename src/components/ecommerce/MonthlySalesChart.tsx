"use client";
import api from "@/app/lib/axios";
import { ApexOptions } from "apexcharts";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

// Dynamically import the ReactApexChart component
const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

export default function MonthlySalesChart() {
  const [revenueMonth, setRevenueMonth] = useState<number[]>([]);
  const [monthCategories, setMonthCategories] = useState<string[]>([]);

  // Lấy tháng và năm hiện tại
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1;
  const currentYear = currentDate.getFullYear();

  useEffect(() => {
    const getMonthlyRevenue = async () => {
      try {
        // Tạo danh sách tháng từ tháng 5 đến tháng hiện tại
        const months = [] as number[];
        const categories = [] as string[];
        
        // Chỉ hiển thị từ tháng 5 đến tháng hiện tại
        const startMonth = 5;
        const endMonth = currentMonth;
        
        for (let month = startMonth; month <= endMonth; month++) {
          months.push(month);
          categories.push(getMonthName(month));
        }

        // Gọi API để lấy doanh thu cho các tháng từ 5 đến hiện tại
        const response = await api.get("/order/revenue-month-range", {
          params: { 
            year: currentYear,
            startMonth: startMonth,
            endMonth: endMonth
          },
        });
        
        setRevenueMonth(response.data);
        setMonthCategories(categories);
      } catch (error) {
        console.error("Lỗi khi lấy doanh thu theo tháng:", error);
        setRevenueMonth([]);
        setMonthCategories([]);
      }
    };

    getMonthlyRevenue();
  }, []);

  // Hàm chuyển đổi số tháng thành tên tháng
  const getMonthName = (month: number): string => {
    const monthNames = ["T1","T2","T3","T4","T5","T6","T7","T8","T9","T10","T11","T12"];
    return monthNames[month - 1];
  };

  const options: ApexOptions = {
    colors: ["#465fff"],
    chart: {
      fontFamily: "Outfit, sans-serif",
      type: "bar",
      height: 180,
      toolbar: {
        show: false,
      },
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "39%",
        borderRadius: 5,
        borderRadiusApplication: "end",
      },
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      show: true,
      width: 4,
      colors: ["transparent"],
    },
    xaxis: {
      categories: monthCategories,
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
    },
    legend: {
      show: true,
      position: "top",
      horizontalAlign: "left",
      fontFamily: "Outfit",
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
        show: false,
      },
      y: {
        formatter: (val: number) => `${val.toLocaleString('vi-VN')} ₫`,
      },
    },
  };

  const series = [
    {
      name: "Doanh thu",
      data: revenueMonth,
    },
  ];

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-5 pt-5 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 sm:pt-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          Doanh thu theo tháng (Từ tháng 5)
        </h3>
      </div>

      <div className="max-w-full overflow-x-auto custom-scrollbar">
        <div className="-ml-5 min-w-[650px] xl:min-w-full pl-2">
          <ReactApexChart
            options={options}
            series={series}
            type="bar"
            height={180}
          />
        </div>
      </div>
    </div>
  );
}
