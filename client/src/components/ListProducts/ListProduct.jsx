import React from "react";
import ProductCard from "../ProductCard/ProductCard";
import styles from "./ListProduct.module.css";
import { Flex, Spin, Alert } from "antd"; // Import Spin và Alert từ antd
import { useQuery } from "@tanstack/react-query";
import { getAllProduct } from "../../services/productService";
function ListProduct({ category }) {
  const {
    data: products,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["products", category],
    queryFn: () => getAllProduct(category),
    staleTime: 1000 * 60 * 5,
  });
  if (isLoading) {
    return (
      <div>
        <div className={styles.statusContainer}>
          <Spin size="large" />
          <p>Loading products...</p>
        </div>
      </div>
    );
  }
  if (isError) {
    return (
      <div className={styles.statusContainer}>
        {/* Error.message lấy thông báo từ đối tượng lỗi */}
        <Alert
          message="Error"
          description={
            error?.message || "Failed to load products. Please try again later."
          }
          type="error"
          showIcon
        />
      </div>
    );
  }

  if (!products || products.length === 0) {
    return (
      <div className={styles.statusContainer}>
        <p>No products found for this category. Please try a different one.</p>
      </div>
    );
  }

  return (
    <div>
      <Flex wrap gap="small" className={styles["list-product-container"]}>
        {products.map((product) => (
          <ProductCard
            key={product._id}
            productId={product._id}
            image={product.thumbnail}
            name={product.name}
            price={product.price}
            oldPrice={product.oldPrice}
            rating={product.rating}
            discount={product.discount}
            extra={product.description}
          />
        ))}
      </Flex>
    </div>
  );
}

export default ListProduct;
