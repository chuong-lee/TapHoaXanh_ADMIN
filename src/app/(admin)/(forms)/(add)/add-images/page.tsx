import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import AddImages from "@/components/product/AddProductImages";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Next.js Form Elements | TailAdmin - Next.js Dashboard Template",
  description:
    "This is Next.js Form Elements page for TailAdmin - Next.js Tailwind CSS Admin Dashboard Template",
};

export default function AddProductVariant() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Thêm hình ảnh sản phẩm" />
      <div className="grid grid-cols-1 gap-6">
        <div className="space-y-6">
          <AddImages />
        </div>
      </div>
    </div>
  );
}
