import React, { useState } from "react";
import ProductCard from "../ProductCard/ProductCard";
import styles from "./ListProduct.module.css";
import { Flex, Spin, Alert } from "antd";
import { useQuery } from "@tanstack/react-query";
import { searchProduct } from "../../services/productService";

function ListProduct({ query }) {
  const [visibleProducts, setVisibleProducts] = useState(8); // Bắt đầu với 8 sản phẩm
  const {
    data: products,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["search", query],
    queryFn: () => searchProduct(query),
  });

  const handleLoadMore = () => {
    setVisibleProducts((prev) => prev * 2); // Nhân đôi số sản phẩm hiển thị
  };

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
    <div className={styles.container}>
      <Flex wrap gap="small" className={styles["list-product-container"]}>
        {/* Chỉ hiển thị số lượng sản phẩm giới hạn */}
        {products.data.slice(0, visibleProducts).map((product) => (
          <ProductCard
            key={product._id}
            productId={product._id}
            image={product.images[0]}
            name={product.name}
            price={product.price}
            sold={product.sold}
            totalStock={product.totalStock}
            oldPrice={product.oldPrice}
            rating={product.rating}
            discount={product.discount}
            extra={product.description}
          />
        ))}
      </Flex>

      {/* Hiển thị nút Load More nếu còn sản phẩm */}
      {products.data.length > visibleProducts && (
        <div className={styles["load-more-wrapper"]}>
          <button
            className={styles["load-more-button"]}
            onClick={handleLoadMore}
          >
            Xem thêm
          </button>
        </div>
      )}
    </div>
  );
}

export default ListProduct;
