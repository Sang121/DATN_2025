import React, { useState } from "react";
import { useSelector } from "react-redux";
import { Card, Radio, Button, Space, Row, Col, message } from "antd";
import { InfoCircleOutlined } from "@ant-design/icons";
import styles from "./PaymentPage.module.css";
import {
  cancelOrder,
  create_payment_url,
  createOrder,
} from "../../services/orderService";
import { useNavigate } from "react-router-dom";
import vnpayLogo from "../../assets/VnpayLogo.png"; // Ensure you have this logo in your assets
import { removeFromCart } from "../../services/userService";
function PaymentPage() {
  const order = useSelector((state) => state.order);
  const [paymentMethod, setPaymentMethod] = useState("COD");
  const [deliveryMethod, setDeliveryMethod] = useState("GHTK");
  const navigate = useNavigate();

  const paymentMethods = [
    { value: "COD", label: "Thanh toán khi nhận hàng" },
    { value: "VNPAY", logo: vnpayLogo },
    // { value: "MOMO", label: "Ví Momo", icon: "📱" },
    // { value: "ZALOPAY", label: "Ví ZaloPay", icon: "💰" },
    // { value: "VIETTEL", label: "Viettel Money", icon: "📲" },
  ];

  const handleCheckout = async () => {
    if (
      !order.shippingInfo.fullName ||
      !order.shippingInfo.phone ||
      !order.shippingInfo.address ||
      !order.shippingInfo.email
    ) {
      message.error(
        "Vui lòng cập nhật thông tin giao hàng trước khi thanh toán."
      );
      return;
    }
    try {
      const orderData = {
        items: order.items,
        shippingInfo: order.shippingInfo,
        paymentMethod: paymentMethod,
        deliveryMethod: deliveryMethod,
        itemsPrice: order.itemsPrice,
        totalDiscount: order.totalDiscount,
        taxPrice: order.taxPrice,
        totalPrice: order.totalPrice,
        user: order.user,
      };

      // --- Handle non-VNPAY payments (like COD) ---
      if (paymentMethod !== "VNPAY") {
        const res = await createOrder(orderData);
        if (res.status === "Success") {
          message.success("Đặt hàng thành công!");
          order.items.map(async (item) => {
            const res = await removeFromCart(item.id);
            console.log(" Removed item from cart:", res);
          });
          navigate("/payment-success", {
            state: {
              orderId: res.data._id,
              totalAmount: order.totalPrice,
              code: "01",
            },
          });
        } else {
          message.error(res.message || "Đặt hàng thất bại, vui lòng thử lại.");
        }
        return; // Stop execution here for non-VNPAY
      } // --- VNPAY Payment Flow ---
      if (paymentMethod === "VNPAY") {
        // Step 1: Create order in DB with pending status
        const orderDataWithStatus = {
          ...orderData,
          orderStatus: "pending payment", // Đặt trạng thái rõ ràng
          isPaid: false, // Đảm bảo đơn hàng chưa được đánh dấu là đã thanh toán
        };

        const res = await createOrder(orderDataWithStatus);
        if (res.status !== "Success" || !res.data?._id) {
          message.error("Không thể tạo đơn hàng. Vui lòng thử lại.");
          return;
        }

        const newOrderId = res.data._id;

        try {
          // Step 2: Prepare data and get payment URL from server
          const paymentData = {
            amount: `${orderData.totalPrice}`,

            orderId: newOrderId,
            bankCode: "", // Explicitly set bankCode
          };

          const resPayment = await create_payment_url(paymentData);

          if (resPayment && resPayment.vnpUrl) {
            // Step 3: Redirect user to VNPay Gateway
            // Lưu orderId vào localStorage để sử dụng trong trường hợp người dùng đóng tab
            localStorage.setItem("pendingVnpayOrderId", newOrderId);

            // Chuyển hướng đến cổng thanh toán
            window.location.href = resPayment.vnpUrl;
          } else {
            // Nếu không lấy được URL thanh toán, hủy đơn hàng đã tạo
            message.error(
              "Không thể lấy được URL thanh toán. Đơn hàng đã được hủy."
            );

            const cancelResult = await cancelOrder(newOrderId);
            if (cancelResult.status === "Success") {
              message.info("Đơn hàng đã được hủy thành công.");
            } else {
              message.error("Không thể hủy đơn hàng. Vui lòng liên hệ hỗ trợ.");
            }
          }
        } catch (error) {
          // Xử lý lỗi khi gọi API thanh toán
          console.error("Lỗi khi tạo URL thanh toán:", error);
          message.error(
            "Có lỗi xảy ra khi xử lý thanh toán. Đơn hàng đã được hủy."
          );

          // Hủy đơn hàng đã tạo
          try {
            await cancelOrder(newOrderId);
          } catch (cancelError) {
            console.error("Không thể hủy đơn hàng:", cancelError);
          }
        }
      }
    } catch (error) {
      console.error("Error creating order:", error);
      message.error("Đặt hàng thất bại, vui lòng thử lại sau.");
    }
  };
  // if (!order.shippingInfo || !order.items || order.items.length === 0) {
  //   message.warning("Bạn chưa có sản phẩm để thanh toán, vui lòng thêm sản phẩm.");

  //   navigate("/cart");
  //   return null;

  // }
  return (
    <div className={styles.paymentContainer}>
      <div className={styles.paymentContent}>
        <div className={styles.mainContent}>
          {/* Delivery Method Section */}
          <Card title="Chọn hình thức giao hàng" className={styles.section}>
            <Radio.Group
              value={deliveryMethod}
              onChange={(e) => setDeliveryMethod(e.target.value)}
            >
              <Space direction="vertical" className={styles.deliveryOptions}>
                <Radio value="GHTK">
                  <Space>
                    <span>Giao hàng tiết kiệm</span>
                    <span className={styles.deliveryTime}>
                      Giao thứ 6, trước 19h, 20/06
                    </span>
                    <span className={styles.freeShipping}>MIỄN PHÍ</span>
                  </Space>
                </Radio>
                <Radio value="GHN">
                  <Space>
                    <span>Giao hàng nhanh</span>
                    <span className={styles.deliveryTime}>
                      Giao thứ 6, trước 19h, 20/06
                    </span>
                    <span className={styles.freeShipping}>MIỄN PHÍ</span>
                  </Space>
                </Radio>
              </Space>
            </Radio.Group>
          </Card>

          {/* Payment Method Section */}
          <Card title="Chọn hình thức thanh toán" className={styles.section}>
            <Radio.Group
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
            >
              <Space direction="vertical" className={styles.paymentOptions}>
                {paymentMethods.map((method) => (
                  <Radio key={method.value} value={method.value}>
                    <Space>
                      <img
                        src={method.logo}
                        alt={method.label}
                        className={styles.paymentLogo}
                      />
                      <span>{method.label}</span>
                    </Space>
                  </Radio>
                ))}
              </Space>
            </Radio.Group>
          </Card>
        </div>

        {/* Order Summary Section */}
        <Card className={styles.orderSummary}>
          <div className={styles.deliveryInfo}>
            <h3>Giao tới</h3>
            <div className={styles.customerName}>
              {order.shippingInfo.fullName}
            </div>
            <div className={styles.customerPhone}>
              {order.shippingInfo.phone}
            </div>
            <div className={styles.address}>{order.shippingInfo.address}</div>
            <div className={styles.email}>
              Email: {order.shippingInfo.email}
            </div>
          </div>

          <div className={styles.summary}>
            <div className={styles.summaryItem}>
              <span>Tổng tiền hàng</span>
              <span>{order.itemsPrice?.toLocaleString()}đ</span>
            </div>
            <div className={styles.fee}>
              <span>VAT</span>
              <span>+{(order.taxPrice || 0).toLocaleString()}đ</span>
            </div>
            <div className={styles.fee}>
              <span>Giảm giá trực tiếp</span>
              <span>-{(order.totalDiscount || 0).toLocaleString()}đ</span>
            </div>
            <div className={styles.total}>
              <span>Tổng tiền thanh toán</span>
              <span className={styles.totalAmount}>
                {(order.totalPrice || 0).toLocaleString()}đ
              </span>
            </div>
          </div>

          <Button
            type="primary"
            size="large"
            className={styles.checkoutButton}
            onClick={() => handleCheckout()}
          >
            Đặt hàng
          </Button>
        </Card>
      </div>
    </div>
  );
}

export default PaymentPage;
