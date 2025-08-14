import React, { useEffect, useState } from "react";
import Sidebar from "../../components/SideBar/SideBar";
import FilterPrice from "../../components/FilterPrice/FilterPrice";
import styles from "./SearchPage.module.css";
import { useParams, useSearchParams } from "react-router-dom";
import { searchProduct } from "../../services/productService";
import { useQuery } from "@tanstack/react-query";
import {
  Row,
  Col,
  Spin,
  Alert,
  Breadcrumb,
  Typography,
  Card,
  Empty,
  Select,
  Space,
  Button,
  Drawer,
} from "antd";
import {
  HomeOutlined,
  SearchOutlined,
  FilterOutlined,
  SortAscendingOutlined,
} from "@ant-design/icons";
import ProductCard from "../../components/ProductCard/ProductCard";

const { Title, Text } = Typography;
const { Option } = Select;

function SearchPage() {
  const { query } = useParams();
  const [searchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(query);
  const [sortBy, setSortBy] = useState("relevance");
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
    setSearchQuery(query);
  }, [query]);

  // Extract filters from URL parameters
  const category = searchParams.get("category");
  const minPrice = searchParams.get("minPrice");
  const maxPrice = searchParams.get("maxPrice");

  const {
    data: searchData,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["search", searchQuery, category, minPrice, maxPrice, sortBy],
    queryFn: () =>
      searchProduct(searchQuery, { category, minPrice, maxPrice, sortBy }),
  });

  const handleSortChange = (value) => {
    setSortBy(value);
  };

  if (isLoading) {
    return (
      <div className={styles.container}>
        <Card className={styles.loading_card}>
          <Spin size="large" tip="Đang tìm kiếm sản phẩm..." />
        </Card>
      </div>
    );
  }

  if (isError) {
    return (
      <div className={styles.container}>
        <Card className={styles.error_card}>
          <Alert
            message="Lỗi tìm kiếm"
            description={
              error?.message ||
              "Không thể tìm kiếm sản phẩm. Vui lòng thử lại sau."
            }
            type="error"
            showIcon
          />
        </Card>
      </div>
    );
  }

  if (!searchData?.data || searchData.data.length === 0) {
    return (
      <div className={styles.container}>
        <Card className={styles.empty_card}>
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={
              <div>
                <Text type="secondary" style={{ fontSize: "16px" }}>
                  Không tìm thấy sản phẩm cho "{query}"
                </Text>
                <br />
                <Text type="secondary">Hãy thử tìm kiếm với từ khóa khác</Text>
              </div>
            }
          />
        </Card>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <Row className={styles.main_content} gutter={[24, 24]}>
        {/* Sidebar for desktop */}
        <Col xs={0} sm={0} md={6} lg={5} xl={4} className={styles.sidebar_col}>
          <div className={styles.sidebar_container}>
            <Sidebar />
            <FilterPrice />
          </div>
        </Col>

        {/* Main content */}
        <Col
          xs={24}
          sm={24}
          md={18}
          lg={19}
          xl={20}
          className={styles.content_col}
        >
          {/* Search header */}
          <Card className={styles.search_header}>
            <div className={styles.search_info}>
              <Title level={3} className={styles.search_title}>
                Kết quả tìm kiếm: "{query}"
              </Title>
              <Text className={styles.result_count}>
                Tìm thấy {searchData.data.length} sản phẩm
              </Text>
            </div>

            <div className={styles.search_controls}>
              <Space size="middle">
                {/* Mobile filter button */}
                <Button
                  type="outline"
                  icon={<FilterOutlined />}
                  className={styles.mobile_filter_btn}
                  onClick={() => setFilterDrawerOpen(true)}
                >
                  Bộ lọc
                </Button>

                {/* Sort dropdown */}
                <Select
                  value={sortBy}
                  onChange={handleSortChange}
                  className={styles.sort_select}
                  suffixIcon={<SortAscendingOutlined />}
                >
                  <Option value="relevance">Liên quan nhất</Option>
                  <Option value="price_asc">Giá thấp đến cao</Option>
                  <Option value="price_desc">Giá cao đến thấp</Option>
                  <Option value="newest">Mới nhất</Option>
                  <Option value="popular">Phổ biến nhất</Option>
                </Select>
              </Space>
            </div>
          </Card>

          {/* Product grid */}
          <div 
            className={`${styles.product_grid} ${
              searchData.data.length <= 3 ? styles[`grid_${searchData.data.length}`] : ''
            }`}
          >
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
        </Col>
      </Row>

      {/* Mobile filter drawer */}
      <Drawer
        title="Bộ lọc sản phẩm"
        placement="left"
        onClose={() => setFilterDrawerOpen(false)}
        open={filterDrawerOpen}
        className={styles.filter_drawer}
      >
        <Sidebar />
        <FilterPrice />
      </Drawer>
    </div>
  );
}

export default SearchPage;
