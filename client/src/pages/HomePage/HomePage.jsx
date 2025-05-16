import React from "react";
import TypeProducts from "../../components/typeProducts/typeProducts";
import BelowHeader from "../../components/BelowHeader/BelowHeader";
import styles from "./HomePage.module.css";
import Carousel from "../../components/Carousel/Carousel";
import ListProduct from "../../components/ListProducts/ListProduct";
function HomePage() {
  return (
    <div>
      <BelowHeader />
      <main>
        <div className={styles["home-page-container"]}>
          <div className={styles["home-page"]}>
            <TypeProducts />
            <div className={styles["home-page-contain"]}>
              <div className="carousel-container">
                <Carousel />
              </div>
              <div className={styles["home-page-title"]}>
                <h2>Thời trang nam</h2>
                <ListProduct />
              </div>
              <div className={styles["home-page-list"]}>
                <h2> Thời Trang Nữ</h2>
                <ListProduct />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default HomePage;
