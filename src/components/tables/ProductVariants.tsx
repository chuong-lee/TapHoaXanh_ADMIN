"use client";
import api from "@/app/lib/axios";
import { ProductVariant } from "@/interface/IProduct";
import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { PaginationPage } from "../pagination/Pagination";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";

interface TitleHeaderProps {
  productId?: string; // Optional productId for filtering variants
  searchItem?: string; // Optional search term
}

const ProductVariants: React.FC<TitleHeaderProps> = ({
  productId,
  searchItem,
}) => {
  const [allProductVariant, setAllProductVariant] = useState<ProductVariant[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit] = useState(10); // số sản phẩm mỗi trang
  const [totalPages, setTotalPages] = useState(1);

  const productVariantFields = [
    "Tên sản phẩm biến thể",
    "Giá sản phẩm",
    "Số lượng sản phẩm",
    "Hành động",
  ];

  useEffect(() => {
    const getAllProducts = async () => {
      try {
        const response = await api.get("/product-variant/search", {
          params: { page, limit, product: productId, search: searchItem },
        });
        setAllProductVariant(response.data.data);
        setTotalPages(response.data.meta.lastPage);
        setLoading(false);
      } catch (error) {
        console.error("Lỗi khi lấy sản phẩm:", error);
      }
    };

    getAllProducts();
  }, [page, limit, productId, searchItem]);

  const handleDeleteProduct = (
    id: number | undefined,
    name: string,
    e: React.FormEvent
  ) => {
    e.preventDefault();
    try {
      if (!id) return;
      api.delete(`/product-variant/${id}`);
    } catch (error) {
      console.log("Xảy ra lỗi", error);
    }
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
                  {productVariantFields.map((item, index) => (
                    <>
                      <TableCell
                        isHeader
                        className="px-5 py-3 font-bold text-gray-500 text-start text-theme-xs dark:text-gray-400"
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
                ) : allProductVariant.length === 0 ? (
                  <TableRow>
                    <TableCell
                      className="text-center py-4 text-gray-500"
                      colSpan={5}
                    >
                      Không có sản phẩm nào.
                    </TableCell>
                  </TableRow>
                ) : (
                  allProductVariant.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="px-5 py-4 text-start">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 overflow-hidden rounded-full">
                            <Image
                              width={40}
                              height={40}
                              src={"/images/product/product-05.jpg"}
                              alt={item.variant_name}
                            />
                          </div>
                          <div>
                            <span className="block font-medium">
                              {item.variant_name}
                            </span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="px-5 py-4 text-start">
                        {item.price_modifier}
                      </TableCell>
                      <TableCell className="px-5 py-4 text-start">
                        {item.stock}
                      </TableCell>
                      <TableCell className="px-5 py-4 text-start">
                        <div className="flex items-center gap-3">
                          <Link
                            className="px-3 py-3 bg-blue-500 text-white rounded-xl"
                            href={`/edit-product-variant/${item.id}`}
                          >
                            Sửa
                          </Link>
                          <button
                            className="px-3 py-3 bg-red-500 text-white rounded-xl"
                            onClick={(e) =>
                              handleDeleteProduct(item.id, item.variant_name, e)
                            }
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

export default ProductVariants;
