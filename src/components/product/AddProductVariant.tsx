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

export default function FormAddProductVariant() {
  const [productVariant, setProductVariant] = useState<ProductVariant>(
    defaultProductVariant
  );
  const [products, setProducts] = useState(listProduct);

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
    .filter((cate) => typeof cate.id === "number")
    .map((cate) => ({
      value: cate.id!.toString(),
      label: cate.name ?? "",
    }));

  const handleSelectProduct = (value: string) => {
    setProductVariant((prev) => ({
      ...prev,
      productId: +value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = { ...productVariant };
    try {
      await api.post("/product-variant", data);
      alert("Thêm biến thể sản phẩm thành công!");
      setProductVariant(defaultProductVariant);
    } catch (error) {
      console.error("Lỗi khi thêm biến thể sản phẩm:", error);
    }
  };

  return (
    <ComponentCard title="Thêm biến thể sản phẩm">
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
