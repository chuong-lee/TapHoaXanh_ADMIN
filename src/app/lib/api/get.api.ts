import { Product } from "@/interface/IProduct";
import api from "../axios";
import { OrderDetail } from "@/interface/IOrder";

export const getProductByCategoryId = async (id: string | number) => {
  return await api.get<Product[]>(`products/cate/${id}`);
};

export const getOrderByOrderCode = async (orderCode: string) => {
  return await api.get<OrderDetail[]>(`order/view-detail/${orderCode}`);
};
