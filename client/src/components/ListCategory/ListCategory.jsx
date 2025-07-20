import React, { useState, useEffect, useCallback, useMemo } from "react";
import { LeftOutlined, RightOutlined } from "@ant-design/icons";
import { Link } from "react-router-dom";
import styles from "./ListCategory.module.css";
import ttNam from "../../assets/img/category/thoi-trang-nam.jpg";
import ttNu from "../../assets/img/category/thoi-trang-nu.jpg";
import doTheThao from "../../assets/img/category/do-the-thao.jpg";
import vay from "../../assets/img/category/vay.jpg";
import aoKhoac from "../../assets/img/category/ao-khoac.jpg";
import doBoi from "../../assets/img/category/do-boi.jpg";
import giayDep from "../../assets/img/category/giay-dep.jpg";
import tuiXach from "../../assets/img/category/tui-xach.jpg";
import baLo from "../../assets/img/category/ba-lo.jpg";
const ListCategory = ({
  subtitle = "",
  showArrows = true,
  enableSwipe = true,
  enableKeyboard = true,
  className = "",
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [itemsToShow, setItemsToShow] = useState(5);

  const breakpoints = useMemo(
    () => ({
      320: 4, // Mobile
      576: 5, // Large mobile
      768: 5, // Tablet
      992: 6, // Desktop
      1200: 6, // Large desktop
    }),
    []
  );

  const categories = [
    {
      id: "1",
      name: "Thời Trang Nam",
      image: ttNam,
      slug: "Nam",
    },
    {
      id: "2",
      name: "Thời Trang Nữ",
      image: ttNu,
      slug: "Nữ",
    },
    {
      id: "3",
      name: "Đồ Thể Thao",
      image: doTheThao,
      slug: "Đồ Thể Thao",
    },
    {
      id: "4",
      name: "Váy",
      image: vay,
      slug: "Váy",
    },
    {
      id: "5",
      name: "Áo Khoác",
      image: aoKhoac,
      slug: "Áo Khoác",
    },
    {
      id: "6",
      name: "Đồ Bơi",
      image: doBoi,
      slug: "Đồ Bơi",
    },
    {
      id: "7",
      name: "Giày dép",
      image: giayDep,
      slug: "Giày dép",
    },
    {
      id: "8",
      name: "Túi xách",
      image: tuiXach,
      slug: "Túi xách",
    },
    {
      id: "9",
      name: "Ba Lô",
      image: baLo,
      slug: "Ba Lô",
    },
  ];

  const updateItemsToShow = useCallback(() => {
    const width = window.innerWidth;
    let newItemsToShow = 5;

    const sortedBreakpoints = Object.entries(breakpoints).sort(
      ([a], [b]) => parseInt(a) - parseInt(b)
    );

    for (const [breakpoint, items] of sortedBreakpoints) {
      if (width >= parseInt(breakpoint)) {
        newItemsToShow = items;
      } else {
        break;
      }
    }

    setItemsToShow(Math.min(newItemsToShow, categories.length));
  }, [breakpoints]);

  useEffect(() => {
    updateItemsToShow();
    const handleResize = () => updateItemsToShow();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [updateItemsToShow]);

  const maxIndex = Math.max(0, categories.length - itemsToShow);

  const goToSlide = useCallback(
    (index) => {
      if (isAnimating || categories.length === 0) return;
      const newIndex = Math.max(0, Math.min(index, maxIndex));

      if (newIndex === currentIndex) return;

      setIsAnimating(true);
      setCurrentIndex(newIndex);
      setTimeout(() => setIsAnimating(false), 300);
    },
    [isAnimating, maxIndex, currentIndex]
  );

  const nextSlide = useCallback(() => {
    goToSlide(currentIndex + 1);
  }, [currentIndex, goToSlide]);

  const prevSlide = useCallback(() => {
    goToSlide(currentIndex - 1);
  }, [currentIndex, goToSlide]);

  useEffect(() => {
    if (!enableKeyboard) return;
    const handleKeyDown = (e) => {
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        prevSlide();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        nextSlide();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [enableKeyboard, prevSlide, nextSlide]);

  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);

  const handleTouchStart = (e) => {
    if (!enableSwipe) return;
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e) => {
    if (!enableSwipe) return;
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!enableSwipe || touchStart === null || touchEnd === null) return;

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe) {
      nextSlide();
    } else if (isRightSwipe) {
      prevSlide();
    }
    setTouchStart(null);
    setTouchEnd(null);
  };

  const translateX = -(currentIndex * (100 / itemsToShow));

  return (
    <div className={`${styles.sliderContainer} ${className}`}>
      <div className={styles.sliderWrapper}>
        {showArrows && (
          <button
            className={`${styles.sliderArrow} ${styles.sliderArrowPrev}`}
            onClick={prevSlide}
            disabled={isAnimating || currentIndex === 0}
            aria-label="Previous categories"
          >
            <LeftOutlined />
          </button>
        )}

        <div
          className={styles.sliderTrack}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div
            className={`${styles.sliderContent} ${
              isAnimating ? styles.animating : ""
            }`}
            style={{
              transform: `translateX(${translateX}%)`,
              width: `${categories.length * (100 / itemsToShow)}%`,
            }}
          >
            {categories.map((category) => (
              <div
                key={category.id}
                className={styles.sliderItem}
                style={{
                  width: `${100 / itemsToShow}%`,
                }}
              >
                <Link
                  to={`/search/${category.slug}`}
                  className={styles.categoryCard}
                >
                  <div className={styles.categoryImageContainer}>
                    <img
                      src={category.image}
                      alt={category.name}
                      className={styles.categoryImage}
                      onError={(e) => {
                        e.target.src = "/images/placeholder-category.jpg";
                      }}
                    />
                  </div>
                  <div className={styles.categoryInfo}>
                    <h3 className={styles.categoryName}>{category.name}</h3>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </div>

        {showArrows && (
          <button
            className={`${styles.sliderArrow} ${styles.sliderArrowNext}`}
            onClick={nextSlide}
            disabled={isAnimating || currentIndex === maxIndex}
            aria-label="Next categories"
          >
            <RightOutlined />
          </button>
        )}
      </div>
    </div>
  );
};

export default ListCategory;
