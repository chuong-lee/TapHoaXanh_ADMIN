// utils/toastHelper.ts
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { toast } from "sonner";

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
