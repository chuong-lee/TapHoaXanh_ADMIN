"use client";
import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ProductImages from "@/components/tables/ProductImages";

export default function Product() {
  return (
    <div>
      <div>
        <PageBreadcrumb pageTitle="Quản lý hình ảnh sản phẩm" />
        <div className="space-y-6">
          <ComponentCard
            title="Danh sách hình ảnh sản phẩm"
            desc="Thêm hình ảnh"
            hrefLink="/add-images"
          >
            <ProductImages />
          </ComponentCard>
        </div>
      </div>
    </div>
  );
}
