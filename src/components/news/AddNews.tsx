"use client";

import api from "@/app/lib/axios";
import { defaultNews, News } from "@/interface/INews";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import ComponentCard from "../common/ComponentCard";
import CheckboxGroup from "../form/form-elements/CheckboxComponents";
import Input from "../form/input/InputField";
import TextArea from "../form/input/TextArea";
import Label from "../form/Label";
import { WriteContentWithAI } from "../modal/ModalAI";
import { Spinner } from "../ui/shadcn-io/spinner";
import { showSuccessAndRedirect } from "@/app/utils/helper";
import DropzoneComponent from "../form/form-elements/DropZone";

export default function FormAddNews() {
  const [news, setNews] = useState<News>(defaultNews);
  const router = useRouter();
  const [isChecked, setIsChecked] = useState(false);
  const [isCheckedAI, setIsCheckedAI] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectImage, setSelectImage] = useState<(File | string)[]>([]);

  const handleCheckbox = () => {
    setIsChecked(true);
    setIsCheckedAI(false);
    setOpenModal(false);
  };

  const handleCheckboxAI = () => {
    setIsChecked(false);
    setIsCheckedAI(true);
    setOpenModal(true);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNews((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("name", news.name);
    formData.append("description", news.description);
    formData.append("type", news.type);
    selectImage.forEach((file) => {
      formData.append("images", file);
    });
    try {
      await api.post("/news", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      showSuccessAndRedirect("Tạo bài viết thành công!", router, "/news");
    } catch (error) {
      console.log("Lỗi: ", error);
    }
  };

  const handleGenerateDescription = async (name: string) => {
    setLoading(true);
    try {
      const res = await api.post("/news/generate-description", { name });
      // giả sử API trả về { data: "nội dung mô tả" }
      setNews((prev) => ({
        ...prev,
        description: res.data, // hoặc res.data.description tuỳ backend
      }));
      setOpenModal(false); // đóng modal khi thành công
    } catch (error) {
      console.error("Lỗi: ", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDescriptionChange = (value: string) => {
    setNews((prev) => ({ ...prev, description: value }));
  };

  const handleSelectImages = async (files: (File | string)[]) => {
    setSelectImage(files);
  };

  return (
    <ComponentCard title="">
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
          <div>
            <Label>Tên bài viết</Label>
            <Input
              type="text"
              placeholder="Nhập mã voucher"
              value={news.name}
              name="name"
              onChange={handleChange}
            />
          </div>
          <div>
            <Label>Loại bài viết</Label>
            <Input
              type="text"
              placeholder="Nhập mã voucher"
              value={news.type}
              name="type"
              onChange={handleChange}
            />
          </div>
          <CheckboxGroup
            isChecked={isChecked}
            isCheckedAI={isCheckedAI}
            onChangeFirst={handleCheckbox}
            onChangeSecond={handleCheckboxAI}
          />
          <div className="col-span-2 relative">
            <Label>Mô tả</Label>
            <div className="relative">
              <TextArea
                value={news.description}
                rows={10}
                disabled={isCheckedAI}
                onChange={handleDescriptionChange}
              />
              {loading && (
                <div className="absolute inset-0 flex items-center justify-center bg-white/70">
                  <Spinner className="w-6 h-6 animate-spin text-blue-500" />
                  <span className="ml-2 text-gray-600">
                    AI đang viết bài...
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="col-span-2 relative">
            <DropzoneComponent onChangeImages={handleSelectImages} />
          </div>

          <WriteContentWithAI
            name={news.name}
            open={openModal}
            onOpenChange={setOpenModal}
            onSubmit={handleGenerateDescription}
          />
        </div>

        <div className="flex justify-end space-x-4 mt-6">
          <Link href="/news" className="bg-gray-300 px-3 py-3 rounded-xl">
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
