import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import FormEditVoucher from "@/components/voucher/EditVoucher";

export default function EditUser() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Chỉnh sửa voucher" />
      <div className="grid grid-cols-1 gap-6">
        <div className="space-y-6">
          <FormEditVoucher />
        </div>
      </div>
    </div>
  );
}
