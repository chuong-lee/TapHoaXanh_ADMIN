"use client";
import React, { useState } from 'react';
import ComponentCard from '../../common/ComponentCard';
import Label from '../Label';
import Input from '../input/InputField';
import Select from '../Select';
import DatePicker from '@/components/form/date-picker';

export default function DefaultInputs() {
  const [showPassword, setShowPassword] = useState(false);
  const options = [
    { value: "marketing", label: "Marketing" },
    { value: "template", label: "Template" },
    { value: "development", label: "Development" },
  ];
  const handleSelectChange = (value: string) => {
    console.log("Selected value:", value);
  };
  return (
    <ComponentCard title="Thêm sản phẩm">
      <div className="space-y-6">
        <div>
          <Label>Tên sản phẩm</Label>
          <Input type="text" placeholder="Nhập tên sản phẩm" />
        </div>
        <div>
          <Label>Giá sản phẩm</Label>
          <Input type="text" placeholder="Nhập giá sản phẩm" />
        </div>
        <div>
          <Label>Mô tả sản phẩm</Label>
          <Input type="text" placeholder="Nhập mô tả sản phẩm" />
        </div>
        <div>
          <Label>Chọn loại sản phẩm</Label>
          <div className="relative">
            <Select
            options={options}
            placeholder="Vui lòng chọn loại sản phẩm"
            onChange={handleSelectChange}
            className="dark:bg-dark-900"
          />
             <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400">
            </span>
          </div>
        </div>
      </div>

      <div className="flex justify-end space-x-4 mt-6">
        <button className='bg-gray-300 px-3 py-3 rounded-xl'>Huỷ</button>
        <button className='bg-blue-700 px-3 py-3 rounded-xl text-white'>Lưu</button>
      </div>
    </ComponentCard>
  );
}
