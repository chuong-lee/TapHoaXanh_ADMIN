"use client";

import api from "@/app/lib/axios";
import { showSuccessAndRedirect } from "@/app/utils/helper";
import { Brand } from "@/interface/IBrand";
import { Category } from "@/interface/ICategory";
import { defaultProduct, Product } from "@/interface/IProduct";
import axios from "axios";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import ComponentCard from "../common/ComponentCard";
import DatePicker from "../form/date-picker";
import FileInput from "../form/input/FileInput";
import Input from "../form/input/InputField";
import TextArea from "../form/input/TextArea";
import Label from "../form/Label";
import Select, { Option } from "../form/Select";
import Image from "next/image";
import { handleAxiosError } from "@/interface/IError";

export default function FormAddProduct() {
  const [product, setProduct] = useState<Product>(defaultProduct);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brand, setBrand] = useState<Brand[]>([]);
  const [errors, setErrors] = useState<Partial<Record<keyof Product, string>>>(
    {}
  );

  const [errorMessage, setErrorMessage] = useState("");
  const router = useRouter();
  const [selectFile, setSelectFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;

    // Validate ngay khi nhập
    let errorMsg = "";

    if (name === "weight_unit" && Number(value) < 0) {
      errorMsg = "Đơn vị khối lượng không được âm";
    }

    if (name === "barcode") {
      const barcodePattern = /^SP\d{4}$/; // SP + 4 chữ số
      if (!barcodePattern.test(value)) {
        errorMsg = "Barcode phải đúng định dạng SPxxxx (ví dụ: SP0001)";
      }
    }

    if (name === "quantity" && Number(value) < 0) {
      errorMsg = "Số lượng không được âm";
    }

    if (name === "price") {
      const numValue = Number(value);

      if (isNaN(numValue)) {
        errorMsg = "Giá phải là số";
      } else if (numValue < 0) {
        errorMsg = "Giá không được âm";
      } else if (numValue < 1000) {
        errorMsg = "Giá tối thiểu 1000 VNĐ";
      }
    }

    if (name === "discount") {
      const numValue = Number(value);

      if (isNaN(numValue)) {
        errorMsg = "Giảm giá phải là số";
      } else if (numValue < 0) {
        errorMsg = "Giảm giá không được âm";
      } else if (numValue > 100) {
        errorMsg = "Giảm giá không được vượt quá 100%";
      }
    }

    // Cập nhật state product
    setProduct((prev) => ({
      ...prev,
      [name]: value,
      ...(name === "name" && { slug: slugify(value) }), // auto slug
    }));

    // Cập nhật state errors
    setErrors((prev) => {
      const updated = { ...prev };
      if (errorMsg) {
        updated[name as keyof Product] = errorMsg;
      } else {
        delete updated[name as keyof Product];
      }
      return updated;
    });
    setErrorMessage("");
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

      // Append các field trong DTO
      formData.append("name", product.name);
      formData.append("price", String(product.price));
      formData.append("discount", String(product.discount));
      formData.append("slug", product.slug);
      formData.append("barcode", product.barcode);
      formData.append("expiry_date", product.expiry_date);
      formData.append("origin", product.origin);
      formData.append("weight_unit", String(product.weight_unit));
      formData.append("description", product.description);
      formData.append("quantity", String(product.quantity));
      formData.append("categoryId", String(product.categoryId));
      formData.append("brandId", String(product.brandId));
      formData.append("purchase", String(product.purchase));

      // Append file ảnh
      if (selectFile) formData.append("images", selectFile);

      await api.post("/products", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setProduct(defaultProduct);
      setErrors({});
      showSuccessAndRedirect("Thêm sản phẩm thành công!", router, "/product");
    } catch (error) {
      handleAxiosError(error, setErrorMessage);
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

    const selectedDate = new Date(dates[0]);
    selectedDate.setHours(0, 0, 0, 0);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (selectedDate < today) {
      setErrors((prev) => ({
        ...prev,
        expiry_date: "Ngày hết hạn không được nhỏ hơn ngày hiện tại!",
      }));
      return;
    }

    // Xóa lỗi nếu đã nhập hợp lệ
    setErrors((prev) => {
      const updated = { ...prev };
      delete updated.expiry_date;
      return updated;
    });

    setProduct((prev) => ({
      ...prev,
      expiry_date: currentDateString, // hoặc: selectedDate.toISOString()
    }));
  };

  const handleDescriptionChange = (value: string) => {
    setProduct((prev) => ({
      ...prev,
      description: value,
    }));
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files?.length) {
      setSelectFile(event.target.files[0]);
      const previewUrl = URL.createObjectURL(event.target.files[0]);
      setPreview(previewUrl);
    }
  };

  return (
    <ComponentCard title="Thêm sản phẩm">
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
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
              onChange={handleChange}
            />
            {(errors.barcode || errorMessage) && (
              <p className="text-red-500 text-sm mt-1">
                {errors.barcode || errorMessage}
              </p>
            )}
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
            {errors.origin && (
              <p className="text-red-500 text-sm mt-1">{errors.origin}</p>
            )}
          </div>
          <div>
            <DatePicker
              id="date-picker"
              label="Ngày hết hạn"
              placeholder="Select a date"
              onChange={handleSelectDate}
            />
            {errors.expiry_date && (
              <p className="text-red-500 text-sm mt-1">{errors.expiry_date}</p>
            )}
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
            {errors.weight_unit && (
              <p className="text-red-500 text-sm mt-1">{errors.weight_unit}</p>
            )}
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
            <Label>Giá sản phẩm</Label>
            <Input
              type="text"
              value={product.price}
              name="price"
              onChange={handleChange}
            />
            {errors.price && (
              <p className="text-red-500 text-sm mt-1">{errors.price}</p>
            )}
          </div>

          <div>
            <Label>Loại danh mục</Label>
            <div className="relative">
              <Select
                options={listCategories}
                placeholder="Vui lòng chọn loại danh mục"
                onChange={handleSelectCategory}
                className="dark:bg-dark-900 w-full"
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
                className="dark:bg-dark-900 w-full"
              />
              <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400"></span>
            </div>
          </div>
          <div className="col-span-2">
            <Label>Giảm giá ( theo đơn vị % )</Label>
            <Input
              type="text"
              value={product.discount}
              name="discount"
              onChange={handleChange}
            />
            {errors.discount && (
              <p className="text-red-500 text-sm mt-1">{errors.discount}</p>
            )}
          </div>
          <div className="col-span-2">
            <Label>Mô tả</Label>
            <TextArea
              value={product.description}
              onChange={handleDescriptionChange}
              rows={6}
            />
          </div>
          <div className="col-span-2">
            <Label>Hình ảnh</Label>
            <FileInput onChange={handleFileChange} className="custom-class" />
            {preview && (
              <Image
                width={500}
                height={500}
                src={preview}
                alt={product.name || "product image"}
                className="mt-5"
              />
            )}
          </div>
        </div>

        <div className="flex justify-end space-x-4 mt-6">
          <Link href="/product" className="bg-gray-300 px-3 py-3 rounded-xl">
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
