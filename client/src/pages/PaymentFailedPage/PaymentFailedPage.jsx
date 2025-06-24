import React, { useEffect } from "react";
import { Button, Result } from "antd";
import { useLocation, useNavigate } from "react-router-dom";
import { CloseCircleOutlined, RollbackOutlined } from "@ant-design/icons";
import styles from "./PaymentFailedPage.module.css";
import { cancelOrder } from "../../services/orderService";

function PaymentFailedPage() {
  const navigate = useNavigate();
  const location = useLocation();

  // Extract error information from query parameters if available
  const searchParams = new URLSearchParams(location.search);
  const errorCode = searchParams.get("vnp_ResponseCode");
  const message =
    searchParams.get("vnp_Message") ||
    "Thanh toán không thành công. Vui lòng thử lại.";

  // Sử dụng useEffect để hủy đơn hàng đang chờ thanh toán (nếu có)
  useEffect(() => {
    const handlePendingOrder = async () => {
      try {
        // Kiểm tra nếu có pendingVnpayOrderId trong localStorage
        const pendingOrderId = localStorage.getItem("pendingVnpayOrderId");
        if (pendingOrderId) {
          console.log("Tìm thấy đơn hàng đang chờ thanh toán:", pendingOrderId);

          // Gọi API hủy đơn hàng
          await cancelOrder(pendingOrderId);
          console.log(
            "Đã hủy đơn hàng do thanh toán thất bại:",
            pendingOrderId
          );

          // Xóa ID đơn hàng khỏi localStorage
          localStorage.removeItem("pendingVnpayOrderId");
        }
      } catch (error) {
        console.error("Lỗi khi hủy đơn hàng đang chờ:", error);
      }
    };

    // Chỉ thực hiện khi có mã lỗi từ VNPAY
    if (errorCode) {
      handlePendingOrder();
    }
  }, [errorCode]);

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
