import React from "react";
import styles from "./SideBar.module.css";
import { Link } from "react-router-dom";
function Sidebar() {
  const typeProductsList = [
    {
      name: "Quần Nam",
      category: "mens-shirts",
      image:
        "https://salt.tikicdn.com/cache/280x280/ts/product/7f/24/d6/bb72bd4e447a082c6a6989021153e8ac.jpg",
    },
    {
      name: "Áo Sơ Mi",
      category: "áo",
      image:
        "https://salt.tikicdn.com/cache/280x280/ts/product/48/aa/f9/c6233b9cf5225a8c2e8dd4513377587c.jpg",
    },
    {
      name: "Áo Thun",
      category: "fragrances",
      image:
        " https://salt.tikicdn.com/cache/100x100/ts/category/00/5d/97/384ca1a678c4ee93a0886a204f47645d.png ",
    },
    {
      name: "Quần áo Nữ",
      category: "womens-dresses",
      image:
        "https://salt.tikicdn.com/ts/category/cd/c9/c8/30464d36bc19f1738ab7208762df4378.png",
    },
    {
      name: "Váy",
      image:
        "https://salt.tikicdn.com/ts/category/58/fb/33/0889ae735cd31390f76db3342f0aa1bf.png",
    },
    {
      name: "Trẻ em",
      image:
        "https://salt.tikicdn.com/cache/750x750/ts/product/6c/dd/d4/817a8f4207e57703b5498b217cb405dd.jpg.webp",
    },
    {
      name: "Giày dép",
      category: "Giày",
      image:
        " https://salt.tikicdn.com/cache/100x100/ts/category/d6/7f/6c/5d53b60efb9448b6a1609c825c29fa40.png",
    },
    {
      name: "Đồng Hồ",
      category: "womens-watches",
      image:
        " https://salt.tikicdn.com/cache/100x100/ts/category/8b/d4/a8/5924758b5c36f3b1c43b6843f52d6dd2.png",
    },
    {
      name: "Ba lô",
      image:
        "https://salt.tikicdn.com/cache/100x100/ts/category/3e/c0/30/1110651bd36a3e0d9b962cf135c818ee.png.webp",
    },
    {
      name: "Túi Xách",
      image:
        "https://salt.tikicdn.com/cache/100x100/ts/category/31/a7/94/6524d2ecbec216816d91b6066452e3f2.png",
    },
  ];

  return (
    <div className={styles.sidebar}>
      <div className={styles.typeProductsContainer}>
        <h2 className={styles.typeProductsTitle}>Danh mục sản phẩm</h2>
        {typeProductsList.map((product, index) => (
          <Link
            to={`/category/${product.category}`}
            key={index}
            className={styles.typeProductItem}
          >
            {product.image && (
              <img
                src={product.image}
                alt={product.name}
                className={styles.typeProductImage}
              />
            )}
            {product.name}
          </Link>
        ))}
      </div>
    </div>
  );
}

export default Sidebar;
