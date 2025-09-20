import { AxiosError } from "axios";

export interface BackendError {
  statusCode: number;
  error: string;
  message: string;
}

export function handleAxiosError(
  err: unknown,
  setMessage: (msg: string) => void
) {
  const error = err as AxiosError<BackendError>;

  if (error.response?.data) {
    const data = error.response.data;
    console.error("❌ Backend error:", data);

    // chỉ có message chung
    setMessage(data.message);
  } else {
    setMessage("Có lỗi xảy ra, vui lòng thử lại");
  }
}

export function handleAxiosErrorInTable(err: unknown): string {
  const error = err as AxiosError<BackendError>;

  if (error.response?.data) {
    const data = error.response.data;
    console.error("❌ Backend error:", data);

    return data.message; // trả về message từ backend
  } else {
    return "Có lỗi xảy ra, vui lòng thử lại";
  }
}
