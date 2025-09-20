"use client";
import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import RatingTable from "@/components/tables/RatingTable";
import { useState } from "react";

export default function RatingPage() {
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
        <PageBreadcrumb pageTitle="Quản lý đánh giá" />
        <div className="space-y-6">
          <ComponentCard
            search={{
              value: searchInput,
              onChange: handleSearchInput,
            }}
            onSubmit={handleSubmitSearch}
          >
            <RatingTable search={searchTerm} />
          </ComponentCard>
        </div>
      </div>
    </div>
  );
}
