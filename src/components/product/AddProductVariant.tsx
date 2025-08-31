"use client";

import api from "@/app/lib/axios";
import {
  defaultProductVariant,
  listProduct,
  ProductVariant,
} from "@/interface/IProduct";
import Link from "next/link";
import { useEffect, useState } from "react";
import ComponentCard from "../common/ComponentCard";
import Input from "../form/input/InputField";
import Label from "../form/Label";
import Select, { Option } from "../form/Select";
import { showSuccessAndRedirect } from "@/app/utils/helper";
import { useRouter } from "next/navigation";
import FileInput from "../form/input/FileInput";
import Image from "next/image";

export default function FormAddProductVariant() {
  const [productVariant, setProductVariant] = useState<ProductVariant>(
    defaultProductVariant
  );
  const [products, setProducts] = useState(listProduct);
  const router = useRouter();
  const [selectFile, setSelectFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setProductVariant((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

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
    .filter((product) => typeof product.id === "number")
    .map((product) => ({
      value: product.id!.toString(),
      label: product.name ?? "",
    }));

  const handleSelectProduct = (value: string) => {
    setProductVariant((prev) => ({
      ...prev,
      productId: +value,
    }));
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files?.length) {
      setSelectFile(event.target.files[0]);
      const previewUrl = URL.createObjectURL(event.target.files[0]);
      setPreview(previewUrl);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append("variant_name", productVariant.variant_name);
      formData.append("price_modifier", String(productVariant.price_modifier));
      formData.append("stock", String(productVariant.stock));
      formData.append("productId", String(productVariant.productId));
      if (selectFile) formData.append("image_url", selectFile);
      await api.post("/product-variant", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      setProductVariant(defaultProductVariant);
      showSuccessAndRedirect(
        "Thêm biến thể sản phẩm thành công",
        router,
        "/product-variant"
      );
    } catch (error) {
      console.error("Lỗi khi thêm biến thể sản phẩm:", error);
    }
  };

  return (
    <ComponentCard title="Thêm biến thể sản phẩm">
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
          <div>
            <Label>Tên sản phẩm biến thể</Label>
            <Input
              type="text"
              placeholder="Nhập tên sản phẩm biến thể"
              name="variant_name"
              value={productVariant.variant_name}
              onChange={handleChange}
            />
          </div>

          <div>
            <Label>Giá</Label>
            <Input
              type="text"
              placeholder="Nhập giá sản phẩm biến thể"
              name="price_modifier"
              value={productVariant.price_modifier}
              onChange={handleChange}
            />
          </div>

          <div>
            <Label>Số lượng</Label>
            <Input
              type="text"
              placeholder="Nhập số lượng sản phẩm biến thể"
              name="stock"
              value={productVariant.stock}
              onChange={handleChange}
            />
          </div>

          <div>
            <Label>Loại sản phẩm</Label>
            <div className="relative">
              <Select
                options={listProducts}
                placeholder="Vui lòng chọn loại sản phẩm"
                onChange={handleSelectProduct}
                className="dark:bg-dark-900 w-full"
              />
              <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400"></span>
            </div>
          </div>

          <div className="col-span-2">
            <Label>Hình ảnh</Label>
            <FileInput onChange={handleFileChange} className="custom-class" />
            {preview && (
              <Image
                width={500}
                height={500}
                src={preview}
                alt={productVariant.image_url || "product image"}
                className="mt-5"
              />
            )}
          </div>
        </div>

        <div className="flex justify-end space-x-4 mt-6">
          <Link
            href="/product-variant"
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
