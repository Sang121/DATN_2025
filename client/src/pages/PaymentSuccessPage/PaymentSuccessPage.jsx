import React, { useEffect, useState } from "react";
import { Button, Result, message } from "antd";
import { useLocation, useNavigate } from "react-router-dom";
import { CheckCircleFilled, ShoppingOutlined } from "@ant-design/icons";
import styles from "./PaymentSuccessPage.module.css";
import { useDispatch } from "react-redux";
import { clearImmediateOrder } from "../../redux/slices/orderSlice";
import { updateOrderAfterPayment } from "../../services/orderService";
import { removeFromCart } from "../../services/userService";

function PaymentSuccessPage() {
  const dispatch = useDispatch();

  const location = useLocation();
  const navigate = useNavigate();
  const [orderId, setOrderId] = useState(null);
  const [totalAmount, setTotalAmount] = useState(null);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const code = location.state?.code;
  useEffect(() => {
    // Log for debugging
    console.log("Location search:", location.search);
    console.log("Location state:", location.state);

    // Xử lý khi có lỗi 404 từ VNPAY Return URL
    // Nếu URL chứa các tham số VNPAY nhưng bị lỗi 404, vẫn cố gắng xử lý thanh toán

    const searchParams = new URLSearchParams(location.search);
    const vnp_ResponseCode = searchParams.get("vnp_ResponseCode") || code;
    const vnp_TxnRef = searchParams.get("vnp_TxnRef");
    const vnp_Amount = searchParams.get("vnp_Amount");

    // Kiểm tra VNPAY Response trực tiếp từ URL (trường hợp redirect bị lỗi 404)
    if (vnp_ResponseCode === "00" && vnp_TxnRef) {
      // VNPAY success
      (async () => {
        try {
          // Lấy ID gốc từ định dạng orderId_timestamp
          const originalOrderId = vnp_TxnRef?.split("_")[0] || vnp_TxnRef;
          setOrderId(originalOrderId);
          setTotalAmount(vnp_Amount ? Number(vnp_Amount) / 100 : null); // Convert back from cents

          // Xóa orderId từ localStorage nếu có
          localStorage.removeItem("pendingVnpayOrderId");

          // Cập nhật trạng thái đơn hàng và trạng thái thanh toán trên server
          try {
            // Thu thập tất cả tham số VNPAY để gửi đến server
            const allVnpParams = {};
            searchParams.forEach((value, key) => {
              if (key.startsWith("vnp_")) {
                allVnpParams[key] = value;
              }
            });

            // Gọi API cập nhật trạng thái đơn hàng sau thanh toán
            const result = await updateOrderAfterPayment(
              originalOrderId,
              vnp_ResponseCode,
              allVnpParams
            );

            if (result.status === "Success") {
              message.success("Đơn hàng đã được thanh toán thành công!");
            }
          } catch (updateError) {
            console.error("Lỗi khi cập nhật trạng thái đơn hàng:", updateError);
          }

          setPaymentSuccess(true);
          dispatch(clearImmediateOrder());

          // const res = await removeFromCart(itemId);
          console.log(
            "VNPAY payment success (from URL), order ID:",
            originalOrderId
          );
        } catch (error) {
          console.error("Error processing VNPAY success:", error);
          navigate("/payment-failed?error=processing");
        }
      })();
    } else if (vnp_ResponseCode === "01" || code === "01") {
      // COD or other payment methods (from state)
      if (location.state?.orderId) {
        setOrderId(location.state.orderId);
        setTotalAmount(location.state.totalAmount);
        setPaymentSuccess(true);
        dispatch(clearImmediateOrder());
        (async () => {
          if (location.state?.orderItems) {
            const removalPromises = location.state.orderItems.map((item) => {
              console.log("Removing item from cart (COD):", item);
              return removeFromCart(item.variant?.idVariant || item.id);
            });
            try {
              const results = await Promise.all(removalPromises);
              console.log(
                "Tất cả sản phẩm đã được xóa khỏi giỏ hàng (COD):",
                results
              );
            } catch (error) {
              console.error("Lỗi khi xóa sản phẩm khỏi giỏ hàng (COD):", error);
              message.error("Có lỗi xảy ra khi cập nhật giỏ hàng của bạn.");
            }
          }
        })();
        console.log("COD payment success, order ID:", location.state.orderId);
      } else {
        console.error("Missing order info in state for COD payment");
        navigate("/payment-failed?error=missing_order_info");
      }
    } else if (location.state?.orderId && location.state?.totalAmount) {
      // Fallback if we have order info in state but no success code
      setOrderId(location.state.orderId);
      setTotalAmount(location.state.totalAmount);
      setPaymentSuccess(true);
      dispatch(clearImmediateOrder());

      // Xóa sản phẩm khỏi giỏ hàng cho fallback case
      (async () => {
        if (location.state?.orderItems) {
          const removalPromises = location.state.orderItems.map((item) => {
            console.log("Removing item from cart (fallback):", item);
            return removeFromCart(item.variant?.idVariant || item.id);
          });
          try {
            const results = await Promise.all(removalPromises);
            console.log(
              "Tất cả sản phẩm đã được xóa khỏi giỏ hàng (fallback):",
              results
            );
          } catch (error) {
            console.error("Lỗi khi xóa sản phẩm khỏi giỏ hàng (fallback):", error);
          }
        }
      })();

      console.log(
        "Payment success (fallback), order ID:",
        location.state.orderId
      );
    } else {
      // No valid payment information found
      console.log(
        "No valid payment information, redirecting to payment-failed"
      );
      navigate("/payment-failed");
    }
  }, [location, navigate, dispatch, code]);

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
              onClick={() => navigate("/profile/my-orders")}
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
