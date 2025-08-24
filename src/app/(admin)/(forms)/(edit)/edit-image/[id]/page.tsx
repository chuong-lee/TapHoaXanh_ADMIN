import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import EditImages from "@/components/product/EditImages";

export default function EditImage() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Sửa hình ảnh" />
      <div className="grid grid-cols-1 gap-6">
        <div className="space-y-6">
          <EditImages />
        </div>
      </div>
    </div>
  );
}
