import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
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
  notification,
  Select,
  Modal,
  Space,
  Timeline,
  Form,
  Input,
} from "antd";
import {
  getOrderDetails,
  updateOrderStatus,
  updatePaymentStatus,
} from "../../../../../services/orderService";
import styles from "./AdminOrderDetail.module.css";
import {
  SmileOutlined,
  SolutionOutlined,
  ShoppingCartOutlined,
  CloseCircleOutlined,
  SyncOutlined,
  UserOutlined,
  EnvironmentOutlined,
  PhoneOutlined,
  PrinterOutlined,
  MailOutlined,
  HistoryOutlined,
  EditOutlined,
  ArrowLeftOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;
const { Option } = Select;
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
    case "returned":
      return {
        current: 3,
        tag: <Tag color="orange">Đã trả hàng</Tag>,
        description: "Khách hàng đã trả hàng, chờ hoàn tiền.",
      };
    case "refunded":
      return {
        current: 4,
        tag: <Tag color="red">Đã hoàn tiền</Tag>,
        description: "Đã hoàn tiền cho khách hàng.",
      };
    default:
      return { current: 0, tag: <Tag>{status}</Tag> };
  }
};

// Validate trạng thái chuyển đổi
const isValidStatusTransition = (currentStatus, newStatus) => {
  // Không thể chuyển từ đã giao sang trạng thái khác (trừ returned)
  if (
    currentStatus === "delivered" &&
    newStatus !== "delivered" &&
    newStatus !== "returned"
  ) {
    return {
      valid: false,
      message: "Đơn hàng đã giao chỉ có thể chuyển sang trạng thái trả hàng.",
    };
  }

  // Không thể chuyển từ đã hủy sang trạng thái khác
  if (currentStatus === "cancelled" && newStatus !== "cancelled") {
    return {
      valid: false,
      message: "Không thể thay đổi trạng thái của đơn hàng đã hủy.",
    };
  }

  // Từ "returned" (đã trả hàng) chỉ có thể chuyển sang "refunded" (đã hoàn tiền)
  if (
    currentStatus === "returned" &&
    newStatus !== "returned" &&
    newStatus !== "refunded"
  ) {
    return {
      valid: false,
      message:
        "Đơn hàng đã trả hàng chỉ có thể chuyển sang trạng thái đã hoàn tiền.",
    };
  }

  // Không thể chuyển từ "refunded" (đã hoàn tiền) sang trạng thái khác
  if (currentStatus === "refunded" && newStatus !== "refunded") {
    return {
      valid: false,
      message: "Không thể thay đổi trạng thái của đơn hàng đã hoàn tiền.",
    };
  }

  // Không thể chuyển từ thanh toán thất bại sang pending/processing/delivered
  if (
    currentStatus === "payment_failed" &&
    (newStatus === "pending" ||
      newStatus === "processing" ||
      newStatus === "delivered")
  ) {
    return {
      valid: false,
      message: "Đơn hàng thanh toán thất bại chỉ có thể hủy đơn hàng",
    };
  }

  // Validation cho flow logic
  if (currentStatus === "pending") {
    const allowedFromPending = ["processing", "cancelled", "payment_failed"];
    if (!allowedFromPending.includes(newStatus)) {
      return {
        valid: false,
        message:
          "Từ 'Chờ xử lý' chỉ có thể chuyển sang: Đang xử lý, Đã hủy, hoặc Thanh toán thất bại.",
      };
    }
  }

  if (currentStatus === "processing") {
    const allowedFromProcessing = ["delivered", "cancelled", "returned"];
    if (!allowedFromProcessing.includes(newStatus)) {
      return {
        valid: false,
        message:
          "Từ 'Đang xử lý' chỉ có thể chuyển sang: Đã giao hàng, Đã hủy, hoặc Trả hàng.",
      };
    }
  }

  // Validation business logic cho return/refund
  if (newStatus === "returned") {
    // Chỉ cho phép trả hàng từ đơn đã giao
    if (currentStatus !== "delivered") {
      return {
        valid: false,
        message: "Chỉ có thể trả hàng từ đơn hàng đã giao.",
      };
    }
  }

  if (newStatus === "refunded") {
    // Chỉ cho phép hoàn tiền từ đơn đã trả hàng
    if (currentStatus !== "returned") {
      return {
        valid: false,
        message: "Chỉ có thể hoàn tiền từ đơn hàng đã trả hàng.",
      };
    }
  }

  return { valid: true };
};

