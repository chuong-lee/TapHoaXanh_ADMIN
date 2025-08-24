"use client";
import api from "@/app/lib/axios";
import { CategoryWithChildren } from "@/interface/ICategory";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { CategoryButtonDelete } from "../modal/ModalCategory";
import { PaginationPage } from "../pagination/Pagination";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";

interface TitleHeaderProps {
  parentId?: string;
  search?: string;
}

const menuCategories = ["Tên danh mục", "Thư mục cha", "Hành đồng"];

const CategoryTable: React.FC<TitleHeaderProps> = ({ parentId, search }) => {
  const [allCategories, setAllCategories] = useState<CategoryWithChildren[]>(
    []
  );
  const [page, setPage] = useState(1);
  const [limit] = useState(3);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getAllProducts = async () => {
      try {
        const response = await api.get("/categories/search", {
          params: { page, limit, parentId, search },
        });

        setAllCategories(response.data.data);
        setTotalPages(response.data.meta.lastPage);
        setLoading(false);
      } catch (error) {
        console.error("Lỗi khi lấy sản phẩm:", error);
      }
    };

    getAllProducts();
  }, [page, limit, parentId, search]);

  return (
    <>
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        <div className="max-w-full overflow-x-auto">
          <div className="min-w-[1102px]">
            <Table>
              {/* Table Header */}
              <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                <TableRow>
                  {menuCategories.map((item, index) => (
                    <TableCell
                      isHeader
                      className="px-5 py-3 font-bold text-gray-500 text-start text-theme-xs dark:text-gray-400 uppercase"
                      key={index}
                    >
                      {item}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHeader>

              {/* Table Body */}
              <TableBody className="divide-y divide-gray-100">
                {loading ? (
                  <TableRow>
                    <TableCell className="text-center py-4">
                      Đang tải sản phẩm...
                    </TableCell>
                  </TableRow>
                ) : !allCategories || allCategories.length === 0 ? (
                  <TableRow>
                    <TableCell
                      className="text-center py-4 text-gray-500"
                      colSpan={5}
                    >
                      Không có danh mục nào
                    </TableCell>
                  </TableRow>
                ) : (
                  allCategories.map((item) => (
                    <TableRow key={item.child_id}>
                      <TableCell className="px-5 py-4 text-start">
                        <div className="flex items-center gap-3">
                          <div>
                            <span className="block font-medium">
                              {item.child_name}
                            </span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="px-5 py-4 text-start">
                        <div className="flex items-center gap-3">
                          <div>
                            <span className="block font-medium">
                              {item.parent_name}
                            </span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="px-5 py-4 text-start">
                        <div className="flex items-center gap-3 ">
                          <Link
                            className="px-3 py-3 bg-blue-500 text-white rounded-xl"
                            href={`/edit-category/${item.child_id}`}
                          >
                            Sửa
                          </Link>
                          <CategoryButtonDelete
                            id={item.child_id!}
                            name={item.child_name!}
                          />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
      {totalPages > 0 && (
        <PaginationPage
          currentPage={page}
          totalPages={totalPages}
          onPageChange={(newPage) => setPage(newPage)}
        />
      )}
    </>
  );
};

export default CategoryTable;
