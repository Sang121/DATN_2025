import React, { useEffect, useState } from "react";
import { Button, Result } from "antd";
import { useLocation, useNavigate } from "react-router-dom";
import { CheckCircleFilled, ShoppingOutlined } from "@ant-design/icons";
import styles from "./PaymentSuccessPage.module.css";
import { useDispatch } from "react-redux";
import { clearImmediateOrder } from "../../redux/slices/orderSlice";

function PaymentSuccessPage() {
  const dispatch = useDispatch();

  const location = useLocation();
  const navigate = useNavigate();
  const [orderId, setOrderId] = useState(null);
  const [totalAmount, setTotalAmount] = useState(null);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const code = location.state?.code;
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const vnp_ResponseCode = searchParams.get("vnp_ResponseCode") || code;
    const vnp_TxnRef = searchParams.get("vnp_TxnRef");
    const vnp_Amount = searchParams.get("vnp_Amount");

    if (vnp_ResponseCode === "00") {
      setOrderId(vnp_TxnRef);
      setTotalAmount(vnp_Amount / 100); // Convert back from cents
      setPaymentSuccess(true);
      dispatch(clearImmediateOrder());
    } else if (vnp_ResponseCode === "01") {
      setOrderId(location.state?.orderId);
      setTotalAmount(location.state?.totalAmount); // Convert back from cents
      setPaymentSuccess(true);
      dispatch(clearImmediateOrder());
    } else {
      navigate("/payment-failed");
    }
  }, [location, navigate]);

  if (!paymentSuccess) {
    return null; // Or a loading spinner while we check the payment status
  }

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <Result
          icon={<CheckCircleFilled className={styles.successIcon} />}
          status="success"
          title="Thanh toán thành công!"
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
              onClick={() => navigate("/profile/my-order")}
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
