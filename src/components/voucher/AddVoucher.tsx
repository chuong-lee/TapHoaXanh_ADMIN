"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import ComponentCard from "../common/ComponentCard";
import DatePicker from "../form/date-picker";
import Input from "../form/input/InputField";
import Label from "../form/Label";
import Select, { Option } from "../form/Select";
import { defaultVoucher, Voucher, VoucherType } from "@/interface/IVoucher";
import api from "@/app/lib/axios";
import { showSuccessAndRedirect } from "@/app/utils/helper";

export default function FormAddVoucher() {
  const [voucher, setVoucher] = useState<Voucher>(defaultVoucher);
  const router = useRouter();

  const listType: Option[] = [
    { value: VoucherType.PERCENTAGE, label: "Giảm theo %" },
    { value: VoucherType.NORMAL, label: "Giảm theo số tiền" },
  ];
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setVoucher((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = { ...voucher };
      await api.post("/voucher", data);
      showSuccessAndRedirect("Tạo voucher thành công!", router, "/voucher");
    } catch (error) {
      console.log("Lỗi: ", error);
    }
  };

  const handleSelectChange = (value: string) => {
    setVoucher((prev) => ({
      ...prev,
      type: value,
    }));
  };

  const handleSelectStartDate = (date: Date[]) => {
    const selectedDate = date[0]; // lấy ngày đầu tiên
    console.log("🚀 ~ handleSelectStartDate ~ selectedDate:", selectedDate);
    if (!selectedDate) return;

    if (voucher.end_date && selectedDate >= new Date(voucher.end_date)) {
      alert("Ngày kết thúc phải lớn hơn ngày bắt đầu");
      setVoucher({
        ...voucher,
        start_date: selectedDate.toISOString(),
        end_date: "",
      });
    } else {
      setVoucher({ ...voucher, start_date: selectedDate.toISOString() });
    }
  };

  const handleSelectEndDate = (date: Date[]) => {
    const selectedDate = date[0]; // hoặc date[1] nếu bạn muốn lấy ngày cuối
    console.log("🚀 ~ handleSelectEndDate ~ selectedDate:", selectedDate);
    if (!selectedDate) return;

    if (voucher.start_date && selectedDate <= new Date(voucher.start_date)) {
      alert("Ngày kết thúc phải lớn hơn ngày bắt đầu");
      return;
    }
    setVoucher({ ...voucher, end_date: selectedDate.toISOString() });
  };

  return (
    <ComponentCard title="">
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
          <div>
            <Label>Mã voucher</Label>
            <Input
              type="text"
              placeholder="Nhập mã voucher"
              value={voucher.code}
              name="code"
              onChange={handleChange}
            />
          </div>
          <div>
            <Label>Mức giảm tối đa</Label>
            <Input
              type="text"
              value={voucher.max_discount}
              name="max_discount"
              onChange={handleChange}
            />
          </div>
          <div>
            <Label>Giá trị đơn hàng tối thiểu</Label>
            <Input
              type="text"
              value={voucher.min_order_value}
              name="min_order_value"
              onChange={handleChange}
            />
          </div>
          <div>
            <Label>Số lượng</Label>
            <Input
              type="text"
              value={voucher.quantity}
              name="quantity"
              onChange={handleChange}
            />
          </div>
          <div>
            <DatePicker
              id="start-date"
              label="Ngày bắt đầu"
              placeholder="Select a date"
              onChange={handleSelectStartDate}
            />
          </div>
          <div>
            <DatePicker
              id="end-date"
              label="Ngày kết thúc"
              placeholder="Select a date"
              onChange={handleSelectEndDate}
            />
          </div>
          <div>
            <Label>Loại voucher</Label>
            <div className="relative">
              <Select
                options={listType}
                placeholder="Vui lòng chọn thư mục cha"
                onChange={handleSelectChange}
                className="dark:bg-dark-900"
              />

              <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400"></span>
            </div>
          </div>
          <div>
            <Label>Giá trị giảm</Label>
            <Input
              type="text"
              value={voucher.value}
              name="value"
              onChange={handleChange}
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
