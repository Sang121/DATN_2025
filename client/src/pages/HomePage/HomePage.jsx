import React from "react";
import Sidebar from "../../components/SideBar/SideBar";
import BelowHeader from "../../components/BelowHeader/BelowHeader";
import styles from "./HomePage.module.css";
import Carousel from "../../components/Carousel/Carousel";
import ImgAds from "../../components/imgAds/ImgAds";
import ListProduct from "../../components/ListProducts/ListProduct";
import FilterPrice from "../../components/FilterPrice/FilterPrice";
function HomePage() {
  return (
    <div>
      <main>
        <div className={styles["home-page-container"]}>
          <div className={styles["home-page"]}>
            <div className={styles["home-page-sidebar"]}>
              <Sidebar />
              <FilterPrice />
            </div>
            <div className={styles["home-page-contain"]}>
              <div className="carousel-container">
                <Carousel />
              </div>
              <div className={styles["home-page-list"]}>
                <h2>Thời trang nam</h2>
                <ListProduct query={"Nam"} />
              </div>
              <ImgAds img="https://1557691689.e.cdneverest.net/fast/2826x0/filters:format(webp)/static.5sfashion.vn/storage/home/collect/iW0O0Erw6eTGQwt2ASd9OUyyvz9GRMY6.png" />
              <div className={styles["home-page-list"]}>
                <h2> Thời Trang Nữ</h2>
                <ListProduct query={"Nữ"} />
              </div>
              <ImgAds img="https://1557691689.e.cdneverest.net/fast/2826x0/filters:format(webp)/static.5sfashion.vn/storage/home/collect/iW0O0Erw6eTGQwt2ASd9OUyyvz9GRMY6.png" />
              <div className={styles["home-page-list"]}>
                <h2> Phụ Kiện </h2>
                <ListProduct query={"Phụ kiện"} />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default HomePage;
