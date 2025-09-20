"use client";

import api from "@/app/lib/axios";
import { listProduct, ProductImages } from "@/interface/IProduct";
import Link from "next/link";
import { useEffect, useState } from "react";
import ComponentCard from "../common/ComponentCard";
import DropzoneComponent from "../form/form-elements/DropZone";
import Label from "../form/Label";
import Select, { Option } from "../form/Select";
import { useRouter } from "next/navigation";
import { showSuccessAndRedirect } from "@/app/utils/helper";

export default function AddImages() {
  const [productImage, setProductImage] = useState<ProductImages>({
    productId: 0,
  });
  const [selectImage, setSelectImage] = useState<(File | string)[]>([]);
  const [products, setProducts] = useState(listProduct);
  const router = useRouter();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await api.get("/products");
        setProducts(response.data);
      } catch (error) {
        console.error("Lỗi khi lấy danh mục:", error);
      }
    };

    fetchCategories();
  }, []);

  const listProducts: Option[] = products
    .filter((cate) => typeof cate.id === "number")
    .map((cate) => ({
      value: cate.id!.toString(),
      label: cate.name ?? "",
    }));

  const handleSelectProduct = (value: string) => {
    setProductImage((prev) => ({
      ...prev,
      productId: +value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("productId", productImage.productId.toString());
    selectImage.forEach((file) => {
      formData.append("images", file);
    });

    try {
      await api.post("/product-images", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      setProductImage({ productId: 0 });
      setSelectImage([]); // reset file
      showSuccessAndRedirect(
        "Thêm hình ảnh thành công!",
        router,
        "/product-images"
      );
    } catch (error) {
      console.error("Lỗi khi thêm biến thể sản phẩm:", error);
    }
  };

  const handleSelectImages = async (files: (File | string)[]) => {
    setSelectImage(files);
  };

  return (
    <ComponentCard title="">
      <form onSubmit={handleSubmit}>
        <div className="space-y-6">
          <div>
            <Label>Loại sản phẩm </Label>
            <div className="relative">
              <Select
                options={listProducts}
                placeholder="Vui lòng chọn loại sản phẩm"
                onChange={handleSelectProduct}
                className="dark:bg-dark-900"
              />
              <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400"></span>
            </div>
          </div>

          <DropzoneComponent onChangeImages={handleSelectImages} />
        </div>
        <div className="flex justify-end space-x-4 mt-6">
          <Link
            href="/product-images"
            className="bg-gray-300 px-3 py-3 rounded-xl"
          >
            Huỷ
          </Link>
          <button
            className="bg-blue-700 px-3 py-3 rounded-xl text-white"
            type="submit"
          >
            Lưu
          </button>
        </div>
      </form>
    </ComponentCard>
  );
}
