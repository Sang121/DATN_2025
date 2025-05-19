import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import styles from "./ProductDetail.module.css";
import { Button } from "antd";
import ProductCard from "../../components/ProductCard/ProductCard";
import ListProducts from "../../components/ListProducts/ListProduct";
function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [selectedSize, setSelectedSize] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState("");
  const sizes = ["S", "M", "L", "XL"];

  useEffect(() => {
    fetch(`https://dummyjson.com/products/${id}`)
      .then((response) => response.json())
      .then((data) => {
        setProduct(data);
        setSelectedImage(
          data.images && data.images.length > 0
            ? data.images[0]
            : data.thumbnail
        );
      })
      .catch((error) => console.error("Error fetching product:", error));
  }, [id]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [id]);

  if (!product) return null;

  return (
    <div className={styles["product-detail-body"]}>
      <div className={styles["product-detail-container"]}>
        <div className={styles["product-detail-breadcrumb"]}>
          <h1>
            <a href="/">Trang chủ</a> /{" "}
            <a href={`/collections/${product.category}`}>{product.category}</a>{" "}
            / {product.title}
          </h1>
        </div>
        <div className={styles["productMain"]}>
          <div className={styles["productImage"]}>
            <div className={styles["productImageThumb"]}>
              {product.images?.slice(0, 3).map((img, idx) => (
                <img
                  key={idx}
                  src={img}
                  alt=""
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
              <img src={selectedImage} alt="" />
            </div>
          </div>
          <div style={{ flex: 1, paddingLeft: 32 }}>
            <h2>{product.title}</h2>
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
          <ListProducts Collections={product.category} />
        </div>
      </div>
    </div>
  );
}

export default ProductDetail;
