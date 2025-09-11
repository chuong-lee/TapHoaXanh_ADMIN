import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import FormEditNews from "@/components/news/EditNews";

export default function EditNews() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Chỉnh sửa bài viết" />
      <div className="grid grid-cols-1 gap-6">
        <div className="space-y-6">
          <FormEditNews />
        </div>
      </div>
    </div>
  );
}
