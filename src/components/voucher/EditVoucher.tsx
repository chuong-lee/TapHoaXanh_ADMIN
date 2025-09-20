"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import ComponentCard from "../common/ComponentCard";
import DatePicker from "../form/date-picker";
import Input from "../form/input/InputField";
import Label from "../form/Label";
import Select, { Option } from "../form/Select";
import { defaultVoucher, Voucher, VoucherType } from "@/interface/IVoucher";
import api from "@/app/lib/axios";
import { showSuccessAndRedirect } from "@/app/utils/helper";

export default function FormEditVoucher() {
  const [voucher, setVoucher] = useState<Voucher>(defaultVoucher);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const router = useRouter();
  const params = useParams();
  const id = params.id;

  const listType: Option[] = [
    { value: VoucherType.PERCENTAGE, label: "Giảm theo %" },
    { value: VoucherType.NORMAL, label: "Giảm theo số tiền" },
  ];

  // Validation functions
  const validateValue = (value: number, type: string, maxDiscount: number) => {
    if (type === VoucherType.PERCENTAGE) {
      if (value > 100) {
        return "Giá trị giảm theo % không được vượt quá 100%";
      }
      if (value <= 0) {
        return "Giá trị giảm theo % phải lớn hơn 0";
      }
    } else if (type === VoucherType.NORMAL) {
      if (value > maxDiscount) {
        return "Giá trị giảm không được vượt quá mức giảm tối đa";
      }
      if (value <= 0) {
        return "Giá trị giảm phải lớn hơn 0";
      }
    }
    return "";
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    // Validate value field
    const valueError = validateValue(
      Number(voucher.value),
      voucher.type || "",
      Number(voucher.max_discount)
    );
    if (valueError) {
      newErrors.value = valueError;
    }

    // Validate max_discount
    if (Number(voucher.max_discount) <= 0) {
      newErrors.max_discount = "Mức giảm tối đa phải lớn hơn 0";
    }

    // Validate min_order_value
    if (Number(voucher.min_order_value) < 0) {
      newErrors.min_order_value = "Giá trị đơn hàng tối thiểu không được âm";
    }

    // Validate quantity
    if (Number(voucher.quantity) <= 0) {
      newErrors.quantity = "Số lượng phải lớn hơn 0";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setVoucher((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  useEffect(() => {
    const getVoucherById = async () => {
      const response = await api.get(`voucher/${id}`);
      const data = response.data;
      console.log("🚀 ~ getVoucherById ~ data:", data);
      setVoucher({ ...data });
    };
    getVoucherById();
  }, [id]);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form before submitting
    if (!validateForm()) {
      return;
    }

    try {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { code, ...data } = voucher;
      await api.patch(`/voucher/${id}`, data);
      showSuccessAndRedirect(
        "Cập nhật voucher thành công!",
        router,
        "/voucher"
      );
    } catch (error) {
      console.log("Lỗi: ", error);
    }
  };

  const handleSelectChange = (value: string) => {
    setVoucher((prev) => ({
      ...prev,
      type: value,
    }));

    // Clear value error when type changes
    if (errors.value) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.value;
        return newErrors;
      });
    }
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
              disabled={true}
            />
          </div>
          <div>
            <Label>Mức giảm tối đa</Label>
            <Input
              type="number"
              value={voucher.max_discount}
              name="max_discount"
              onChange={handleChange}
            />
            {errors.max_discount && (
              <p className="text-red-500 text-sm mt-1">{errors.max_discount}</p>
            )}
          </div>
          <div>
            <Label>Giá trị đơn hàng tối thiểu</Label>
            <Input
              type="number"
              value={voucher.min_order_value}
              name="min_order_value"
              onChange={handleChange}
            />
            {errors.min_order_value && (
              <p className="text-red-500 text-sm mt-1">
                {errors.min_order_value}
              </p>
            )}
          </div>
          <div>
            <Label>Số lượng</Label>
            <Input
              type="number"
              value={voucher.quantity}
              name="quantity"
              onChange={handleChange}
            />
            {errors.quantity && (
              <p className="text-red-500 text-sm mt-1">{errors.quantity}</p>
            )}
          </div>
          <div>
            <DatePicker
              id="start-date"
              label="Ngày bắt đầu"
              placeholder="Lựa chọn ngày bắt đầu"
              onChange={handleSelectStartDate}
              defaultDate={voucher.start_date}
            />
          </div>
          <div>
            <DatePicker
              id="end-date"
              label="Ngày kết thúc"
              placeholder="Lựa chọn ngày kết thúc"
              onChange={handleSelectEndDate}
              defaultDate={voucher.end_date}
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
                defaultValue={voucher.type}
              />

              <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400"></span>
            </div>
          </div>
          <div>
            <Label>Giá trị giảm</Label>
            <Input
              type="number"
              value={voucher.value}
              name="value"
              onChange={handleChange}
              placeholder={
                voucher.type === VoucherType.PERCENTAGE
                  ? "Nhập % giảm (0-100)"
                  : "Nhập số tiền giảm"
              }
            />
            {errors.value && (
              <p className="text-red-500 text-sm mt-1">{errors.value}</p>
            )}
          </div>
        </div>

        <div className="flex justify-end space-x-4 mt-6">
          <Link href="/voucher" className="bg-gray-300 px-3 py-3 rounded-xl">
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
