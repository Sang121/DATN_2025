// src/components/Header/Header.jsx
import React, { useState, useEffect } from "react";
import {
  ShoppingCartOutlined,
  UserOutlined,
  SearchOutlined,
  LogoutOutlined,
  MenuOutlined,
  ShoppingOutlined,
  HomeOutlined,
  SettingOutlined,
  LoginOutlined,
  DashboardOutlined,
  ExperimentOutlined,
  HeartOutlined,
  BellOutlined,
  DownOutlined,
  CloseOutlined,
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
  AutoComplete,
} from "antd";
import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { updateUser, logout } from "../../redux/slices/userSlice";
import { clearOrder } from "../../redux/slices/orderSlice";
import { logoutUser } from "../../services/userService";

const { Header } = Layout;
const { Text } = Typography;
const { Search } = Input;

function AppHeader({ onShowSignIn }) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const navigate = useNavigate();
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
      const scrollTop = window.scrollY;
      if (scrollTop > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // Cập nhật thời gian hiện tại
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
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
      <div className={styles.headerContainer}>
        {/* Logo Section */}
        <div className={styles.logoSection}>
          <Link to="/" className={styles.logoLink}>
            <div className={styles.logo}>
              <span className={styles.logoIcon}>S</span>
              <span className={styles.logoText}>Fashion</span>
            </div>
          </Link>
        </div>

        {/* Search Section - Desktop */}
        <div className={styles.searchSection}>
          <div className={styles.searchWrapper}>
            <Input.Search
              placeholder="Tìm kiếm sản phẩm, thương hiệu..."
              enterButton={
                <Button
                  type="primary"
                  icon={<SearchOutlined />}
                  className={styles.searchButton}
                />
              }
              size="large"
              onSearch={handleSearch}
              className={styles.searchInput}
              allowClear
            />
          </div>
        </div>

        {/* Navigation Section - Desktop */}
        <div className={styles.navSection}>
          {isLoggedIn ? (
            <div className={styles.navItems}>
              <Tooltip title="Yêu thích" placement="bottom">
                <Link to="/favoriteProducts" className={styles.navItem}>
                  <HeartOutlined className={styles.navIcon} />
                </Link>
              </Tooltip>

              <Tooltip title="Giỏ hàng" placement="bottom">
                <Link to="/cart" className={styles.navItem}>
                  <Badge
                    count={cartItemCount}
                    size="small"
                    className={
                      cartItemCount > 0
                        ? `${styles.badge} ${styles.hasNotifications}`
                        : styles.badge
                    }
                  >
                    <ShoppingCartOutlined className={styles.navIcon} />
                  </Badge>
                </Link>
              </Tooltip>

              <Tooltip title="Thông báo" placement="bottom">
                <div className={styles.navItem}>
                  <Badge
                    count={3}
                    size="small"
                    className={`${styles.badge} ${styles.hasNotifications}`}
                  >
                    <BellOutlined
                      className={`${styles.navIcon} ${styles.notificationBell}`}
                    />
                  </Badge>
                </div>
              </Tooltip>
              <Dropdown
                overlay={userMenu}
                trigger={["click"]}
                placement="bottomRight"
                className={styles.userDropdown}
              >
                <div className={styles.userProfile}>
                  <Avatar
                    size={32}
                    className={styles.userAvatar}
                    icon={<UserOutlined />}
                  />
                  <div className={styles.userInfo}>
                    <span className={styles.userName}>
                      {user.username || "Tài khoản"}
                    </span>
                    <DownOutlined className={styles.dropdownIcon} />
                  </div>
                </div>
              </Dropdown>
            </div>
          ) : (
            <div className={styles.navItems}>
              <Link to="/favoriteProducts" className={styles.navItem}>
                <HeartOutlined className={styles.navIcon} />
                <span className={styles.navLabel}>Yêu thích</span>
              </Link>

              <Link to="/cart" className={styles.navItem}>
                <Badge
                  count={cartItemCount}
                  size="small"
                  className={
                    cartItemCount > 0
                      ? `${styles.badge} ${styles.hasNotifications}`
                      : styles.badge
                  }
                >
                  <ShoppingCartOutlined className={styles.navIcon} />
                </Badge>
                <span className={styles.navLabel}>Giỏ hàng</span>
              </Link>

              <Button
                type="primary"
                icon={<LoginOutlined />}
                className={styles.loginButton}
                onClick={() => onShowSignIn(handleLoginSuccess)}
              >
                Đăng nhập
              </Button>
            </div>
          )}
        </div>

        {/* Mobile Menu */}
        <div className={styles.mobileSection}>
          <div className={styles.mobileActions}>
            <Tooltip title="Giỏ hàng" placement="bottom">
              <Link to="/cart" className={styles.navItem}>
                <Badge
                  count={cartItemCount}
                  size="small"
                  className={
                    cartItemCount > 0
                      ? `${styles.badge} ${styles.hasNotifications}`
                      : styles.badge
                  }
                >
                  <ShoppingCartOutlined className={styles.navIcon} />
                </Badge>
              </Link>
            </Tooltip>

            <Button
              type="text"
              icon={drawerOpen ? <CloseOutlined /> : <MenuOutlined />}
              onClick={() => setDrawerOpen(!drawerOpen)}
              className={styles.menuToggle}
            />
          </div>
        </div>
      </div>

      {/* Modern Mobile Drawer */}
      <Drawer
        title={null}
        placement="right"
        width="300px"
        onClose={() => setDrawerOpen(false)}
        open={drawerOpen}
        className={styles.mobileDrawer}
        closeIcon={null}
        styles={{
          body: { padding: 0 },
          header: { display: "none" },
        }}
        transitionName="slide"
        maskTransitionName="fade"
      >
        <div className={styles.drawerContent}>
          {/* Drawer Header */}
          <div className={styles.drawerHeader}>
            <Link to="/" onClick={() => setDrawerOpen(false)}>
              <div className={styles.drawerLogo}>
                <span className={styles.logoIcon}>S</span>
                <span className={styles.logoText}>Fashion</span>
              </div>
            </Link>
            <Button
              type="text"
              icon={<CloseOutlined />}
              onClick={() => setDrawerOpen(false)}
              className={styles.drawerClose}
            />
          </div>

          {/* Mobile Search */}
          <div className={styles.drawerSearch}>
            <Input.Search
              placeholder="Tìm kiếm sản phẩm..."
              onSearch={(value) => {
                handleSearch(value);
                setDrawerOpen(false);
              }}
              enterButton
              size="large"
              className={styles.mobileSearchInput}
            />
          </div>

          {/* User Section */}
          {isLoggedIn && (
            <div className={styles.drawerUserSection}>
              <div className={styles.drawerUserInfo}>
                <Avatar
                  size={48}
                  className={styles.drawerUserAvatar}
                  icon={<UserOutlined />}
                />
                <div className={styles.drawerUserDetails}>
                  <span className={styles.drawerUserName}>
                    {user.username || "Tài khoản"}
                  </span>
                  <span className={styles.drawerUserRole}>
                    {user.isAdmin ? "Quản trị viên" : "Khách hàng"}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Menu */}
          <div className={styles.drawerMenu}>
            <div
              className={styles.drawerMenuItem}
              onClick={() => setDrawerOpen(false)}
            >
              <Link to="/" className={styles.drawerMenuLink}>
                <HomeOutlined className={styles.drawerMenuIcon} />
                <span>Trang chủ</span>
              </Link>
            </div>

            <div
              className={styles.drawerMenuItem}
              onClick={() => setDrawerOpen(false)}
            >
              <Link to="/favoriteProducts" className={styles.drawerMenuLink}>
                <HeartOutlined className={styles.drawerMenuIcon} />
                <span>Yêu thích</span>
              </Link>
            </div>

            {isLoggedIn && (
              <div
                className={styles.drawerMenuItem}
                onClick={() => setDrawerOpen(false)}
              >
                <Link to="/notifications" className={styles.drawerMenuLink}>
                  <BellOutlined className={styles.drawerMenuIcon} />
                  <span>Thông báo</span>
                  <Badge count={3} className={styles.drawerBadge} />
                </Link>
              </div>
            )}

            <div
              className={styles.drawerMenuItem}
              onClick={() => setDrawerOpen(false)}
            >
              <Link to="/cart" className={styles.drawerMenuLink}>
                <ShoppingCartOutlined className={styles.drawerMenuIcon} />
                <span>Giỏ hàng</span>
                {cartItemCount > 0 && (
                  <Badge count={cartItemCount} className={styles.drawerBadge} />
                )}
              </Link>
            </div>

            {isLoggedIn ? (
              <>
                <div className={styles.drawerDivider} />

                <div
                  className={styles.drawerMenuItem}
                  onClick={() => setDrawerOpen(false)}
                >
                  <Link to="/profile" className={styles.drawerMenuLink}>
                    <UserOutlined className={styles.drawerMenuIcon} />
                    <span>Thông tin tài khoản</span>
                  </Link>
                </div>

                <div
                  className={styles.drawerMenuItem}
                  onClick={() => setDrawerOpen(false)}
                >
                  <Link
                    to="/profile/my-order"
                    className={styles.drawerMenuLink}
                  >
                    <ShoppingOutlined className={styles.drawerMenuIcon} />
                    <span>Đơn hàng của tôi</span>
                  </Link>
                </div>

                {user?.isAdmin && (
                  <div
                    className={styles.drawerMenuItem}
                    onClick={() => setDrawerOpen(false)}
                  >
                    <Link to="/system/admin" className={styles.drawerMenuLink}>
                      <DashboardOutlined className={styles.drawerMenuIcon} />
                      <span>Quản lý hệ thống</span>
                    </Link>
                  </div>
                )}

                <div className={styles.drawerDivider} />

                <div className={styles.drawerMenuItem} onClick={handleLogout}>
                  <div className={styles.drawerMenuLink}>
                    <LogoutOutlined className={styles.drawerMenuIcon} />
                    <span>Đăng xuất</span>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className={styles.drawerDivider} />
                <div className={styles.drawerMenuItem}>
                  <Button
                    type="primary"
                    block
                    size="large"
                    icon={<LoginOutlined />}
                    onClick={() => {
                      setDrawerOpen(false);
                      onShowSignIn(handleLoginSuccess);
                    }}
                    className={styles.drawerLoginButton}
                  >
                    Đăng nhập / Đăng ký
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      </Drawer>
    </Header>
  );
}

export default AppHeader;
