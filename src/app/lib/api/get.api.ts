import { Product } from "@/interface/IProduct";
import api from "../axios";

export const getProductByCategoryId = async (id: string | number) => {
  return await api.get<Product[]>(`products/cate/${id}`);
};
