import React from "react";
import { Carousel as AntCarousel } from "antd";
import { Link } from "react-router-dom";
import styles from "./Carousel.module.css";

function Carousel() {
  // Slides data
  const slides = [
    {
      id: 1,
      images: [
        {
          src: "https://salt.tikicdn.com/cache/w750/ts/tikimsp/1f/7f/6e/78d8c9976eb8b7b3b6133671573d1a56.png",
          alt: "Thời trang nam",
          link: "/search/Nam",
        },
        {
          src: "https://salt.tikicdn.com/cache/w750/ts/tikimsp/27/a0/e9/bbe8b3f5cdb8837e352eb891da0a9794.jpg",
          alt: "Thời trang nữ",
          link: "/search/Nữ",
        },
      ],
    },
    {
      id: 2,
      images: [
        {
          src: "https://salt.tikicdn.com/cache/w750/ts/tikimsp/27/a0/e9/bbe8b3f5cdb8837e352eb891da0a9794.jpg",
          alt: "Phụ kiện thời trang",
          link: "/search/Phụ%20kiện",
        },
        {
          src: "https://salt.tikicdn.com/cache/w750/ts/tikimsp/1f/7f/6e/78d8c9976eb8b7b3b6133671573d1a56.png",
          alt: "Giày dép",
          link: "/search/Giày",
        },
      ],
    },
    {
      id: 3,
      images: [
        {
          src: "https://salt.tikicdn.com/cache/w750/ts/tikimsp/1f/7f/6e/78d8c9976eb8b7b3b6133671573d1a56.png",
          alt: "Đồng hồ",
          link: "/search/Đồng%20Hồ",
        },
        {
          src: "https://salt.tikicdn.com/cache/w750/ts/tikimsp/27/a0/e9/bbe8b3f5cdb8837e352eb891da0a9794.jpg",
          alt: "Túi xách",
          link: "/search/Túi%20Xách",
        },
      ],
    },
  ];

  return (
    <div className={styles.carouselContainer}>
      <AntCarousel
        autoplay
        effect="fade"
        dots={true}
        className={styles.carousel}
      >
        {slides.map((slide) => (
          <div key={slide.id}>
            <div className={styles.slider}>
              {slide.images.map((image, idx) => (
                <Link to={image.link} key={idx} className={styles.imageLink}>
                  <img
                    className={styles.imageSlider}
                    alt={image.alt}
                    src={image.src}
                  />
                  <div className={styles.imageOverlay}>
                    <span className={styles.imageText}>{image.alt}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </AntCarousel>
    </div>
  );
}

export default Carousel;
