import FormEditCategory from "@/components/category/EditCategory";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Next.js Form Elements | TailAdmin - Next.js Dashboard Template",
  description:
    "This is Next.js Form Elements page for TailAdmin - Next.js Tailwind CSS Admin Dashboard Template",
};

export default function EditCategory() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Sửa danh mục" />
      <div className="grid grid-cols-1 gap-6">
        <div className="space-y-6">
          <FormEditCategory />
        </div>
      </div>
    </div>
  );
}
