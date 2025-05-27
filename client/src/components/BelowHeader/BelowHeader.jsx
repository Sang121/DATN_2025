import React from "react";
import styles from "./BelowHeader.module.css";
import { Row, Col } from "antd"; 
import {
  FaCheckCircle,
  FaTruck,
  FaSyncAlt,
  FaBox,
  FaTag,
} from "react-icons/fa";

export default function BelowHeader() {
  return (
    <div className={styles["below-header-container"]}>
      <Row
        align="middle" 
        justify="center" 
        className={styles["below-header-row"]} 
      >
    
        <Col xs={0} sm={24} md={4} lg={3}>
          {" "}
          <div className={styles["below-header-title"]}>Cam kết</div>
        </Col>

        {/* List of items */}
        <Col xs={0} sm={24} md={18} lg={20}>
          {" "}
          <Row
            align="middle"
            justify="center" 
            gap='5px'
            gutter={[
              { xs: 0, sm: 5, md: 10, lg:10 }, // Gutter ngang: 0px trên xs/sm, 10px trên md, 10px trên lg
              { xs: 0, sm: 16, md: 0, lg: 0 },
            ]}
            className={styles["below-header-list"]} // Áp dụng style cũ cho list
          >
            {/* Item 1 */}
            <Col xs={0} sm={8} md={4} lg={4}>
              {" "}
              {/* Full width on xs, 1/3 on sm, 1/5 on md/lg */}
              <div className={styles["below-header-item"]}>
                <span className={styles["below-header-icon"]}>
                  <FaCheckCircle />
                </span>
                <span>100% hàng thật</span>
              </div>
            </Col>
            {/* Divider (Optional: hide on small screens) */}
            <Col xs={0} sm={0} md={0} lg={0}>
              {" "}
              {/* Hidden on all small screens, can make visible for larger tablets if needed */}
              {/* Ant Design Col renders nothing if xs=0, sm=0 etc. We'll handle divider visibility purely with CSS for better control. */}
            </Col>
            {/* Item 2 */}
            <Col xs={0} sm={8} md={4} lg={4}>
              <div className={styles["below-header-item"]}>
                <span className={styles["below-header-icon"]}>
                  <FaTruck />
                </span>
                <span>Freeship mọi đơn</span>
              </div>
            </Col>
            {/* Divider */}
            <Col xs={0} sm={0} md={0} lg={0}></Col> {/* See above note */}
            {/* Item 3 */}
            <Col xs={0} sm={9} md={5} lg={5}>
              <div className={styles["below-header-item"]}>
                <span className={styles["below-header-icon"]}>
                  <FaSyncAlt />
                </span>
                <span>Hoàn 200% nếu hàng giả</span>
              </div>
            </Col>
            {/* Divider */}
            <Col xs={0} sm={0} md={0} lg={0}></Col> {/* See above note */}
            {/* Item 4 */}
            <Col xs={0} sm={12} md={4} lg={4}>
              {" "}
              {/* Change sm to 12 for 2 items per row on small tablets */}
              <div className={styles["below-header-item"]}>
                <span className={styles["below-header-icon"]}>
                  <FaBox />
                </span>
                <span>30 ngày đổi trả</span>
              </div>
            </Col>
            {/* Divider */}
            <Col xs={0} sm={0} md={0} lg={0}></Col> {/* See above note */}
            {/* Item 5 */}
            <Col xs={0} sm={12} md={3} lg={3}>
              {" "}
              {/* Change sm to 12 for 2 items per row on small tablets */}
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
