// src/components/Header/Header.jsx
import React, { useState, useEffect } from "react";
import {
  FaSearch,
  FaUserCircle,
  FaShoppingCart,
  FaPersonBooth,
  FaSignOutAlt,
  FaBars,
} from "react-icons/fa";
import styles from "./Header.module.css";
import { Row, Col, Drawer, Popover } from "antd";
import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { updateUser, logout } from "../../redux/slices/userSlice";
import { logoutUser } from "../../services/userService";
import { message as antdMessage } from "antd";

import { searchProduct } from "../../services/productService";
function Header({ onShowSignIn }) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user);
  const currentUsername = user.username;
  const currentIsLoggedIn = !!user.access_token;
const order = useSelector((state) => state.order);
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
  }, [user.refresh_token]);

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
  const handleSearch = () => {
    const trimmedSearchTerm = searchTerm.trim();
    if (trimmedSearchTerm) {
     
      navigate(`/search/${encodeURIComponent(trimmedSearchTerm)}`);
      setDrawerOpen(false);
    }
  };
  const handleLogout = () => {
    sessionStorage.clear();
    dispatch(logout());
    logoutUser()
      .then(() => {
        console.log("Logout successful");
        antdMessage.success("Đăng xuất thành công!");
        setDrawerOpen(false);
        navigate("/");
      })
      .catch((error) => {
        console.error("Logout failed:", error);
      });
  };

  const handleLoginSuccess = (userData) => {
    if (userData) {
      dispatch(updateUser(userData));
    }
  };

  return (
    <header className={styles.header}>
      <div className={styles["header-container"]}>
        <Row
          align="middle"
          gutter={[16, 16]}
          style={{ width: "100%" }}
          className={styles["header-row"]}
        >
          <Col xs={20} sm={8} md={6} lg={3} className={styles.logo}>
            <Link to="/" className={styles["logo-link"]}>
              Ecommerce
            </Link>
          </Col>

          <Col
            xs={0}
            sm={16}
            md={12}
            lg={9}
            className={styles["search-bar-container"]}
          >
            <input
              type="text"
              placeholder="Tìm sản phẩm, danh mục hay thương hiệu mong muốn..."
              className={styles["search-input"]}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />
            <button className={styles["search-button"]} onClick={handleSearch}>
              <FaSearch className={styles["search-icon"]} />
              Tìm kiếm
            </button>
          </Col>

          <Col
            xs={0}
            sm={0}
            md={6}
            lg={10}
            className={styles["actions-container"]}
            style={{ justifyContent: "flex-end" }}
          >
            {currentIsLoggedIn ? (
              <div className={styles["action-item"]}>
                <FaUserCircle className={styles["action-icon"]} />
                <div className={styles["account-text-container"]}>
                  <Popover
                    content={
                      <div className={styles["popover-content"]}>
                        <Link to="/profile" className={styles["account-link"]}>
                          <span className={styles["account-btn"]}>
                            Thông tin tài khoản
                          </span>
                        </Link>
                        {user?.isAdmin && (
                          <Link
                            to="/system/admin"
                            className={styles["account-link"]}
                          >
                            <span className={styles["account-btn"]}>
                              Quản lý hệ thống
                            </span>
                          </Link>
                        )}
                        <span
                          onClick={handleLogout}
                          className={styles["logout-btn"]}
                        >
                          {" "}
                          <FaSignOutAlt className={styles["action-icon"]} />
                        </span>
                      </div>
                    }
                    trigger="click"
                  >
                    <span className={styles["bold-text"]}>
                      {currentUsername || "Tài khoản"}{" "}
                    </span>
                  </Popover>
                </div>
              </div>
            ) : (
              <div className={styles["action-item"]}>
                <FaUserCircle className={styles["action-icon"]} />
                <div className={styles["account-text-container"]}>
                  <span
                    className={styles.clickable}
                    onClick={() => onShowSignIn(handleLoginSuccess)}
                  >
                    Đăng Nhập/Đăng Ký
                  </span>
                </div>
              </div>
            )}
            <Link to="/cart" className={styles["action-item"]}>
              <FaShoppingCart className={styles["action-icon"]} />
              <span className={styles["cart-text"]}>Giỏ Hàng</span>
              <span className={styles["cart-count"]}>{order.orderItems.length}</span>
            </Link>
            <Link to="/fitting_room" className={styles["action-item"]}>
              <FaPersonBooth className={styles["action-icon"]} />
              <span className={styles["cart-text"]}>Phòng thử đồ</span>
            </Link>
          </Col>

          <Col
            xs={4}
            sm={0}
            md={0}
            lg={0}
            className={styles["menu-mobile-col"]}
          >
            <FaBars
              className={styles["menu-mobile-icon"]}
              onClick={() => setDrawerOpen(true)}
            />
          </Col>
        </Row>
      </div>

      <Drawer
        placement="left"
        onClose={() => setDrawerOpen(false)}
        open={drawerOpen}
        width={window.innerWidth < 500 ? "80vw" : 220}
      >
        <div className={styles["actions-container-mobile"]}>
          {currentIsLoggedIn ? (
            <div className={styles["action-item"]}>
              <FaUserCircle className={styles["action-icon"]} />
              <div className={styles["account-text-container"]}>
                <Link to="/account" onClick={() => setDrawerOpen(false)}>
                  <span className={styles["bold-text"]}>Tài khoản</span>
                </Link>
              </div>
            </div>
          ) : (
            <div
              className={styles["action-item"]}
              onClick={() => {
                onShowSignIn(handleLoginSuccess);
                setDrawerOpen(false);
              }}
            >
              <FaUserCircle className={styles["action-icon"]} />
              <div className={styles["account-text-container"]}>
                <span className={styles.clickable}>Đăng Nhập Đăng Ký</span>
              </div>
            </div>
          )}
          <Link
            to="/cart"
            className={styles["action-item"]}
            onClick={() => setDrawerOpen(false)}
          >
            <FaShoppingCart className={styles["action-icon"]} />
            <span className={styles["cart-text"]}>Giỏ Hàng</span>
            <span className={styles["cart-count"]}>3</span>
          </Link>
          <Link
            to="/fitting_room"
            className={styles["action-item"]}
            onClick={() => setDrawerOpen(false)}
          >
            <FaPersonBooth className={styles["action-icon"]} />
            <span className={styles["cart-text"]}>Phòng thử đồ</span>
          </Link>
        </div>
      </Drawer>
    </header>
  );
}

export default Header;
