import React, { useEffect, useState } from "react";
import Sidebar from "../../components/SideBar/SideBar";
import FilterPrice from "../../components/FilterPrice/FilterPrice";
import styles from "./SearchPage.module.css";
import { useParams } from "react-router-dom";
import { searchProduct } from "../../services/productService";
import { useQuery } from "@tanstack/react-query";
import { Row, Col, Spin, Alert } from "antd";
import ProductCard from "../../components/ProductCard/ProductCard";

function SearchPage() {
  const { query } = useParams();
  const [searchQuery, setSearchQuery] = useState(query);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "smooth" });

    setSearchQuery(query);
  }, [query]);

  const {
    data: searchData,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["search", searchQuery],
    queryFn: () => searchProduct(searchQuery),
  });

  if (isLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.statusContainer}>
          <Spin size="large" tip="Đang tìm kiếm sản phẩm..." />
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className={styles.container}>
        <div className={styles.statusContainer}>
          <Alert
            message="Lỗi tìm kiếm"
            description={
              error?.message ||
              "Không thể tìm kiếm sản phẩm. Vui lòng thử lại sau."
            }
            type="error"
            showIcon
          />
        </div>
      </div>
    );
  }

  if (!searchData?.data || searchData.data.length === 0) {
    return (
      <div className={styles.container}>
        <div className={styles.statusContainer}>
          <Alert
            message={`Không tìm thấy sản phẩm cho "${query}"`}
            description="Hãy thử tìm kiếm với từ khóa khác"
            type="info"
            showIcon
          />
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <Row className={styles.mainContent} gutter={[24, 16]}>
        <Col xs={0} sm={0} md={6} lg={5} xl={4} className={styles.sidebar}>
          <Sidebar />
          <FilterPrice />
        </Col>

        <Col xs={24} sm={24} md={18} lg={19} xl={20} className={styles.content}>
          <div className={styles.contentList}>
            <div className={styles.breadcrumb}>
              <h1>
                <a href="/">Trang chủ</a> / Kết quả tìm kiếm: "{query}"
              </h1>
              <p className={styles.resultCount}>
                Tìm thấy {searchData.data.length} sản phẩm
              </p>
            </div>

            <div className={styles.productGrid}>
              {searchData.data.map((product) => (
                <ProductCard
                  key={product._id}
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
              ))}
            </div>
          </div>
        </Col>
      </Row>
    </div>
  );
}

export default SearchPage;
