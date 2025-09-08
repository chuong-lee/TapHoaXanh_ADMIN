"use client";
import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { Option } from "@/components/form/Select";
import UserTable from "@/components/tables/UserTable";
import { TUserRole } from "@/interface/IUser";
import { useState } from "react";

export default function UserPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProductId, setSelectedProductId] = useState("");

  const productOptions: Option[] = [
    { value: TUserRole.ADMIN, label: TUserRole.ADMIN },
    { value: TUserRole.USER, label: TUserRole.USER },
  ];

  const handleSelectProduct = (value: string) => {
    setSelectedProductId(value);
  };

  const handleSearchItem = (value: string) => {
    setSearchTerm(value);
  };

  return (
    <div>
      <div>
        <PageBreadcrumb pageTitle="Quản lý danh sách người dùng" />
        <div className="space-y-6">
          <ComponentCard
            hrefLink="/add-product-variant"
            filters={[
              {
                label: "Lọc theo vai trò:",
                value: selectedProductId,
                onChange: handleSelectProduct,
                options: productOptions,
              },
            ]}
            search={{
              value: searchTerm,
              onChange: handleSearchItem,
            }}
          >
            <UserTable filterRole={selectedProductId} searchItem={searchTerm} />
          </ComponentCard>
        </div>
      </div>
    </div>
  );
}
