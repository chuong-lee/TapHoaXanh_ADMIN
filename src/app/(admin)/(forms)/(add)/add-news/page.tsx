import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import FormAddNews from "@/components/news/AddNews";

export default function AddVoucher() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Tạo mới bài viết" />
      <div className="grid grid-cols-1 gap-6">
        <div className="space-y-6">
          <FormAddNews />
        </div>
      </div>
    </div>
  );
}
