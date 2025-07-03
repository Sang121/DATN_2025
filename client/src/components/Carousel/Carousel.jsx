import React, { useRef } from "react";
import { Carousel as AntCarousel, Button } from "antd";
import { LeftOutlined, RightOutlined } from "@ant-design/icons";
import { Link } from "react-router-dom";
import styles from "./Carousel.module.css";
import slide1 from "../../assets/img/carousel/1.webp";
import slide2 from "../../assets/img/carousel/2.webp";
import slide3 from "../../assets/img/carousel/3.webp";
import slide4 from "../../assets/img/carousel/4.webp";

function Carousel() {
  const carouselRef = useRef(null);

  // Slides data
  const slides = [
    {
      id: 1,
      images: {
        src: slide1,
        alt: "Thời trang nam",
        link: "/search/Nam",
      },
    },
    {
      id: 2,
      images: {
        src: slide2,
        alt: "Thời trang nữ",
        link: "/search/Nữ",
      },
    },
    {
      id: 3,
      images: {
        src: slide3,
        alt: "Quần",
        link: "/search/Quần",
      },
    },
    {
      id: 4,
      images: {
        src: slide4,
        alt: "Áo",
        link: "/search/Áo",
      },
    },
  ];

  // Navigation functions
  const goToPrev = () => {
    carouselRef.current?.prev();
  };

  const goToNext = () => {
    carouselRef.current?.next();
  };

  return (
    <div className={styles.carouselContainer}>
      <Button
        className={styles.prevButton}
        icon={<LeftOutlined />}
        onClick={goToPrev}
        shape="circle"
        size="large"
        type="primary"
      />

      <Button
        className={styles.nextButton}
        icon={<RightOutlined />}
        onClick={goToNext}
        shape="circle"
        size="large"
        type="primary"
      />

      <AntCarousel
        ref={carouselRef}
        autoplay
        effect="fade"
        dots={true}
        className={styles.carousel}
        autoplaySpeed={4000}
        speed={800}
      >
        {slides.map((slide) => (
          <div key={slide.id} className={styles.slider}>
            <Link to={slide.images.link} className={styles.imageLink}>
              <img
                className={styles.imageSlider}
                alt={slide.images.alt}
                src={slide.images.src}
              />
              <div className={styles.imageOverlay}>
                <span className={styles.imageText}>{slide.images.alt}</span>
              </div>
            </Link>
          </div>
        ))}
      </AntCarousel>
    </div>
  );
}

export default Carousel;
