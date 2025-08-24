// utils/toastHelper.ts
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { toast } from "sonner";
import api from "../lib/axios";
import { AxiosError } from "axios";

export function showSuccessAndRedirect(
  message: string,
  router: AppRouterInstance,
  path: string = "/"
) {
  toast.success(message, {
    duration: 1000,
    onAutoClose: () => router.push(path), // chỉ chạy khi toast đóng
  });
}

// Helper để xóa nhưng bỏ qua lỗi 404
export const safeDelete = async (url: string) => {
  try {
    await api.delete(url);
  } catch (error) {
    const axiosError = error as AxiosError;
    if (axiosError.response?.status !== 404) throw error;
  }
};
