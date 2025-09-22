"use client";
import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import NewsTable from "@/components/tables/NewsTable";
import { useState } from "react";

export default function NewsPage() {
  const [selectedOrder] = useState("");
  const [searchInput, setSearchInput] = useState(""); // giá trị đang nhập
  const [searchTerm, setSearchTerm] = useState(""); // giá trị đã submit

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
