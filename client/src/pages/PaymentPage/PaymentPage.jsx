import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Card, Radio, Button, Space, Row, Col, message } from "antd";
import { InfoCircleOutlined } from "@ant-design/icons";
import styles from "./PaymentPage.module.css";
import { createOrder } from "../../services/orderService";
import { clearImmediateOrder } from "../../redux/slices/orderSlice";
import { useNavigate } from "react-router-dom";

function PaymentPage() {
  const order = useSelector((state) => state.order);
  const [paymentMethod, setPaymentMethod] = useState("COD");
  const [deliveryMethod, setDeliveryMethod] = useState("GHTK");
  const navigate = useNavigate();

  const dispatch = useDispatch();

  const paymentMethods = [
    { value: "COD", label: "Thanh toán tiền mặt", icon: "💵" },
    { value: "VNPAY", label: "Quét Mã QR từ ứng dụng ngân hàng", icon: "🏦" },
    { value: "MOMO", label: "Ví Momo", icon: "📱" },
    { value: "ZALOPAY", label: "Ví ZaloPay", icon: "💰" },
    { value: "VIETTEL", label: "Viettel Money", icon: "📲" },
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
      const res = await createOrder(orderData);
      if (res.status === "Success") {
        dispatch(clearImmediateOrder());
        message.success("Đặt hàng thành công!");
        navigate("/payment-success", {
          state: {
            orderId: res.data._id,
            totalAmount: order.totalPrice,
          },
        });

        // Redirect to order confirmation page or clear cart
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
                      <span>{method.icon}</span>
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
            <div className={styles.email}>Email: {order.shippingInfo.email}</div>
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
