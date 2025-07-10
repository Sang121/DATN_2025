import React, { useEffect, useState, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import {
  Card,
  Row,
  Col,
  Typography,
  Tag,
  Spin,
  Alert,
  Descriptions,
  List,
  Avatar,
  Button,
  Steps,
  Divider,
  notification,
} from "antd";
import { getOrderDetails, cancelOrder } from "../../services/orderService";
import styles from "./OrderDetailPage.module.css";
import {
  SmileOutlined,
  SolutionOutlined,
  ShoppingCartOutlined,
  CloseCircleOutlined,
  SyncOutlined,
} from "@ant-design/icons";

const { Title, Text, Paragraph } = Typography;
const { Step } = Steps;

const getStatusInfo = (status) => {
  switch (status) {
    case "pending":
      return {
        current: 0,
        tag: (
          <Tag icon={<SyncOutlined spin />} color="processing">
            Chờ xử lý
          </Tag>
        ),
      };
    case "processing":
      return {
        current: 1,
        tag: <Tag color="processing">Đang xử lý</Tag>,
      };
    case "delivered":
      return {
        current: 2,
        tag: <Tag color="success">Đã giao hàng</Tag>,
      };
    case "cancelled":
      return {
        current: 3,
        status: "error",
        tag: <Tag color="error">Đã hủy</Tag>,
        description: "Đơn hàng đã bị hủy.",
      };
    case "payment_failed":
      return {
        current: 0,
        status: "error",
        tag: <Tag color="red">Thanh toán thất bại</Tag>,
        description: "Thanh toán cho đơn hàng này đã thất bại.",
      };
    default:
      return { current: 0, tag: <Tag>{status}</Tag> };
  }
};

function OrderDetailPage() {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isCancelling, setIsCancelling] = useState(false);

  const fetchOrderDetails = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getOrderDetails(orderId);
      if (res?.data) {
        setOrder(res.data);
      } else {
        const msg = "Không tìm thấy chi tiết đơn hàng.";
        setError(msg);
        notification.error({ message: "Lỗi", description: msg });
      }
    } catch (err) {
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "Đã có lỗi xảy ra khi tải chi tiết đơn hàng.";
      setError(errorMessage);
      notification.error({ message: "Lỗi", description: errorMessage });
    } finally {
      setLoading(false);
    }
  }, [orderId]);
  useEffect(() => {
    fetchOrderDetails();
  }, [fetchOrderDetails]);

  const handleCancelOrder = async () => {
    setIsCancelling(true);
    try {
      const res = await cancelOrder(orderId);
      if (res?.status === "Success") {
        await fetchOrderDetails();
        notification.success({
          message: "Thành công",
          description: "Đơn hàng đã được hủy thành công.",
        });
      } else {
        notification.error({
          message: "Lỗi",
          description: res?.message || "Không thể hủy đơn hàng.",
        });
      }
    } catch (err) {
      notification.error({
        message: "Lỗi",
        description: err.message || "Đã có lỗi xảy ra khi hủy đơn hàng.",
      });
    } finally {
      setIsCancelling(false);
    }
  };

  if (loading) {
    return (
      <Spin
        size="large"
        style={{ display: "block", marginTop: "50px" }}
        fullscreen
      />
    );
  }
  if (error && !order) {
    return (
      <div className={styles.container}>
        <Card className={styles.errorCard}>
          <Alert
            message="Không thể tải đơn hàng"
            description={error}
            type="error"
            showIcon
            action={
              <Button type="primary" onClick={fetchOrderDetails}>
                Thử lại
              </Button>
            }
          />
        </Card>
      </div>
    );
  }

  if (!order) {
    return (
      <div className={styles.container}>
        <Card className={styles.errorCard}>
          <Alert
            message="Không có dữ liệu đơn hàng"
            description="Không tìm thấy thông tin đơn hàng hoặc đơn hàng không tồn tại."
            type="info"
            showIcon
          />
          <div className={styles.errorActions}>
            <Link to="/">
              <Button type="primary">Về trang chủ</Button>
            </Link>
            <Link to="/profile?tab=orders">
              <Button>Xem các đơn hàng khác</Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  const statusInfo = getStatusInfo(order.orderStatus);
  const API_URL = import.meta.env.VITE_API_URL;
  const canCancel = order.orderStatus === "pending";

  const renderSteps = () => {
    if (statusInfo.status === "error") {
      return (
        <Steps
          current={1} // Always show the second step as error
          status="error"
          className={styles.orderSteps}
        >
          <Step
            title="Tạo đơn hàng"
            description="Đơn hàng đã được tạo."
            icon={<SolutionOutlined />}
          />
          <Step
            title={
              order.orderStatus === "cancelled"
                ? "Đã hủy"
                : "Thanh toán thất bại"
            }
            description={statusInfo.description}
            icon={<CloseCircleOutlined />}
          />
        </Steps>
      );
    }

    return (
      <Steps
        current={statusInfo.current}
        status={statusInfo.status}
        className={styles.orderSteps}
      >
        <Step
          title="Chờ xử lý"
          description="Đơn hàng đã được tạo."
          icon={<SolutionOutlined />}
        />
        <Step
          title="Đang giao hàng"
          description="Đang trên đường đến với bạn."
          icon={<ShoppingCartOutlined />}
        />
        <Step
          title="Đã giao hàng"
          description="Cảm ơn đã mua sắm!"
          icon={<SmileOutlined />}
        />
      </Steps>
    );
  };

  return (
    <div className={styles.container}>
      {renderSteps()}

      <Card
        title="Tổng quan đơn hàng"
        bordered={false}
        className={styles.contentCard}
      >
        <Row gutter={[32, 24]}>
          {/* Cột trái: Danh sách sản phẩm và hành động */}{" "}
          <Col xs={24} lg={14}>
            <Title
              level={5}
              style={{
                marginBottom: "16px",
                display: "flex",
                alignItems: "center",
              }}
            >
              <ShoppingCartOutlined style={{ marginRight: 8 }} /> Danh sách sản
              phẩm
            </Title>
            <List
              itemLayout="horizontal"
              dataSource={order.items}
              className={styles.productsList}
              renderItem={(item) => (
                <List.Item className={styles.productItem}>
                  <List.Item.Meta
                    avatar={
                      <Avatar
                        src={item.image}
                        size={64}
                        shape="square"
                        icon={<ShoppingCartOutlined />}
                        onError={(e) => {
                          // Khi ảnh không load được, hiển thị icon mặc định
                          const target = e.target;
                          target.onerror = null; // Ngăn lặp vô hạn
                          target.src = ""; // Xóa nguồn ảnh lỗi
                          target.className = `${target.className} ${styles.imageError}`;
                        }}
                      />
                    }
                    title={
                      <Link
                        to={`/product/${item.product}`}
                        className={styles.productName}
                      >
                        {item.name}
                      </Link>
                    }
                    description={
                      <span>
                        Size: <b>{item.variant.size}</b> - Màu:{" "}
                        <b>{item.variant.color}</b>
                      </span>
                    }
                  />
                  <div className={styles.priceInfo}>
                    <Text>{item.newPrice.toLocaleString()}đ</Text>
                    <Text type="secondary">x {item.amount}</Text>
                    <Text strong>
                      {(item.newPrice * item.amount).toLocaleString()}đ
                    </Text>
                  </div>
                </List.Item>
              )}
            />
            {canCancel && (
              <div className={styles.actions}>
                <Button
                  type="primary"
                  danger
                  onClick={handleCancelOrder}
                  loading={isCancelling}
                  icon={<CloseCircleOutlined />}
                >
                  Hủy đơn hàng
                </Button>
              </div>
            )}
          </Col>
          {/* Cột phải: Thông tin giao hàng và thanh toán */}{" "}
          <Col xs={24} lg={10}>
            <Title
              level={5}
              style={{
                marginBottom: "16px",
                display: "flex",
                alignItems: "center",
              }}
            >
              <SolutionOutlined style={{ marginRight: 8 }} /> Thông tin chi tiết
            </Title>
            <Descriptions
              column={1}
              bordered
              size="small"
              className={styles.detailDescriptions}
            >
              <Descriptions.Item label="Mã đơn hàng">
                <Text code copyable>
                  {order._id}
                </Text>
              </Descriptions.Item>
              <Descriptions.Item label="Người nhận">
                <Text strong>{order.shippingInfo.fullName}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Số điện thoại">
                {order.shippingInfo.phone}
              </Descriptions.Item>
              <Descriptions.Item label="Địa chỉ">
                {`${order.shippingInfo.address}`}
              </Descriptions.Item>
            </Descriptions>
            <Divider />
            <Descriptions
              column={1}
              bordered
              size="small"
              className={styles.priceDetails}
            >
              <Descriptions.Item label="Phương thức TT">
                <Tag color="blue">{order.paymentMethod}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Tạm tính">
                {order.itemsPrice.toLocaleString()}đ
              </Descriptions.Item>

              <Descriptions.Item label="Giảm giá trực tiếp">
                {order.totalDiscount.toLocaleString()}đ
              </Descriptions.Item>
              <Descriptions.Item label="VAT">
                {order.taxPrice.toLocaleString()}đ
              </Descriptions.Item>
              <Descriptions.Item label="Phí vận chuyển">0 đ</Descriptions.Item>
              <Descriptions.Item
                label={<Text strong>Tổng cộng</Text>}
                contentStyle={{
                  fontSize: "1.2rem",
                  fontWeight: "bold",
                  color: "#ff4d4f",
                }}
              >
                <Text strong style={{ fontSize: "1.2rem", color: "#ff4d4f" }}>
                  {order.totalPrice.toLocaleString()}đ
                </Text>
              </Descriptions.Item>
            </Descriptions>
          </Col>
        </Row>
      </Card>
    </div>
  );
}

export default OrderDetailPage;
