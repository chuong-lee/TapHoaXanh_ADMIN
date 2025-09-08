"use client";
import api from "@/app/lib/axios";
import { ApexOptions } from "apexcharts";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

// Dynamically import the ReactApexChart component
const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

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
    categories: [
      "Tháng 1",
      "Tháng 2",
      "Tháng 3",
      "Tháng 4",
      "Tháng 5",
      "Tháng 6",
      "Tháng 7",
      "Tháng 8",
      "Tháng 9",
      "Tháng 10",
      "Tháng 11",
      "Tháng 12",
    ],
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
      text: undefined,
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
      formatter: (val: number) => `${val}`,
    },
  },
};

interface TitleHeaderProps {
  year?: number | null;
}

export default function MonthlySalesChart({ year }: TitleHeaderProps) {
  const [revenueMonth, setRevenueMonth] = useState<number[]>([]);
  useEffect(() => {
    const getMonthyRevenue = async () => {
      const response = await api.get("/order/revenue-month", {
        params: { year },
      });
      setRevenueMonth(response.data);
    };
    getMonthyRevenue();
  }, [year]);

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
          Doanh thu theo tháng
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
