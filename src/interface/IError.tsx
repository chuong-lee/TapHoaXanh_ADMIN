import { AxiosError } from "axios";

interface BackendErrors<T> {
  message?: string;
  errors?: Partial<Record<keyof T, string>>;
}

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
