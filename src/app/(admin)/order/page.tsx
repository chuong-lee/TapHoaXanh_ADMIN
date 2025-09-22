"use client";
import ComponentCard, { GetDateProps } from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { Option } from "@/components/form/Select";
import OrderTable, { StatusOrder } from "@/components/tables/OrderTable";
import { useState } from "react";
import { toast } from "sonner";

enum OrderStatsType {
  DAY = "Theo ngày",
  MONTH = "Theo tháng",
  YEAR = "Theo năm",
}

const mapStatsTypeToDatePicker: Record<
  OrderStatsType,
  "date" | "month" | "year"
> = {
  [OrderStatsType.DAY]: "date",
  [OrderStatsType.MONTH]: "month",
  [OrderStatsType.YEAR]: "year",
};

export default function OrderPage() {
  const [selectedOrder, setSelectedOrder] = useState("");
  const [searchInput, setSearchInput] = useState(""); // giá trị đang nhập
  const [searchTerm, setSearchTerm] = useState(""); // giá trị đã submit

  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [month, setMonth] = useState<number | null>(null);
  const [year, setYear] = useState<number | null>(null);
  const [selectedTime, setSelectedTime] = useState<OrderStatsType>(
    OrderStatsType.DAY
  );

  const listStatus: Option[] = [
    { value: "success", label: StatusOrder.SUCCESS },
    { value: "pending", label: StatusOrder.PENDING },
    { value: "cancelled", label: StatusOrder.CANCELLED },
  ];

  const listTime: Option[] = [
    { value: OrderStatsType.DAY, label: OrderStatsType.DAY },
    { value: OrderStatsType.MONTH, label: OrderStatsType.MONTH },
    { value: OrderStatsType.YEAR, label: OrderStatsType.YEAR },
  ];

  const handleSelectStatusOrder = (value: string) => {
    setSelectedOrder(value);
  };

  const handleSelectTime = (value: string) => {
    setSelectedTime(value as OrderStatsType);
    setEndDate(null);
    setStartDate(null);
    setMonth(null);
    setYear(null);
  };

  const handleSearchInput = (value: string) => {
    setSearchInput(value);
  };

  const handleSubmitSearch = () => {
    setSearchTerm(searchInput);
  };

  const handleSelectStartDate = (date: Date[]) => {
    const selectedDate = date[0]; // lấy ngày đầu tiên
    if (!selectedDate) return;

    if (endDate && selectedDate >= new Date(endDate)) {
      toast.error("Ngày bắt đầu phải nhỏ hơn ngày kết thúc");
      setStartDate(null);
      return;
    }
    setStartDate(selectedDate);
    setMonth(null);
    setYear(null);
  };

  const handleSelectEndDate = (date: Date[]) => {
    const selectedDate = date[0]; // hoặc date[1] nếu bạn muốn lấy ngày cuối
    if (!selectedDate) return;

    if (startDate && selectedDate <= new Date(startDate)) {
      toast.error("Ngày kết thúc phải lớn hơn ngày bắt đầu");
      setEndDate(null);
      return;
    }
    setEndDate(selectedDate);
    setMonth(null);
    setYear(null);
  };

  const handleSelectMonth = (date: Date[]) => {
    const selectedDate = date[0]; // hoặc date[1] nếu bạn muốn lấy ngày cuối
    if (!selectedDate) return;
    const month = selectedDate.getMonth() + 1;
    console.log("🚀 ~ handleSelectMonth ~ month:", month);
    setMonth(month);
    setStartDate(null);
    setEndDate(null);
    setYear(null);
  };

  const handleSelectYear = (date: Date[]) => {
    const selectedDate = date[0]; // hoặc date[1] nếu bạn muốn lấy ngày cuối
    if (!selectedDate) return;
    setYear(selectedDate.getFullYear());
    setStartDate(null);
    setEndDate(null);
  };
  console.log(year);

  const filterOptions: Record<string, GetDateProps[]> = {
    date: [
      {
        label: "Ngày bắt đầu",
        titleId: "selected-start-date",
        onChange: handleSelectStartDate,
        onClear: () => setStartDate(null),
      },
      {
        label: "Ngày kết thúc",
        titleId: "selected-end-date",
        onChange: handleSelectEndDate,
        onClear: () => setEndDate(null),
      },
    ],
    month: [
      {
        label: "Chọn tháng",
        titleId: "selected-month",
        onChange: handleSelectMonth,
        onClear: () => setMonth(null),
        type: mapStatsTypeToDatePicker[selectedTime],
      },
    ],

    year: [
      {
        label: "Chọn năm",
        titleId: "selected-year",
        onChange: handleSelectYear,
        onClear: () => setYear(null),
        type: mapStatsTypeToDatePicker[selectedTime],
      },
    ],
  };

  return (
    <div>
      <div>
        <PageBreadcrumb pageTitle="Quản lý đơn hàng" />
        <div className="space-y-6">
          <ComponentCard
            filters={[
              {
                label: "Lọc theo trạng thái đơn hàng:",
                value: selectedOrder,
                onChange: handleSelectStatusOrder,
                options: listStatus,
              },
              {
                label: "Lựa chọn chế độ xem đơn hàng:",
                value: selectedTime,
                onChange: handleSelectTime,
                options: listTime,
              },
            ]}
            filterByDate={filterOptions[mapStatsTypeToDatePicker[selectedTime]]}
            search={{
              value: searchInput,
              onChange: handleSearchInput,
            }}
            onSubmit={handleSubmitSearch}
          >
            <OrderTable
              status={selectedOrder}
              search={searchTerm}
              start_date={startDate?.toISOString()}
              end_date={endDate?.toISOString()}
              month={month!}
            />
          </ComponentCard>
        </div>
      </div>
    </div>
  );
}
