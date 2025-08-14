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

export default function FormEditProductVariant() {
  const [productVariant, setProductVariant] = useState<ProductVariant>(
    defaultProductVariant
  );
  const [product, setProduct] = useState<Product[]>([]);
  const params = useParams();
  const id = params.id;
  const router = useRouter();

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
        console.log("🚀 ~ fetchCategories ~ response:", response);
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
        });
      } catch (error) {
        console.error("Lỗi khi lấy danh mục:", error);
      }
    };

    fetchCategory();
  }, []);

  const listProducts: Option[] = product
    .filter((cate) => typeof cate.id === "number")
    .map((cate) => ({
      value: cate.id!.toString(),
      label: cate.name ?? "",
    }));

  const slugify = (text: string): string => {
    return text
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9\-]/g, "");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = { ...productVariant };
    try {
      await api.patch(`/products-variant/${id}`, data);
      setProductVariant(defaultProductVariant);
      showSuccessAndRedirect(
        "Cập nhật sản phẩm biến thể thành công!",
        router,
        "/product"
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

  return (
    <ComponentCard title="">
      <form onSubmit={handleSubmit}>
        <div className="space-y-6">
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
                className="dark:bg-dark-900"
                defaultValue={productVariant.productId.toString()}
              />
              <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400"></span>
            </div>
          </div>
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
