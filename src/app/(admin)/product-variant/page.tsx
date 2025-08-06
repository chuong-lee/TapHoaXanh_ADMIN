"use client";
import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ProductVariants from "@/components/tables/ProductVariants";

export default function Product() {
  return (
    <div>
      <div>
        <PageBreadcrumb pageTitle="Quản lý sản phẩm biến thể" />
        <div className="space-y-6">
          <ComponentCard
            title="Danh sách sản phẩm biến thể"
            desc="Thêm sản phẩm biến thể"
            hrefLink="/add-product-variant"
          >
            <ProductVariants
              column1="Tên sản phẩm biến thể"
              column2="Giá sản phẩm"
              column3="Số lượng sản phẩm"
              column4="Hành động"
            />
          </ComponentCard>
        </div>
      </div>
    </div>
  );
}
