import React from 'react';
import { FaSearch, FaUserCircle, FaShoppingCart, FaPersonBooth } from 'react-icons/fa';
import './Header.css';
import BelowHeader from '../BelowHeader/BelowHeader';
// import tikiLogo from './assets/tiki-logo.png';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
function Header() {
  return (
    <header className="header">
      <div className="header-container">
        {/* Logo */}
        <div className="logo">
          <a href="/" className="logo-link">
            {/* <img src={tikiLogo} alt="Tiki" className="logo-image" /> */}
            LOGO
          </a>
        </div>

        {/* Thanh tìm kiếm */}
        <div className="search-bar-container">
          <input
            type="text"
            placeholder="Tìm sản phẩm, danh mục hay thương hiệu mong muốn..."
            className="search-input"
          />
          <button className="search-button">
            <FaSearch className="search-icon" />
            Tìm kiếm
          </button>
        </div>

        {/* Các action: Tài khoản, Giỏ hàng */}
        <div className="actions-container">
          <div className="action-item" onClick={() => alert('Chức năng tài khoản!')}>
            <FaUserCircle className="action-icon" />
            <div className="account-text-container">
              <span>Đăng Nhập / Đăng Ký</span>
              <span style={{ fontWeight: '500' }}>Tài khoản</span>
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
      </div>

      {/* Thanh điều hướng phụ (danh mục) nếu cần */}
      {/* ... */}
    </header>
  );
}

export default Header;