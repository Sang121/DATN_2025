// src/components/Header/Header.jsx
import React, { useState, useEffect } from "react";
import {
  ShoppingCartOutlined,
  UserOutlined,
  SearchOutlined,
  LogoutOutlined,
  MenuOutlined,
  AppstoreOutlined,
  ShoppingOutlined,
  HomeOutlined,
  UserSwitchOutlined,
  SettingOutlined,
  LoginOutlined,
  DashboardOutlined,
  ExperimentOutlined,
} from "@ant-design/icons";
import styles from "./Header.module.css";
import {
  Layout,
  Input,
  Row,
  Col,
  Badge,
  Avatar,
  Dropdown,
  Space,
  Drawer,
  Button,
  Menu,
  Divider,
  message,
  Tooltip,
  Typography,
} from "antd";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { updateUser, logout } from "../../redux/slices/userSlice";
import { clearOrder } from "../../redux/slices/orderSlice";
import { logoutUser } from "../../services/userService";

const { Header } = Layout;
const { Text } = Typography;
const { Search } = Input;

function AppHeader({ onShowSignIn }) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  // Đã xóa biến searchTerm không sử dụng
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const user = useSelector((state) => state.user);
  const order = useSelector((state) => state.order);
  const cartItemCount = order?.orderItems?.length || 0;

  const isLoggedIn = !!user.access_token;

  // Xử lý lưu thông tin đăng nhập vào sessionStorage
  useEffect(() => {
    if (user.username) {
      sessionStorage.setItem("username", user.username);
    } else {
      sessionStorage.removeItem("username");
    }
    if (user._id) {
      sessionStorage.setItem("userId", user._id);
    } else {
      sessionStorage.removeItem("userId");
    }
    if (user.access_token) {
      sessionStorage.setItem("access_token", user.access_token);
    } else {
      sessionStorage.removeItem("access_token");
    }
    if (user.refresh_token) {
      sessionStorage.setItem("refresh_token", user.refresh_token);
    } else {
      sessionStorage.removeItem("refresh_token");
    }
  }, [user]);

  // Xử lý sự kiện thay đổi sessionStorage
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === "userState") {
        const storedState = sessionStorage.getItem("userState");
        if (storedState) {
          const parsedState = JSON.parse(storedState);
          dispatch(updateUser(parsedState.user));
        } else {
          dispatch(logout());
        }
      }
      if (e.key === "access_token" && !e.newValue) {
        dispatch(logout());
      }
    };
    window.addEventListener("storage", handleStorageChange);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [dispatch]);

  // Xử lý sự kiện scroll để thay đổi giao diện khi cuộn trang
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // Xử lý tìm kiếm
  const handleSearch = (value) => {
    const trimmedSearchTerm = value.trim();
    if (trimmedSearchTerm) {
      navigate(`/search/${encodeURIComponent(trimmedSearchTerm)}`);
      setDrawerOpen(false);
    }
  };

  // Xử lý đăng xuất
  const handleLogout = () => {
    sessionStorage.clear();
    dispatch(logout());
    dispatch(clearOrder());

    logoutUser()
      .then(() => {
        message.success("Đăng xuất thành công!");
        setDrawerOpen(false);
        navigate("/");
      })
      .catch((error) => {
        console.error("Logout failed:", error);
        message.error("Đăng xuất thất bại");
      });
  };

  // Xử lý đăng nhập thành công
  const handleLoginSuccess = (userData) => {
    if (userData) {
      dispatch(updateUser(userData));
    }
  };

  // Menu người dùng
  const userMenu = (
    <Menu>
      <Menu.Item key="profile" icon={<UserOutlined />}>
        <Link to="/profile">Thông tin tài khoản</Link>
      </Menu.Item>
      <Menu.Item key="orders" icon={<ShoppingOutlined />}>
        <Link to="/profile/my-order">Đơn hàng của tôi</Link>
      </Menu.Item>
      {user?.isAdmin && (
        <Menu.Item key="admin" icon={<DashboardOutlined />}>
          <Link to="/system/admin">Quản lý hệ thống</Link>
        </Menu.Item>
      )}
      <Menu.Divider />
      <Menu.Item key="logout" icon={<LogoutOutlined />} onClick={handleLogout}>
        Đăng xuất
      </Menu.Item>
    </Menu>
  );

  return (
    <Header className={`${styles.header} ${scrolled ? styles.scrolled : ""}`}>
      <Row
        className={styles.headerRow}
        align="middle"
        justify="space-between"
        wrap={false}
      >
        {/* Logo - Hiển thị trên mọi thiết bị */}
        <Col xs={14} sm={8} md={5} lg={4} xl={4}>
          <Link to="/" className={styles.logoLink}>
            <div className={styles.logo}>S-Fashion</div>
          </Link>
        </Col>
        {/* Thanh tìm kiếm - Ẩn trên mobile */}
        <Col xs={0} sm={8} md={8} lg={10} xl={10} className={styles.searchCol}>
          <Search
            placeholder="Tìm sản phẩm, danh mục hay thương hiệu..."
            enterButton={
              <Button type="primary" icon={<SearchOutlined />}>
                Tìm kiếm
              </Button>
            }
            size="large"
            onSearch={handleSearch}
            className={styles.searchInput}
            allowClear
          />
        </Col>
        {/* Navigation Menu - Hiển thị trên desktop */}
        <Col xs={0} sm={0} md={9} lg={8} xl={8} className={styles.navLinks}>
          {isLoggedIn ? (
            <Space size="large">
              <Tooltip title="Phòng thử đồ">
                <Link to="/fitting_room" className={styles.navLink}>
                  <Badge className={styles.navItem}>
                    <ExperimentOutlined className={styles.navIcon} />
                    <Text className={styles.navText}>Phòng thử đồ</Text>
                  </Badge>
                </Link>
              </Tooltip>

              <Tooltip title="Giỏ hàng">
                <Link to="/cart" className={styles.navLink}>
                  <Badge
                    count={cartItemCount}
                    overflowCount={99}
                    className={styles.navItem}
                  >
                    <ShoppingCartOutlined className={styles.navIcon} />
                    <Text className={styles.navText}>Giỏ hàng</Text>
                  </Badge>
                </Link>
              </Tooltip>

              <Dropdown
                overlay={userMenu}
                trigger={["click"]}
                placement="bottomRight"
              >
                <div className={styles.userDropdown}>
                  <Avatar
                    size="small"
                    className={styles.avatar}
                    icon={<UserOutlined />}
                  />
                  <Text className={styles.userName}>
                    {user.username || "Tài khoản"}
                  </Text>
                </div>
              </Dropdown>
            </Space>
          ) : (
            <Space size="large">
              <Link to="/fitting_room" className={styles.navLink}>
                <Badge className={styles.navItem}>
                  <ExperimentOutlined className={styles.navIcon} />
                  <Text className={styles.navText}>Phòng thử đồ</Text>
                </Badge>
              </Link>

              <Link to="/cart" className={styles.navLink}>
                <Badge
                  count={cartItemCount}
                  overflowCount={99}
                  className={styles.navItem}
                >
                  <ShoppingCartOutlined className={styles.navIcon} />
                  <Text className={styles.navText}>Giỏ hàng</Text>
                </Badge>
              </Link>

              <Button
                type="text"
                icon={<LoginOutlined />}
                className={styles.loginButton}
                onClick={() => onShowSignIn(handleLoginSuccess)}
              >
                Đăng nhập
              </Button>
            </Space>
          )}
        </Col>{" "}
        {/* Menu icon cho mobile */}
        <Col
          xs={10}
          sm={8}
          md={0}
          lg={0}
          xl={0}
          className={styles.mobileMenuCol}
        >
          <Space>
            <Link to="/cart">
              <Badge count={cartItemCount} size="small">
                <Button
                  type="text"
                  icon={<ShoppingCartOutlined />}
                  className={styles.iconButton}
                />
              </Badge>
            </Link>

            <Button
              type="text"
              icon={<MenuOutlined />}
              onClick={() => setDrawerOpen(true)}
              className={styles.menuButton}
            />
          </Space>
        </Col>
      </Row>

      {/* Drawer Menu for Mobile */}
      <Drawer
        title={
          <Link to="/" onClick={() => setDrawerOpen(false)}>
            <span className={styles.drawerTitle}>S-Fashion</span>
          </Link>
        }
        placement="right"
        width={window.innerWidth < 500 ? "80%" : 300}
        onClose={() => setDrawerOpen(false)}
        open={drawerOpen}
        styles={{ padding: 0, borderBottom: "1px solid #f0f0f0" }}
      
      >
        <div className={styles.drawerContent}>
          {/* Search box in drawer */}
          <div className={styles.drawerSearch}>
            <Search
              placeholder="Tìm kiếm sản phẩm..."
              onSearch={handleSearch}
              enterButton
            />
          </div>

          <Menu
            mode="inline"
            selectedKeys={[location.pathname]}
            style={{ borderRight: 0 }}
          >
            <Menu.Item
              key="/"
              icon={<HomeOutlined />}
              onClick={() => setDrawerOpen(false)}
            >
              <Link to="/">Trang chủ</Link>
            </Menu.Item>

            <Menu.Item
              key="/fitting_room"
              icon={<ExperimentOutlined />}
              onClick={() => setDrawerOpen(false)}
            >
              <Link to="/fitting_room">Phòng thử đồ</Link>
            </Menu.Item>

            <Menu.Item
              key="/cart"
              icon={<ShoppingCartOutlined />}
              onClick={() => setDrawerOpen(false)}
            >
              <Link to="/cart">Giỏ hàng ({cartItemCount})</Link>
            </Menu.Item>

            <Divider style={{ margin: "8px 0" }} />

            {isLoggedIn ? (
              <>
                <Menu.Item
                  key="/profile"
                  icon={<UserOutlined />}
                  onClick={() => setDrawerOpen(false)}
                >
                  <Link to="/profile">Thông tin tài khoản</Link>
                </Menu.Item>

                <Menu.Item
                  key="/profile/my-order"
                  icon={<ShoppingOutlined />}
                  onClick={() => setDrawerOpen(false)}
                >
                  <Link to="/profile/my-order">Đơn hàng của tôi</Link>
                </Menu.Item>

                {user?.isAdmin && (
                  <Menu.Item
                    key="/system/admin"
                    icon={<SettingOutlined />}
                    onClick={() => setDrawerOpen(false)}
                  >
                    <Link to="/system/admin">Quản lý hệ thống</Link>
                  </Menu.Item>
                )}

                <Divider style={{ margin: "8px 0" }} />

                <Menu.Item
                  key="logout"
                  icon={<LogoutOutlined />}
                  onClick={handleLogout}
                >
                  Đăng xuất
                </Menu.Item>
              </>
            ) : (
              <Menu.Item
                key="login"
                icon={<LoginOutlined />}
                onClick={() => {
                  setDrawerOpen(false);
                  onShowSignIn(handleLoginSuccess);
                }}
              >
                Đăng nhập / Đăng ký
              </Menu.Item>
            )}
          </Menu>
        </div>
      </Drawer>
    </Header>
  );
}

export default AppHeader;
