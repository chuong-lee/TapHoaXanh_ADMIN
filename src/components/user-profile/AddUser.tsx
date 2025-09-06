"use client";

import api from "@/app/lib/axios";
import { showSuccessAndRedirect } from "@/app/utils/helper";
import { defaultUser, TUserRole, User } from "@/interface/IUser";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import ComponentCard from "../common/ComponentCard";
import Input from "../form/input/InputField";
import Label from "../form/Label";
import Select, { Option } from "../form/Select";

export default function FormAddUser() {
  const [user, setUser] = useState<User>(defaultUser);
  const router = useRouter();

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setUser((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const productOptions: Option[] = [
    { value: TUserRole.ADMIN, label: TUserRole.ADMIN },
    { value: TUserRole.USER, label: TUserRole.USER },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = { ...user };
    try {
      await api.post(`/auth/register`, data);
      setUser(defaultUser);
      showSuccessAndRedirect(
        "Cập nhật thông tin người dùng thành công!",
        router,
        "/profile"
      );
    } catch (error) {
      console.log("Lỗi: ", error);
    }
  };

  const handleSelectProduct = (value: string) => {
    setUser((prev) => ({
      ...prev,
      role: value as TUserRole,
    }));
  };

  return (
    <ComponentCard title="">
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
          <div>
            <Label>Tên người dùng</Label>
            <Input
              type="text"
              placeholder="Nhập tên người dùng"
              name="name"
              value={user.name}
              onChange={handleChange}
            />
          </div>

          <div>
            <Label>SĐT</Label>
            <Input
              type="text"
              placeholder="Nhập SĐT"
              name="phone"
              value={user.phone}
              onChange={handleChange}
            />
          </div>

          <div>
            <Label>Email</Label>
            <Input
              type="email"
              placeholder="Nhập số lượng sản phẩm biến thể"
              name="email"
              value={user.email}
              onChange={handleChange}
            />
          </div>

          <div>
            <Label>Vai trò</Label>
            <div className="relative">
              <Select
                options={productOptions}
                placeholder="Vui lòng chọn vai trò"
                onChange={handleSelectProduct}
                className="dark:bg-dark-900 w-full"
                defaultValue={user.role}
              />
              <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400"></span>
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-4 mt-6">
          <button className="bg-gray-300 px-3 py-3 rounded-xl">
            <Link href="/profile">Huỷ</Link>
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
