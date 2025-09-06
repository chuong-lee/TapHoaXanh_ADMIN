"use client";
import { EcommerceMetrics } from "@/components/ecommerce/EcommerceMetrics";
import MonthlySalesChart from "@/components/ecommerce/MonthlySalesChart";
import RecentOrders from "@/components/ecommerce/RecentOrders";
import DatePicker from "@/components/form/date-picker";
import { useState } from "react";

export default function Dashboard() {
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null);
  const handleSelectYear = (year?: number, month?: number) => {
    if (year) setSelectedYear(year);
    if (month) setSelectedMonth(month);
  };

  // handler cho year
  const handleYearChange = (dates: Date | Date[] | null) => {
    if (!dates) return;
    const date = Array.isArray(dates) ? dates[0] : dates;
    handleSelectYear(date.getFullYear(), undefined);
  };

  // handler cho month
  const handleMonthChange = (dates: Date | Date[] | null) => {
    if (!dates) return;
    const date = Array.isArray(dates) ? dates[0] : dates;
    handleSelectYear(undefined, date.getMonth() + 1); // getMonth() trả 0–11
  };
  return (
    <div className="grid grid-cols-12 gap-4 md:gap-6">
      <div className="col-span-12 xl:col-span-12">
        <EcommerceMetrics year={selectedYear} month={selectedMonth} />
      </div>

      <div className="col-span-12 xl:col-span-12">
        <div className="flex justify-end items-center gap-5 mb-5">
          <DatePicker
            id="choosed-month"
            label="Chọn theo tháng"
            placeholder="Hãy chọn tháng"
            type="dashboar-month"
            onChange={handleMonthChange}
          />
          <DatePicker
            id="choosed-year"
            label="Chọn theo năm"
            placeholder="Hãy chọn năm"
            type="year"
            onChange={handleYearChange}
          />
        </div>
        <MonthlySalesChart year={selectedYear} />
      </div>

      <div className="col-span-12 xl:col-span-12">
        <RecentOrders />
      </div>
    </div>
  );
}
