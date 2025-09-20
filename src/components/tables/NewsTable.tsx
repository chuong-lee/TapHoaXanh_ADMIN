"use client";
import api from "@/app/lib/axios";
import { News } from "@/interface/INews";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { NewsButtonDelete } from "../modal/ModalNews";
import { PaginationPage } from "../pagination/Pagination";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";

interface TitleHeaderProps {
  status?: string;
  search?: string;
}

const columns = [
  "Tiêu đề bài viết",
  "Loại bài viết",
  "Nội dung",
  "Lượt xem",
  "Lượt thích",
  "Hành động",
];

export enum StatusOrder {
  SUCCESS = "Đã thanh toán",
  ERROR = "Đã hủy",
  PENDING = "Chưa thanh toán",
}

const NewsTable: React.FC<TitleHeaderProps> = ({ status, search }) => {
  const [allProducts, setAllProducts] = useState<News[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  useEffect(() => {
    const getAllProducts = async () => {
      try {
        const response = await api.get("/news/search", {
          params: {
            page,
            limit: 10,
            search,
          },
        });

        setAllProducts(response.data.data);
        setTotalPages(response.data.meta.lastPage);
        setLoading(false);
      } catch (error) {
        console.error("Lỗi khi lấy sản phẩm:", error);
      }
    };

    getAllProducts();
  }, [page, search, status]);

  return (
    <>
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        <div className="max-w-full overflow-x-auto">
          <div className="min-w-[1102px]">
            <Table>
              {/* Table Header */}
              <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                <TableRow>
                  {columns.map((item, index) => (
                    <>
                      <TableCell
                        isHeader
                        className="px-5 py-3 font-bold text-gray-500 text-start text-theme-xs dark:text-gray-400 uppercase"
                        key={index}
                      >
                        {item}
                      </TableCell>
                    </>
                  ))}
                </TableRow>
              </TableHeader>

              {/* Table Body */}
              <TableBody className="divide-y divide-gray-100">
                {loading ? (
                  <TableRow>
                    <TableCell className="text-center py-4 text-gray-500">
                      Đang tải ...
                    </TableCell>
                  </TableRow>
                ) : allProducts.length === 0 ? (
                  <TableRow>
                    <TableCell
                      className="text-center py-4 text-gray-500"
                      colSpan={5}
                    >
                      Không có đơn hàng nào.
                    </TableCell>
                  </TableRow>
                ) : (
                  allProducts.map((item) => {
                    return (
                      <TableRow key={item.id}>
                        <TableCell className="px-5 py-4 text-start">
                          {item.name}
                        </TableCell>
                        <TableCell className="px-5 py-4 text-start">
                          {item.type}
                        </TableCell>
                        <TableCell className="px-5 py-4 text-start">
                          {item.description.length > 200
                            ? `${item.description.substring(0, 200)} [...]`
                            : item.description}
                        </TableCell>
                        <TableCell className="px-5 py-4 text-start">
                          {item.views}
                        </TableCell>
                        <TableCell className="px-5 py-4 text-start">
                          {item.likes}
                        </TableCell>
                        <TableCell className="px-5 py-4 text-start">
                          <div className="flex items-center gap-3">
                            <Link
                              className="px-3 py-3 bg-blue-500 text-white rounded-xl"
                              href={`/edit-news/${item.id}`}
                            >
                              Sửa
                            </Link>
                            {item.id && (
                              <NewsButtonDelete id={item.id} name={item.name} />
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
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

export default NewsTable;
