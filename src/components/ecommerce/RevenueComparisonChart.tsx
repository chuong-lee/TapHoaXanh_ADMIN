"use client";
import api from "@/app/lib/axios";
import { ApexOptions } from "apexcharts";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

// Dynamically import the ReactApexChart component
const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

interface ComparisonData {
  current: number[];
  previous: number[];
  labels: string[];
}

export default function RevenueComparisonChart() {
  const [comparisonData, setComparisonData] = useState<ComparisonData>({
    current: [],
    previous: [],
    labels: []
  });

  useEffect(() => {
    const fetchComparisonData = async () => {
      try {
        // Lấy dữ liệu so sánh tuần này vs tuần trước
        const currentWeekResponse = await api.get("/order/revenue-daily", {
          params: { 
            year: new Date().getFullYear(),
            week: Math.ceil(new Date().getDate() / 7)
          },
        });
        
        const lastWeekResponse = await api.get("/order/revenue-daily", {
          params: { 
            year: new Date().getFullYear(),
            week: Math.ceil(new Date().getDate() / 7) - 1
          },
        });

        const labels = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];
        
        setComparisonData({
          current: currentWeekResponse.data,
          previous: lastWeekResponse.data,
          labels
        });
      } catch (error) {
        console.error("Lỗi khi lấy dữ liệu so sánh:", error);
        setComparisonData({
          current: [],
          previous: [],
          labels: []
        });
      }
    };

    fetchComparisonData();
  }, []);

  const options: ApexOptions = {
    colors: ["#10b981", "#6b7280"],
    chart: {
      fontFamily: "Outfit, sans-serif",
      type: "line",
      height: 250,
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
      colors: ["#10b981", "#6b7280"],
      curve: "smooth",
    },
    xaxis: {
      categories: comparisonData.labels,
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
      horizontalAlign: "right",
      fontFamily: "Outfit",
      markers: {
        radius: 4,
      },
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
        gradientToColors: ["#10b981", "#6b7280"],
        inverseColors: false,
        opacityFrom: 0.3,
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
      name: "Tuần này",
      data: comparisonData.current,
    },
    {
      name: "Tuần trước",
      data: comparisonData.previous,
    },
  ];

  // Tính tổng doanh thu và phần trăm thay đổi
  const currentTotal = comparisonData.current.reduce((sum, val) => sum + val, 0);
  const previousTotal = comparisonData.previous.reduce((sum, val) => sum + val, 0);
  const percentageChange = previousTotal > 0 
    ? Math.round(((currentTotal - previousTotal) / previousTotal) * 100 * 10) / 10
    : 0;

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-5 pt-5 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 sm:pt-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          So sánh doanh thu tuần này vs tuần trước
        </h3>
        <div className="text-right">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Tổng tuần này: {currentTotal.toLocaleString('vi-VN')} ₫
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Tổng tuần trước: {previousTotal.toLocaleString('vi-VN')} ₫
          </div>
          <div className={`text-sm font-medium ${percentageChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {percentageChange >= 0 ? '+' : ''}{percentageChange}%
          </div>
        </div>
      </div>

      <div className="max-w-full overflow-x-auto custom-scrollbar">
        <div className="-ml-5 min-w-[650px] xl:min-w-full pl-2">
          <ReactApexChart
            options={options}
            series={series}
            type="line"
            height={250}
          />
        </div>
      </div>
    </div>
  );
}
