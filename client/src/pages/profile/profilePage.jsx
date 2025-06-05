import React from "react";
import styles from "./profilePage.module.css";
import { Link } from "react-router-dom";
import { Button, Form, Input, Radio } from "antd";
import UserUpdate from "../../components/updateUser/userUpdate";

function ProfilePage() {
  const user = JSON.parse(sessionStorage.getItem("userState"))?.user || {};
  return (
    <main>
      <div className={styles.profileContainer}>
        <div className={styles.profile}>
          <div className={styles.breadcrumbContainer}>
            <div className={styles.breadcrumb}>
              <Link className={styles.breadcrumbItem} to="/">
                Trang Chủ
              </Link>
              <span className={styles.icon}>
                <svg
                  width="6"
                  height="11"
                  viewBox="0 0 6 11"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fill="#808089"
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M0.646447 0.646447C0.841709 0.451184 1.15829 0.451184 1.35355 0.646447L6.35355 5.64645C6.54882 5.84171 6.54882 6.15829 6.35355 6.35355L1.35355 11.3536C1.15829 11.5488 0.841709 11.5488 0.646447 11.3536C0.451184 11.1583 0.451184 10.8417 0.646447 10.6464L5.29289 6L0.646447 1.35355C0.451184 1.15829 0.451184 0.841709 0.646447 0.646447Z"
                  ></path>
                </svg>
              </span>
              <Link
                to="#"
                className={styles.breadcrumbItem}
                data-view-id="breadcrumb_item"
                data-view-index="1"
              >
                <span title="Thông tin tài khoản">Thông tin tài khoản</span>
              </Link>
            </div>
          </div>
          <div className={styles.sidebar}>
            <div children={styles.sidebarHeader}>
              <span className={styles.accountInfo}>
                Tài khoản của: <strong> {user.username}</strong>
              </span>
            </div>
            <ul>
              <li>
                <a>Thông tin tài khoản</a>
              </li>
              <li>
                <a> Quản lý đơn hàng</a>
              </li>
            </ul>
          </div>
          <div className={styles.profileContent}>
            <div className={styles.mainProfile}>
              <div className={styles.infoLeft}>
                <div
                  style={{
                    backgroundColor: "rgb(255, 255, 255)",
                    borderRadius: "4px",
                    marginTop: "16px",
                  }}
                >
                  <UserUpdate />
                </div>
              </div>
              {/* <div className={styles.vertical}></div>
              <div className={styles.infoRight}>
                <h2>Email và số điện thoại</h2>
              </div> */}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default ProfilePage;
