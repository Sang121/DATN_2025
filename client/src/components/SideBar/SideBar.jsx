import React from "react";
import styles from "./SideBar.module.css";
import { Link } from "react-router-dom";
import { Menu, Typography } from "antd";
import {
  TagsOutlined,
  ManOutlined,
  WomanOutlined,
  SkinOutlined,
  ShoppingOutlined,
  ThunderboltOutlined,
  ClockCircleOutlined,
  InboxOutlined,
} from "@ant-design/icons";

const { Title } = Typography;

function Sidebar() {
  const typeProductsList = [
    {
      name: "Thời trang nam",
      category: "Nam",
      image:
        " https://salt.tikicdn.com/cache/100x100/ts/category/00/5d/97/384ca1a678c4ee93a0886a204f47645d.png ",
    },
    {
      name: "Thời trang nữ",
      category: "Nữ",
      image:
        "https://salt.tikicdn.com/ts/category/cd/c9/c8/30464d36bc19f1738ab7208762df4378.png",
    },
    {
      name: "Quần",
      category: "Quần",
      image:
        "https://salt.tikicdn.com/cache/280x280/ts/product/7f/24/d6/bb72bd4e447a082c6a6989021153e8ac.jpg",
    },
    {
      name: "Áo",
      category: "Áo",
      image:
        " https://salt.tikicdn.com/cache/100x100/ts/category/00/5d/97/384ca1a678c4ee93a0886a204f47645d.png ",
    },
    {
      name: "Váy",
      category: "Váy",
      image:
        "https://salt.tikicdn.com/ts/category/58/fb/33/0889ae735cd31390f76db3342f0aa1bf.png",
    },
    {
      name: "Trẻ em",
      category: "Trẻ em",
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
      category: "Đồng Hồ",
      image:
        " https://salt.tikicdn.com/cache/100x100/ts/category/8b/d4/a8/5924758b5c36f3b1c43b6843f52d6dd2.png",
    },
    {
      name: "Ba lô",
      category: "Ba lô",
      image:
        "https://salt.tikicdn.com/cache/100x100/ts/category/3e/c0/30/1110651bd36a3e0d9b962cf135c818ee.png.webp",
    },
    {
      name: "Túi Xách",
      category: "Túi Xách",
      image:
        "https://salt.tikicdn.com/cache/100x100/ts/category/31/a7/94/6524d2ecbec216816d91b6066452e3f2.png",
    },
  ];
  // Tạo các items cho Menu của Ant Design
  const menuItems = typeProductsList.map((product, index) => {
    // Chọn icon phù hợp dựa vào category
    let icon;
    switch (product.category) {
      case "Nam":
        icon = <ManOutlined />;
        break;
      case "Nữ":
        icon = <WomanOutlined />;
        break;
      case "Quần":
      case "Áo":
      case "Váy":
        icon = <SkinOutlined />;
        break;
      case "Trẻ em":
        icon = <ThunderboltOutlined />;
        break;
      case "Giày":
        icon = <ShoppingOutlined />;
        break;
      case "Đồng Hồ":
        icon = <ClockCircleOutlined />;
        break;
      case "Ba lô":
      case "Túi Xách":
        icon = <InboxOutlined />;
        break;
      default:
        icon = <TagsOutlined />;
    }

    return {
      key: index.toString(),
      icon: icon,
      label: (
        <Link to={`/searchproduct?category=${product.category}`}>
          {product.name}
        </Link>
      ),
    };
  });

  return (
    <div className={styles.sidebar}>
      <div className={styles.typeProductsContainer}>
        <Title level={4} className={styles.categoryTitle}>
          <TagsOutlined /> Danh mục sản phẩm
        </Title>
        <Menu
          mode="vertical"
          items={menuItems}
          className={styles.categoryMenu}
          theme="light"
        />
      </div>
    </div>
  );
}

export default Sidebar;
