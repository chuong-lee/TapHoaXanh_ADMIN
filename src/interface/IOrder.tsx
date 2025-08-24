export interface Order {
  id?: number;
  total_price: number;
  note: string;
  order_code: string;
  status?: string;
  payment?: string;
  userId: number;
}

export interface OrderUser {
  id: number;
  orderCode: string;
  status: string;
  userName: string;
  userPhone: string;
  totalPrice: number;
}

export enum PaymentMethod {
  DEFAULT = "",
  STRIPE = "stripe",
  MOMO = "momo",
  VNPAY = "vnpay",
  BANK = "bank",
  BANK_TRANSFER = "bank_transfer",
}

export const defaultOrder: Order = {
  total_price: 0,
  note: "",
  order_code: "",
  status: "",
  payment: "",
  userId: 0,
};

export enum PaymentStatus {
  PENDING = "pending",
  SUCCESS = "success",
  FAIL = "fail",
}
