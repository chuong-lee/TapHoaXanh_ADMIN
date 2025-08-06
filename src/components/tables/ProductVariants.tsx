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
import Image from "next/image";
import Link from "next/link";
import { ProductVariant } from "@/interface/IProduct";

interface TitleHeaderProps {
  column1?: string;
  column2?: string;
  column3?: string;
  column4?: string;
  column5?: string;
}

const ProductVariants: React.FC<TitleHeaderProps> = ({
  column1,
  column2,
  column3,
  column4,
  column5,
}) => {
  const [allProducts, setAllProducts] = useState<ProductVariant[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const getAllProducts = async () => {
      try {
        const response = await api.get("/product-variant");
        setAllProducts(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Lỗi khi lấy sản phẩm:", error);
      }
    };

    getAllProducts();
  }, []);

  const handleDeleteProduct = (
    id: number | undefined,
    name: string,
    e: React.FormEvent
  ) => {
    e.preventDefault();
    try {
      if (!id) return;
      api.delete(`/product-variant/${id}`);
      alert(`Sản phẩm ${name} đã được xóa thành công`);
      setAllProducts((prev) => prev.filter((item) => item.id !== id));
    } catch (error) {
      console.log("Xảy ra lỗi", error);
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
                allProducts.map((item) => (
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
                          href={`/edit-product/${item.id}`}
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
  );
};

export default ProductVariants;
