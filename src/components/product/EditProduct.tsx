"use client";

import api from "@/app/lib/axios";
import { Brand } from "@/interface/IBrand";
import { Category } from "@/interface/ICategory";
import { defaultProduct, Product } from "@/interface/IProduct";
import axios from "axios";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import ComponentCard from "../common/ComponentCard";
import DatePicker from "../form/date-picker";
import Input from "../form/input/InputField";
import Label from "../form/Label";
import Select, { Option } from "../form/Select";

export default function FormEditProduct() {
  const [product, setProduct] = useState<Product>(defaultProduct);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brand, setBrand] = useState<Brand[]>([]);
  const [errors, setErrors] = useState<Category>({});
  const params = useParams();
  const id = params.id;

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setProduct((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await api.get("/categories");
        console.log("🚀 ~ fetchCategories ~ response:", response);
        setCategories(response.data);
      } catch (error) {
        console.error("Lỗi khi lấy danh mục:", error);
      }
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchCategory = async () => {
      try {
        const response = await api.get(`/products/${id}`);
        const data = response.data;
        console.log("🚀 ~ fetchCategory ~ data:", data);
        setProduct({
          name: data.name || "",
          price: data.price || 0,
          discount: data.discount || 0,
          images: data.images || "",
          slug: data.slug || "",
          barcode: data.barcode || "",
          expiry_date: data.expiry_date || "",
          origin: data.origin || "",
          weight_unit: data.weight_unit || "",
          description: data.description || "",
          quantity: data.quantity || 0,
          categoryId: data.categoryId || 0,
          brandId: data.brandId || 0,
          purchase: data.purchase || 0,
        });
      } catch (error) {
        console.error("Lỗi khi lấy danh mục:", error);
      }
    };

    fetchCategory();
  }, []);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await api.get("/brand");
        setBrand(response.data);
      } catch (error) {
        console.error("Lỗi khi lấy danh mục:", error);
      }
    };

    fetchCategories();
  }, []);

  const listCategories: Option[] = categories
    .filter((cate) => typeof cate.id === "number")
    .map((cate) => ({
      value: cate.id!.toString(),
      label: cate.name ?? "",
    }));

  const listBrands: Option[] = brand
    .filter((brand) => typeof brand.id === "number")
    .map((brand) => ({
      value: brand.id!.toString(),
      label: brand.name ?? "",
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
    const { barcode, ...data } = product;
    try {
      await api.patch(`/products/${id}`, data);
      alert("Cập nhật thành công");
      setErrors({});
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

        setErrors(fieldErrors);
      }
    }
  };

  const handleSelectCategory = (value: string) => {
    setProduct((prev) => ({
      ...prev,
      categoryId: +value,
    }));
  };

  const handleSelectBrand = (value: string) => {
    setProduct((prev) => ({
      ...prev,
      brandId: +value,
    }));
  };

  const handleSelectDate = (dates: Date[], currentDateString: string) => {
    if (!dates || dates.length === 0) return;

    setProduct((prev) => ({
      ...prev,
      expiry_date: currentDateString,
    }));
  };

  return (
    <ComponentCard title="Thêm sản phẩm">
      <form onSubmit={handleSubmit}>
        <div className="space-y-6">
          <div>
            <Label>Tên sản phẩm</Label>
            <Input
              type="text"
              placeholder="Nhập tên sản phẩm"
              name="name"
              value={product.name}
              onChange={handleChange}
            />
            {errors.name && (
              <p className="text-red-500 text-sm mt-1">{errors.name}</p>
            )}
          </div>
          <div>
            <Label>Mã sản phẩm</Label>
            <Input
              type="text"
              placeholder="Nhập tên sản phẩm"
              name="barcode"
              value={product.barcode}
              disabled={true}
              onChange={handleChange}
            />
          </div>
          <div>
            <Label>Xuất xứ</Label>
            <Input
              type="text"
              placeholder="Nhập tên sản phẩm"
              name="origin"
              value={product.origin}
              onChange={handleChange}
            />
          </div>
          <div>
            <DatePicker
              id="date-picker"
              label="Ngày hết hạn"
              placeholder="Select a date"
              onChange={handleSelectDate}
            />
          </div>
          <div>
            <Label>Cân nặng</Label>
            <Input
              type="text"
              placeholder="Nhập tên sản phẩm"
              name="weight_unit"
              value={product.weight_unit}
              onChange={handleChange}
            />
          </div>
          <div>
            <Label>Slug</Label>
            <Input
              type="text"
              value={product.slug}
              name="slug"
              onChange={handleChange}
            />
          </div>
          <div>
            <Label>Số lượng</Label>
            <Input
              type="text"
              value={product.quantity}
              name="quantity"
              onChange={handleChange}
            />
          </div>
          <div>
            <Label>Giá sản phẩm</Label>
            <Input
              type="text"
              value={product.price}
              name="price"
              onChange={handleChange}
            />
          </div>
          <div>
            <Label>Giảm giá</Label>
            <Input
              type="text"
              value={product.discount}
              name="discount"
              onChange={handleChange}
            />
          </div>
          <div>
            <Label>Loại danh mục</Label>
            <div className="relative">
              <Select
                options={listCategories}
                placeholder="Vui lòng chọn loại danh mục"
                onChange={handleSelectCategory}
                className="dark:bg-dark-900"
                defaultValue={product.categoryId.toString()}
              />
              <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400"></span>
            </div>
          </div>
          <div>
            <Label>Nhãn hàng</Label>
            <div className="relative">
              <Select
                options={listBrands}
                placeholder="Vui lòng chọn nhãn hàng"
                onChange={handleSelectBrand}
                defaultValue={product.brandId.toString()}
                className="dark:bg-dark-900"
              />
              <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400"></span>
            </div>
          </div>
          <div>
            <Label>Mô tả</Label>
            <Input
              type="text"
              value={product.description}
              name="description"
              onChange={handleChange}
            />
          </div>
          <div>
            <Label>Hình ảnh</Label>
            <Input
              type="text"
              value={product.images}
              name="images"
              onChange={handleChange}
            />
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
