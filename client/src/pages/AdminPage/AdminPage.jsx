import React, { useState, useMemo, lazy, Suspense } from "react";
import {
  AppstoreOutlined,
  CalendarOutlined,
  LinkOutlined,
  MailOutlined,
  ProductOutlined,
  SettingOutlined,
  UserOutlined,
  ShoppingCartOutlined, // Thêm icon cho đơn hàng
  BarChartOutlined, // Thêm icon cho thống kê
  RollbackOutlined, // Icon cho yêu cầu trả hàng
  OrderedListOutlined, // Icon cho quản lý đơn hàng
} from "@ant-design/icons";
import styles from "./styles/AdminPage.module.css";
import "./styles/index.css"; // Import global admin styles
import { Col, Divider, Menu, Switch, Spin } from "antd";
import { useLocation } from "react-router-dom";
import { useEffect } from "react";

const UserManager = lazy(() => import("./modules/Users"));
const ProductManager = lazy(() => import("./modules/Products"));
const OrderManager = lazy(() => import("./modules/Orders"));
const ReturnRequestManager = lazy(() => import("./modules/Orders/components/ReturnRequestManager"));
const OptimizedStatistics = lazy(() =>
  import("./modules/Statistics/OptimizedStatistics")
);

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
    key: "orders",
    icon: <ShoppingCartOutlined />,
    label: "Quản lý đơn hàng",
    children: [
      {
        key: "order",
        icon: <OrderedListOutlined />,
        label: "Đơn hàng",
      },
      {
        key: "return-requests",
        icon: <RollbackOutlined />,
        label: "Yêu cầu trả hàng",
      },
    ],
  },
  {
    key: "Statistics",
    icon: <BarChartOutlined />,
    label: "Thống kê doanh số",
  },
];

const AdminPage = () => {
  const [selectedKey, setSelectedKey] = useState("user");

  const handleOnClick = ({ key }) => {
    setSelectedKey(key);
  };

  const components = useMemo(
    () => ({
      user: <UserManager />,
      product: <ProductManager />,
      order: <OrderManager />,
      "return-requests": <ReturnRequestManager />,
      Statistics: <OptimizedStatistics />,
    }),
    []
  );

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
            <Suspense fallback={<Spin size="large" />}>
              {components[selectedKey]}
            </Suspense>
          </Col>
        </Col>
      </div>
    </>
  );
};

export default AdminPage;
