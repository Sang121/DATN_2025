import React from "react";
import Sidebar from "../../components/SideBar/SideBar";
import FilterPrice from "../../components/FilterPrice/FilterPrice";
import styles from "./TypeProductPage.module.css";
import ListProduct from "../../components/ListProducts/ListProduct";
import { useParams } from "react-router-dom";

function TypeProductPage() {
  const { category } = useParams();

  return (
    <div className={styles["type-product-page-container"]}>
      <div className={styles["type-product-page"]}>
        <div className={styles.SideBar}>
          <Sidebar />
          <FilterPrice />
        </div>
        <div className={styles["type-product-page-content"]}>
          <div className={styles["type-product-page-list"]}>
            <div className={styles["product-detail-breadcrumb"]}>
              <h1>
                <a href="/">Trang chủ</a> / {category}
              </h1>
            </div>

            <ListProduct category={category} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default TypeProductPage;
