import React, { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Row, Col, Typography, Spin, Empty } from "antd";
import { HeartFilled } from "@ant-design/icons";
import { getFavorite } from "../../services/userService";
import ProductCard from "../../components/ProductCard/ProductCard";
import styles from "./FavoriteProduct.module.css";
import { useLocation } from "react-router-dom";

const { Title } = Typography;

function FavoriteProduct() {
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

  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <Spin size="large" />
        <Title level={4} style={{ marginTop: 16 }}>
          Đang tải...
        </Title>
      </div>
    );
  }

  if (isError) {
    return (
      <div className={styles.emptyContainer}>
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={
            <Title level={5} type="danger">
              Lỗi: {error?.message || "Không thể tải sản phẩm yêu thích."}
            </Title>
          }
        />
      </div>
    );
  }

  return (
    <div className={styles.favoritePageContainer}>
      <Title level={2} className={styles.pageTitle}>
        Sản phẩm yêu thích của bạn
      </Title>

      {favoriteProducts && favoriteProducts.length > 0 ? (
        <Row gutter={[16, 16]} className={styles.productGrid}>
          {favoriteProducts.map((product) => (
            <Col
              key={product._id}
              xs={24}
              sm={12}
              md={8}
              lg={6}
              className={styles.productCol}
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
            </Col>
          ))}
        </Row>
      ) : (
        <div className={styles.emptyContainer}>
          <Empty
            image="https://gw.alipayobjects.com/zos/antfincdn/ZHrcdLPrvN/empty.svg"
            description={
              <Title level={4} type="secondary">
                Bạn chưa có sản phẩm yêu thích nào.
              </Title>
            }
          />
        </div>
      )}
    </div>
  );
}

export default FavoriteProduct;
