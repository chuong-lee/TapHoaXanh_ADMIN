"use client"
import React, { useEffect, useState } from "react";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../ui/table";
import api from "@/app/lib/axios";
import Image from "next/image";
import Link from "next/link";


interface TitleHeaderProps {
  column1?: string;
  column2?: string;
  column3?: string;
  column4?: string;
  column5?: string;
}

interface Product {
  id: number;
  name: string;
  price: number;
  discount: number;
  images: string;
  slug: string;
  barcode: string;
  expiry_date: Date;
  origin: string;
  weight_unit: string;
  description?: string; // nullable
  quantity: number;
  purchase: number; // default: 0
}

const BasicTableOne: React.FC<TitleHeaderProps> = ({
  column1,
  column2,
  column3,
  column4,
  column5,
}) =>  {

  const [allProducts, setAllProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    api.get('/products').then(res => {
      const data = res.data
      let productList: Product[] = []

      if (Array.isArray(data)) {
        productList = data
      } else if (data && typeof data === 'object' && Array.isArray((data as { products?: unknown }).products)) {
        productList = (data as { products: Product[] }).products
      }

      setAllProducts(productList)
      setLoading(false)
    })
  }, [])
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
  ) : (
    allProducts.map((item) => (
      <TableRow key={item.id}>
        <TableCell className="px-5 py-4 text-start">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 overflow-hidden rounded-full">
              <Image
                width={40}
                height={40}
                src={item.images}
                alt={item.name}
              />
            </div>
            <div>
              <span className="block font-medium">{item.name}</span>
            </div>
          </div>
        </TableCell>
        <TableCell className="px-5 py-4 text-start">{item.barcode}</TableCell>
        <TableCell className="px-5 py-4 text-start">{item.price}</TableCell>
        <TableCell className="px-5 py-4 text-start">{item.quantity}</TableCell>
        <TableCell className="px-5 py-4 text-start">
          <div className="flex items-center gap-3 ">
            <Link className="px-3 py-3 bg-blue-500 text-white rounded-xl" href='#'>Sửa</Link>
            <Link className="px-3 py-3 bg-red-500 text-white rounded-xl" href='#'>Xoá</Link>
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

export default BasicTableOne;
