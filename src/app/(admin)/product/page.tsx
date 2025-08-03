"use client";
import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ProductTable from "@/components/tables/ProductTable";

export default function Product() {
  return (
    <div>
      <div>
        <PageBreadcrumb pageTitle="Quản lý sản phẩm" />
        <div className="space-y-6">
          <ComponentCard
            title="Danh sách sản phẩm"
            desc="Thêm sản phẩm"
            hrefLink="/add-product"
          >
            <ProductTable
              column1="Tên sản phẩm"
              column2="Mã sản phẩm"
              column3="Giá sản phẩm"
              column4="Số lượng sản phẩm"
              column5="Hành động"
            />
          </ComponentCard>
        </div>
      </div>
    </div>
  );
}
