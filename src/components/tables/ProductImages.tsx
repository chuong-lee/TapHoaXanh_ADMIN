"use client";
import api from "@/app/lib/axios";
import { GetProductImages } from "@/interface/IProduct";
import Image from "next/image";
import React, { useEffect, useState } from "react";

const ProductImages: React.FC = () => {
  const [allProducts, setAllProducts] = useState<GetProductImages[]>([]);
  const [selectedImage, setSelectedImage] = useState<{
    url: string;
    name: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getAllProducts = async () => {
      try {
        const response = await api.get("/product-images");
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
      api.delete(`/product-images/${id}`);
      alert(`Sản phẩm ${name} đã được xóa thành công`);
      setAllProducts((prev) => prev.filter((item) => item.id !== id));
    } catch (error) {
      console.log("Xảy ra lỗi", error);
    }
  };

  const handleShowImageInfo = (e: React.MouseEvent<HTMLImageElement>) => {
    e.preventDefault();
    const imageUrl = e.currentTarget.src;
    const imageName = e.currentTarget.alt;
    setSelectedImage({ url: imageUrl, name: imageName });
  };

  const handleClose = () => setSelectedImage(null);
  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-5">
        {loading ? (
          <p className="text-center py-4 text-gray-500">Đang tải sản phẩm...</p>
        ) : allProducts.length === 0 ? (
          <p>Không có nội dung nào</p>
        ) : (
          allProducts.map((item) => (
            <div key={item.id}>
              <Image
                width={338}
                height={338}
                src={`http://localhost:5000${item.image_url}`}
                alt={item.name}
                className="w-full h-full border border-gray-200 rounded-xl dark:border-gray-800"
                onClick={handleShowImageInfo}
              />
            </div>
          ))
        )}
      </div>

      {/* Popup hiển thị chi tiết ảnh */}
      {/* {selectedImage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-4 max-w-[80%] max-h-[80%] overflow-auto">
            <h2 className="text-lg font-semibold mb-2">{selectedImage.name}</h2>
            <img
              src={selectedImage.url}
              alt={selectedImage.name}
              className="max-w-full max-h-[70vh] rounded-lg object-contain"
            />
            <button
              className="mt-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
              onClick={handleClose}
            >
              Đóng
            </button>
          </div>
        </div>
      )} */}
    </div>
  );
};

export default ProductImages;
