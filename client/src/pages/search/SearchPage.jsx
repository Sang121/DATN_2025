import React, { useEffect, useState } from "react";
import Sidebar from "../../components/SideBar/SideBar";
import FilterPrice from "../../components/FilterPrice/FilterPrice";
import styles from "./SearchPage.module.css";
import ListProduct from "../../components/ListProducts/ListProduct";
import { useParams } from "react-router-dom";
import { searchProduct } from "../../services/productService";
import { useQuery } from "@tanstack/react-query";
import { Flex } from "antd";
import ProductCard from "../../components/ProductCard/ProductCard";

function SearchPage() {
  const { query } = useParams();
  const [searchQuery, setSearchQuery] = useState(query);

  useEffect(() => {
    setSearchQuery(query);
  }, [query]);
  const {
    data: searchData,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["search", searchQuery],
    queryFn: () => searchProduct(searchQuery),
  });
  if (isLoading) {
    return <div>Loading...</div>;
  }
  if (isError) {
    return <div>Error: {isError.message}</div>;
  }

  return (
    <div className={styles["type-product-page-container"]}>
      <div className={styles["type-product-page"]}>
        <div className={styles.SideBar}>
          <Sidebar />
          <FilterPrice />
        </div>
        <div className={styles["type-product-page-content"]}>
          <div className={styles["type-product-page-list"]}>
            <div className={styles["product-detail-breadcrumb"]}>
              <h1>
                <a href="/">Trang chủ</a> / {query}
              </h1>
            </div>
            <div>
              <Flex
                wrap
                gap="small"
                className={styles["list-product-container"]}
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
              </Flex>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SearchPage;
