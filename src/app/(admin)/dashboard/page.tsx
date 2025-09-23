"use client";
import { EcommerceMetrics } from "@/components/ecommerce/EcommerceMetrics";
import MonthlySalesChart from "@/components/ecommerce/MonthlySalesChart";
import RecentOrders from "@/components/ecommerce/RecentOrders";
import { DailyRevenueChart } from "@/components/ecommerce/DailyRevenueChart";
import DatePicker from "@/components/form/date-picker";
import { useState } from "react";

export default function Dashboard() {
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null);
  const [selectedStartDate, setSelectedStartDate] = useState<string | null>(
    null
  );
  const [selectedEndDate, setSelectedEndDate] = useState<string | null>(null);

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

  // handler cho start date
  const handleStartDateChange = (dates: Date[]) => {
    if (!dates || dates.length === 0) return;
    setSelectedStartDate(dates[0].toISOString());
  };

  // handler cho end date
  const handleEndDateChange = (dates: Date[]) => {
    if (!dates || dates.length === 0) return;
    setSelectedEndDate(dates[0].toISOString());
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
        <div className="flex justify-end items-center gap-5 mb-5">
          <DatePicker
            id="start-date"
            label="Ngày bắt đầu"
            placeholder="Chọn ngày bắt đầu"
            type="date"
            onChange={handleStartDateChange}
          />
          <DatePicker
            id="end-date"
            label="Ngày kết thúc"
            placeholder="Chọn ngày kết thúc"
            type="date"
            onChange={handleEndDateChange}
          />
        </div>
        <DailyRevenueChart
          year={selectedYear}
          month={selectedMonth}
          startDate={selectedStartDate}
          endDate={selectedEndDate}
        />
      </div>

      <div className="col-span-12 xl:col-span-12">
        <RecentOrders />
      </div>
    </div>
  );
}
