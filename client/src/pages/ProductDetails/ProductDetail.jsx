import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import styles from "./ProductDetail.module.css";
import { Alert, Button, Spin, Rate, Tag, message } from "antd";
import ListProducts from "../../components/ListProducts/ListProduct";
import { useQuery } from "@tanstack/react-query";
import { getDetailProduct } from "../../services/productService";
import { useDispatch } from "react-redux";
import { addOrderItem } from "../../redux/slices/orderSlice";
function ProductDetail() {
  const { id } = useParams();
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState("");
  const [availableColors, setAvailableColors] = useState([]);
  const [availableSizes, setAvailableSizes] = useState([]);
  const userId = sessionStorage.getItem("userId") || null;
  const dispatch = useDispatch();

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
  const getIdForVariant = (size, color) => {
    if (!product?.variants) return null;
    const variant = product.variants.find(
      (v) => v.size === size && v.color === color
    );
    return variant?._id || null;
  };

  // Hàm lấy số lượng tồn kho cho size và màu được chọn
  const getStockForVariant = (size, color) => {
    if (!product?.variants) return 0;
    const variant = product.variants.find(
      (v) => v.size === size && v.color === color
    );
    return variant?.stock || 0;
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

  // Sửa lại hàm xử lý khi chọn size

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

  const productPrice = {
    newPrice: product.price - (product.price * product.discount) / 100,
    oldPrice: product.price,
  };

  const uniqueSizes = [...new Set(product.variants.map((v) => v.size))];
  const uniqueColors = [...new Set(product.variants.map((v) => v.color))];
  const handleSizeSelect = (size) => {
    if (selectedSize === size) {
      // Khi bỏ chọn size, reset cả size và color
      setSelectedSize("");
      setSelectedColor(""); // Reset color khi bỏ chọn size
      // Reset lại tất cả các màu có sẵn
      setAvailableColors(uniqueColors);
      setAvailableSizes(uniqueSizes);
    } else {
      setSelectedSize(size);
      // Nếu đã có màu được chọn, kiểm tra xem màu đó có hợp lệ với size mới không
      if (selectedColor) {
        const colorsForNewSize = getColorsForSize(size);
        if (!colorsForNewSize.includes(selectedColor)) {
          setSelectedColor(""); // Reset color nếu không hợp lệ với size mới
        }
      }
      setAvailableColors(getColorsForSize(size));
    }
  };

  // Sửa lại hàm xử lý khi chọn màu
  const handleColorSelect = (color) => {
    if (selectedColor === color) {
      // Khi bỏ chọn màu, reset cả color và size
      setSelectedColor("");
      setSelectedSize(""); // Reset size khi bỏ chọn màu
      // Reset lại tất cả các size có sẵn
      setAvailableSizes(uniqueSizes);
      setAvailableColors(uniqueColors);
    } else {
      setSelectedColor(color);
      // Nếu đã có size được chọn, kiểm tra xem size đó có hợp lệ với màu mới không
      if (selectedSize) {
        const sizesForNewColor = getSizesForColor(color);
        if (!sizesForNewColor.includes(selectedSize)) {
          setSelectedSize(""); // Reset size nếu không hợp lệ với màu mới
        }
      }
      setAvailableSizes(getSizesForColor(color));
    }
  };
  const handleAddToCart = (size, color, quantity) => {
    if (userId === undefined) {
      message.error("Bạn cần đăng nhập để thêm sản phẩm vào giỏ hàng");
      return;
    }
    dispatch(
      addOrderItem({
        id: getIdForVariant(selectedSize, selectedColor),
        name: product.name,
        amount: quantity,
        originalPrice: productPrice.oldPrice,
        price: productPrice.newPrice,
        image: selectedImage,
        isDiscount: product.discount > 0,
        variant: {
          idVariant: getIdForVariant(selectedSize, selectedColor),
          size: selectedSize,
          color: selectedColor,
          stock: getStockForVariant(selectedSize, selectedColor),
        },
        product: product._id,
        isUpdate: false,
      })
    );
    message.success("Sản phẩm đã được thêm vào giỏ hàng");
  };
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
            <span className={styles["productName"]}>{product.name}</span>
            <div className={styles["productRating"]}>
              <Rate
                className={styles["ratingStar"]}
                disabled
                defaultValue={4}
              />
              <span className={styles["ratingCount"]}>
                {product.rating || 0} đánh giá
              </span>
            </div>
            <div className={styles["productSold"]}>
              <span>({product.sold}) đã bán</span>
            </div>
            {product.discount > 0 ? (
              <div className={styles.productPrice}>
                {/* Giá hiện tại */}
                <div className={styles.currentPrice}>
                  <span>
                    {Math.round(productPrice.newPrice)?.toLocaleString("vi-VN")}
                  </span>
                  <sup>₫</sup>
                </div>

                {/* Phần trăm giảm giá */}
                <div className={styles.discountRate}>{product.discount}%</div>

                {/* Icon giảm giá */}
                <div className={styles.discountIcon}>
                  <img
                    src="https://salt.tikicdn.com/ts/upload/59/3f/08/2635c54cb215de11383507b2fe38bde3.png"
                    width="14"
                    height="14"
                    alt="discount-icon"
                  />
                </div>

                {/* Giá gốc */}
                <div className={styles.originalPrice}>
                  <del>
                    {Math.round(productPrice.oldPrice)?.toLocaleString("vi-VN")}
                    đ
                  </del>
                  <sup>₫</sup>
                </div>

                {/* Icon thông tin */}
                <div className={styles.infoIcon}>
                  <img
                    src="https://salt.tikicdn.com/ts/upload/7b/3e/15/a6e1a274630e27840824d4aab203aaea.png"
                    width="14"
                    height="14"
                    alt="info-icon"
                    style={{ cursor: "pointer" }}
                  />
                </div>
              </div>
            ) : (
              <div>
                {product.price && (
                  <span className={styles.price}>
                    {product.price?.toLocaleString("vi-VN")}đ
                  </span>
                )}
                {product.discount > 0 && (
                  <Tag color="red" className={styles.discountTag}>
                    -{product.discount}%
                  </Tag>
                )}
              </div>
            )}

            <div className={styles.productInfo}>
              {/* Thêm đánh giá sản phẩm */}

              {/* Cải thiện hiển thị variants */}
              <div className={styles.variantSection}>
                <div className={styles.sizeSection}>
                  <div className={styles.sizeHeader}>
                    <span>Chọn size:</span>
                    <Button type="link">Hướng dẫn chọn size</Button>
                  </div>
                  <div className={styles.sizeList}>
                    {/* Hiển thị tất cả sizes, disable những size không có sẵn cho màu đã chọn */}
                    {uniqueSizes.map((size) => {
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
                    })}
                  </div>
                </div>
                <div className={styles.colorSection}>
                  <div className={styles.colorHeader}>
                    <span>Chọn màu:</span>
                  </div>
                  <div className={styles.sizeList}>
                    {/* Hiển thị tất cả colors, disable những màu không có sẵn cho size đã chọn */}
                    {uniqueColors.map((color) => {
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
                    })}
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
                onClick={() =>
                  handleAddToCart(selectedSize, selectedColor, quantity)
                }
              >
                Thêm vào giỏ hàng
              </Button>
            </div>
          </div>
        </div>
        <div className={styles["productDetail"]}>
          <h2>Thông tin chi tiết</h2>
          {product.description}
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
