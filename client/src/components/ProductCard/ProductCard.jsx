import React, { useState } from "react";
import styles from "./ProductCard.module.css";
import { Link } from "react-router-dom";
import { HeartFilled, HeartOutlined } from "@ant-design/icons";
import { Button, message } from "antd";
import { addFavorite, removeFavorite } from "../../services/userService";
import { useSelector, useDispatch } from "react-redux";
import { updateFavorite } from "../../redux/slices/userSlice";
function ProductCard({
  productId,
  image,
  name,
  totalStock,
  price,
  sold,
  discount,
}) {
  const [isAnimating, setIsAnimating] = useState(false);
  const dispatch = useDispatch();
  const favoriteProducts = useSelector((state) => state.user.favorite);
  const userId = useSelector((state) => state.user._id);

  const isFavorite = favoriteProducts?.some((product) => product === productId);
  const newPrice = price - (price * discount) / 100;
  const formattedPrice = new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(newPrice);
  const productPrice = {
    newPrice: formattedPrice,
    oldPrice: price?.toLocaleString("vi-VN"),
  };
  const handleFavorite = (e) => {
    e.stopPropagation();
    if (!userId) {
      message.error("Vui lòng đăng nhập để thêm sản phẩm vào yêu thích.");
      return;
    }
    if (isFavorite) {
      removeFavorite(productId);
      dispatch(
        updateFavorite({
          favorite: favoriteProducts.filter((id) => id !== productId),
        })
      );
    } else {
      addFavorite(productId);
      dispatch(updateFavorite({ favorite: [...favoriteProducts, productId] }));
      setIsAnimating(true);
    }
  };
  return (
    <div className={styles["product-card"]}>
      {discount > 0 && (
        <div className={styles["product-card-discount"]}>-{discount}%</div>
      )}

      {totalStock > 0 ? (
        sold > 20 ? (
          <div className={styles["product-card-badge"]}>Bán chạy</div>
        ) : null
      ) : (
        <div className={styles["product-card-badge-out-of-stock"]}></div>
      )}
      <Link to={`/products/${productId}`}>
        <img src={image} alt={name} className={styles["product-image"]} />
      </Link>
      <div className={styles["product-card-body"]}>
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
                <span style={{ color: "#ff424e" }}>
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
            </div>
          )}
          <div className={styles["product-sold"]}>
            <span className={styles["sold-count"]}>
              {" "}
              Đã bán {sold ? sold : 0} sản phẩm
            </span>
            <Button
              type="text"
              className={styles["favorite-button"]}
              onClick={handleFavorite}
            >
              {isFavorite ? (
                <HeartFilled
                  className={isAnimating ? styles.favoriteIconAnimate : ""}
                  style={{ color: "#ff424e", border: "none" }}
                  onAnimationEnd={() => setIsAnimating(false)}
                />
              ) : (
                <HeartOutlined />
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductCard;
