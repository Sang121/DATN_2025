import React from "react";
import styles from "./BelowHeader.module.css";
import { Row, Col } from "antd";
import { FaCheckCircle, FaTruck, FaBox, FaTag } from "react-icons/fa";

export default function BelowHeader() {
  return (
    <div className={styles["below-header-container"]}>
      <Row
        align="middle"
        justify="center"
        className={styles["below-header-row"]}
      >
        <Col xs={0} sm={0} md={4} lg={3}>
          <div className={styles["below-header-title"]}>Cam kết</div>
        </Col>

        <Col xs={0} sm={0} md={18} lg={20}>
          <Row
            align="middle"
            justify="center"
            gutter={[
              { xs: 0, sm: 0, md: 10, lg: 10 },
              { xs: 0, sm: 0, md: 0, lg: 0 },
            ]}
            className={styles["below-header-list"]}
          >
            <Col xs={0} sm={0} md={5} lg={5}>
              <div className={styles["below-header-item"]}>
                <span className={styles["below-header-icon"]}>
                  <FaCheckCircle />
                </span>
                <span>100% hàng thật</span>
              </div>
            </Col>

            <Col xs={0} sm={0} md={5} lg={5}>
              <div className={styles["below-header-item"]}>
                <span className={styles["below-header-icon"]}>
                  <FaTruck />
                </span>
                <span>Freeship đơn trên 500k</span>
              </div>
            </Col>

            <Col xs={0} sm={0} md={5} lg={5}>
              <div className={styles["below-header-item"]}>
                <span className={styles["below-header-icon"]}>
                  <FaBox />
                </span>
                <span>30 ngày đổi hàng</span>
              </div>
            </Col>

            <Col xs={0} sm={0} md={5} lg={5}>
              <div className={styles["below-header-item"]}>
                <span className={styles["below-header-icon"]}>
                  <FaTag />
                </span>
                <span>Giá siêu rẻ</span>
              </div>
            </Col>
          </Row>
        </Col>
      </Row>
    </div>
  );
}
