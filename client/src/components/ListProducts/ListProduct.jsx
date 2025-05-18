import React from "react";
import ProductCard from "../ProductCard/ProductCard";
import styles from "./ListProduct.module.css";
import { Flex } from "antd";
import { useEffect } from "react";
import { useState } from "react";
import { BaseUrl } from "../dumpApi";
function ListProduct({ Collections }) {
  const [products, setProducts] = useState([]);
  useEffect(() => {
         fetch(`https://dummyjson.com/products/category/${Collections}`)
           .then((res) => res.json())
           .then((data) => setProducts(data.products));
      }, [Collections]);

  return (
    <div>
      <Flex wrap gap="small" className={styles["list-product-container"]}>
        {products.map((product) => (
          <ProductCard
            productId={product.id}
            image={product.thumbnail}
            name={product.title}
            price={product.price}
            oldPrice={product.oldPrice}
            rating={product.rating}
            discount={product.discountPercentage}
         
           
            extra={product.description}
          />
        ))}
      </Flex>
    </div>
  );
}

export default ListProduct;
