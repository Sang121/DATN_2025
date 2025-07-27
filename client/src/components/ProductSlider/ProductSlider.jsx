import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  LeftOutlined,
  RightOutlined,
  LoadingOutlined,
} from "@ant-design/icons";
import { Alert, Spin } from "antd";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import ProductCardV2 from "../ProductCardV2/ProductCardV2";
import { searchProduct } from "../../services/productService";
import styles from "./ProductSlider.module.css";

const ProductSlider = ({
  query = null,
  title = "",
  subtitle = "",
  showArrows = true,
  enableSwipe = true,
  enableKeyboard = true,
  className = "",
  cardProps = {},
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [itemsToShow, setItemsToShow] = useState(5);

  const breakpoints = useMemo(
    () => ({
      320: 2, // Mobile
      576: 3, // Large mobile
      768: 4, // Tablet
      992: 5, // Desktop
      1200: 6, // Large desktop
    }),
    []
  );

  const {
    data: fetchedRawProducts,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["search", query],
    queryFn: () => searchProduct(query),
    enabled: !!query,
  });

  // Determine the final list of products to display, ensure consistency
  const listProducts = useMemo(() => {
    if (fetchedRawProducts?.data?.length > 0) {
      return fetchedRawProducts.data.map((product) => ({
        id: product._id,
        _id: product._id,
        name: product.name,
        image: product.images?.[0] || product.thumbnail,
        price: product.price,
        sold: product.sold,
        totalStock: product.totalStock,
        discount: product.discount,
        variants: product.variants || [],
      }));
    }
    return [];
  }, [fetchedRawProducts, query]);

  const updateItemsToShow = useCallback(() => {
    const width = window.innerWidth;
    let newItemsToShow = 5; // Bắt đầu với giá trị mặc định

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

    if (listProducts.length > newItemsToShow) {
      setItemsToShow(Math.min(newItemsToShow, listProducts.length));
    } else {
      setItemsToShow(newItemsToShow);
    }
  }, [breakpoints, listProducts.length]);

  useEffect(() => {
    updateItemsToShow();
    const handleResize = () => updateItemsToShow();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [updateItemsToShow]);

  const maxIndex = Math.max(0, listProducts.length - itemsToShow);

  const goToSlide = useCallback(
    (index) => {
      if (isAnimating || listProducts.length === 0) return;
      const newIndex = Math.max(0, Math.min(index, maxIndex));

      if (newIndex === currentIndex) return;

      setIsAnimating(true);
      setCurrentIndex(newIndex);
      setTimeout(() => setIsAnimating(false), 300);
    },
    [isAnimating, maxIndex, currentIndex, listProducts.length]
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

  const translateX =
    listProducts.length > 0 ? -(currentIndex * (100 / listProducts.length)) : 0;

  if (query && isLoading) {
    return (
      <div className={`${styles.sliderContainer} ${className}`}>
        {title && (
          <div className={styles.sliderHeader}>
            <h2 className={styles.sliderTitle}>{title}</h2>
            {subtitle && <p className={styles.sliderSubtitle}>{subtitle}</p>}
          </div>
        )}
        <div className={styles.loading}>
          <Spin
            indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />}
            tip="Đang tải sản phẩm..."
          />
        </div>
      </div>
    );
  }

  if (query && isError) {
    return (
      <div className={`${styles.sliderContainer} ${className}`}>
        {title && (
          <div className={styles.sliderHeader}>
            <h2 className={styles.sliderTitle}>{title}</h2>
            {subtitle && <p className={styles.sliderSubtitle}>{subtitle}</p>}
          </div>
        )}
        <Alert
          message="Lỗi tải sản phẩm"
          description={
            error?.message ||
            "Không thể tải danh sách sản phẩm. Vui lòng thử lại sau."
          }
          type="error"
          showIcon
        />
      </div>
    );
  }

  if (listProducts.length === 0) {
    return (
      <div className={`${styles.sliderContainer} ${className}`}>
        {title && (
          <div className={styles.sliderHeader}>
            <h2 className={styles.sliderTitle}>{title}</h2>
            {subtitle && <p className={styles.sliderSubtitle}>{subtitle}</p>}
          </div>
        )}
        <div className={styles.emptyState}>
          <p>Không có sản phẩm nào để hiển thị</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`${styles.sliderContainer} ${className}`}>
      <div className={styles.sliderHeaderContainer}>
        {(title || subtitle) && (
          <div className={styles.sliderHeader}>
            {title && <h2 className={styles.sliderTitle}>{title}</h2>}
            {subtitle && <p className={styles.sliderSubtitle}>{subtitle}</p>}
          </div>
        )}
        <div className={styles.viewMoreContainer}>
          <Link to={`/search/${query}`} className={styles.viewMoreLink}>
            Xem thêm <RightOutlined />
          </Link>
        </div>
      </div>

      <div className={styles.sliderWrapper}>
        {/* Previous Arrow */}
        {showArrows && (
          <button
            className={`${styles.sliderArrow} ${styles.sliderArrowPrev}`}
            onClick={prevSlide}
            disabled={isAnimating || currentIndex === 0}
            aria-label="Previous products"
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
              // Chiều rộng của content phải đủ để chứa tất cả sản phẩm,
              // với mỗi sản phẩm chiếm 1/itemsToShow của khung nhìn.
              width: `${(100 / itemsToShow) * listProducts.length}%`,
            }}
          >
            {listProducts.map((product, index) => (
              <div
                key={product.id || product._id || index}
                className={styles.sliderItem}
                style={{
                  // Chiều rộng của mỗi item phải là một phần của tổng số item
                  // bên trong sliderContent.
                  width: `${100 / listProducts.length}%`,
                }}
              >
                <ProductCardV2
                  productId={product.id || product._id}
                  image={product.image}
                  name={product.name}
                  totalStock={product.totalStock || product.stock}
                  price={product.price}
                  sold={product.sold}
                  discount={product.discount}
                  variants={product.variants || []}
                  {...cardProps}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Next Arrow */}
        {showArrows && (
          <button
            className={`${styles.sliderArrow} ${styles.sliderArrowNext}`}
            onClick={nextSlide}
            disabled={isAnimating || currentIndex === maxIndex}
            aria-label="Next products"
          >
            <RightOutlined />
          </button>
        )}
      </div>
    </div>
  );
};

export default ProductSlider;
