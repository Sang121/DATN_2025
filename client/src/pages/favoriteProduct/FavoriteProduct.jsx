import React, { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Row,
  Col,
  Typography,
  Spin,
  Empty,
  Button,
  Select,
  Input,
  Card,
  Space,
} from "antd";
import {
  HeartFilled,
  SearchOutlined,
  SortAscendingOutlined,
} from "@ant-design/icons";
import { getFavorite } from "../../services/userService";
import ProductCard from "../../components/ProductCard/ProductCard";
import styles from "./FavoriteProduct.module.css";
import { useLocation } from "react-router-dom";

const { Title, Text } = Typography;
const { Option } = Select;

function FavoriteProduct() {
  const [sortBy, setSortBy] = useState("newest");
  const [searchTerm, setSearchTerm] = useState("");

  const {
    data: favoriteProducts,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["favoriteProducts"],
    queryFn: getFavorite,
  });

  const location = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [location.pathname]);

  // Filter and sort products
  const filteredAndSortedProducts = React.useMemo(() => {
    if (!favoriteProducts) return [];

    let filtered = favoriteProducts.filter((product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Sort products
    switch (sortBy) {
      case "price-low":
        filtered.sort((a, b) => a.price - b.price);
        break;
      case "price-high":
        filtered.sort((a, b) => b.price - a.price);
        break;
      case "name":
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "rating":
        filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      default: // newest
        filtered.reverse();
    }

    return filtered;
  }, [favoriteProducts, searchTerm, sortBy]);

  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingContent}>
          <Spin size="large" className={styles.spinner} />
          <Title level={4} className={styles.loadingText}>
            Đang tải sản phẩm yêu thích...
          </Title>
          <Text className={styles.loadingSubtext}>
            Vui lòng chờ trong giây lát
          </Text>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className={styles.favoritePageContainer}>
        <div className={styles.errorContainer}>
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={
              <div className={styles.errorContent}>
                <Title level={4} className={styles.errorTitle}>
                  Oops! Có lỗi xảy ra
                </Title>
                <Text className={styles.errorMessage}>
                  {error?.message ||
                    "Không thể tải sản phẩm yêu thích. Vui lòng thử lại sau."}
                </Text>
                <Button
                  type="primary"
                  className={styles.retryButton}
                  onClick={() => window.location.reload()}
                >
                  Thử lại
                </Button>
              </div>
            }
          />
        </div>
      </div>
    );
  }

  return (
    <div className={styles.favoritePageContainer}>
      {favoriteProducts && favoriteProducts.length > 0 ? (
        <>
          {/* Control Panel */}
          <Card className={styles.controlPanel}>
            <Row gutter={[16, 16]} align="middle">
              <Col xs={24} sm={12} md={10}>
                <Input
                  placeholder="Tìm kiếm sản phẩm yêu thích..."
                  prefix={<SearchOutlined />}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={styles.searchInput}
                  size="large"
                />
              </Col>

              <Col xs={12} sm={6} md={6}>
                <Select
                  value={sortBy}
                  onChange={setSortBy}
                  className={styles.sortSelect}
                  size="large"
                  suffixIcon={<SortAscendingOutlined />}
                >
                  <Option value="newest">Mới nhất</Option>
                  <Option value="name">Tên A-Z</Option>
                  <Option value="price-low">Giá thấp</Option>
                  <Option value="price-high">Giá cao</Option>
                  <Option value="rating">Đánh giá</Option>
                </Select>
              </Col>

              <Col xs={12} md={8}>
                <div className={styles.resultInfo}>
                  <Text className={styles.resultText}>
                    Hiển thị <strong>{filteredAndSortedProducts.length}</strong>{" "}
                    trong số <strong>{favoriteProducts.length}</strong> sản phẩm
                  </Text>
                </div>
              </Col>
            </Row>
          </Card>

          {/* Products Grid */}
          {filteredAndSortedProducts.length > 0 ? (
            <div className={styles.productsSection}>
              <Row gutter={[24, 24]} className={styles.productGrid}>
                {filteredAndSortedProducts.map((product, index) => (
                  <Col
                    key={product._id}
                    xs={24}
                    sm={12}
                    md={8}
                    lg={6}
                    className={styles.productCol}
                  >
                    <div
                      className={styles.productWrapper}
                      style={{
                        animationDelay: `${index * 0.1}s`,
                      }}
                    >
                      <ProductCard
                        productId={product._id}
                        image={product.images[0]}
                        name={product.name}
                        price={product.price}
                        sold={product.sold}
                        totalStock={product.totalStock}
                        oldPrice={product.oldPrice}
                        rating={product.rating}
                        discount={product.discount}
                        extra={product.description}
                      />
                    </div>
                  </Col>
                ))}
              </Row>
            </div>
          ) : (
            <div className={styles.noResultsContainer}>
              <Empty
                image="https://gw.alipayobjects.com/zos/antfincdn/ZHrcdLPrvN/empty.svg"
                description={
                  <div className={styles.noResultsContent}>
                    <Title level={4} className={styles.noResultsTitle}>
                      Không tìm thấy sản phẩm
                    </Title>
                    <Text className={styles.noResultsText}>
                      Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc
                    </Text>
                    <Button
                      type="link"
                      onClick={() => {
                        setSearchTerm("");
                        setSortBy("newest");
                      }}
                      className={styles.clearButton}
                    >
                      Xóa bộ lọc
                    </Button>
                  </div>
                }
              />
            </div>
          )}
        </>
      ) : (
        <div className={styles.emptyStateContainer}>
          <div className={styles.emptyStateContent}>
            <div className={styles.emptyIcon}>
              <HeartFilled />
            </div>
            <Title level={3} className={styles.emptyTitle}>
              Chưa có sản phẩm yêu thích
            </Title>
            <Text className={styles.emptyDescription}>
              Hãy khám phá và thêm những sản phẩm bạn yêu thích vào danh sách
              này
            </Text>
            <Button
              type="primary"
              size="large"
              className={styles.shopButton}
              onClick={() => (window.location.href = "/products")}
            >
              Khám phá sản phẩm
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export default FavoriteProduct;
