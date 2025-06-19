import React from "react";
import { Button, message, Result } from "antd";
import { useLocation, useNavigate } from "react-router-dom";
import { CheckCircleFilled, ShoppingOutlined } from "@ant-design/icons";
import styles from "./PaymentSuccessPage.module.css";

function PaymentSuccessPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { orderId, totalAmount } = location.state || {};
  if (!orderId || !totalAmount) {
    message.error("Thông tin đơn hàng không hợp lệ.");
    navigate("/");
    return null;
  }
  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <Result
          icon={<CheckCircleFilled className={styles.successIcon} />}
          status="success"
          title="Đặt hàng thành công!"
          subTitle={
            <div className={styles.orderInfo}>
              <p>
                Mã đơn hàng: <span className={styles.orderId}>{orderId}</span>
              </p>
              <p>
                Tổng tiền:{" "}
                <span className={styles.totalAmount}>
                  {totalAmount?.toLocaleString()}đ
                </span>
              </p>
              <p className={styles.thankYou}>
                Cảm ơn bạn đã mua hàng tại Shop!
              </p>
            </div>
          }
          extra={[
            <Button
              type="primary"
              key="orders"
              onClick={() => navigate("/user/orders")}
              className={styles.orderButton}
            >
              Xem đơn hàng
            </Button>,
            <Button
              key="shop"
              onClick={() => navigate("/")}
              icon={<ShoppingOutlined />}
              className={styles.continueButton}
            >
              Tiếp tục mua sắm
            </Button>,
          ]}
        />
      </div>
    </div>
  );
}

export default PaymentSuccessPage;
