import React, { useState } from "react";
import {
  Layout,
  Menu,
  Breadcrumb,
  Avatar,
  Typography,
  Drawer,
  Button,
} from "antd";
import {
  UserOutlined,
  UnorderedListOutlined,
  MenuOutlined,
} from "@ant-design/icons";
import { Link } from "react-router-dom";
import styles from "./profilePage.module.css";
import UserUpdate from "../../components/updateUser/userUpdate";
import MyOrder from "../../components/myOrder/MyOrder";

const { Content, Sider } = Layout;
const { Title, Text } = Typography;

function ProfilePage() {
  const [activeView, setActiveView] = useState("profile");
  const [mobileMenuVisible, setMobileMenuVisible] = useState(false);
  const user = JSON.parse(sessionStorage.getItem("userState"))?.user || {};

  const menuItems = [
    {
      key: "profile",
      label: "Thông tin tài khoản",
      icon: <UserOutlined />,
    },
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
    setMobileMenuVisible(false); // Close mobile menu after selection
  };

  const renderSidebarContent = () => (
    <>
      <div className={styles.siderHeader}>
        <Avatar size={64} icon={<UserOutlined />} src={user.avatar} />
        <Title level={5} style={{ marginTop: 16, marginBottom: 0 }}>
          {user.fullName || user.username || "Người dùng"}
        </Title>
        <Text type="secondary">{user.email || "Chưa có email"}</Text>
      </div>
      <Menu
        mode="inline"
        selectedKeys={[activeView]}
        onClick={handleMenuClick}
        items={menuItems}
        className={styles.menu}
      />
    </>
  );

  return (
    <div className={styles.pageContainer}>
      {/* Mobile menu trigger button */}
      <Button
        className={styles.mobileMenuTrigger}
        icon={<MenuOutlined />}
        onClick={() => setMobileMenuVisible(true)}
        type="primary"
      />

      {/* Breadcrumb */}
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

      {/* Main layout */}
      <Layout className={styles.layoutContainer}>
        {/* Desktop sidebar */}
        <Sider
          width={250}
          className={styles.sider}
          breakpoint="md"
          collapsedWidth="0"
        >
          {renderSidebarContent()}
        </Sider>

        {/* Mobile drawer */}
        <Drawer
          title="Menu"
          placement="left"
          onClose={() => setMobileMenuVisible(false)}
          open={mobileMenuVisible}
          width={250}
        >
          {renderSidebarContent()}
        </Drawer>

        {/* Content area */}
        <Content className={styles.content}>{renderContent()}</Content>
      </Layout>
    </div>
  );
}

export default ProfilePage;
