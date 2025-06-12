import React, { useState } from "react";
import {
  AppstoreOutlined,
  CalendarOutlined,
  LinkOutlined,
  MailOutlined,
  ProductOutlined,
  SettingOutlined,
  UserOutlined,
} from "@ant-design/icons";
import styles from "./AdminPage.module.css";
import { Col, Divider, Menu, Switch } from "antd";
import UserManager from "./component/userManager/UserManager";
import ProductManager from "./component/productManager/ProductManager";
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
];
const AdminPage = () => {
  const [selectedKey, setSelectedKey] = useState("user");

  const handleOnClick = ({ key }) => {
    setSelectedKey(key);
  };
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
            />
          </Col>
          <Col xs={18} sm={18} md={18} lg={20} className={styles["content"]}>
            {selectedKey === "user" ? (
              <span>
                <UserManager />
              </span>
            ) : (
              <span>
                <ProductManager />
              </span>
            )}
          </Col>
          {/* <div className={styles["content"]}>
            {" "}
            {selectedKey === "product" && <span>Product nè </span>}{" "}
          </div> */}
        </Col>
      </div>
    </>
  );
};
export default AdminPage;
