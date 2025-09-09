"use client";
import api from "@/app/lib/axios";
import { Rating } from "@/interface/IRating";
import React, { useEffect, useState } from "react";
import { RatingButtonDelete } from "../modal/ModalRating";
import { PaginationPage } from "../pagination/Pagination";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";
import RatingComponent from "../rating/Rating";

interface TitleHeaderProps {
  search?: string;
  start_date?: string;
  end_date?: string;
}

const columns = [
  "Tên sản phẩm",
  "Tên khách hàng",
  "Bình luận",
  "Số sao",
  "Hành động",
];

const RatingTable: React.FC<TitleHeaderProps> = ({ search }) => {
  const [allVouchers, setAllVouchers] = useState<Rating[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  useEffect(() => {
    const getAllProducts = async () => {
      try {
        const response = await api.get("/rating/search", {
          params: { page, limit: 10, search },
        });

        setAllVouchers(response.data.data);
        setTotalPages(response.data.meta.lastPage);
        setLoading(false);
      } catch (error) {
        console.error("Lỗi khi lấy sản phẩm:", error);
      }
    };

    getAllProducts();
  }, [page, search]);

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
                        className="px-5 py-3 font-bold text-gray-500 text-center text-theme-xs dark:text-gray-400 uppercase"
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
                ) : allVouchers.length === 0 ? (
                  <TableRow>
                    <TableCell
                      className="text-center py-4 text-gray-500"
                      colSpan={5}
                    >
                      Không có voucher nào.
                    </TableCell>
                  </TableRow>
                ) : (
                  allVouchers.map((item) => {
                    return (
                      <TableRow key={item.id}>
                        <TableCell className="px-5 py-4 text-center">
                          {item.product.name}
                        </TableCell>
                        <TableCell className="px-5 py-4 text-center">
                          {item.users.name}
                        </TableCell>
                        <TableCell className="px-5 py-4 text-center">
                          {item.comment}
                        </TableCell>
                        <TableCell className="px-5 py-4 text-center">
                          <RatingComponent rating={item.rating} />
                        </TableCell>

                        <TableCell className="px-5 py-4 text-center">
                          <div className="w-full">
                            {item.id && (
                              <RatingButtonDelete
                                voucherId={item.id}
                                customerName={item.users.name}
                              />
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

export default RatingTable;
