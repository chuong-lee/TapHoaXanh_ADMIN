import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import FormAddVoucher from "@/components/voucher/AddVoucher";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Next.js Form Elements | TailAdmin - Next.js Dashboard Template",
  description:
    "This is Next.js Form Elements page for TailAdmin - Next.js Tailwind CSS Admin Dashboard Template",
};

export default function AddVoucher() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Tạo mới voucher" />
      <div className="grid grid-cols-1 gap-6">
        <div className="space-y-6">
          <FormAddVoucher />
        </div>
      </div>
    </div>
  );
}
