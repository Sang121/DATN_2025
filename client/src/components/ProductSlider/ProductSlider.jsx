// ProductSlider.jsx
import React, { useState, useEffect, useRef, useCallback } from "react"; // Added useCallback
import { LeftOutlined, RightOutlined } from "@ant-design/icons";
import ProductCardV2 from "../productCardV2/ProductCardV2";
import styles from "./ProductSlider.module.css";
import { searchProduct } from "../../services/productService";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";

// Moved outside to prevent re-creation on every render if not dependent on props
const getResponsiveSlidesToShow = (slidesToShowBase = 5) => {
  // Added slidesToShowBase
  if (window.innerWidth <= 480) return 2; // Mobile small - 2 products
  if (window.innerWidth <= 576) return 2; // Mobile - 2 products
  if (window.innerWidth <= 768) return 3; // Tablet small - 3 products
  if (window.innerWidth <= 992) return 3; // Tablet - 3 products
  if (window.innerWidth <= 1200) return 4; // Desktop small - 4 products
  if (window.innerWidth <= 1400) return 5; // Desktop medium - 5 products
  return slidesToShowBase; // Desktop large - 6 products
};

const ProductSlider = ({ query, title, slidesToShow = 6 }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startPos, setStartPos] = useState(0);
  const [currentTranslate, setCurrentTranslate] = useState(0);
  const sliderRef = useRef(null);

  const [responsiveSlidesToShow, setResponsiveSlidesToShow] = useState(
    getResponsiveSlidesToShow(slidesToShow) // Pass slidesToShow to initialize
  );

  const {
    data: apiResponse,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["search", query],
    queryFn: () => searchProduct(query),
  });

  // Safely extract products array from API response
  const products = React.useMemo(() => {
    if (!apiResponse) return [];

    // Handle different API response structures
    if (Array.isArray(apiResponse)) {
      return apiResponse;
    }

    if (apiResponse.data && Array.isArray(apiResponse.data)) {
      return apiResponse.data;
    }

    if (apiResponse.products && Array.isArray(apiResponse.products)) {
      return apiResponse.products;
    }

    console.warn("Unexpected API response structure:", apiResponse);
    return [];
  }, [apiResponse]);

  useEffect(() => {
    const handleResize = () => {
      setResponsiveSlidesToShow(getResponsiveSlidesToShow(slidesToShow)); // Pass slidesToShow
      setCurrentIndex(0); // Reset to first slide on resize
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [slidesToShow]); // Add slidesToShow to dependencies

  const maxIndex = Math.max(0, products.length - responsiveSlidesToShow);

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => {
      const newIndex = Math.min(prevIndex + 1, maxIndex);
      return newIndex;
    });
  };

  const prevSlide = () => {
    setCurrentIndex((prevIndex) => {
      const newIndex = Math.max(prevIndex - 1, 0);
      return newIndex;
    });
  };

  // Touch/Mouse events for drag functionality
  const getPositionX = useCallback((event) => {
    return event.type.includes("mouse")
      ? event.pageX
      : event.touches[0].clientX;
  }, []);

  const setSliderPosition = useCallback(() => {
    if (sliderRef.current && products.length > 0) {
      // Get the actual computed width of slide items
      const slideItem = sliderRef.current.firstElementChild;
      if (!slideItem) return;

      const computedStyle = getComputedStyle(sliderRef.current);
      const gap = parseFloat(computedStyle.gap) || 0;

      // Get the actual width of one slide item (includes responsive CSS width)
      const slideWidth = slideItem.offsetWidth;

      // Calculate translation based on current index
      const translateX = -currentIndex * (slideWidth + gap);

      sliderRef.current.style.transform = `translateX(${translateX}px)`;
    }
  }, [currentIndex, products.length]);

  const handleStart = useCallback(
    (event) => {
      setIsDragging(true);
      setStartPos(getPositionX(event));
      if (sliderRef.current) {
        sliderRef.current.style.transition = "none"; // Disable transition during drag
      }
    },
    [getPositionX]
  );

  const handleMove = useCallback(
    (event) => {
      if (isDragging) {
        const currentPosition = getPositionX(event);
        const movedBy = currentPosition - startPos;
        // Temporarily apply the drag movement
        if (sliderRef.current) {
          const currentTransform = new WebKitCSSMatrix(
            getComputedStyle(sliderRef.current).transform
          ).m41;
          sliderRef.current.style.transform = `translateX(${
            currentTransform + movedBy - currentTranslate
          }px)`;
          setCurrentTranslate(movedBy); // Update currentTranslate to reflect the total movement for this drag
        }
      }
    },
    [isDragging, startPos, getPositionX, currentTranslate]
  ); // Added currentTranslate to dependencies

  const handleEnd = useCallback(() => {
    setIsDragging(false);

    const movedBy = currentTranslate;
    const threshold = 50; // Minimum distance to trigger slide change

    if (movedBy < -threshold && currentIndex < maxIndex) {
      setCurrentIndex((prev) => prev + 1);
    } else if (movedBy > threshold && currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }

    setCurrentTranslate(0); // Reset for next drag

    if (sliderRef.current) {
      sliderRef.current.style.transition = "transform 0.3s ease-in-out"; // Re-enable transition
      setSliderPosition(); // Snap to the correct position
    }
  }, [currentTranslate, currentIndex, maxIndex, setSliderPosition]);

  useEffect(() => {
    setSliderPosition();
  }, [setSliderPosition, currentIndex, responsiveSlidesToShow, products]); // Re-run when products or other dependencies change

  // Loading state
  if (isLoading) {
    return (
      <div className={styles.sliderContainer}>
        {title && <h2 className={styles.sliderTitle}>{title}</h2>}
        <div className={styles.loading}>Đang tải sản phẩm...</div>
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className={styles.sliderContainer}>
        {title && <h2 className={styles.sliderTitle}>{title}</h2>}
        <div className={styles.error}>
          Lỗi: {error?.message || "Không thể tải sản phẩm"}
        </div>
      </div>
    );
  }

  // No products state
  if (!products || !Array.isArray(products) || products.length === 0) {
    return (
      <div className={styles.sliderContainer}>
        {title && <h2 className={styles.sliderTitle}>{title}</h2>}
        <div className={styles.noProducts}>Không có sản phẩm nào</div>
      </div>
    );
  }

  return (
    <div className={styles.sliderContainer}>
      <div className={styles.title}>
        {title && <h2 className={styles.sliderTitle}>{title}</h2>}
        <Link to={`/search/${query}`} className={styles.seeMore}>
          Xem thêm...
        </Link>{" "}
      </div>

      <div className={styles.sliderWrapper}>
        {/* Previous button */}
        <button
          className={`${styles.sliderButton} ${styles.prevButton}`}
          onClick={prevSlide}
          disabled={currentIndex === 0}
          aria-label="Previous products"
        >
          <LeftOutlined />
        </button>

        {/* Slider content */}
        <div className={styles.sliderContent}>
          <div
            ref={sliderRef}
            className={styles.sliderTrack}
            onMouseDown={handleStart}
            onMouseMove={handleMove}
            onMouseUp={handleEnd}
            onMouseLeave={handleEnd}
            onTouchStart={handleStart}
            onTouchMove={handleMove}
            onTouchEnd={handleEnd}
          >
            {products.map((product) => (
              <div key={product._id} className={styles.slideItem}>
                <ProductCardV2
                  productId={product._id}
                  image={product.images?.[0] || "/placeholder-image.jpg"}
                  name={product.name}
                  totalStock={product.totalStock}
                  price={product.price}
                  sold={product.sold}
                  discount={product.discount || 0}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Next button */}
        <button
          className={`${styles.sliderButton} ${styles.nextButton}`}
          onClick={nextSlide}
          disabled={currentIndex >= maxIndex}
          aria-label="Next products"
        >
          <RightOutlined />
        </button>
      </div>
    </div>
  );
};

export default ProductSlider;
