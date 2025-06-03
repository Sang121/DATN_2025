import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import styles from "./ProductDetail.module.css";
import { Alert, Button, Spin } from "antd";
import ListProducts from "../../components/ListProducts/ListProduct";
import { useQuery } from "@tanstack/react-query";
import { getDetailProduct } from "../../services/productService";

function ProductDetail() {
  const { id } = useParams();
  const [selectedSize, setSelectedSize] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState("");
  const sizes = ["S", "M", "L", "XL"];

  const {
    data: product,
    isLoading,
    isError,
    isSuccess,
    error,
  } = useQuery({
    queryKey: ["productDetail", id],
    queryFn: () => getDetailProduct(id),
    enabled: !!id,
  });

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [id]);
  useEffect(() => {
    if (isSuccess && product) {
      // Chỉ chạy khi product đã tải thành công
      setSelectedImage(
        product.images && product.images.length > 0
          ? product.images[0]
          : product.thumbnail || "a"
      );
    }
  }, [isSuccess, product]);

  if (isLoading) {
    return (
      <div
        className={styles.statusContainer}
        style={{ display: "flex", textalign: "center" }}
      >
        <Spin size="large" />
        <p>Loading product details...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className={styles.statusContainer}>
        <Alert
          message="Error"
          description={
            error?.message ||
            "Failed to load product details. Please try again later."
          }
          type="error"
          showIcon
        />
      </div>
    );
  }

  // Nếu không loading, không lỗi và product là null (không tìm thấy sản phẩm)
  if (!product) {
    return (
      <div className={styles.statusContainer}>
        <p>Product not found.</p>
      </div>
    );
  }

  return (
    <div className={styles["product-detail-body"]}>
      <div className={styles["product-detail-container"]}>
        <div className={styles["product-detail-breadcrumb"]}>
          <h1>
            <a href="/">Trang chủ</a> /{" "}
            <a href={`/category/${product.category}`}>{product.category}</a> /{" "}
            {product.name}
          </h1>
        </div>
        <div className={styles["productMain"]}>
          <div className={styles["productImage"]}>
            <div className={styles["productImageThumb"]}>
              {/* Kiểm tra product.images trước khi map */}
              {product.images?.slice(0, 3).map((img, idx) => (
                <img
                  key={idx}
                  src={img}
                  alt={product.name}
                  style={{
                    border: selectedImage === img ? "2px solid #1a94ff" : "",
                    opacity: selectedImage === img ? 1 : 0.7,
                    cursor: "pointer",
                  }}
                  onClick={() => setSelectedImage(img)}
                />
              ))}
            </div>
            <div className={styles["productImageMain"]}>
              <img src={selectedImage} alt={product.name} />
            </div>
          </div>
          <div style={{ flex: 1, paddingLeft: 32 }}>
            <h2>{product.name}</h2>
            <p>{product.description}</p>
            <div>
              <strong>Giá:</strong> {product.price}$
            </div>
            <div>
              <strong>Brand:</strong> {product.brand}
            </div>
            <div>
              <strong>Category:</strong> {product.category}
            </div>
            <div className={styles.sizeSelectBlock}>
              <strong>Chọn size:</strong>
              <div className={styles.sizeList}>
                {sizes.map((size) => (
                  <Button
                    key={size}
                    className={`${styles.sizeBtn} ${
                      selectedSize === size ? styles.selected : ""
                    }`}
                    onClick={() => setSelectedSize(size)}
                  >
                    {size}
                  </Button>
                ))}
              </div>
            </div>
            <div className={styles.quantityBlock}>
              <strong> Số lượng:</strong>
              <div className={styles.quantityControl}>
                <Button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  disabled={quantity <= 1}
                  className={styles.quantityBtn}
                >
                  -
                </Button>
                <span className={styles.quantityValue}> {quantity} </span>
                <Button
                  onClick={() => setQuantity((q) => q + 1)}
                  className={styles.quantityBtn}
                >
                  +
                </Button>
              </div>
            </div>
            <div style={{ marginTop: 24 }}>
              <Button
                type="primary"
                size="large"
                disabled={!selectedSize}
                onClick={() => {}}
              >
                Thêm vào giỏ hàng
              </Button>
            </div>
          </div>
        </div>
        <div className={styles["productDetail"]}>
          <h2>Thông tin chi tiết</h2>
          <p>{product.description}</p>
          <h3>Thông số kỹ thuật</h3>
        </div>
      </div>
      <div className={styles["product-detail-related"]}>
        <h2>Sản phẩm cùng danh mục</h2>
        <div className={styles["product-detail-related-list"]}>
          {product.category && <ListProducts category={product.category} />}
        </div>
      </div>
    </div>
  );
}

export default ProductDetail;
