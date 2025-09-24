"use client";
import ComponentCard, { GetDateProps } from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { Option } from "@/components/form/Select";
import OrderTable, { StatusOrder, StatusOrderDisplay } from "@/components/tables/OrderTable";
import { PaymentStatus, PaymentMethod } from "@/interface/IOrder";
import { useState } from "react";
import { toast } from "sonner";

enum OrderStatsType {
  DAY = "Theo ngày",
  TODAY = "Hôm nay",
  MONTH = "Theo tháng",
  YEAR = "Theo năm",
}

const mapStatsTypeToDatePicker: Record<
  OrderStatsType,
  "date" | "month" | "year" | "today"
> = {
  [OrderStatsType.DAY]: "date",
  [OrderStatsType.TODAY]: "today",
  [OrderStatsType.MONTH]: "month",
  [OrderStatsType.YEAR]: "year",
};

export default function OrderPage() {
  const [selectedOrder, setSelectedOrder] = useState("");
  const [selectedPaymentStatus, setSelectedPaymentStatus] = useState("");
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("");
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
    { value: "success", label: StatusOrderDisplay.SUCCESS },
    { value: "pending", label: StatusOrderDisplay.PENDING },
    { value: "cancelled", label: StatusOrderDisplay.CANCELLED },
    { value: "confirmed", label: StatusOrderDisplay.CONFIRMED },
    { value: "delivered", label: StatusOrderDisplay.DELIVERED },
  ];

  const listPaymentStatus: Option[] = [
    { value: PaymentStatus.SUCCESS, label: "Đã thanh toán" },
    { value: PaymentStatus.PENDING, label: "Chưa thanh toán" },
    { value: PaymentStatus.FAIL, label: "Thanh toán thất bại" },
  ];

  const listPaymentMethod: Option[] = [
    { value: PaymentMethod.VNPAY, label: "VNPay" },
    { value: PaymentMethod.COD, label: "Thanh toán khi nhận hàng" },
  ];

  const listTime: Option[] = [
    { value: OrderStatsType.DAY, label: OrderStatsType.DAY },
    { value: OrderStatsType.TODAY, label: OrderStatsType.TODAY },
    { value: OrderStatsType.MONTH, label: OrderStatsType.MONTH },
    { value: OrderStatsType.YEAR, label: OrderStatsType.YEAR },
  ];

  const handleSelectStatusOrder = (value: string) => {
    setSelectedOrder(value);
  };

  const handleSelectPaymentStatus = (value: string) => {
    setSelectedPaymentStatus(value);
  };

  const handleSelectPaymentMethod = (value: string) => {
    setSelectedPaymentMethod(value);
  };

  const handleSelectTime = (value: string) => {
    setSelectedTime(value as OrderStatsType);
    setEndDate(null);
    setStartDate(null);
    setMonth(null);
    setYear(null);

    // Nếu chọn "Hôm nay", tự động set ngày hôm nay từ đầu ngày đến cuối ngày
    if (value === OrderStatsType.TODAY) {
      const today = new Date();

      // Đầu ngày (00:00:00)
      const startOfDay = new Date(today);
      startOfDay.setHours(0, 0, 0, 0);

      // Cuối ngày (23:59:59)
      const endOfDay = new Date(today);
      endOfDay.setHours(23, 59, 59, 999);

      setStartDate(startOfDay);
      setEndDate(endOfDay);
    }
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
    today: [], // Không cần date picker cho "Hôm nay"
    month: [
      {
        label: "Chọn tháng",
        titleId: "selected-month",
        onChange: handleSelectMonth,
        onClear: () => setMonth(null),
        type: "month",
      },
    ],
    year: [
      {
        label: "Chọn năm",
        titleId: "selected-year",
        onChange: handleSelectYear,
        onClear: () => setYear(null),
        type: "year",
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
                label: "Lọc theo trạng thái thanh toán:",
                value: selectedPaymentStatus,
                onChange: handleSelectPaymentStatus,
                options: listPaymentStatus,
              },
              {
                label: "Lọc theo phương thức thanh toán:",
                value: selectedPaymentMethod,
                onChange: handleSelectPaymentMethod,
                options: listPaymentMethod,
              },
            ]}
            search={{
              value: searchInput,
              onChange: handleSearchInput,
            }}
            onSubmit={handleSubmitSearch}
          >
            <div></div>
          </ComponentCard>

          <ComponentCard
            filters={[
              {
                label: "Lựa chọn chế độ xem đơn hàng:",
                value: selectedTime,
                onChange: handleSelectTime,
                options: listTime,
              },
            ]}
            filterByDate={filterOptions[mapStatsTypeToDatePicker[selectedTime]]}
          >
            <OrderTable
              status={selectedOrder}
              paymentStatus={selectedPaymentStatus}
              paymentMethod={selectedPaymentMethod}
              search={searchTerm}
              start_date={startDate?.toISOString()}
              end_date={endDate?.toISOString()}
              month={month!}
              year={year!}
            />
          </ComponentCard>
        </div>
      </div>
    </div>
  );
}
