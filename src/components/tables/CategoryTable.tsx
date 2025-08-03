"use client";
import React, { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";
import api from "@/app/lib/axios";
import Link from "next/link";
import { Category } from "@/interface/ICategory";

interface TitleHeaderProps {
  column1?: string;
  column2?: string;
  column3?: string;
  column4?: string;
  column5?: string;
}

const CategoryTable: React.FC<TitleHeaderProps> = ({
  column1,
  column2,
  column3,
  column4,
  column5,
}) => {
  const [allCategories, setAllCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/categories").then((res) => {
      const data = res.data;
      let categoryList: Category[] = [];

      if (Array.isArray(data)) {
        categoryList = data;
      } else if (
        data &&
        typeof data === "object" &&
        Array.isArray((data as { category?: unknown }).category)
      ) {
        categoryList = (data as { category: Category[] }).category;
      }

      setAllCategories(categoryList);
      setLoading(false);
    });
  }, []);

  const handleDelete = (id: number | undefined, e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!id) return;
      api.delete(`/categories/${id}`);
      alert("Xóa thành công");
      setAllCategories((prev) => prev.filter((item) => item.id !== id));
    } catch (error) {
      console.error("Xóa bị lỗi", error);
    }
  };
  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
      <div className="max-w-full overflow-x-auto">
        <div className="min-w-[1102px]">
          <Table>
            {/* Table Header */}
            <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
              <TableRow>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-bold text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  {column1}
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-bold text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  {column2}
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-bold text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  {column3}
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-bold text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  {column4}
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-bold text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  {column5}
                </TableCell>
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
              ) : allCategories.length === 0 ? (
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
                  <TableRow key={item.id}>
                    <TableCell className="px-5 py-4 text-start">
                      <div className="flex items-center gap-3">
                        <div>
                          <span className="block font-medium">{item.name}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="px-5 py-4 text-start">
                      <div className="flex items-center gap-3 ">
                        <Link
                          className="px-3 py-3 bg-blue-500 text-white rounded-xl"
                          href={`/edit-category/${item.id}`}
                        >
                          Sửa
                        </Link>

                        <button
                          className="px-3 py-3 bg-red-500 text-white rounded-xl"
                          onClick={(e) => handleDelete(item.id, e)}
                        >
                          Xoá
                        </button>
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
  );
};

export default CategoryTable;
