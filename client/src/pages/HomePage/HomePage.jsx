import React from "react";
import Sidebar from "../../components/SideBar/SideBar";
import BelowHeader from "../../components/BelowHeader/BelowHeader";
import styles from "./HomePage.module.css";
import Carousel from "../../components/Carousel/Carousel";
import ImgAds from "../../components/ListCategory/ListCategory";
import { BackTop, Col } from "antd";
import { ArrowUpOutlined } from "@ant-design/icons";
import ProductSlider from "../../components/ProductSlider/ProductSlider";
import SliderProduct from "../../components/SliderProduct/TopSeller";
import bottomBanner from "../../assets/img/banner/BottomBanner.png";
import TopSeller from "../../components/SliderProduct/TopSeller";
import ListCategory from "../../components/ListCategory/ListCategory";
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
              <div className={styles["home-page-list"]}>
                <TopSeller
                  title="Top sản phẩm bán chạy"
                  subtitle="Khám phá xu hướng thời trang mới nhất"
                  autoPlayInterval={4000}
                  showArrows={true}
                  cardProps={{
                    showFavorite: true,
                    showSold: true,
                    variant: "slider",
                  }}
                />
              </div>
              <div className={styles["home-page-list"]}>
                <ListCategory />
              </div>

              <div className={styles["home-page-list"]}>
                <ProductSlider
                  query={"Nam"}
                  title="Thời trang nam"
                  subtitle="Khám phá xu hướng thời trang nam mới nhất"
                  autoPlayInterval={4000}
                  showArrows={true}
                  cardProps={{
                    showFavorite: true,
                    showSold: true,
                    variant: "slider",
                  }}
                />
              </div>
              {/* <ImgAds img="https://1557691689.e.cdneverest.net/fast/2826x0/filters:format(webp)/static.5sfashion.vn/storage/home/collect/iW0O0Erw6eTGQwt2ASd9OUyyvz9GRMY6.png" /> */}
              <div className={styles["home-page-list"]}>
                <ProductSlider
                  query={"Nữ"}
                  title="Thời trang nữ"
                  subtitle="Khám phá xu hướng thời trang nữ mới nhất"
                  autoPlayInterval={4000}
                  showArrows={true}
                  cardProps={{
                    showFavorite: true,
                    showSold: true,
                    variant: "slider",
                  }}
                />
              </div>

              <img className={styles.Banner} src={bottomBanner} alt="Banner" />

              <div className={styles["home-page-list"]}>
                <ProductSlider
                  query={"Phụ kiện"}
                  title="Phụ kiện thời trang"
                  subtitle="Hoàn thiện phong cách với phụ kiện độc đáo"
                  autoPlay={true}
                  autoPlayInterval={5000}
                  showArrows={true}
                  showDots={true}
                  cardProps={{
                    showFavorite: true,
                    showSold: true,
                    variant: "slider",
                  }}
                />
              </div>

              <div className={styles["home-page-list"]}>
                <ProductSlider
                  query={"Giày Dép"}
                  title="Giày Dép"
                  subtitle="Hoàn thiện phong cách với giày dép độc đáo"
                  autoPlay={true}
                  autoPlayInterval={5000}
                  showArrows={true}
                  showDots={true}
                  cardProps={{
                    showFavorite: true,
                    showSold: true,
                    variant: "slider",
                  }}
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
