"use client";
import api from "@/app/lib/axios";
import { GetProductImages } from "@/interface/IProduct";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import { ModalProductImages } from "../modal/ModalProductImages";

const ProductImages: React.FC = () => {
  const [allProducts, setAllProducts] = useState<GetProductImages[]>([]);
  const [selectedImage, setSelectedImage] = useState<{
    id: number;
    url: string;
    name: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

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

  const handleShowImageInfo = (
    item: GetProductImages,
    e: React.MouseEvent<HTMLImageElement>
  ) => {
    e.preventDefault();
    setSelectedImage({
      id: item.id!,
      url: `http://localhost:5000${item.image_url}`,
      name: item.name!,
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

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
                src={`${process.env.NEXT_PUBLIC_API_URL} + ${item.image_url}`}
                alt={item.name}
                className="w-full h-full border border-gray-200 rounded-xl dark:border-gray-800"
                onClick={(e) => handleShowImageInfo(item, e)}
              />
            </div>
          ))
        )}
        {selectedImage && isModalOpen && (
          <ModalProductImages
            isOpen={isModalOpen}
            onClose={handleCloseModal}
            imageId={selectedImage?.id}
            imageName={selectedImage?.name}
            imageUrl={selectedImage?.url}
          />
        )}
      </div>
    </div>
  );
};

export default ProductImages;
