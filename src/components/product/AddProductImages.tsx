"use client";

import api from "@/app/lib/axios";
import {
  defaultProductImage,
  listProduct,
  ProductImages,
} from "@/interface/IProduct";
import Link from "next/link";
import { useEffect, useState } from "react";
import ComponentCard from "../common/ComponentCard";
import DropzoneComponent from "../form/form-elements/DropZone";
import Label from "../form/Label";
import Select, { Option } from "../form/Select";

export default function AddImages() {
  const [productImage, setProductImage] =
    useState<ProductImages>(defaultProductImage);
  const [products, setProducts] = useState(listProduct);

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
    const data = { ...productImage };
    try {
      await api.post("/product-images", data);
      alert("Thêm biến thể sản phẩm thành công!");
      setProductImage(defaultProductImage);
    } catch (error) {
      console.error("Lỗi khi thêm biến thể sản phẩm:", error);
    }
  };

  const handleSelectImages = async (files: File[]) => {
    console.log("Selected files:", files);
    const pathImages = files.map((file) => file.name);
    setProductImage((prev) => ({
      ...prev,
      image_url: pathImages,
    }));
  };

  console.log(1111, productImage);

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
          <button className="bg-gray-300 px-3 py-3 rounded-xl">
            <Link href="/category">Huỷ</Link>
          </button>
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
