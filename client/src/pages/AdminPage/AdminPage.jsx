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
import UserManager from "../../components/admin/userManager/UserManager";
import ProductManager from "../../components/admin/productManager/ProductManager";

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
          <Col xs={6} sm={6} md={6} lg={4}>
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
              <span><ProductManager/></span>
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
