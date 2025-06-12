import React from "react";
import ProductCard from "../ProductCard/ProductCard";
import styles from "./ListProduct.module.css";
import { Flex, Spin, Alert, Empty } from "antd";
import { useQuery } from "@tanstack/react-query";
import { searchProduct } from "../../services/productService";

function ListProduct({ query }) {
  console.log(query);
  const {
    data: products,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["search", query],
    queryFn: () => searchProduct(query),
  });
  if (isLoading) {
    return (
      <div className={styles.statusContainer}>
        <Spin size="large" tip="Đang tải sản phẩm..." />
      </div>
    );
  }
  if (isError) {
    return (
      <div className={styles.statusContainer}>
        <Alert
          message="Lỗi"
          description={
            error?.message ||
            "Không thể tải danh sách sản phẩm. Vui lòng thử lại sau."
          }
          type="error"
          showIcon
        />
      </div>
    );
  }

  if (!products?.data || products.data.length === 0) {
    return (
      <div className={styles.statusContainer}>
        <Alert
          message="Không có sản phẩm nào trong danh mục này"
          description="Vui lòng chọn danh mục khác"
          type="error"
          showIcon
        />
      </div>
    );
  }

  return (
    <div>
      <Flex wrap gap="small" className={styles["list-product-container"]}>
        {products.data.map((product) => (
          <ProductCard
            key={product._id}
            productId={product._id}
            image={product.images[0]}
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
