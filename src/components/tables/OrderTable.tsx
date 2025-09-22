"use client";
import api from "@/app/lib/axios";
import {
  OrderUser,
  PaymentMethod,
  PaymentStatus,
  PaymentMethodDisplay,
  PaymentStatusDisplay,
} from "@/interface/IOrder";
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
  "Phương thức thanh toán",
  "Trạng thái thanh toán",
  "Trạng thái",
  "Hành động",
];

export enum StatusOrder {
  PENDING = "pending",
  CONFIRMED = "confirmed",
  DELIVERED = "delivered",
  SUCCESS = "success",
  CANCELLED = "cancelled",
}

export enum StatusOrderDisplay {
  PENDING = "Chờ xử lý",
  CONFIRMED = "Đã xác nhận",
  DELIVERED = "Đang giao hàng",
  SUCCESS = "Đã hoàn thành",
  CANCELLED = "Đã hủy",
}

const statusColors: Record<StatusOrder, BadgeColor> = {
  [StatusOrder.SUCCESS]: "success",
  [StatusOrder.PENDING]: "warning",
  [StatusOrder.CANCELLED]: "error",
  [StatusOrder.DELIVERED]: "primary",
  [StatusOrder.CONFIRMED]: "info",
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
      case "confirmed":
        return StatusOrder.CONFIRMED;
      case "delivered":
        return StatusOrder.DELIVERED;
      case "cancelled":
        return StatusOrder.CANCELLED;
      default:
        return StatusOrder.PENDING;
    }
  };

  const getStatusDisplay = (status: StatusOrder): string => {
    switch (status) {
      case StatusOrder.PENDING:
        return StatusOrderDisplay.PENDING;
      case StatusOrder.CONFIRMED:
        return StatusOrderDisplay.CONFIRMED;
      case StatusOrder.DELIVERED:
        return StatusOrderDisplay.DELIVERED;
      case StatusOrder.SUCCESS:
        return StatusOrderDisplay.SUCCESS;
      case StatusOrder.CANCELLED:
        return StatusOrderDisplay.CANCELLED;
      default:
        return StatusOrderDisplay.PENDING;
    }
  };

  const getPaymentMethodDisplay = (paymentMethod: string): string => {
    switch (paymentMethod) {
      case PaymentMethod.COD:
        return PaymentMethodDisplay.COD;
      case PaymentMethod.VNPAY:
        return PaymentMethodDisplay.VNPAY;
      default:
        return "Chưa chọn";
    }
  };

  const getPaymentStatusDisplay = (paymentStatus: string): string => {
    switch (paymentStatus) {
      case PaymentStatus.PENDING:
        return PaymentStatusDisplay.PENDING;
      case PaymentStatus.SUCCESS:
        return PaymentStatusDisplay.SUCCESS;
      case PaymentStatus.FAIL:
        return PaymentStatusDisplay.FAIL;
      default:
        return PaymentStatusDisplay.PENDING;
    }
  };

  const getPaymentStatusColor = (paymentStatus: string): BadgeColor => {
    switch (paymentStatus) {
      case PaymentStatus.SUCCESS:
        return "success";
      case PaymentStatus.PENDING:
        return "warning";
      case PaymentStatus.FAIL:
        return "error";
      default:
        return "warning";
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
                      colSpan={8}
                    >
                      Không có đơn hàng nào.
                    </TableCell>
                  </TableRow>
                ) : (
                  allProducts.map((item) => {
                    const formatTotalPrice = formatNumberWithComma(
                      item.total_price
                    );

                    const currentStatus = getColorStatus(item.status);

                    // Lấy thông tin payment từ mảng payments (lấy payment đầu tiên)
                    const payment =
                      item.payments && item.payments.length > 0
                        ? item.payments[0]
                        : null;
                    const paymentMethod = payment?.payment_method || "";
                    const paymentStatus = payment?.status || "";

                    return (
                      <TableRow key={item.id}>
                        <TableCell className="px-5 py-4 text-start">
                          {item.order_code}
                        </TableCell>
                        <TableCell className="px-5 py-4 text-start">
                          {item.user.name}
                        </TableCell>
                        <TableCell className="px-5 py-4 text-start">
                          {item.user.phone}
                        </TableCell>
                        <TableCell className="px-5 py-4 text-start">
                          {formatTotalPrice}
                        </TableCell>
                        <TableCell className="px-5 py-4 text-start">
                          {getPaymentMethodDisplay(paymentMethod)}
                        </TableCell>
                        <TableCell className="px-5 py-4 text-start">
                          <Badge
                            variant="solid"
                            color={getPaymentStatusColor(paymentStatus)}
                          >
                            {getPaymentStatusDisplay(paymentStatus)}
                          </Badge>
                        </TableCell>
                        <TableCell className="px-5 py-4 text-start">
                          <Badge
                            variant="solid"
                            color={statusColors[currentStatus]}
                          >
                            {getStatusDisplay(currentStatus)}
                          </Badge>
                        </TableCell>
                        <TableCell className="px-5 py-4 text-start">
                          <div className="flex items-center gap-3">
                            {item.order_code && (
                              <PopupViewDetailOrder
                                orderCode={item.order_code}
                                orderId={item.id}
                                currentStatus={item.status}
                                paymentMethod={paymentMethod}
                                paymentStatus={paymentStatus}
                                onStatusUpdate={() => {
                                  // Refresh data after status update
                                  const refreshData = async () => {
                                    try {
                                      const response = await api.get(
                                        "/order/search",
                                        {
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
                                        }
                                      );
                                      setAllProducts(response.data.data);
                                    } catch (error) {
                                      console.error(
                                        "Lỗi khi refresh data:",
                                        error
                                      );
                                    }
                                  };
                                  refreshData();
                                }}
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
