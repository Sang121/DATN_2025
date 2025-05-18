import React from "react";
import styles from "./ProductCard.module.css";
import { Link } from "react-router-dom";
function ProductCard({
  productId,
  image,
  name,
  price,
  rating,
  discount,
  badge,
  labels = [],
  extra,
}) {
  const newPrice = price - (price * discount) / 100;
  const formattedPrice = new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(newPrice);
  return (
    <div className={styles["product-card"]}>
      {badge && <div className={styles["product-card-badge"]}>{badge}</div>}
      <div className={styles["product-card-img-wrap"]}>
        <img className={styles["product-card-img"]} src={image} alt={name} />
      </div>
      <div className={styles["product-card-body"]}>
        {/* <div className={styles["product-card-labels"]}>
          {labels.map((label, idx) => (
            <span
              key={idx}
              className={`${styles["product-card-label"]} ${label.type}`}
            >
              {label.text}ddd
            </span>
          ))}
        </div> */}
        {console.log(" id của sản phẩm ", name, "là", productId)}
        <Link to={`/products/${productId}`}>
          <div className={styles["product-card-name"]}>{name}</div>
        </Link>
      </div>
      <div className={styles["product-card-rating"]}>
        <span className={styles["product-card-rating-value"]}>{rating}</span>
        <span className={styles["product-card-rating-star"]}>★</span>
      </div>

      <div className={styles["product-card-price"]}>
        <span className={styles["product-card-price-current"]}>
          {formattedPrice}
        </span>
        <span className={styles["product-card-price-old"]}>
          {new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
          }).format(price)}
        </span>
      </div>
      <button className={styles["product-card-btn"]}>Thêm vào giỏ</button>
    </div>
  );
}

export default ProductCard;
