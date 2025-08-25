"use client";
import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import VoucherTable from "@/components/tables/VoucherTable";
import { useState } from "react";
import { toast } from "sonner";

export default function VoucherPage() {
  const [selectedOrder, setSelectedOrder] = useState("");
  const [searchInput, setSearchInput] = useState(""); // giá trị đang nhập
  const [searchTerm, setSearchTerm] = useState(""); // giá trị đã submit

  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

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
      return;
    }
    setStartDate(selectedDate);
  };

  const handleSelectEndDate = (date: Date[]) => {
    const selectedDate = date[0]; // hoặc date[1] nếu bạn muốn lấy ngày cuối
    if (!selectedDate) return;

    if (startDate && selectedDate <= new Date(startDate)) {
      toast.error("Ngày kết thúc phải lớn hơn ngày bắt đầu");

      return;
    }
    setEndDate(selectedDate);
  };
  return (
    <div>
      <div>
        <PageBreadcrumb pageTitle="Quản lý voucher" />
        <div className="space-y-6">
          <ComponentCard
            desc="Tạo voucher"
            hrefLink="/add-voucher"
            search={{
              value: searchInput,
              onChange: handleSearchInput,
            }}
            onSubmit={handleSubmitSearch}
            filterByDate={[
              {
                label: "Ngày bắt đầu",
                titleId: "filter-start-date",
                onChange: handleSelectStartDate,
              },

              {
                label: "Ngày kết thúc",
                titleId: "filter-end-date",
                onChange: handleSelectEndDate,
              },
            ]}
          >
            <VoucherTable
              status={selectedOrder}
              search={searchTerm}
              start_date={startDate?.toISOString()}
              end_date={endDate?.toISOString()}
            />
          </ComponentCard>
        </div>
      </div>
    </div>
  );
}
