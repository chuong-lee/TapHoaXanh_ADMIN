"use client";
import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { Option } from "@/components/form/Select";
import NewsTable from "@/components/tables/NewsTable";
import { StatusOrder } from "@/components/tables/OrderTable";
import { useState } from "react";

export default function NewsPage() {
  const [selectedOrder, setSelectedOrder] = useState("");
  const [searchInput, setSearchInput] = useState(""); // giá trị đang nhập
  const [searchTerm, setSearchTerm] = useState(""); // giá trị đã submit

  const listStatus: Option[] = [
    { value: "success", label: StatusOrder.SUCCESS },
    { value: "pending", label: StatusOrder.PENDING },
    { value: "error", label: StatusOrder.ERROR },
  ];
  const handleSelectStatusOrder = (value: string) => {
    setSelectedOrder(value);
  };

  const handleSearchInput = (value: string) => {
    setSearchInput(value);
  };

  const handleSubmitSearch = () => {
    setSearchTerm(searchInput);
  };

  return (
    <div>
      <div>
        <PageBreadcrumb pageTitle="Quản lý bài viết" />
        <div className="space-y-6">
          <ComponentCard
            desc="Tạo bài viết"
            hrefLink="/add-news"
            filters={[
              {
                label: "Lọc theo trạng thái đơn hàng:",
                value: selectedOrder,
                onChange: handleSelectStatusOrder,
                options: listStatus,
              },
            ]}
            search={{
              value: searchInput,
              onChange: handleSearchInput,
            }}
            onSubmit={handleSubmitSearch}
          >
            <NewsTable status={selectedOrder} search={searchTerm} />
          </ComponentCard>
        </div>
      </div>
    </div>
  );
}
