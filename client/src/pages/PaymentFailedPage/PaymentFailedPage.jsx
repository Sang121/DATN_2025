import React from "react";
import { Button, Result } from "antd";
import { useLocation, useNavigate } from "react-router-dom";
import { CloseCircleOutlined, RollbackOutlined } from "@ant-design/icons";
import styles from "./PaymentFailedPage.module.css";

function PaymentFailedPage() {
  const navigate = useNavigate();
  const location = useLocation();

  // Extract error information from query parameters if available
  const searchParams = new URLSearchParams(location.search);
  const errorCode = searchParams.get("vnp_ResponseCode");
  const message =
    searchParams.get("vnp_Message") ||
    "Thanh toán không thành công. Vui lòng thử lại.";

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <Result
          status="error"
          icon={<CloseCircleOutlined className={styles.errorIcon} />}
          title="Thanh toán thất bại!"
          subTitle={`Lỗi #${errorCode}: ${message}`}
          extra={[
            <Button
              type="primary"
              danger
              key="retry"
              onClick={() => navigate("/payment")}
              className={styles.actionButton}
            >
              Thử lại thanh toán
            </Button>,
            <Button
              key="home"
              onClick={() => navigate("/")}
              icon={<RollbackOutlined />}
              className={styles.actionButton}
            >
              Quay về trang chủ
            </Button>,
          ]}
        />
      </div>
    </div>
  );
}

export default PaymentFailedPage;
