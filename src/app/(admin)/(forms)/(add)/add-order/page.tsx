import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import FormAddOrder from "@/components/order/AddOrder";

export default function AddProductVariant() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Thêm mới đơn hàng" />
      <div className="grid grid-cols-1 gap-6">
        <div className="space-y-6">
          <FormAddOrder />
        </div>
      </div>
    </div>
  );
}
