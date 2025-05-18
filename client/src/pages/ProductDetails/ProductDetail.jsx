import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import styles from "./ProductDetail.module.css";
import { Button } from "antd";
import ProductCard from "../../components/ProductCard/ProductCard";

function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [selectedSize, setSelectedSize] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const sizes = ["S", "M", "L", "XL"];

  useEffect(() => {
    fetch(`https://dummyjson.com/products/${id}`)
      .then((response) => response.json())
      .then((data) => setProduct(data))
      .catch((error) => console.error("Error fetching product:", error));
  }, [id]);

  // Fetch sản phẩm cùng category
  useEffect(() => {
    if (product?.category) {
      fetch(`https://dummyjson.com/products/category/${product.category}`)
        .then((res) => res.json())
        .then((data) => {
          // Loại bỏ sản phẩm hiện tại khỏi danh sách
          const filtered = data.products.filter((p) => p.id !== Number(id));
          setRelatedProducts(filtered);
        });
    }
  }, [product, id]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [id]);

  if (!product) return null;

  return (
    <div className={styles["product-detail-body"]}>
      <div className={styles["product-detail-container"]}>
        <div className={styles["product-detail-breadcrumb"]}>
          <h1>
            <a href="/">Trang chủ</a> / <a href="/brand">{product.category}</a>{" "}
            / {product.title}
          </h1>
        </div>
        <div className={styles["productMain"]}>
          <div className={styles["productImage"]}>
            <div className={styles["productImageThumb"]}>
              {product.images?.slice(0, 3).map((img, idx) => (
                <img key={idx} src={img} alt="" />
              ))}
            </div>
            <div className={styles["productImageMain"]}>
              <img src={product.thumbnail} alt="" />
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
            {/* Chọn size */}
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
              {selectedSize && (
                <div className={styles.sizeSelectedText}>
                  Đã chọn size: <b>{selectedSize}</b>
                </div>
              )}
            </div>
            {/* Chọn số lượng */}
            <div className={styles.quantityBlock}>
              <strong>Số lượng:</strong>
              <div className={styles.quantityControl}>
                <Button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  disabled={quantity <= 1}
                  className={styles.quantityBtn}
                >
                  -
                </Button>
                <span className={styles.quantityValue}>{quantity}</span>
                <Button
                  onClick={() => setQuantity((q) => q + 1)}
                  className={styles.quantityBtn}
                >
                  +
                </Button>
              </div>
            </div>
          </div>
        </div>
        <div className={styles["productDetail"]}>
          <h2>Thông tin chi tiết</h2>
          <p>{product.description}</p>
          <h3>Thông số kỹ thuật</h3>
        </div>
      </div>

      {/* Danh sách sản phẩm cùng category */}
      {relatedProducts.length > 0 && (
        <div style={{ maxWidth: 1200, margin: "32px auto" }}>
          <h2 style={{ margin: "16px 0" }}>Sản phẩm cùng danh mục</h2>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 16 }}>
            {relatedProducts.map((item) => (
              <ProductCard
                key={item.id}
                productId={item.id}
                image={item.thumbnail}
                name={item.title}
                price={item.price}
                oldPrice={item.oldPrice}
                rating={item.rating}
                badge={item.brand}
                labels={item.tags}
                extra={item.description}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default ProductDetail;
