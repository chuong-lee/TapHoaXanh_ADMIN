import { safeDelete } from "@/app/utils/helper";

export const deleteProductVariantByProductId = async (
  productId: number | string
) => {
  await safeDelete(`/product-variant/by-product/${productId}`);
};

export const deleteProductImagesByProductId = async (
  productId: number | string
) => {
  await safeDelete(`/product-images/by-product/${productId}`);
};

export const deleteProductById = async (productId: number | string) => {
  await safeDelete(`/products/${productId}`); // Product là bắt buộc, không bỏ qua lỗi
};

export const deleteProductByCategoryId = async (
  categoryId: number | string
) => {
  await safeDelete(`/products/by-cate/${categoryId}`);
};

export const deleteCategory = async (categoryId: number | string) => {
  await safeDelete(`/categories/${categoryId}`);
};
