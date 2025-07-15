import React from "react";
import styles from "./BelowHeader.module.css";
import { Row, Col } from "antd";
import { useNavigate } from "react-router-dom";

export default function BelowHeader() {
  const navigate = useNavigate();

  // Danh sách các danh mục sản phẩm
  const categories = [
    "Hàng Mới",
    "Bán Chạy",
    "Quần",
    "Áo",
    "Giày",
    "Dép",
    "Túi xách",
    "Phụ kiện",
    "Đồng hồ",
    "Kính",
    "Trang sức",
  ];

  const handleCategoryClick = (category) => {
    navigate(`/search/${category}`);
  };

  return (
    <div className={styles["below-header-container"]}>
      <Row className={styles["below-header-row"]} align="middle">
        <Col xs={24} md={24}>
          <div className={styles["below-header-list"]}>
            {categories.map((category, index) => (
              <div
                key={index}
                className={styles["below-header-item"]}
                onClick={() => handleCategoryClick(category)}
              >
                {category}
              </div>
            ))}
          </div>
        </Col>
      </Row>
    </div>
  );
}