function AdminOrderDetail() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [updatingPayment, setUpdatingPayment] = useState(false); // Thêm state cho cập nhật thanh toán
  const [selectedStatus, setSelectedStatus] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [paymentModalVisible, setPaymentModalVisible] = useState(false); // Modal xác nhận cập nhật thanh toán
  const [noteForm] = Form.useForm();
  const [paymentForm] = Form.useForm(); // Form cho ghi chú thanh toán

  const fetchOrderDetails = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getOrderDetails(orderId);
      if (res?.data) {
        setOrder(res.data);
        setSelectedStatus(res.data.orderStatus);
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

  const handleStatusChange = (value) => {
    setSelectedStatus(value);
  };

  const showUpdateModal = () => {
    if (selectedStatus !== order.orderStatus) {
      const validationResult = isValidStatusTransition(
        order.orderStatus,
        selectedStatus
      );
      if (!validationResult.valid) {
        notification.warning({
          message: "Cảnh báo",
          description: validationResult.message,
        });
        setSelectedStatus(order.orderStatus);
        return;
      }

      setModalVisible(true);
    } else {
      notification.info({
        message: "Thông báo",
        description: "Trạng thái đơn hàng không thay đổi.",
      });
    }
  };
  const handleUpdateStatus = async () => {
    try {
      setUpdatingStatus(true);
      // Lấy note từ form và gửi đến API
      const adminNote = noteForm.getFieldValue("note") || "";

      const res = await updateOrderStatus(orderId, selectedStatus, adminNote);
      if (res?.status === "Success") {
        await fetchOrderDetails();
        notification.success({
          message: "Thành công",
          description: "Trạng thái đơn hàng đã được cập nhật thành công.",
        });
        setModalVisible(false);
        noteForm.resetFields();
      } else {
        notification.error({
          message: "Lỗi",
          description:
            res?.message || "Không thể cập nhật trạng thái đơn hàng.",
        });
      }
    } catch (err) {
      notification.error({
        message: "Lỗi",
        description: err.message || "Đã có lỗi xảy ra khi cập nhật trạng thái.",
      });
    } finally {
      setUpdatingStatus(false);
    }
  };
  // Hàm mở modal xác nhận cập nhật thanh toán
  const showPaymentModal = () => {
    setPaymentModalVisible(true);
  };

  // Hàm cập nhật trạng thái thanh toán
  const handleUpdatePayment = async () => {
    try {
      setUpdatingPayment(true);
      // Lấy note từ form và gửi đến API
      const paymentNote = paymentForm.getFieldValue("note") || "";
      // Đảo ngược trạng thái thanh toán hiện tại
      const newPaymentStatus = !order.isPaid;

      const res = await updatePaymentStatus(
        orderId,
        newPaymentStatus,
        paymentNote
      );
      if (res?.status === "Success") {
        await fetchOrderDetails();
        notification.success({
          message: "Thành công",
          description: `Trạng thái thanh toán đã được cập nhật thành: ${
            newPaymentStatus ? "Đã thanh toán" : "Chưa thanh toán"
          }.`,
        });
        setPaymentModalVisible(false);
        paymentForm.resetFields();
      } else {
        notification.error({
          message: "Lỗi",
          description:
            res?.message || "Không thể cập nhật trạng thái thanh toán.",
        });
      }
    } catch (err) {
      notification.error({
        message: "Lỗi",
        description:
          err.message || "Đã có lỗi xảy ra khi cập nhật trạng thái thanh toán.",
      });
    } finally {
      setUpdatingPayment(false);
    }
  };

  const handlePrintInvoice = () => {
    window.print();
  };

  const handleBackToList = () => {
    navigate("/system/admin");
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <Spin size="large" />
      </div>
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
            <Button type="primary" onClick={handleBackToList}>
              Quản lý đơn hàng
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  const statusInfo = getStatusInfo(order.orderStatus);
  const renderSteps = () => {
    if (statusInfo.status === "error") {
      return (
        <Steps current={1} status="error" className={styles.orderSteps}>
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
    if (order.orderStatus === "returned") {
      return (
        <Steps current={3} status="process" className={styles.orderSteps}>
          <Step
            title="Chờ xử lý"
            description="Đơn hàng đã được tạo."
            icon={<SolutionOutlined />}
            status="finish"
          />
          <Step
            title="Đang xử lý"
            description="Đang chuẩn bị và giao hàng."
            icon={<ShoppingCartOutlined />}
            status="finish"
          />
          <Step
            title="Đã giao hàng"
            description="Đơn hàng đã hoàn thành."
            icon={<SmileOutlined />}
            status="finish"
          />
          <Step
            title="Đã trả hàng"
            description="Khách hàng đã trả hàng, chờ hoàn tiền."
            icon={<CloseCircleOutlined />}
            status="process"
          />
        </Steps>
      );
    }

    if (order.orderStatus === "refunded") {
      return (
        <Steps current={4} status="finish" className={styles.orderSteps}>
          <Step
            title="Chờ xử lý"
            description="Đơn hàng đã được tạo."
            icon={<SolutionOutlined />}
            status="finish"
          />
          <Step
            title="Đang xử lý"
            description="Đang chuẩn bị và giao hàng."
            icon={<ShoppingCartOutlined />}
            status="finish"
          />
          <Step
            title="Đã giao hàng"
            description="Đơn hàng đã hoàn thành."
            icon={<SmileOutlined />}
            status="finish"
          />
          <Step
            title="Đã trả hàng"
            description="Khách hàng đã trả hàng."
            icon={<CloseCircleOutlined />}
            status="finish"
          />
          <Step
            title="Đã hoàn tiền"
            description="Đã hoàn tiền cho khách hàng."
            icon={<SmileOutlined />}
            status="finish"
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
          title="Đang xử lý"
          description="Đang chuẩn bị và giao hàng."
          icon={<ShoppingCartOutlined />}
        />
        <Step
          title="Đã giao hàng"
          description="Đơn hàng đã hoàn thành."
          icon={<SmileOutlined />}
        />
      </Steps>
    );
  };

  return (
    <div className={styles.container}>
      <Button
        type="default"
        icon={<ArrowLeftOutlined />}
        onClick={handleBackToList}
        className={styles.backButton}
      >
        Quay lại
      </Button>
      <div className={styles.header}>
        <Title level={3}>Chi tiết đơn hàng #{order._id.slice(-8)}</Title>
        <Space>
          <Button icon={<PrinterOutlined />} onClick={handlePrintInvoice}>
            In đơn hàng
          </Button>
          <Button type="primary" onClick={handleBackToList}>
            Quản lý đơn hàng
          </Button>
        </Space>
      </div>
      {renderSteps()}{" "}
      <Row gutter={[24, 24]} className={styles.adminToolbar}>
        <Col span={24}>
          <Card title="Cập nhật đơn hàng" bordered={false}>
            <Row gutter={[16, 16]}>
              {" "}
              <Col xs={24} md={12}>
                <div className={styles.statusSection}>
                  <div className={styles.statusDisplay}>
                    <Text strong>Trạng thái đơn hàng:</Text>
                    {getStatusInfo(order.orderStatus).tag}
                  </div>
                  <div className={styles.statusControls}>
                    <Text strong>Thay đổi thành:</Text>
                    <Select
                      value={selectedStatus}
                      onChange={handleStatusChange}
                      className={styles.statusSelect}
                    >
                      <Option value="payment_failed">
                        Thanh toán thất bại
                      </Option>
                      <Option value="pending">Chờ xử lý</Option>
                      <Option value="processing">Đang xử lý</Option>
                      <Option value="delivered">Đã giao hàng</Option>
                      <Option value="cancelled">Đã hủy</Option>
                      <Option value="returned">Đã trả hàng</Option>
                      <Option value="refunded">Đã hoàn tiền</Option>
                    </Select>
                    <Button
                      type="primary"
                      onClick={showUpdateModal}
                      icon={<EditOutlined />}
                    >
                      Cập nhật
                    </Button>
                  </div>
                </div>
              </Col>
              <Col xs={24} md={12}>
                <div className={styles.paymentSection}>
                  <div className={styles.paymentDisplay}>
                    <Text strong>Trạng thái thanh toán:</Text>
                    <Tag color={order.isPaid ? "green" : "volcano"}>
                      {order.isPaid ? "ĐÃ THANH TOÁN" : "CHƯA THANH TOÁN"}
                    </Tag>
                  </div>

                  {/* Chỉ hiện nút cập nhật thanh toán cho các trường hợp đặc biệt, không phải VNPAY và chưa giao hàng */}
                  {order.paymentMethod !== "VNPAY" &&
                    order.orderStatus !== "delivered" && (
                      <div className={styles.paymentControls}>
                        <Text strong>Cập nhật:</Text>
                        <Button
                          type="primary"
                          onClick={showPaymentModal}
                          icon={<EditOutlined />}
                        >
                          {order.isPaid
                            ? "Đánh dấu chưa thanh toán"
                            : "Đánh dấu đã thanh toán"}
                        </Button>
                        {order.paymentMethod === "COD" && (
                          <Text type="secondary" className={styles.paymentNote}>
                            (Sẽ tự động được đánh dấu khi giao hàng)
                          </Text>
                        )}
                      </div>
                    )}

                  {/* Hiển thị thông báo cho VNPAY */}
                  {order.paymentMethod === "VNPAY" && (
                    <Text type="secondary">
                      Đơn hàng đã được thanh toán qua VNPAY.
                    </Text>
                  )}

                  {/* Hiển thị thông báo cho đơn hàng đã giao */}
                  {order.orderStatus === "delivered" &&
                    order.paymentMethod === "COD" && (
                      <Text type="secondary">
                        Đơn hàng COD đã được giao, trạng thái thanh toán đã tự
                        động cập nhật.
                      </Text>
                    )}
                </div>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>
      <Card
        title="Tổng quan đơn hàng"
        bordered={false}
        className={styles.contentCard}
      >
        <Row gutter={[32, 24]}>
          {/* Cột trái: Thông tin khách hàng và Timeline */}
          <Col xs={24} lg={10}>
            <Card
              title={
                <span>
                  <UserOutlined /> Thông tin khách hàng
                </span>
              }
              className={styles.customerCard}
              size="small"
            >
              <Descriptions column={1} size="small">
                <Descriptions.Item label="Họ tên">
                  {order.shippingInfo.fullName}
                </Descriptions.Item>
                <Descriptions.Item
                  label={
                    <>
                      <PhoneOutlined /> Số điện thoại
                    </>
                  }
                >
                  {order.shippingInfo.phone}
                </Descriptions.Item>
                <Descriptions.Item
                  label={
                    <>
                      <MailOutlined /> Email
                    </>
                  }
                >
                  {order.shippingInfo.email || "Không có"}
                </Descriptions.Item>
                <Descriptions.Item
                  label={
                    <>
                      <EnvironmentOutlined /> Địa chỉ
                    </>
                  }
                >
                  {order.shippingInfo.address}
                </Descriptions.Item>
              </Descriptions>
            </Card>{" "}
            <Card
              title={
                <span>
                  <HistoryOutlined /> Lịch sử đơn hàng
                </span>
              }
              className={styles.timelineCard}
              size="small"
            >
              <Timeline>
                <Timeline.Item>
                  Đơn hàng được tạo -{" "}
                  {new Date(order.createdAt).toLocaleString()}
                </Timeline.Item>
                {order.isPaid && (
                  <Timeline.Item color="green">
                    Thanh toán thành công -{" "}
                    {new Date(order.paidAt).toLocaleString()}
                  </Timeline.Item>
                )}

                {/* Hiển thị lịch sử trạng thái từ statusHistory */}
                {order.statusHistory &&
                  order.statusHistory.length > 0 &&
                  order.statusHistory.map((history, index) => {
                    let color = "blue";
                    let statusText = "Đang xử lý";

                    switch (history.status) {
                      case "pending":
                        color = "orange";
                        statusText = "Chờ xử lý";
                        break;
                      case "processing":
                        color = "blue";
                        statusText = "Đang xử lý";
                        break;
                      case "delivered":
                        color = "green";
                        statusText = "Đã giao hàng";
                        break;
                      case "cancelled":
                        color = "red";
                        statusText = "Đã hủy";
                        break;
                      case "payment_failed":
                        color = "red";
                        statusText = "Thanh toán thất bại";
                        break;
                      case "returned":
                        color = "orange";
                        statusText = "Đã trả hàng";
                        break;
                      case "refunded":
                        color = "red";
                        statusText = "Đã hoàn tiền";
                        break;
                      default:
                        color = "blue";
                    }

                    return (
                      <Timeline.Item color={color} key={index}>
                        <div>
                          <strong>{statusText}</strong> -{" "}
                          {new Date(history.updatedAt).toLocaleString()}
                        </div>
                        {history.note && (
                          <div className={styles.historyNote}>
                            {history.note}
                          </div>
                        )}
                      </Timeline.Item>
                    );
                  })}
              </Timeline>
            </Card>
            <Card
              title={
                <span>
                  <SolutionOutlined /> Thông tin thanh toán
                </span>
              }
              className={styles.paymentCard}
              size="small"
            >
              {" "}
              <Descriptions column={1} size="small">
                <Descriptions.Item label="Phương thức">
                  <Tag
                    color={order.paymentMethod === "VNPAY" ? "cyan" : "blue"}
                  >
                    {order.paymentMethod === "VNPAY"
                      ? "VNPAY"
                      : "Thanh toán khi nhận hàng (COD)"}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Trạng thái">
                  <Tag color={order.isPaid ? "green" : "volcano"}>
                    {order.isPaid ? "ĐÃ THANH TOÁN" : "CHƯA THANH TOÁN"}
                    {order.paymentMethod === "COD" &&
                      order.orderStatus === "delivered" &&
                      !order.isPaid &&
                      " (Sẽ tự động cập nhật)"}
                  </Tag>
                </Descriptions.Item>
                {order.isPaid && (
                  <Descriptions.Item label="Thời gian thanh toán">
                    {new Date(order.paidAt).toLocaleString()}
                  </Descriptions.Item>
                )}
                {order.paymentInfo && order.paymentInfo.id && (
                  <Descriptions.Item label="Mã giao dịch">
                    <Text code copyable>
                      {order.paymentInfo.id}
                    </Text>
                  </Descriptions.Item>
                )}
                {order.paymentMethod === "VNPAY" && (
                  <Descriptions.Item label="Ghi chú">
                    <Text type="secondary">
                      Đơn hàng VNPAY được thanh toán tự động khi đặt hàng thành
                      công.
                    </Text>
                  </Descriptions.Item>
                )}
                {order.paymentMethod === "COD" && (
                  <Descriptions.Item label="Ghi chú">
                    <Text type="secondary">
                      Đơn hàng COD sẽ được tự động cập nhật thành đã thanh toán
                      khi trạng thái là "Đã giao hàng".
                    </Text>
                  </Descriptions.Item>
                )}
              </Descriptions>
            </Card>
          </Col>

          {/* Cột phải: Danh sách sản phẩm và chi tiết giá */}
          <Col xs={24} lg={14}>
            <Card
              title={
                <span>
                  <ShoppingCartOutlined /> Danh sách sản phẩm
                </span>
              }
              className={styles.productsCard}
              size="small"
            >
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
                        />
                      }
                      title={item.name}
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
            </Card>

            <Card
              title="Chi tiết thanh toán"
              className={styles.pricingSummaryCard}
              size="small"
            >
              <Descriptions column={1} size="small">
                <Descriptions.Item label="Tạm tính">
                  {order.itemsPrice.toLocaleString()}đ
                </Descriptions.Item>
                <Descriptions.Item label="Giảm giá trực tiếp">
                  {(order.totalDiscount || 0).toLocaleString()}đ
                </Descriptions.Item>
                <Descriptions.Item label="VAT">
                  {order.taxPrice.toLocaleString()}đ
                </Descriptions.Item>
                <Descriptions.Item label="Phí vận chuyển">
                  0 đ
                </Descriptions.Item>
                <Descriptions.Item
                  label={<Text strong>Tổng thanh toán</Text>}
                  className={styles.totalPrice}
                >
                  <Text strong className={styles.totalAmount}>
                    {order.totalPrice.toLocaleString()}đ
                  </Text>
                </Descriptions.Item>
              </Descriptions>
            </Card>
          </Col>
        </Row>
      </Card>{" "}
      {/* Modal cập nhật trạng thái đơn hàng */}
      <Modal
        title="Cập nhật trạng thái đơn hàng"
        visible={modalVisible}
        onOk={handleUpdateStatus}
        onCancel={() => setModalVisible(false)}
        confirmLoading={updatingStatus}
      >
        <p>
          Bạn có chắc chắn muốn thay đổi trạng thái đơn hàng từ{" "}
          <Tag>{order.orderStatus}</Tag> sang <Tag>{selectedStatus}</Tag>?
        </p>

        {selectedStatus === "cancelled" && (
          <Alert
            message="Cảnh báo"
            description="Hành động này sẽ hủy đơn hàng và không thể hoàn tác. Nếu đơn hàng đã thanh toán, hệ thống sẽ đánh dấu để hoàn tiền cho khách hàng."
            type="warning"
            showIcon
            className={styles.modalAlert}
          />
        )}
        {selectedStatus === "returned" && (
          <Alert
            message="Thông báo"
            description="Hành động này sẽ đánh dấu đơn hàng là đã trả hàng. Bạn có thể cập nhật sang 'Đã hoàn tiền' sau khi hoàn tất việc hoàn tiền cho khách hàng."
            type="info"
            showIcon
            className={styles.modalAlert}
          />
        )}
        {selectedStatus === "refunded" && (
          <Alert
            message="Cảnh báo"
            description="Hành động này sẽ đánh dấu đã hoàn tiền cho khách hàng và không thể hoàn tác. Hãy đảm bảo bạn đã thực hiện hoàn tiền thành công."
            type="warning"
            showIcon
            className={styles.modalAlert}
          />
        )}

        <Form form={noteForm} layout="vertical">
          <Form.Item name="note" label="Ghi chú (tùy chọn)">
            <Input.TextArea
              rows={4}
              placeholder="Nhập ghi chú về việc thay đổi trạng thái"
            />
          </Form.Item>
        </Form>
      </Modal>
      {/* Modal cập nhật trạng thái thanh toán */}
      <Modal
        title="Cập nhật trạng thái thanh toán"
        visible={paymentModalVisible}
        onOk={handleUpdatePayment}
        onCancel={() => setPaymentModalVisible(false)}
        confirmLoading={updatingPayment}
      >
        <p>
          Bạn có chắc chắn muốn thay đổi trạng thái thanh toán từ{" "}
          <Tag color={order.isPaid ? "green" : "volcano"}>
            {order.isPaid ? "ĐÃ THANH TOÁN" : "CHƯA THANH TOÁN"}
          </Tag>{" "}
          sang{" "}
          <Tag color={!order.isPaid ? "green" : "volcano"}>
            {!order.isPaid ? "ĐÃ THANH TOÁN" : "CHƯA THANH TOÁN"}
          </Tag>
          ?
        </p>

        {order.paymentMethod === "COD" && !order.isPaid && (
          <Alert
            message="Thông báo"
            description="Đơn hàng COD sẽ tự động được đánh dấu là đã thanh toán khi trạng thái đơn hàng chuyển thành 'Đã giao hàng'."
            type="info"
            showIcon
            className={styles.modalAlert}
          />
        )}

        {order.isPaid && (
          <Alert
            message="Cảnh báo"
            description="Đánh dấu đơn hàng này là chưa thanh toán có thể ảnh hưởng đến báo cáo tài chính."
            type="warning"
            showIcon
            className={styles.modalAlert}
          />
        )}

        <Form form={paymentForm} layout="vertical">
          <Form.Item name="note" label="Ghi chú (tùy chọn)">
            <Input.TextArea
              rows={4}
              placeholder="Nhập ghi chú về việc thay đổi trạng thái thanh toán"
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

export default AdminOrderDetail;
