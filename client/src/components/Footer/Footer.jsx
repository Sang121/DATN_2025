import React from "react";
import styles from "./Footer.module.css";
import { Link } from "react-router-dom";
import { FaFacebook, FaInstagram } from "react-icons/fa";
function Footer() {
  return (
    <div className={styles.footer}>
      <div className={styles.line1}>
        <ul>
          <li>
            <a href="https://help.shopee.vn/portal/article/77244">
              Chính sách bảo mật
            </a>
          </li>
          <li>
            <a href="https://help.shopee.vn/portal/article/77245">
              Quy chế hoạt động
            </a>
          </li>
          <li>
            <a href="https://help.shopee.vn/portal/article/77250">
              Chính sách vận chuyển
            </a>
          </li>
          <li>
            <a href="https://help.shopee.vn/portal/article/77251">
              Chính sách hoàn hàng và trả tiền
            </a>
          </li>
        </ul>
      </div>
      <div className={styles.line2}>
        <a href="https://www.facebook.com/Libra245" className={styles.homeBtn}>
          <button type="button" className={styles.btn}>
            <FaFacebook className={styles.action_icon} /> Facebook
          </button>
        </a>
     
        <a href="https://www.instagram.com/imsn.02/" className={styles.homeBtn}>
          <button type="button" className={styles.btn}>
            <FaInstagram className={styles.action_icon} /> Instagram
          </button>
        </a>
      </div>
      <div className={styles.line3}>
        <ul>
          <li>
            Địa chỉ: Quang trung, Yên Nghĩa, Thành phố Hà Nội, Việt Nam. Tổng
            đài hỗ trợ: 0345123230 - Email: 20010797@st.phenikaa-uni.edu.vn
          </li>
          <li>
            Chịu Trách Nhiệm Quản Lý Nội Dung: Sáng - Điện thoại liên hệ:
            0352797320
          </li>
          <li> </li>
          <li>© 2023 - Bản quyền thuộc về Công ty TNHH 1 thành viên</li>
        </ul>
      </div>
    </div>
  );
}

export default Footer;
