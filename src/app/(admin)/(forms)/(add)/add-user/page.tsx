import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import FormAddUser from "@/components/user-profile/AddUser";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Next.js Form Elements | TailAdmin - Next.js Dashboard Template",
  description:
    "This is Next.js Form Elements page for TailAdmin - Next.js Tailwind CSS Admin Dashboard Template",
};

export default function AddUser() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Cập nhật thông tin người dùng" />
      <div className="grid grid-cols-1 gap-6">
        <div className="space-y-6">
          <FormAddUser />
        </div>
      </div>
    </div>
  );
}
