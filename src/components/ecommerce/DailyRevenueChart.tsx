"use client";
import api from "@/app/lib/axios";
import { ApexOptions } from "apexcharts";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

// Dynamically import the ReactApexChart component
const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

export default function DailyRevenueChart() {
  const [revenueDaily, setRevenueDaily] = useState<number[]>([]);

  useEffect(() => {
    const getDailyRevenue = async () => {
      try {
        const response = await api.get("/order/revenue-daily", {
          params: { 
            year: new Date().getFullYear(),
            week: Math.ceil(new Date().getDate() / 7) // Tuần hiện tại
          },
        });
        setRevenueDaily(response.data);
      } catch (error) {
        console.error("Lỗi khi lấy doanh thu theo ngày:", error);
        setRevenueDaily([]);
      }
    };
    getDailyRevenue();
  }, []);

  const options: ApexOptions = {
    colors: ["#10b981"],
    chart: {
      fontFamily: "Outfit, sans-serif",
      type: "line",
      height: 200,
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
      colors: ["#10b981"],
      curve: "smooth",
    },
    xaxis: {
      categories: [
        "Thứ 2",
        "Thứ 3", 
        "Thứ 4",
        "Thứ 5",
        "Thứ 6",
        "Thứ 7",
        "Chủ nhật",
      ],
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
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
        gradientToColors: ["#10b981"],
        inverseColors: false,
        opacityFrom: 0.8,
        opacityTo: 0.1,
        stops: [0, 100],
      },
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
      name: "Doanh thu theo ngày",
      data: revenueDaily,
    },
  ];

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-5 pt-5 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 sm:pt-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          Doanh thu theo ngày trong tuần
        </h3>
      </div>

      <div className="max-w-full overflow-x-auto custom-scrollbar">
        <div className="-ml-5 min-w-[650px] xl:min-w-full pl-2">
          <ReactApexChart
            options={options}
            series={series}
            type="line"
            height={200}
          />
        </div>
      </div>
    </div>
  );
}
