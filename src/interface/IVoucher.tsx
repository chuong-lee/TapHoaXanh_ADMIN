export interface Voucher {
  id?: number;
  code: string;

  max_discount: number;

  min_order_value: number;

  quantity: number;

  is_used: boolean;

  start_date: string;

  end_date: string;

  type?: string;

  value: number;

  orderId?: number;
}

export enum VoucherType {
  PERCENTAGE = "PERCENTAGE",
  NORMAL = "NORMAL",
}

export const defaultVoucher: Voucher = {
  code: "",
  max_discount: 0,
  min_order_value: 0,
  quantity: 0,
  is_used: false,
  start_date: "",
  end_date: "",
  type: "",
  value: 0,
};
