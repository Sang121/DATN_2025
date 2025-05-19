import React, { useState } from "react";
import {
  FaSearch,
  FaUserCircle,
  FaShoppingCart,
  FaPersonBooth,
  FaBars,
} from "react-icons/fa";
import "./Header.css";
import { Row, Col, Grid, Drawer } from "antd";
import { Link } from "react-router-dom";

const { useBreakpoint } = Grid;

function Header({ onShowSignIn }) {
  const screens = useBreakpoint();
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <header className="header">
      <div className="header-container">
        <Row align="middle" gutter={[16, 16]} style={{ width: "100%" }}>
          <Col xs={20} sm={8} md={6} lg={3} className="logo">
            <a href="/" className="logo-link">
              Ecommerce
            </a>
          </Col>

          <Col xs={0} sm={16} md={12} lg={8} className="search-bar-container">
            <input
              type="text"
              placeholder="Tìm sản phẩm, danh mục hay thương hiệu mong muốn..."
              className="search-input"
            />
            <button className="search-button">
              <FaSearch className="search-icon" />
              Tìm kiếm
            </button>
          </Col>

          {/* Actions: Hiện trên desktop, ẩn trên mobile */}
          <Col
            xs={0}
            sm={0}
            md={6}
            lg={10}
            className="actions-container"
            style={{ justifyContent: "flex-end" }}
          >
            <div className="action-item">
              <FaUserCircle className="action-icon" />
              <div className="account-text-container ">
                <span style={{ cursor: "pointer" }} onClick={onShowSignIn}>
                  Đăng Nhập Đăng Ký
                </span>
                <Link to="/account">
                  <span style={{ fontWeight: "500" }}>Tài khoản</span>
                </Link>
              </div>
            </div>
            <Link to="/cart" className="action-item">
              <FaShoppingCart className="action-icon" />
              <span className="cart-text">Giỏ Hàng</span>
              <span className="cart-count">3</span>
            </Link>
            <Link to="/fitting_room" className="action-item">
              <FaPersonBooth className="action-icon" />
              <span className="cart-text">Phòng thử đồ</span>
            </Link>
          </Col>

       
          <Col xs={4} sm={0} md={0} lg={0} className="menu-mobile-col">
            <FaBars
              className="menu-mobile-icon"
              onClick={() => setDrawerOpen(true)}
            />
          </Col>
        </Row>
      </div>
      {/* Drawer cho mobile menu */}
      <Drawer
        placement="left" 
        onClose={() => setDrawerOpen(false)}
        open={drawerOpen}
        width={window.innerWidth < 500 ? "80vw" : 220}
      >
        <div className="actions-container-mobile">
          <div
            className="action-item"
            onClick={() => alert("Chức năng tài khoản!")}
          >
            <FaUserCircle className="action-icon" />
            <div className="account-text-container">
              <span>Đăng Nhập / Đăng Ký</span>
              <span style={{ fontWeight: "500" }}>Tài khoản</span>
            </div>
          </div>
          <a href="/cart" className="action-item">
            <FaShoppingCart className="action-icon" />
            <span className="cart-text">Giỏ Hàng</span>
            <span className="cart-count">3</span>
          </a>
          <a href="/fitting_room" className="action-item">
            <FaPersonBooth className="action-icon" />
            <span className="cart-text">Phòng thử đồ</span>
          </a>
        </div>
      </Drawer>
    </header>
  );
}

export default Header;
