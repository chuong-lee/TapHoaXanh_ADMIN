import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import BasicTableOne from "@/components/tables/BasicTableOne";
import React from "react";

export default function Product() {
  return (
    <div>
      <div>
        <PageBreadcrumb pageTitle="Quản lý sản phẩm" />
        <div className="space-y-6">
          <ComponentCard buttonTitle="Thêm sản phẩm">
            <BasicTableOne column1="Tên sản phẩm" column2="Giá sản phẩm" column3="Số lượng sản phẩm" column4="Hành động"/>
          </ComponentCard>
        </div>
      </div>
    </div>
  );
}
