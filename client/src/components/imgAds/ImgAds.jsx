import React from "react";
import { Card } from "antd";
import styles from "./ImgAds.module.css";

function ImgAds({ img, title, link }) {
  return (
    <Card
      className={styles.adCard}
      bordered={false}
      bodyStyle={{ padding: 0 }}
      onClick={link ? () => (window.location.href = link) : undefined}
    >
      <div className={styles.adImageContainer}>
        <img className={styles.adImage} src={img} alt={title || "Quảng cáo"} />
        {title && <div className={styles.adTitle}>{title}</div>}
      </div>
    </Card>
  );
}

export default ImgAds;
