"use client";
import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ProductTable from "@/components/tables/ProductTable";
import useFetch from "@/hook/useFetch";
import { Brand } from "@/interface/IBrand";
import { Category } from "@/interface/ICategory";
import { handleLoadSelectOptions } from "@/lib/utils";
import { useState } from "react";

export default function Product() {
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [selectedBrandId, setSelectedBrandId] = useState("");
  const { data: allCategories } = useFetch<Category[]>("/categories");
  const { data: allBrands } = useFetch<Brand[]>("/brand");
  const [searchInput, setSearchInput] = useState(""); // giá trị đang nhập
  const [searchTerm, setSearchTerm] = useState(""); // giá trị đã submit

  const listCategories = handleLoadSelectOptions(allCategories, "id", "name", {
    value: 'null',
    label: "Sản phẩm không thuộc nhóm sản phẩm nào",
  });
  const listBrands = handleLoadSelectOptions(allBrands, "id", "name");

  const handleSelectCategories = (value: string) => {
    setSelectedCategoryId(value);
  };

  const handleSelectBrand = (value: string) => {
    setSelectedBrandId(value);
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
        <PageBreadcrumb pageTitle="Quản lý sản phẩm" />
        <div className="space-y-6">
          <ComponentCard
            desc="Thêm sản phẩm"
            hrefLink="/add-product"
            filters={[
              {
                label: "Lọc theo danh mục:",
                value: selectedCategoryId,
                onChange: handleSelectCategories,
                options: listCategories,
              },
              {
                label: "Lọc theo thương hiệu:",
                value: selectedBrandId,
                onChange: handleSelectBrand,
                options: listBrands,
              },
            ]}
            search={{
              value: searchInput,
              onChange: handleSearchInput,
            }}
            onSubmit={handleSubmitSearch}
          >
            <ProductTable
              categoryId={selectedCategoryId}
              brand={selectedBrandId}
              search={searchTerm}
            />
          </ComponentCard>
        </div>
      </div>
    </div>
  );
}
