"use client";

import api from "@/app/lib/axios";
import { showSuccessAndRedirect } from "@/app/utils/helper";
import {
  defaultOrder,
  Order,
  PaymentMethod,
  PaymentStatus,
} from "@/interface/IOrder";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import ComponentCard from "../common/ComponentCard";
import Input from "../form/input/InputField";
import Label from "../form/Label";
import Select, { Option } from "../form/Select";

export default function FormAddOrder() {
  const [productVariant, setProductVariant] = useState<Order>(defaultOrder);
  const router = useRouter();

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setProductVariant((prev) => ({
      ...prev,
      [name]: name === "total_price" ? Number(value) : value,
    }));
  };

  const listProducts: Option[] = [
    { value: PaymentStatus.FAIL, label: PaymentStatus.FAIL },
    { value: PaymentStatus.PENDING, label: PaymentStatus.PENDING },
    { value: PaymentStatus.SUCCESS, label: PaymentStatus.SUCCESS },
  ];

  const paymentMethod: Option[] = [
    { value: PaymentMethod.BANK, label: PaymentMethod.BANK },
  ];

  const listUser: Option[] = [{ value: "1", label: "Nguyen Van A" }];

  const handleSelectProduct = (value: string) => {
    setProductVariant((prev) => ({
      ...prev,
      status: value,
    }));
  };

  const handleSelectUser = (value: string) => {
    setProductVariant((prev) => ({
      ...prev,
      userId: +value,
    }));
  };

  const handleSelectPayment = (value: string) => {
    setProductVariant((prev) => ({
      ...prev,
      payment: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = { ...productVariant };
    try {
      await api.post("/order", data);
      setProductVariant(defaultOrder);
      showSuccessAndRedirect("Thêm đơn hàng thành công", router, "/order");
    } catch (error) {
      console.error("Lỗi khi thêm biến thể sản phẩm:", error);
    }
  };

  return (
    <ComponentCard title="">
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
          <div>
            <Label>Mã đơn hàng</Label>
            <Input
              type="text"
              placeholder="Nhập mã đơn hàng"
              name="order_code"
              value={productVariant.order_code}
              onChange={handleChange}
            />
          </div>

          <div>
            <Label>Tổng giá</Label>
            <Input
              type="text"
              placeholder="Nhập tổng giá"
              name="total_price"
              value={productVariant.total_price}
              onChange={handleChange}
            />
          </div>

          <div>
            <Label>Ghi chú</Label>
            <Input
              type="text"
              placeholder="Nhập ghi chú"
              name="note"
              value={productVariant.note}
              onChange={handleChange}
            />
          </div>

          <div>
            <Label>Trạng thái đơn hàng</Label>
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
          <div>
            <Label>Phương thức thanh toán</Label>
            <div className="relative">
              <Select
                options={paymentMethod}
                placeholder="Vui lòng chọn loại sản phẩm"
                onChange={handleSelectPayment}
                className="dark:bg-dark-900 w-full"
              />
              <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400"></span>
            </div>
          </div>
          <div>
            <Label>Người dùng</Label>
            <div className="relative">
              <Select
                options={listUser}
                placeholder="Vui lòng chọn loại sản phẩm"
                onChange={handleSelectUser}
                className="dark:bg-dark-900 w-full"
              />
              <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400"></span>
            </div>
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
