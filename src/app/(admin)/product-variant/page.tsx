"use client";
import api from "@/app/lib/axios";
import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { Option } from "@/components/form/Select";
import ProductVariants from "@/components/tables/ProductVariants";
import { Product } from "@/interface/IProduct";
import { useEffect, useState } from "react";

export default function ProductPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProductId, setSelectedProductId] = useState("");
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await api.get("/products");
        setAllProducts(response.data);
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };

    fetchProducts();
  }, []);
  const productOptions: Option[] = allProducts
    .filter((product) => typeof product.id === "number")
    .map((product) => ({
      value: product.id!.toString(),
      label: product.name ?? "",
    }));
  const handleSelectProduct = (value: string) => {
    setSelectedProductId(value);
  };

  const handleSearchItem = (value: string) => {
    setSearchTerm(value);
    console.log("Search term:", value);
  };

  return (
    <div>
      <div>
        <PageBreadcrumb pageTitle="Quản lý sản phẩm biến thể" />
        <div className="space-y-6">
          <ComponentCard
            desc="Thêm sản phẩm biến thể"
            hrefLink="/add-product-variant"
            filters={[
              {
                label: "Lọc theo sản phẩm:",
                value: selectedProductId,
                onChange: handleSelectProduct,
                options: productOptions,
              },
            ]}
            search={{
              value: searchTerm,
              onChange: handleSearchItem,
            }}
          >
            <ProductVariants
              productId={selectedProductId}
              searchItem={searchTerm}
            />
          </ComponentCard>
        </div>
      </div>
    </div>
  );
}
