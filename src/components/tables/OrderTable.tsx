"use client";
import api from "@/app/lib/axios";
import { OrderUser } from "@/interface/IOrder";
import React, { useEffect, useState } from "react";
import { PaginationPage } from "../pagination/Pagination";
import Badge, { BadgeColor } from "../ui/badge/Badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";
import { PopupViewDetailOrder } from "../modal/order/ViewDetailOrder";

interface TitleHeaderProps {
  status?: string;
  search?: string;
  start_date?: string;
  end_date?: string;
  month?: number;
  year?: number;
}

const columns = [
  "Mã đơn hàng",
  "Tên khách hàng",
  "SĐT",
  "Tổng giá",
  "Trạng thái",
];

export enum StatusOrder {
  SUCCESS = "Đã thanh toán",
  ERROR = "Đã hủy",
  PENDING = "Chưa thanh toán",
}

const statusColors: Record<StatusOrder, BadgeColor> = {
  [StatusOrder.SUCCESS]: "success",
  [StatusOrder.PENDING]: "warning",
  [StatusOrder.ERROR]: "error",
};

const OrderTable: React.FC<TitleHeaderProps> = ({
  status,
  search,
  start_date,
  end_date,
  month,
  year,
}) => {
  const [allProducts, setAllProducts] = useState<OrderUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  useEffect(() => {
    const getAllProducts = async () => {
      try {
        const response = await api.get("/order/search", {
          params: {
            page,
            limit: 10,
            search,
            status,
            start_date,
            end_date,
            month,
            year,
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
  }, [page, search, status, start_date, end_date, month, year]);

  const getColorStatus = (status: string): StatusOrder => {
    switch (status) {
      case "success":
        return StatusOrder.SUCCESS;
      case "pending":
        return StatusOrder.PENDING;
      case "error":
        return StatusOrder.ERROR;
      default:
        return StatusOrder.PENDING; // fallback or choose appropriate default
    }
  };

  function formatNumberWithComma(num: number): string {
    return num.toLocaleString("en-US"); // hoặc "vi-VN" nếu muốn dùng dấu chấm cho VN
  }
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
                    const formatTotalPrice = formatNumberWithComma(
                      item.totalPrice
                    );

                    const status = getColorStatus(item.status);
                    return (
                      <TableRow key={item.id}>
                        <TableCell className="px-5 py-4 text-start">
                          {item.orderCode}
                        </TableCell>
                        <TableCell className="px-5 py-4 text-start">
                          {item.userName}
                        </TableCell>
                        <TableCell className="px-5 py-4 text-start">
                          {item.userPhone}
                        </TableCell>
                        <TableCell className="px-5 py-4 text-start">
                          {formatTotalPrice}
                        </TableCell>
                        <TableCell className="px-5 py-4 text-start">
                          <Badge variant="solid" color={statusColors[status]}>
                            {status}
                          </Badge>
                        </TableCell>
                        <TableCell className="px-5 py-4 text-start">
                          <div className="flex items-center gap-3">
                            {item.orderCode && (
                              <PopupViewDetailOrder
                                orderCode={item.orderCode}
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

export default OrderTable;
