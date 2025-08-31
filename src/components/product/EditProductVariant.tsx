"use client";

import api from "@/app/lib/axios";
import {
  defaultProductVariant,
  Product,
  ProductVariant,
} from "@/interface/IProduct";
import axios from "axios";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import ComponentCard from "../common/ComponentCard";
import Input from "../form/input/InputField";
import Label from "../form/Label";
import Select, { Option } from "../form/Select";
import { showSuccessAndRedirect } from "@/app/utils/helper";
import FileInput from "../form/input/FileInput";
import Image from "next/image";

export default function FormEditProductVariant() {
  const [productVariant, setProductVariant] = useState<ProductVariant>(
    defaultProductVariant
  );
  const [product, setProduct] = useState<Product[]>([]);
  const params = useParams();
  const id = params.id;
  const router = useRouter();
  const [preview, setPreview] = useState<string | null>(null);
  const [selectFile, setSelectFile] = useState<File | null>(null);

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
        setProduct(response.data);
      } catch (error) {
        console.error("Lỗi khi lấy danh mục:", error);
      }
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchCategory = async () => {
      try {
        const response = await api.get(`/product-variant/${id}`);
        const data = response.data;
        setProductVariant({
          variant_name: data.variant_name || "",
          price_modifier: data.price_modifier || 0,
          stock: data.stock || 0,
          productId: data.product.id || 0,
          image_url: data.image_url || "",
        });
      } catch (error) {
        console.error("Lỗi khi lấy danh mục:", error);
      }
    };

    fetchCategory();
  }, [id]);

  const listProducts: Option[] = product
    .filter((cate) => typeof cate.id === "number")
    .map((cate) => ({
      value: cate.id!.toString(),
      label: cate.name ?? "",
    }));

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
        "Cập nhật sản phẩm biến thể thành công!",
        router,
        "/product-variant"
      );
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const messages = error.response?.data?.message;

        const fieldErrors: { name?: string; slug?: string } = {};

        if (Array.isArray(messages)) {
          messages.forEach((msg) => {
            if (msg.includes("Tên danh mục")) {
              fieldErrors.name = msg;
            } else if (msg.includes("Slug")) {
              fieldErrors.slug = msg;
            }
          });
        }
      }
    }
  };

  const handleSelectProduct = (value: string) => {
    setProduct((prev) => ({
      ...prev,
      productId: +value,
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setSelectFile(selectedFile);

      // Tạo URL xem trước
      const previewUrl = URL.createObjectURL(selectedFile);
      setPreview(previewUrl);
    }
  };
  return (
    <ComponentCard title="">
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
                defaultValue={productVariant.productId.toString()}
              />
              <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400"></span>
            </div>
          </div>

          <div className="col-span-2">
            <Label>Hình ảnh</Label>
            <FileInput onChange={handleFileChange} className="custom-class" />
            <Image
              width={500}
              height={500}
              src={preview || productVariant.image_url}
              alt={productVariant.variant_name || "product image"}
              className="mt-5"
            />
          </div>
        </div>

        <div className="flex justify-end space-x-4 mt-6">
          <button className="bg-gray-300 px-3 py-3 rounded-xl">
            <Link href="/product-variant">Huỷ</Link>
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
