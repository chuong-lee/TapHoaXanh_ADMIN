import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import FormEditProduct from "@/components/product/EditProduct";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Next.js Form Elements | TailAdmin - Next.js Dashboard Template",
  description:
    "This is Next.js Form Elements page for TailAdmin - Next.js Tailwind CSS Admin Dashboard Template",
};

export default function EditProduct() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Sửa sản phẩm" />
      <div className="grid grid-cols-1 gap-6">
        <div className="space-y-6">
          <FormEditProduct />
        </div>
      </div>
    </div>
  );
}
