"use client";
import api from "@/app/lib/axios";
import { Product } from "@/interface/IProduct";
import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { ProductButtonDelete } from "../modal/ModalProduct";
import { PaginationPage } from "../pagination/Pagination";
import Badge, { BadgeColor } from "../ui/badge/Badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Button } from "../ui/button";

interface TitleHeaderProps {
  category?: string;
  brand?: string;
  search?: string;
}

const columns = [
  "Tên sản phẩm",
  "Mã sản phẩm",
  "Giá sản phẩm",
  "Giá giảm",
  "Số lượng sản phẩm",
  "trạng thái",
  "Hành động",
];

export enum Status {
  VALID = "Còn hạn",
  ALMOST_EXPIRED = "Sắp hết hạn",
  EXPIRED = "Hết hạn",
}

const statusColors: Record<Status, BadgeColor> = {
  [Status.VALID]: "success",
  [Status.ALMOST_EXPIRED]: "warning",
  [Status.EXPIRED]: "error",
};

const ProductTable: React.FC<TitleHeaderProps> = ({
  category,
  brand,
  search,
}) => {
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  useEffect(() => {
    const getAllProducts = async () => {
      try {
        const response = await api.get("/products/search", {
          params: { page, limit, category, brand, search },
        });

        setAllProducts(response.data.data);
        setTotalPages(response.data.meta.lastPage);
        setLoading(false);
      } catch (error) {
        console.error("Lỗi khi lấy sản phẩm:", error);
      }
    };

    getAllProducts();
  }, [page, limit, category, brand, search]);

  const handleCheckStatusProduct = (
    expiry: string | Date
  ): { status: Status; message?: string } => {
    const date = typeof expiry === "string" ? new Date(expiry) : expiry;
    const now = new Date();

    // Số mili-giây chênh lệch
    const diffMs = date.getTime() - now.getTime();

    // Chuyển sang số ngày
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    let status: Status;
    let message: string;
    if (diffDays < 0) {
      status = Status.EXPIRED;
      message = "Hết hạn";
    } else {
      status = diffDays <= 7 ? Status.ALMOST_EXPIRED : Status.VALID;
      message = `Còn ${diffDays} ngày`;
    }

    return { status, message };
  };

  const handleDeleteProduct = (
    id: number | undefined,
    name: string,
    e: React.FormEvent
  ) => {
    e.preventDefault();
    try {
      if (!id) return;
      api.delete(`/products/${id}`);
      setAllProducts((prev) => prev.filter((item) => item.id !== id));
      toast.success(`Xóa sản phẩm ${name} thành công`);
    } catch (error) {
      console.log("Xảy ra lỗi", error);
    }
  };

  function formatNumberWithComma(num: number): string {
    return num.toLocaleString("en-US"); // hoặc "vi-VN" nếu muốn dùng dấu chấm cho VN
  }
  const handleDiscount = (price: number, discount: number) => {
    const discountAmount = (price * discount) / 100;
    return parseFloat((price - discountAmount).toFixed(2));
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
                      Đang tải sản phẩm...
                    </TableCell>
                  </TableRow>
                ) : allProducts.length === 0 ? (
                  <TableRow>
                    <TableCell
                      className="text-center py-4 text-gray-500"
                      colSpan={5}
                    >
                      Không có sản phẩm nào.
                    </TableCell>
                  </TableRow>
                ) : (
                  allProducts.map((item) => {
                    const status = handleCheckStatusProduct(item.expiry_date);
                    const discountPrice = handleDiscount(
                      item.price,
                      item.discount
                    );

                    const formatPrice = formatNumberWithComma(item.price);
                    const formatQuantity = formatNumberWithComma(item.quantity);
                    return (
                      <TableRow key={item.id}>
                        <TableCell className="px-5 py-4 text-start">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 overflow-hidden rounded-full">
                              <Image
                                width={40}
                                height={40}
                                src={`http://localhost:5000${item.images}`}
                                alt={item.name}
                              />
                            </div>
                            <div>
                              <span className="block font-medium">
                                {item.name}
                              </span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="px-5 py-4 text-start">
                          {item.barcode}
                        </TableCell>
                        <TableCell className="px-5 py-4 text-start">
                          {formatPrice}
                        </TableCell>
                        <TableCell className="px-5 py-4 text-start">
                          {discountPrice}
                        </TableCell>
                        <TableCell className="px-5 py-4 text-start">
                          {formatQuantity}
                        </TableCell>
                        <TableCell className="px-5 py-4 text-start">
                          <Badge
                            variant="solid"
                            color={statusColors[status.status]}
                          >
                            {status.message}
                          </Badge>
                        </TableCell>
                        <TableCell className="px-5 py-4 text-start">
                          <div className="flex items-center gap-3">
                            <Link
                              className="px-3 py-3 bg-blue-500 text-white rounded-xl"
                              href={`/edit-product/${item.id}`}
                            >
                              Sửa
                            </Link>
                            {item.id && (
                              <ProductButtonDelete
                                productId={item.id}
                                productName={item.name}
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

export default ProductTable;
