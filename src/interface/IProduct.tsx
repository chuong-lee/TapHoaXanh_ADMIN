export interface Product {
  name: string;
  price: number;
  discount: number;
  images: string;
  slug: string;
  barcode: string;
  expiry_date: string; // hoặc Date nếu bạn dùng Date object
  origin: string;
  weight_unit: string;
  description: string;
  quantity: number;
  categoryId: number;
  brandId: number;
  purchase: number;
}

export const defaultProduct: Product = {
  name: "",
  price: 0,
  discount: 0,
  images: "",
  slug: "",
  barcode: "",
  expiry_date: "",
  origin: "",
  weight_unit: "",
  description: "",
  quantity: 0,
  categoryId: 0,
  brandId: 0,
  purchase: 0,
};
