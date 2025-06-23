import React, { useState } from "react";
import { Layout, Menu, Breadcrumb, Avatar, Typography } from "antd";
import { UserOutlined, UnorderedListOutlined } from "@ant-design/icons";
import { Link } from "react-router-dom";
import styles from "./profilePage.module.css";
import UserUpdate from "../../components/updateUser/userUpdate";
import MyOrder from "../../components/myOrder/MyOrder";

const { Content, Sider } = Layout;
const { Title, Text } = Typography;

function ProfilePage() {
  const [activeView, setActiveView] = useState("profile");
  const user = JSON.parse(sessionStorage.getItem("userState"))?.user || {};

  const menuItems = [
    { key: "profile", label: "Thông tin tài khoản", icon: <UserOutlined /> },
    {
      key: "orders",
      label: "Đơn hàng của tôi",
      icon: <UnorderedListOutlined />,
    },
  ];

  const renderContent = () => {
    switch (activeView) {
      case "profile":
        return <UserUpdate />;
      case "orders":
        return <MyOrder />;
      default:
        return <UserUpdate />;
    }
  };

  const handleMenuClick = (e) => {
    setActiveView(e.key);
  };

  return (
    <div className={styles.pageContainer}>
      <Breadcrumb className={styles.breadcrumb}>
        <Breadcrumb.Item>
          <Link to="/">Trang Chủ</Link>
        </Breadcrumb.Item>
        <Breadcrumb.Item>Tài khoản</Breadcrumb.Item>
        <Breadcrumb.Item>
          {activeView === "profile"
            ? "Thông tin tài khoản"
            : "Đơn hàng của tôi"}
        </Breadcrumb.Item>
      </Breadcrumb>
      <Layout className={styles.layoutContainer}>
        <Sider width={250} className={styles.sider}>
          <div className={styles.siderHeader}>
            <Avatar size={64} icon={<UserOutlined />} src={user.avatar} />
            <Title level={5} style={{ marginTop: 16, marginBottom: 0 }}>
              {user.fullName || user.username}
            </Title>
            <Text type="secondary">{user.email}</Text>
          </div>
          <Menu
            mode="inline"
            selectedKeys={[activeView]}
            onClick={handleMenuClick}
            items={menuItems}
            className={styles.menu}
          />
        </Sider>
        <Content className={styles.content}>{renderContent()}</Content>
      </Layout>
    </div>
  );
}

export default ProfilePage;
