"use client";

import api from "@/app/lib/axios";
import axios from "axios";
import Link from "next/link";
import { useEffect, useState } from "react";
import ComponentCard from "../common/ComponentCard";
import Input from "../form/input/InputField";
import Label from "../form/Label";
import Select, { Option } from "../form/Select";
import { useParams, useRouter } from "next/navigation";
import { showSuccessAndRedirect } from "@/app/utils/helper";

interface Category {
  id?: number;
  name?: string;
  slug?: string;
  parentId?: number;
}

export default function FormEditCategory() {
  const [category, setCategory] = useState("");
  const [slug, setSlug] = useState("");
  const [parentId, setParentId] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [errors, setErrors] = useState<Category>({});
  const params = useParams();
  const id = params.id;
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCategory(value);
    setSlug(slugify(value));
  };

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await api.get("/categories");
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
        const response = await api.get(`/categories/${id}`);
        const data = response.data;
        console.log("🚀 ~ fetchCategory ~ data:", data);

        setCategory(data.name || "");
        setSlug(data.slug || "");
        setParentId(data.parent_id || "");
      } catch (error) {
        console.error("Lỗi khi lấy danh mục:", error);
      }
    };

    fetchCategory();
  }, []);

  const options: Option[] = categories
    .filter((cat) => typeof cat.id === "number")
    .map((cat) => ({
      value: cat.id!.toString(),
      label: cat.name ?? "",
    }));

  const defaultValue = options.find((opt) => opt.value === parentId.toString());
  console.log("11111", defaultValue);

  const slugify = (text: string): string => {
    return text
      .normalize("NFD") // tách dấu ra khỏi ký tự
      .replace(/[\u0300-\u036f]/g, "") // xóa dấu
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "-") // thay khoảng trắng bằng dấu gạch ngang
      .replace(/[^a-z0-9\-]/g, ""); // xóa ký tự đặc biệt (nếu có)
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      name: category,
      slug: slug,
      parent_id: parentId,
    };
    try {
      await api.patch(`/categories/${id}`, data);
      setCategory("");
      setSlug("");
      setParentId("");
      setErrors({});
      showSuccessAndRedirect("Cập nhật thành công!", router, "/category");
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

  const handleSelectChange = (value: string) => {
    setParentId(value);
  };

  return (
    <ComponentCard title="Sửa danh mục">
      <form onSubmit={handleSubmit}>
        <div className="space-y-6">
          <div>
            <Label>Tên danh mục</Label>
            <Input
              type="text"
              placeholder="Nhập tên danh mục"
              value={category}
              onChange={handleChange}
            />
            {errors.name && (
              <p className="text-red-500 text-sm mt-1">{errors.name}</p>
            )}
          </div>
          <div>
            <Label>Slug</Label>
            <Input
              type="text"
              value={slug}
              onChange={handleChange}
              disabled={true}
            />
            {errors.slug && (
              <p className="text-red-500 text-sm mt-1">{errors.slug}</p>
            )}
          </div>
          <div>
            <Label>Thư mục cha</Label>
            <div className="relative">
              <Select
                options={options}
                placeholder="Vui lòng chọn thư mục cha"
                onChange={handleSelectChange}
                className="dark:bg-dark-900"
                defaultValue={parentId}
              />
              <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400"></span>
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-4 mt-6">
          <Link href="/category" className="bg-gray-300 px-3 py-3 rounded-xl">
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
