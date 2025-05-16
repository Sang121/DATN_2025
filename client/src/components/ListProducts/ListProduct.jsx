import React from "react";
import ProductCard from "../ProductCard/ProductCard";
import styles from "./ListProduct.module.css";
import { Flex } from "antd";
import { useEffect } from "react";
import { useState } from "react";
import { BaseUrl } from "../dumpApi";
import { fetchProducts } from "../GetProducts";
function ListProduct() {
  const [products, setProducts] = useState([]);
  useEffect(() => {
    fetchProducts().then((data) => {
      setProducts(data);
  
    });
  }, []); 

  return (
    <div>
      <Flex wrap gap="small" className={styles["list-product-container"]}>
        {products.map((product) => (
          <ProductCard
            key={product.id}
            image={product.thumbnail}
            name={product.title}
            price={product.price}
            oldPrice={product.oldPrice}
            rating={product.rating}
            discount={product.discountPercentage}
            badge={product.brand}
            labels={product.tags}
            extra={product.brand}
          />
        ))}
      </Flex>
    </div>
  );
}

export default ListProduct;
