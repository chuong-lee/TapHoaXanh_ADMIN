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
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10); // Hiển thị 10 sản phẩm mỗi trang
  
  // Tính toán sản phẩm hiển thị theo trang
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentProducts = allProducts.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(allProducts.length / itemsPerPage);
  
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        console.log('Fetching products from:', process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000");
        
        // Gọi API thật để lấy tất cả sản phẩm từ database
        const response = await api.get('/products');
        const data = response.data;
        console.log('API Response:', data);
        
        let productList: Product[] = [];

        // Xử lý response từ API - có thể là array trực tiếp hoặc object có key products
        if (Array.isArray(data)) {
          productList = data;
        } else if (data && typeof data === 'object') {
          // Kiểm tra các key có thể có
          if (Array.isArray(data.products)) {
            productList = data.products;
          } else if (Array.isArray(data.data)) {
            productList = data.data;
          } else if (Array.isArray(data.items)) {
            productList = data.items;
          }
        }

        console.log('Processed product list:', productList);
        setAllProducts(productList);
        setError(null);
        
      } catch (err: unknown) {
        console.error('Error fetching products:', err);
        
        // Xử lý các loại lỗi khác nhau
        let errorMessage = 'Lỗi không xác định';
        
        if (err instanceof Error) {
          if (err.message.includes('Network Error')) {
            errorMessage = 'Không thể kết nối với server. Kiểm tra backend có đang chạy không?';
          } else if (err.message.includes('timeout')) {
            errorMessage = 'Kết nối timeout. Server phản hồi chậm.';
          } else {
            errorMessage = err.message;
          }
        }
        
        // Nếu là lỗi từ axios
        if (typeof err === 'object' && err !== null && 'response' in err) {
          const axiosError = err as { response?: { status: number }; request?: unknown };
          if (axiosError.response) {
            const status = axiosError.response.status;
            switch (status) {
              case 404:
                errorMessage = 'API endpoint không tồn tại (404)';
                break;
              case 500:
                errorMessage = 'Lỗi server (500)';
                break;
              case 403:
                errorMessage = 'Không có quyền truy cập (403)';
                break;
              default:
                errorMessage = `Lỗi API: ${status}`;
            }
          } else if (axiosError.request) {
            errorMessage = 'Không thể kết nối với server. Kiểm tra backend có đang chạy không?';
          }
        }
        
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
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
      <TableCell> </TableCell>
      <TableCell> </TableCell>
      <TableCell> </TableCell>
      <TableCell> </TableCell>
    </TableRow>
  ) : error ? (
    <TableRow>
      <TableCell className="text-center py-4 text-red-500">
        Lỗi: {error}
      </TableCell>
      <TableCell> </TableCell>
      <TableCell> </TableCell>
      <TableCell> </TableCell>
      <TableCell> </TableCell>
    </TableRow>
  ) : allProducts.length === 0 ? (
    <TableRow>
      <TableCell className="text-center py-4">
        Không có sản phẩm nào. Kiểm tra kết nối API tại: {process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"}
      </TableCell>
      <TableCell> </TableCell>
      <TableCell> </TableCell>
      <TableCell> </TableCell>
      <TableCell> </TableCell>
    </TableRow>
  ) : (
    currentProducts.map((item) => (
      <TableRow key={item.id}>
        <TableCell className="px-5 py-4 text-start">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 overflow-hidden rounded-full">
              <Image
                width={40}
                height={40}
                src={item.images}
                alt={item.name}
                onError={(e) => {
                  // Fallback image if original fails to load
                  e.currentTarget.src = "/images/product/product-01.jpg";
                }}
              />
            </div>
            <div>
              <span className="block font-medium">{item.name}</span>
            </div>
          </div>
        </TableCell>
        <TableCell className="px-5 py-4 text-start">{item.barcode}</TableCell>
        <TableCell className="px-5 py-4 text-start">
          {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.price)}
        </TableCell>
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
      
      {/* Pagination */}
      {allProducts.length > itemsPerPage && (
        <div className="flex items-center justify-between px-5 py-3 border-t border-gray-200">
          <div className="text-sm text-gray-500">
            Hiển thị {indexOfFirstItem + 1} - {Math.min(indexOfLastItem, allProducts.length)} trong {allProducts.length} sản phẩm
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 text-sm border rounded disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Trước
            </button>
            <span className="px-3 py-1 text-sm">
              Trang {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 text-sm border rounded disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Sau
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BasicTableOne;
