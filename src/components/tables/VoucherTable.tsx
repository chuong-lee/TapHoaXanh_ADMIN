"use client";
import api from "@/app/lib/axios";
import { Voucher } from "@/interface/IVoucher";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { VoucherButtonDelete } from "../modal/ModalVoucher";
import { PaginationPage } from "../pagination/Pagination";
import Badge, { BadgeColor } from "../ui/badge/Badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";

interface TitleHeaderProps {
  search?: string;
  start_date?: string;
  end_date?: string;
}

const columns = [
  "Mã voucher",
  "Số lượng",
  "Loại voucher",
  "Ngày bắt đầu",
  "Ngày kết thúc",
  "Trạng thái voucher",
  "Hành động",
];

export enum StatusVoucher {
  VALID = "Còn hạn",
  ALMOST_EXPIRED = "Sắp hết hạn",
  EXPIRED = "Hết hạn",
  NOT_STARTED = "Chưa bắt đầu",
}

const statusColors: Record<StatusVoucher, BadgeColor> = {
  [StatusVoucher.VALID]: "success",
  [StatusVoucher.ALMOST_EXPIRED]: "warning",
  [StatusVoucher.EXPIRED]: "error",
  [StatusVoucher.NOT_STARTED]: "info",
};

const VoucherTable: React.FC<TitleHeaderProps> = ({
  search,
  start_date,
  end_date,
}) => {
  const [allVouchers, setAllVouchers] = useState<Voucher[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  useEffect(() => {
    const getAllProducts = async () => {
      try {
        const response = await api.get("/voucher/search", {
          params: { page, limit: 10, search, start_date, end_date },
        });

        setAllVouchers(response.data.data);
        setTotalPages(response.data.meta.lastPage);
        setLoading(false);
      } catch (error) {
        console.error("Lỗi khi lấy sản phẩm:", error);
      }
    };

    getAllProducts();
  }, [page, search, start_date, end_date]);

  const calculatorExpiredDate = (
    startDate: string,
    endDate: string
  ): { status: StatusVoucher; message?: string } => {
    const now = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);

    // Tính số ngày từ hiện tại đến ngày kết thúc
    const diffTime = end.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    let status: StatusVoucher;
    let message: string;

    // Kiểm tra nếu voucher chưa bắt đầu
    if (now < start) {
      status = StatusVoucher.NOT_STARTED;
      message = "Chưa bắt đầu";
    } else if (diffDays < 0) {
      // Voucher đã hết hạn
      status = StatusVoucher.EXPIRED;
      message = "Hết hạn";
    } else if (diffDays <= 7) {
      // Voucher sắp hết hạn (còn 7 ngày hoặc ít hơn)
      status = StatusVoucher.ALMOST_EXPIRED;
      message = `Còn ${diffDays} ngày`;
    } else {
      // Voucher còn hạn
      status = StatusVoucher.VALID;
      message = `Còn ${diffDays} ngày`;
    }

    return { status, message };
  };

  const covertDate = (date: string) => {
    const dateOnly = date.split("T")[0];
    return dateOnly;
  };

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
                    const statusVoucher = calculatorExpiredDate(
                      item.start_date,
                      item.end_date
                    );
                    const startDate = covertDate(item.start_date);
                    const endDate = covertDate(item.end_date);
                    return (
                      <TableRow key={item.id}>
                        <TableCell className="px-5 py-4 text-start">
                          {item.code}
                        </TableCell>
                        <TableCell className="px-5 py-4 text-start">
                          {item.quantity}
                        </TableCell>
                        <TableCell className="px-5 py-4 text-start">
                          {item.type}
                        </TableCell>
                        <TableCell className="px-5 py-4 text-start">
                          {startDate}
                        </TableCell>
                        <TableCell className="px-5 py-4 text-start">
                          {endDate}
                        </TableCell>
                        <TableCell className="px-5 py-4 text-start">
                          <Badge
                            variant="solid"
                            color={statusColors[statusVoucher.status]}
                          >
                            {statusVoucher.message}
                          </Badge>
                        </TableCell>
                        <TableCell className="px-5 py-4 text-start">
                          <div className="flex items-center gap-3">
                            <Link
                              className="px-3 py-3 bg-blue-500 text-white rounded-xl"
                              href={`/edit-voucher/${item.id}`}
                            >
                              Sửa
                            </Link>
                            {item.id && (
                              <VoucherButtonDelete
                                voucherId={item.id}
                                voucherCode={item.code}
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

export default VoucherTable;
