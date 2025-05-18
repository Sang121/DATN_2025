import React from "react";
import styles from "./FilterPrice.module.css";

function FilterPrice() {
  return (
    <div className={styles.filterPriceContainer}>
      <h2 className={styles.filterPriceTitle}>Lọc theo giá</h2>
      <div className={styles.filterPriceRange}>
        <input
          type="number"
          className={styles.filterPriceInput}
          placeholder="Từ"
          min={0}
        />
        <span className={styles.filterPriceDash}>-</span>
        <input
          type="number"
          className={styles.filterPriceInput}
          placeholder="Đến"
          min={0}
        />
      </div>
      <button className={styles.filterPriceBtn}>Áp dụng</button>
    </div>
  );
}

export default FilterPrice;
