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
import FileInput from "../form/input/FileInput";
import Image from "next/image";

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
  const [selectFile, setSelectFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [imageURL, setImageURL] = useState<string>("");

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

        setCategory(data.name || "");
        setSlug(data.slug || "");
        setParentId(data.parent_id || "");
        setImageURL(data.image_url || "");
      } catch (error) {
        console.error("Lỗi khi lấy danh mục:", error);
      }
    };

    fetchCategory();
  }, [id]);

  const options: Option[] = categories
    .filter((cat) => typeof cat.id === "number")
    .map((cat) => ({
      value: cat.id!.toString(),
      label: cat.name ?? "",
    }));

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
    try {
      const formData = new FormData();
      formData.append("name", category);
      formData.append("slug", slug);
      formData.append("parent_id", parentId ? parentId : "0");
      if (selectFile) formData.append("files", selectFile);
      await api.patch(`/categories/${id}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
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

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files?.length) {
      setSelectFile(event.target.files[0]);
      const previewUrl = URL.createObjectURL(event.target.files[0]);
      setPreview(previewUrl);
    }
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

          <div className="col-span-2">
            <Label>Hình ảnh</Label>
            <FileInput onChange={handleFileChange} className="custom-class" />
            <Image
              width={500}
              height={500}
              src={preview || imageURL}
              alt={category || "product image"}
              className="mt-5"
            />
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
