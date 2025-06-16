import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import styles from "./ProductDetail.module.css";
import { Alert, Button, Spin, Rate, Tag } from "antd";
import ListProducts from "../../components/ListProducts/ListProduct";
import { useQuery } from "@tanstack/react-query";
import { getDetailProduct } from "../../services/productService";

function ProductDetail() {
  const { id } = useParams();
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState("");

  // Thêm state để lưu trữ các màu và size có sẵn
  const [availableColors, setAvailableColors] = useState([]);
  const [availableSizes, setAvailableSizes] = useState([]);

  const {
    data: product,
    isLoading,
    isError,
    isSuccess,
    error,
  } = useQuery({
    queryKey: ["productDetail", id],
    queryFn: () => getDetailProduct(id),
    enabled: !!id,
  });

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [id]);
  useEffect(() => {
    if (isSuccess && product) {
      // Chỉ chạy khi product đã tải thành công
      setSelectedImage(
        product.images && product.images.length > 0
          ? product.images[0]
          : product.thumbnail || "a"
      );
    }
  }, [isSuccess, product]);

  // Hàm lấy các màu có sẵn cho size được chọn
  const getColorsForSize = (size) => {
    if (!product?.variants) return [];
    return [
      ...new Set(
        product.variants.filter((v) => v.size === size).map((v) => v.color)
      ),
    ];
  };

  // Hàm lấy các size có sẵn cho màu được chọn
  const getSizesForColor = (color) => {
    if (!product?.variants) return [];
    return [
      ...new Set(
        product.variants.filter((v) => v.color === color).map((v) => v.size)
      ),
    ];
  };

  // Hàm lấy số lượng tồn kho cho size và màu được chọn
  const getStockForVariant = (size, color) => {
    if (!product?.variants) return 0;
    const variant = product.variants.find(
      (v) => v.size === size && v.color === color
    );
    return variant?.stock || 0;
  };

  // Xử lý khi chọn size
  const handleSizeSelect = (size) => {
    setSelectedSize(size);
    const availableColorsForSize = getColorsForSize(size);
    setAvailableColors(availableColorsForSize);

    // Nếu màu đã chọn không có trong size mới, reset màu
    if (selectedColor && !availableColorsForSize.includes(selectedColor)) {
      setSelectedColor("");
    }
  };

  // Xử lý khi chọn màu
  const handleColorSelect = (color) => {
    setSelectedColor(color);
    const availableSizesForColor = getSizesForColor(color);
    setAvailableSizes(availableSizesForColor);

    // Nếu size đã chọn không có trong màu mới, reset size
    if (selectedSize && !availableSizesForColor.includes(selectedSize)) {
      setSelectedSize("");
    }
  };

  // Khởi tạo danh sách sizes và colors khi product load xong
  useEffect(() => {
    if (product?.variants) {
      const allSizes = [...new Set(product.variants.map((v) => v.size))];
      const allColors = [...new Set(product.variants.map((v) => v.color))];
      setAvailableSizes(allSizes);
      setAvailableColors(allColors);
    }
  }, [product]);

  if (isLoading) {
    return (
      <div
        className={styles.statusContainer}
        style={{ display: "flex", textalign: "center" }}
      >
        <Spin size="large" />
        <p>Loading product details...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className={styles.statusContainer}>
        <Alert
          message="Error"
          description={
            error?.message ||
            "Failed to load product details. Please try again later."
          }
          type="error"
          showIcon
        />
      </div>
    );
  }

  // Nếu không loading, không lỗi và product là null (không tìm thấy sản phẩm)
  if (!product) {
    return (
      <div className={styles.statusContainer}>
        <p>Product not found.</p>
      </div>
    );
  }

  return (
    <div className={styles["product-detail-body"]}>
      <div className={styles["product-detail-container"]}>
        <div className={styles["product-detail-breadcrumb"]}>
          <h1>
            <a href="/">Trang chủ</a> /{" "}
            <a href={`/search/${product.category}`}>{product.category}</a> /{" "}
            {product.name}
          </h1>
        </div>
        <div className={styles["productMain"]}>
          <div className={styles["productImage"]}>
            <div className={styles["productImageThumb"]}>
              {/* Kiểm tra product.images trước khi map */}
              {product.images?.slice(0, 7).map((img, idx) => (
                <img
                  key={idx}
                  src={img}
                  alt={product.name}
                  style={{
                    border: selectedImage === img ? "2px solid #1a94ff" : "",
                    opacity: selectedImage === img ? 1 : 0.7,
                    cursor: "pointer",
                  }}
                  onClick={() => setSelectedImage(img)}
                />
              ))}
            </div>
            <div className={styles["productImageMain"]}>
              <img src={selectedImage} alt={product.name} />
            </div>
          </div>
          <div style={{ flex: 1, paddingLeft: 32 }}>
            <h2>{product.name}</h2>
            <div>
              <strong>Giá:</strong> {product.price?.toLocaleString("vi-VN")}đ
              {product.oldPrice && (
                <span className={styles.oldPrice}>
                  {product.oldPrice?.toLocaleString("vi-VN")}đ
                </span>
              )}
              {product.discount > 0 && (
                <Tag color="red" className={styles.discountTag}>
                  -{product.discount}%
                </Tag>
              )}
            </div>
           

            <div className={styles.productInfo}>
              {/* Thêm đánh giá sản phẩm */}
              <div className={styles.productRating}>
                <Rate disabled defaultValue={4} />
                <span>(120 đánh giá)</span>
              </div>


              {/* Cải thiện hiển thị variants */}
              <div className={styles.variantSection}>
                <div className={styles.sizeSection}>
                  <div className={styles.sizeHeader}>
                    <span>Chọn size:</span>
                    <Button type="link">Hướng dẫn chọn size</Button>
                  </div>
                  <div className={styles.sizeList}>
                    {/* Hiển thị tất cả sizes, disable những size không có sẵn cho màu đã chọn */}
                    {[...new Set(product.variants.map((v) => v.size))].map(
                      (size) => {
                        const isAvailable =
                          !selectedColor || availableSizes.includes(size);
                        return (
                          <Button
                            key={size}
                            className={`${styles.sizeBtn} ${
                              selectedSize === size ? styles.selected : ""
                            } ${!isAvailable ? styles.disabled : ""}`}
                            onClick={() => handleSizeSelect(size)}
                            disabled={!isAvailable}
                          >
                            {size}
                          </Button>
                        );
                      }
                    )}
                  </div>
                </div>
                <div className={styles.colorSection}>
                  <div className={styles.colorHeader}>
                    <span>Chọn màu:</span>
                  </div>
                  <div className={styles.sizeList}>
                    {/* Hiển thị tất cả colors, disable những màu không có sẵn cho size đã chọn */}
                    {[...new Set(product.variants.map((v) => v.color))].map(
                      (color) => {
                        const isAvailable =
                          !selectedSize || availableColors.includes(color);
                        return (
                          <Button
                            key={color}
                            className={`${styles.sizeBtn} ${
                              selectedColor === color ? styles.selected : ""
                            } ${!isAvailable ? styles.disabled : ""}`}
                            onClick={() => handleColorSelect(color)}
                            disabled={!isAvailable}
                          >
                            {color}
                          </Button>
                        );
                      }
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Hiển thị số lượng tồn kho */}
            <div className={styles.stockInfo}>
              <strong>Số lượng tồn kho: </strong>
              {selectedSize && selectedColor
                ? getStockForVariant(selectedSize, selectedColor)
                : "Vui lòng chọn size và màu"}
            </div>

            {/* Điều chỉnh số lượng */}
            <div className={styles.quantityBlock}>
              <strong>Số lượng:</strong>
              <div className={styles.quantityControl}>
                <Button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  disabled={quantity <= 1}
                  className={styles.quantityBtn}
                >
                  -
                </Button>
                <span className={styles.quantityValue}>{quantity}</span>
                <Button
                  onClick={() =>
                    setQuantity((q) =>
                      Math.min(
                        q + 1,
                        getStockForVariant(selectedSize, selectedColor)
                      )
                    )
                  }
                  disabled={
                    !selectedSize ||
                    !selectedColor ||
                    quantity >= getStockForVariant(selectedSize, selectedColor)
                  }
                  className={styles.quantityBtn}
                >
                  +
                </Button>
              </div>
            </div>

            {/* Nút thêm vào giỏ hàng */}
            <div style={{ marginTop: 24 }}>
              <Button
                type="primary"
                size="large"
                disabled={!selectedSize || !selectedColor}
                onClick={() => {}}
              >
                Thêm vào giỏ hàng
              </Button>
            </div>
          </div>
        </div>
        <div className={styles["productDetail"]}>
          <h2>Thông tin chi tiết</h2>
          <p>{product.description}</p>
          <h3>Thông số kỹ thuật</h3>
        </div>
      </div>
      <div className={styles["product-detail-related"]}>
        <h2>Sản phẩm cùng danh mục</h2>
        <div className={styles["product-detail-related-list"]}>
          {product.category && <ListProducts query={product.category} />}
        </div>
      </div>
    </div>
  );
}

export default ProductDetail;
