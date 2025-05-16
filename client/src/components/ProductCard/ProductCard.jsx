import React from "react";
import "./ProductCard.css";

function ProductCard({
  image,
  name,
  price,
  oldPrice,
  rating,
  discount,
  badge,
  labels = [],
  extra,
}) {
  return (
    <div className="product-card">
      {badge && <div className="product-card-badge">{badge}</div>}
      <div className="product-card-img-wrap">
        <img className="product-card-img" src={image} alt={name} />
      </div>
      <div className="product-card-body">
        <div className="product-card-labels">
          {labels.map((label, idx) => (
            <span key={idx} className={`product-card-label ${label.type}`}>
              {label.text}
            </span>
          ))}
        </div>
        <div className="product-card-name">{name}</div>
        <div className="product-card-rating">
          {Array.from({ length: 5 }).map((_, i) => (
            <span key={i} className={i < rating ? "star filled" : "star"}>
              ★
            </span>
          ))}
        </div>
        <div className="product-card-price">
          {discount && (
            <span className="product-card-discount">-{discount}%</span>
          )}
          <span className="product-card-price-current">{price}₫</span>
          {oldPrice && (
            <span className="product-card-price-old">{oldPrice}₫</span>
          )}
        </div>
        {extra && <div className="product-card-extra">{extra}</div>}
        <button className="product-card-btn">Thêm vào giỏ</button>
      </div>
    </div>
  );
}

export default ProductCard;
