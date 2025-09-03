"use client";
import api from "@/app/lib/axios";
import { ApexOptions } from "apexcharts";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

// Dynamically import the ReactApexChart component
const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

export default function WeeklyRevenueChart() {
  const [revenueWeekly, setRevenueWeekly] = useState<number[]>([]);

  useEffect(() => {
    const getWeeklyRevenue = async () => {
      try {
        const response = await api.get("/order/revenue-weekly", {
          params: { year: new Date().getFullYear(), month: new Date().getMonth() + 1 },
        });
        setRevenueWeekly(response.data);
      } catch (error) {
        console.error("Lỗi khi lấy doanh thu theo tuần:", error);
        setRevenueWeekly([]);
      }
    };
    getWeeklyRevenue();
  }, []);

  const options: ApexOptions = {
    colors: ["#f59e0b"],
    chart: { fontFamily: "Outfit, sans-serif", type: "area", height: 200, toolbar: { show: false } },
    dataLabels: { enabled: false },
    stroke: { show: true, width: 2, colors: ["#f59e0b"] },
    xaxis: {
      categories: ["Tuần 1","Tuần 2","Tuần 3","Tuần 4","Tuần 5"],
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    legend: { show: false },
    yaxis: { title: { text: "Doanh thu (VNĐ)" } },
    grid: { yaxis: { lines: { show: true } } },
    fill: { type: "gradient", gradient: { shade: "light", type: "vertical", shadeIntensity: 0.4, gradientToColors: ["#f59e0b"], inverseColors: false, opacityFrom: 0.6, opacityTo: 0.1, stops: [0, 100] } },
    tooltip: { x: { show: false }, y: { formatter: (val: number) => `${val.toLocaleString('vi-VN')} ₫` } },
  };

  const series = [{ name: "Doanh thu theo tuần", data: revenueWeekly }];

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-5 pt-5 dark:border-gray-800 dark:bg.white/[0.03] sm:px-6 sm:pt-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">Doanh thu theo tuần trong tháng</h3>
      </div>
      <div className="max-w-full overflow-x-auto custom-scrollbar">
        <div className="-ml-5 min-w-[650px] xl:min-w-full pl-2">
          <ReactApexChart options={options} series={series} type="area" height={200} />
        </div>
      </div>
    </div>
  );
}
