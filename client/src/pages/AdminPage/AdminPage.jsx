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
import { Divider, Menu, Switch } from "antd";
const items = [
  {
    key: "user",
    icon: <UserOutlined />,
    label: "Quản lý người dùng",
  },
  {
    key: "product",
    icon: <ProductOutlined />,
    label: "Quản lý sản phẩm",
  },
];
const AdminPage = () => {
  const [mode, setMode] = useState("inline");
  const [theme, setTheme] = useState("light");
  const [selectedKey, setSelectedKey] = useState();
  const changeMode = (value) => {
    setMode(value ? "vertical" : "inline");
  };
  const changeTheme = (value) => {
    setTheme(value ? "dark" : "light");
  };
  const handleOnClick = ({ key }) => {
    setSelectedKey(key);
  };
  return (
    <>
      <Switch onChange={changeMode} /> Change Mode
      <Divider type="vertical" />
      <Switch onChange={changeTheme} /> Change Style
      <br />
      <br />
      <div>
        <Menu
          style={{ width: 256 }}
          defaultSelectedKeys={["1"]}
          defaultOpenKeys={["sub1"]}
          onClick={handleOnClick}
          mode={mode}
          theme={theme}
          items={items}
        />
        <div> {selectedKey === "user" && <span>User nè </span>} </div>
        <div> {selectedKey === "product" && <span>Product nè </span>} </div>
      </div>
    </>
  );
};
export default AdminPage;
