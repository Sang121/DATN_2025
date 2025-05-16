import React from "react";
import styles from "./BelowHeader.module.css";
import {
  FaCheckCircle,
  FaTruck,
  FaSyncAlt,
  FaBox,
  FaTag,
} from "react-icons/fa";

export default function BelowHeader() {
  return (
    <div className={styles["below-header-container"]}>
      <div className={styles["below-header-title"]}>Cam kết</div>
      <div className={styles["below-header-list"]}>
        <div className={styles["below-header-item"]}>
          <span className={styles["below-header-icon"]}>
            <FaCheckCircle />
          </span>
          <span>100% hàng thật</span>
        </div>
        <div className={styles["below-header-divider"]}></div>
        <div className={styles["below-header-item"]}>
          <span className={styles["below-header-icon"]}>
            <FaTruck />
          </span>
          <span>Freeship mọi đơn</span>
        </div>
        <div className={styles["below-header-divider"]}></div>
        <div className={styles["below-header-item"]}>
          <span className={styles["below-header-icon"]}>
            <FaSyncAlt />
          </span>
          <span>Hoàn 200% nếu hàng giả</span>
        </div>
        <div className={styles["below-header-divider"]}></div>
        <div className={styles["below-header-item"]}>
          <span className={styles["below-header-icon"]}>
            <FaBox />
          </span>
          <span>30 ngày đổi trả</span>
        </div>
        <div className={styles["below-header-divider"]}></div>
        <div className={styles["below-header-item"]}>
          <span className={styles["below-header-icon"]}>
            <FaTag />
          </span>
          <span>Giá siêu rẻ</span>
        </div>
      </div>
    </div>
  );
}
