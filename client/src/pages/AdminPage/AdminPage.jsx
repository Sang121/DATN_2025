import React, { useState } from "react";
import {
  AppstoreOutlined,
  CalendarOutlined,
  LinkOutlined,
  MailOutlined,
  ProductOutlined,
  SettingOutlined,
  UserOutlined,
  ShoppingCartOutlined, // Thêm icon cho đơn hàng
} from "@ant-design/icons";
import styles from "./AdminPage.module.css";
import { Col, Divider, Menu, Switch } from "antd";
import UserManager from "./component/userManager/UserManager";
import ProductManager from "./component/productManager/ProductManager";
import OrderManager from "./component/orderManager/OrderManager";
import Statistics from "./component/StatisticsPage/Statistics";
import { useLocation } from "react-router-dom";
import { useEffect } from "react";

const items = [
  {
    key: "user",
    icon: <UserOutlined />,
    label: "Người dùng",
  },
  {
    key: "product",
    icon: <ProductOutlined />,
    label: "Sản phẩm",
  },
  {
    key: "order", // Thêm key cho đơn hàng
    icon: <ShoppingCartOutlined />,
    label: "Đơn hàng",
  },
  {
    key: "Statistics", // Thêm key cho thống kê
    icon: <ShoppingCartOutlined />,
    label: "Thống kê doanh số",
  },
];

const AdminPage = () => {
  const [selectedKey, setSelectedKey] = useState("user");

  const handleOnClick = ({ key }) => {
    setSelectedKey(key);
  };
  const renderContent = () => {
    switch (selectedKey) {
      case "user":
        return <UserManager />;
      case "product":
        return <ProductManager />;
      case "order":
        return <OrderManager />;
      case "Statistics":
        return <Statistics />;
      default:
        return <UserManager />;
    }
  };
  const location = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [location.pathname]);

  return (
    <>
      <div className={styles["adminContainer"]}>
        <Col className={styles["mainContent"]}>
          <Col xs={4} sm={4} md={3} lg={3}>
            <Menu
              mode="inline"
              className={styles["sideBar"]}
              onClick={handleOnClick}
              theme="light"
              items={items}
              selectedKeys={[selectedKey]}
            />
          </Col>
          <Col xs={18} sm={18} md={18} lg={20} className={styles["content"]}>
            {renderContent()}
          </Col>
        </Col>
      </div>
    </>
  );
};

export default AdminPage;
