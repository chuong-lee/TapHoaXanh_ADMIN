"use client";
import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import CategoryTable from "@/components/tables/CategoryTable";
import useFetch from "@/hook/useFetch";
import { Category } from "@/interface/ICategory";
import { handleLoadSelectOptions } from "@/lib/utils";
import { useState } from "react";

export default function CategoryPage() {
  const [searchInput, setSearchInput] = useState(""); // giá trị đang nhập
  const [searchTerm, setSearchTerm] = useState(""); // giá trị đã submit
  const { data: allCategories } = useFetch<Category[]>("/categories");
  const [selectedCategoryId, setSelectedCategoryId] = useState("");

  const listCategories = handleLoadSelectOptions(allCategories, "id", "name");
  const handleSelectCategories = (value: string) => {
    setSelectedCategoryId(value);
  };

  const handleSearchInput = (value: string) => {
    setSearchInput(value);
  };

  const handleSubmitSearch = () => {
    setSearchTerm(searchInput);
  };

  return (
    <>
      <div>
        <PageBreadcrumb pageTitle="Quản lý danh mục" />
        <div className="space-y-6">
          <ComponentCard
            desc="Thêm danh mục"
            hrefLink="/add-category"
            filters={[
              {
                label: "Lọc theo danh mục:",
                value: selectedCategoryId,
                onChange: handleSelectCategories,
                options: listCategories,
              },
            ]}
            search={{
              value: searchInput,
              onChange: handleSearchInput,
            }}
            onSubmit={handleSubmitSearch}
          >
            <CategoryTable
              parentId={selectedCategoryId}
              search={searchTerm}
              column1="Tên danh mục"
              column2="Danh mục cha"
              column3="Hành động"
            />
          </ComponentCard>
        </div>
      </div>
    </>
  );
}
