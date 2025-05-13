import React from 'react';
import { FaSearch, FaUserCircle, FaShoppingCart } from 'react-icons/fa';
// Để sử dụng logo thực tế, bạn có thể import nó như sau:
// import tikiLogo from './assets/tiki-logo.png'; // Đảm bảo đường dẫn đúng và bạn có file logo

function Header() {
  // Styles inline (cân nhắc chuyển sang file CSS riêng cho các ứng dụng lớn hơn)
  const styles = {
    header: {
      backgroundColor: '#1A94FF', // Màu xanh của Tiki
      padding: '10px 0',
      color: 'white',
      fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif', // Font chữ phổ biến
    },
    container: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '0 15px',
    },
    logo: {
      marginRight: '30px',
    },
    logoLink: {
      textDecoration: 'none',
      color: 'white',
      fontSize: '30px', // Kích thước chữ cho logo
      fontWeight: 'bold',
    },
    // logoImage: { // Bỏ comment và sử dụng nếu bạn có file ảnh logo
    //   height: '40px', // Điều chỉnh chiều cao nếu cần
    //   verticalAlign: 'middle',
    // },
    searchBarContainer: {
      flexGrow: 1,
      display: 'flex',
      maxWidth: '650px', // Chiều rộng tối đa cho thanh tìm kiếm
    },
    searchInput: {
      flexGrow: 1,
      padding: '10px 15px',
      border: 'none',
      borderRadius: '3px 0 0 3px', // Bo góc bên trái
      fontSize: '14px',
      outline: 'none',
      color: '#333', // Màu chữ khi nhập liệu
    },
    searchButton: {
      backgroundColor: '#0D5CB6', // Màu xanh đậm hơn cho nút tìm kiếm
      color: 'white',
      border: 'none',
      padding: '0 20px',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      fontSize: '14px',
      borderRadius: '0 3px 3px 0', // Bo góc bên phải
    },
    searchIcon: {
      marginRight: '8px',
    },
    actionsContainer: {
      display: 'flex',
      alignItems: 'center',
      marginLeft: '30px',
    },
    actionItem: {
      display: 'flex',
      alignItems: 'center',
      cursor: 'pointer',
      marginLeft: '25px', // Khoảng cách giữa các mục action
      textDecoration: 'none',
      color: 'white',
    },
    actionIcon: {
      marginRight: '8px',
      fontSize: '22px', // Kích thước icon
    },
    accountTextContainer: {
      display: 'flex',
      flexDirection: 'column',
      fontSize: '12px',
      lineHeight: '1.3',
    },
    cartText: {
      fontSize: '13px',
    },
    cartCount: {
      backgroundColor: 'rgb(253, 216, 53)', // Màu vàng của Tiki cho số lượng trong giỏ hàng
      color: 'rgb(74, 74, 74)',
      borderRadius: '10px',
      padding: '1px 7px',
      fontSize: '11px',
      fontWeight: 'bold',
      marginLeft: '5px',
      minWidth: '10px', // Đảm bảo hình tròn nếu số nhỏ
      textAlign: 'center',
      lineHeight: '15px', // Căn giữa số theo chiều dọc
      height: '17px',
    },
  };

  return (
   
    <header style={styles.header}>
      <div style={styles.container}>
        {/* Logo */}
        <div style={styles.logo}>
          <a href="/" style={styles.logoLink}>
            {/* <img src={tikiLogo} alt="Tiki" style={styles.logoImage} /> */}
            LOGO {/* Placeholder - Thay bằng logo thực tế của bạn */}
          </a>
        </div>

        {/* Thanh tìm kiếm */}
        <div style={styles.searchBarContainer}>
          <input
            type="text"
            placeholder="Tìm sản phẩm, danh mục hay thương hiệu mong muốn..."
            style={styles.searchInput}
          />
          <button style={styles.searchButton}>
            <FaSearch style={styles.searchIcon} />
            Tìm kiếm
          </button>
        </div>

        {/* Các action: Tài khoản, Giỏ hàng */}
        <div style={styles.actionsContainer}>
          <div style={styles.actionItem} onClick={() => alert('Chức năng tài khoản!')}> {/* Ví dụ xử lý sự kiện click */}
            <FaUserCircle style={styles.actionIcon} />
            <div style={styles.accountTextContainer}>
              <span>Đăng Nhập / Đăng Ký</span>
              <span style={{fontWeight: '500'}}>Tài khoản</span>
            </div>
          </div>

          <a href="/cart" style={styles.actionItem}> {/* Liên kết đến trang giỏ hàng */}
            <FaShoppingCart style={styles.actionIcon} />
            <span style={styles.cartText}>Giỏ Hàng</span>
            <span style={styles.cartCount}>0</span> {/* Placeholder cho số lượng sản phẩm trong giỏ */}
          </a>
        </div>
      </div>

      {/* Tùy chọn: Thanh điều hướng phụ (danh mục) như của Tiki */}
      {/*
      <nav style={{ backgroundColor: '#1A94FF', borderTop: '1px solid rgba(255,255,255,0.2)', padding: '8px 0' }}>
        <div style={{ ...styles.container, justifyContent: 'flex-start', fontSize: '13px', flexWrap: 'wrap' }}>
          <a href="#" style={{ color: 'white', marginRight: '20px', textDecoration: 'none', padding: '5px 0' }}>Trái Cây</a>
          <a href="#" style={{ color: 'white', marginRight: '20px', textDecoration: 'none', padding: '5px 0' }}>Thịt, Trứng</a>
          <a href="#" style={{ color: 'white', marginRight: '20px', textDecoration: 'none', padding: '5px 0' }}>Rau Củ Quả</a>
          <a href="#" style={{ color: 'white', marginRight: '20px', textDecoration: 'none', padding: '5px 0' }}>Sữa, bơ, phô mai</a>
          <a href="#" style={{ color: 'white', marginRight: '20px', textDecoration: 'none', padding: '5px 0' }}>Hải Sản</a>
        </div>
      </nav>
      */}
    </header>
  );
}

export default Header;