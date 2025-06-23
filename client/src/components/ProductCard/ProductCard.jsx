import React from "react";
import styles from "./ProductCard.module.css";
import { Link } from "react-router-dom";
import { StarFilled, ShoppingCartOutlined } from "@ant-design/icons";

function ProductCard({ productId, image, name,totalStock, price, sold, discount }) {
  const newPrice = price - (price * discount) / 100;
  const formattedPrice = new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(newPrice);
const productPrice = {
    newPrice: formattedPrice,
    oldPrice: price?.toLocaleString("vi-VN"),
  };
  return (
    <div className={styles["product-card"]}>
      {discount > 0 && (
        <div className={styles["product-card-discount"]}>-{discount}%</div>
      )}

{(totalStock > 0) ? (
        sold > 20 ? (
          <div className={styles["product-card-badge"]}>Bán chạy</div>
        ) : null
      ) : (
        <div className={styles["product-card-badge-out-of-stock"]}>Hết hàng</div>
      )}
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
        <div className="card">
          <Link to={`/products/${productId}`}>
            <div className={styles["productName"]}>{name}</div>
          </Link>

          {/* <div className={styles["product-rating"]}>
            <span className={styles["rating-stars"]}>
              {[...Array(5)].map((_, index) => (
                <StarFilled
                  key={index}
                  style={{
                    color: index < Math.floor(rating) ? "#ffd700" : "#e8e8e8",
                    fontSize: "12px",
                  }}
                />
              ))}
            </span>
            <span className={styles["rating-count"]}>
              ({rating?.toFixed(1)})
            </span>
       
          </div> */}

          {discount > 0 ? (
            <div>
              {/* Giá hiện tại */}
              <div className={styles["productPrice"]}>
                <span className={styles["red"]}>
                  {productPrice.newPrice?.toLocaleString("vi-VN")}
                </span>

                <div className={styles["productOldPriceContainer"]}>
                
                  {/* Giá gốc */}
                  <div className={styles["productOldPrice"]}>
                    <del>{productPrice.oldPrice?.toLocaleString("vi-VN")}đ</del>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div>
              {price && (
                <span className={styles["productPrice"]}>
                  {price?.toLocaleString("vi-VN")}đ
                </span>
              )}
              {discount > 0 && (
                <Tag color="red" className={styles.discountTag}>
                  -{discount}%
                </Tag>
              )}
            </div>
          )}
          <div className={styles["product-sold"]}>
            <span className={styles["sold-count"]}>
              {" "}
              Đã bán {sold ? sold : 0 } sản phẩm
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductCard;
