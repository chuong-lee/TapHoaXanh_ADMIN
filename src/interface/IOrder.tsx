export interface Order {
  id?: number;
  total_price: number;
  note: string;
  order_code: string;
  status?: string;
  payment?: string;
  userId: number;
}

export interface Payment {
  payment_method: string;
  status: string;
}

export interface User {
  name: string;
  phone: string;
}

export interface OrderUser {
  id: number;
  order_code: string;
  status: string;
  total_price: number;
  payments: Payment[];
  user: User;
  createdAt: string;
  updatedAt: string;
}

export enum PaymentMethod {
  COD = "COD",
  VNPAY = "VNPAY",
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

export enum PaymentMethodDisplay {
  COD = "Thanh toán khi nhận hàng",
  VNPAY = "VNPay",
}

export enum PaymentStatusDisplay {
  PENDING = "Chờ thanh toán",
  SUCCESS = "Đã thanh toán",
  FAIL = "Thanh toán thất bại",
}

export interface OrderDetail {
  id?: number;
  orderCode: string;
  productName: string;
  unitPrice: number;
  quantity: number;
  productImage: string;
}
