import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import CategoryTable from "@/components/tables/CategoryTable";

export default function Category() {
  return (
    <>
      <div>
        <PageBreadcrumb pageTitle="Quản lý danh mục" />
        <div className="space-y-6">
          <ComponentCard
            title="Danh sách danh mục"
            desc="Thêm danh mục"
            hrefLink="/add-category"
          >
            <CategoryTable column1="Tên sản phẩm" column2="Hành động" />
          </ComponentCard>
        </div>
      </div>
    </>
  );
}
