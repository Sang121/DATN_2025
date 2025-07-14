import React from "react";
import Sidebar from "../../components/SideBar/SideBar";
import BelowHeader from "../../components/BelowHeader/BelowHeader";
import styles from "./HomePage.module.css";
import Carousel from "../../components/Carousel/Carousel";
import ImgAds from "../../components/imgAds/ImgAds";
import ListProduct from "../../components/ListProducts/ListProduct";
import FilterPrice from "../../components/FilterPrice/FilterPrice";
import { BackTop, Col } from "antd";
import { ArrowUpOutlined } from "@ant-design/icons";
import Promo from "../../components/promo/Promo";
import ProductSlider from "../../components/ProductSlider/ProductSlider";
function HomePage() {
  return (
    <div>
      <main>
        <div className={styles["home-page-container"]}>
          <div className="carousel-container">
            <Carousel />
          </div>
          <div className={styles["home-page"]}>
            <Col
              xs={24}
              sm={24}
              md={24}
              lg={24}
              className={styles["home-page-contain"]}
            >
              <Promo />
              <div className={styles["home-page-list"]}>
                <ProductSlider
                  query={"Quần"}
                  title={"Hàng mới về"}
                  slidesToShow={5}
                />
                <ProductSlider
                  query={"Nam"}
                  title={"Thời trang nam"}
                  slidesToShow={5}
                />
              </div>
              <ImgAds img="https://1557691689.e.cdneverest.net/fast/2826x0/filters:format(webp)/static.5sfashion.vn/storage/home/collect/iW0O0Erw6eTGQwt2ASd9OUyyvz9GRMY6.png" />
              <div className={styles["home-page-list"]}>
                <ProductSlider
                  query={"Nữ"}
                  title={"Thời trang nữ"}
                  slidesToShow={5}
                />
              </div>
              <ImgAds img="https://1557691689.e.cdneverest.net/fast/2826x0/filters:format(webp)/static.5sfashion.vn/storage/home/collect/iW0O0Erw6eTGQwt2ASd9OUyyvz9GRMY6.png" />
              <div className={styles["home-page-list"]}>
                <ProductSlider
                  query={"Áo"}
                  title={"Áo"}
                  slidesToShow={5}
                />
              </div>
            </Col>
          </div>
        </div>
      </main>

      {/* Nút cuộn lên đầu trang */}
      <BackTop>
        <div className={styles.backTopButton}>
          <ArrowUpOutlined />
        </div>
      </BackTop>
    </div>
  );
}

export default HomePage;
