import React from "react";
import styles from "./ProductCard.module.css";
import { Link } from "react-router-dom";
import {
  StarFilled,
  ShoppingCartOutlined,
  EyeOutlined,
} from "@ant-design/icons";

function ProductCard({ productId, image, name, price, rating, discount }) {
  const newPrice = price - (price * discount) / 100;
  const formattedPrice = new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(newPrice);
  return (
    <div className={styles["product-card"]}>
      <Link to={`/products/${productId}`}>
        <img src={image} alt={name} className={styles["product-image"]} />
      </Link>
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
        <Link to={`/products/${productId}`}>
          <div className={styles["product-card-name"]}>{name}</div>
        </Link>
      </div>
      <div className={styles["product-rating"]}>
        <span className={styles["rating-stars"]}>
          {[...Array(5)].map((_, index) => (
            <StarFilled
              key={index}
              style={{
                color: index < Math.floor(rating) ? "#ffd700" : "#e8e8e8",
              }}
            />
          ))}
        </span>
        <span className={styles["rating-count"]}>({rating?.toFixed(1)})</span>
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
      <button className={styles["product-card-btn"]}>
        {" "}
        <ShoppingCartOutlined />
        Thêm vào giỏ
      </button>
    </div>
  );
}

export default ProductCard;
