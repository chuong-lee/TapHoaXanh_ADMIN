export interface Product {
  id?: number; // Optional for new products
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
export interface ProductVariant {
  id?: number; // Optional for new product variants
  variant_name: string;
  price_modifier: number;
  stock: number;
  productId: number;
}

export interface ProductImages {
  id?: number; // Optional for new product variants
  image_url: string[];
  productId: number;
}

export interface GetProductImages {
  id?: number; // Optional for new product variants
  image_url: string;
  name: string;
}

export const listProduct: Product[] = [];
export const listProductVariant: ProductVariant[] = [];

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

export const defaultProductVariant: ProductVariant = {
  variant_name: "",
  price_modifier: 0,
  stock: 0,
  productId: 0,
};

export const defaultProductImage: ProductImages = {
  image_url: [],
  productId: 0,
};
