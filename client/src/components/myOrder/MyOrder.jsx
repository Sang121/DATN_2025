import React, { useState, useEffect } from "react";
import {
  Card,
  Tag,
  Button,
  Typography,
  Spin,
  Alert,
  Menu,
  Divider,
  Empty,
  Row,
  Col,
  Space,
  Pagination,
  Image,
  Tooltip,
  Modal,
  Form,
  Input,
  Select,
  message,
  Radio,
} from "antd";
import {
  FilterOutlined,
  ClockCircleOutlined,
  CarOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  UnorderedListOutlined,
  ShoppingOutlined,
  EyeOutlined,
  ReloadOutlined,
  CalendarOutlined,
  CreditCardOutlined,
  RollbackOutlined,
  WarningOutlined,
} from "@ant-design/icons";
import { useSelector } from "react-redux";
import { useQuery } from "@tanstack/react-query";
import * as orderService from "../../services/orderService";
import styles from "./Myorder.module.css";
import { Link } from "react-router-dom";
import { useMediaQuery } from "react-responsive";

const { Title, Text } = Typography;
const { TextArea } = Input;

// Thêm status cho returned và refunded
const getStatusTag = (status) => {
  const statusMap = {
    pending: {
      color: "orange",
      text: "Chờ xử lý",
      icon: <ClockCircleOutlined />,
    },
    processing: { color: "blue", text: "Đang giao", icon: <CarOutlined /> },
    delivered: {
      color: "green",
      text: "Đã giao",
      icon: <CheckCircleOutlined />,
    },
    cancelled: {
      color: "red",
      text: "Đã hủy",
      icon: <ExclamationCircleOutlined />,
    },
    payment_failed: {
      color: "volcano",
      text: "Thanh toán thất bại",
      icon: <CreditCardOutlined />,
    },
    returned: {
      color: "purple",
      text: "Yêu cầu trả hàng",
      icon: <RollbackOutlined />,
    },
    return_requested: {
      color: "orange",
      text: "Chờ duyệt hoàn tiền",
      icon: <ClockCircleOutlined />,
    },
    refunded: {
      color: "cyan",
      text: "Đã hoàn tiền",
      icon: <CheckCircleOutlined />,
    },
  };

  const statusInfo = statusMap[status] || {
    color: "default",
    text: status,
    icon: null,
  };

  return (
    <Tag
      color={statusInfo.color}
      icon={statusInfo.icon}
      className={styles.statusTag}
    >
      {statusInfo.text}
    </Tag>
  );
};

function MyOrder() {
  const user = useSelector((state) => state.user);
  const userId = user?.id || user?._id;
  const isMobile = useMediaQuery({ maxWidth: 768 });
  const [activeStatus, setActiveStatus] = useState("all");
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 5, // Hiển thị 5 đơn hàng mỗi trang
  });

  // State cho modal trả hàng
  const [returnModal, setReturnModal] = useState({
    visible: false,
    orderId: null,
    orderData: null,
  });
  const [returnForm] = Form.useForm();
  const [submittingReturn, setSubmittingReturn] = useState(false);

  // Đếm số lượng cho từng loại trạng thái
  const [orderCounts, setOrderCounts] = useState({
    all: 0,
    pending: 0,
    processing: 0,
    delivered: 0,
    cancelled: 0,
    returned: 0,
    refunded: 0,
  });
  useEffect(() => {
    const fetchOrderCounts = async () => {
      if (!userId) return;

      try {
        const allOrdersCount = await orderService.getOrdersCount(userId);

        if (allOrdersCount && typeof allOrdersCount === "object") {
          setOrderCounts({
            all: allOrdersCount.total || 0,
            pending: allOrdersCount.pending || 0,
            processing: allOrdersCount.processing || 0,
            delivered: allOrdersCount.delivered || 0,
            cancelled: allOrdersCount.cancelled || 0,
            returned: allOrdersCount.returned || 0,
            refunded: allOrdersCount.refunded || 0,
          });

          console.log("Fetched order counts:", allOrdersCount);
        }
      } catch (error) {
        console.error("Không thể lấy số lượng đơn hàng:", error);
      }
    };

    fetchOrderCounts();
  }, [userId, activeStatus]);
  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "smooth",
    });
  }, []);
  const {
    data: queryData,
    isLoading,
    isError,
    error,
    isFetching,
  } = useQuery({
    queryKey: [
      "my-orders",
      userId,
      pagination.current,
      pagination.pageSize,
      activeStatus,
    ],
    queryFn: () => {
      if (!userId) {
        return Promise.reject(new Error("Vui lòng đăng nhập để xem đơn hàng."));
      }

      const status = activeStatus !== "all" ? activeStatus : undefined;
      console.log(`Fetching orders with status: ${status || "all"}`);

      return orderService.getOrdersByUserId(
        userId,
        pagination.pageSize,
        pagination.current - 1,
        status
      );
    },
    enabled: !!userId,
    keepPreviousData: true,
    onSuccess: (data) => {
      if (activeStatus !== "all") {
        setOrderCounts((prev) => ({
          ...prev,
          [activeStatus]: data.total || 0,
        }));
      } else {
        setOrderCounts((prev) => ({ ...prev, all: data.total || 0 }));
      }
    },
  });
  const handleStatusChange = (status) => {
    console.log(`Changing status filter to: ${status}`);
    setActiveStatus(status);
    setPagination((prev) => ({ ...prev, current: 1 }));
  };

  // Xử lý mở modal trả hàng
  const handleOpenReturnModal = (order) => {
    setReturnModal({
      visible: true,
      orderId: order._id,
      orderData: order,
    });
    returnForm.resetFields();
  };

  // Xử lý đóng modal trả hàng
  const handleCloseReturnModal = () => {
    setReturnModal({
      visible: false,
      orderId: null,
      orderData: null,
    });
    returnForm.resetFields();
  };

  // Xử lý gửi yêu cầu trả hàng
  const handleSubmitReturn = async (values) => {
    try {
      setSubmittingReturn(true);
      
      const returnData = {
        reason: values.reason,
        description: values.description,
        refundMethod: 'bank', // Luôn là chuyển khoản ngân hàng
        bankInfo: {
          bankName: values.bankName,
          accountNumber: values.accountNumber,
          accountHolder: values.accountHolder,
        },
      };

      // Gọi API để tạo yêu cầu trả hàng
      await orderService.createReturnRequest(returnModal.orderId, returnData);
      
      message.success('Yêu cầu trả hàng đã được gửi thành công!');
      handleCloseReturnModal();
      
      // Refresh dữ liệu đơn hàng
      window.location.reload();
      
    } catch (error) {
      console.error('Lỗi khi gửi yêu cầu trả hàng:', error);
      message.error('Có lỗi xảy ra khi gửi yêu cầu trả hàng. Vui lòng thử lại!');
    } finally {
      setSubmittingReturn(false);
    }
  };

  // Kiểm tra xem đơn hàng có thể trả hàng không
  const canReturnOrder = (order) => {
    // Không cho phép trả hàng nếu đã có yêu cầu hoàn tiền hoặc đã hoàn tiền
    if (['return_requested', 'returned', 'refunded'].includes(order.orderStatus)) {
      return false;
    }
    
    const deliveredDate = new Date(order.deliveredAt || order.updatedAt);
    const currentDate = new Date();
    const daysDiff = Math.floor((currentDate - deliveredDate) / (1000 * 60 * 60 * 24));
    
    return (order.isDelivered || order.orderStatus === 'delivered') && daysDiff <= 7; // Cho phép trả hàng trong 7 ngày
  };
  const handlePageChange = (page, pageSize) => {
    setPagination({ current: page, pageSize });
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  if (isLoading) {
    return (
      <Spin size="large" style={{ display: "block", marginTop: "50px" }} />
    );
  }

  if (isError) {
    return <Alert message={error.message} type="error" showIcon />;
  }
  const renderStatusMenu = () => {
    const menuItems = [
      {
        key: "all",
        icon: <UnorderedListOutlined />,
        label: (
          <span>
            Tất cả đơn hàng
            <span className={styles.statusCount}>{orderCounts.all || 0}</span>
          </span>
        ),
      },
      {
        key: "pending",
        icon: <ClockCircleOutlined />,
        label: (
          <span>
            Chờ xử lý
            <span className={styles.statusCount}>
              {orderCounts.pending || 0}
            </span>
          </span>
        ),
      },
      {
        key: "processing",
        icon: <CarOutlined />,
        label: (
          <span>
            Đang giao hàng
            <span className={styles.statusCount}>
              {orderCounts.processing || 0}
            </span>
          </span>
        ),
      },
      {
        key: "delivered",
        icon: <CheckCircleOutlined />,
        label: (
          <span>
            Giao thành công
            <span className={styles.statusCount}>
              {orderCounts.delivered || 0}
            </span>
          </span>
        ),
      },
      {
        key: "cancelled",
        icon: <ExclamationCircleOutlined />,
        label: (
          <span>
            Đã hủy
            <span className={styles.statusCount}>
              {orderCounts.cancelled || 0}
            </span>
          </span>
        ),
      },
      {
        key: "returned",
        icon: <RollbackOutlined />,
        label: (
          <span>
            Yêu cầu trả hàng
            <span className={styles.statusCount}>
              {orderCounts.returned || 0}
            </span>
          </span>
        ),
      },
      {
        key: "refunded",
        icon: <CheckCircleOutlined />,
        label: (
          <span>
            Đã hoàn tiền
            <span className={styles.statusCount}>
              {orderCounts.refunded || 0}
            </span>
          </span>
        ),
      },
    ];

    return (
      <Menu
        mode={isMobile ? "horizontal" : "inline"}
        selectedKeys={[activeStatus]}
        onClick={({ key }) => handleStatusChange(key)}
        className={isMobile ? styles.filterMenu : styles.sidebarMenu}
        items={menuItems}
      />
    );
  };

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <Title level={2} className={styles.title}>
          <ShoppingOutlined className={styles.titleIcon} />
          Đơn hàng của tôi
        </Title>
        <Text type="secondary" className={styles.subtitle}>
          Quản lý và theo dõi tất cả đơn hàng của bạn
        </Text>
      </div>

      <Row gutter={[24, 24]}>
        <Col xs={0} sm={0} md={6} lg={5} xl={5}>
          <Card className={styles.sidebarCard}>
            <div className={styles.sidebarHeader}>
              <FilterOutlined />
              <span>Lọc theo trạng thái</span>
            </div>
            {renderStatusMenu()}
          </Card>
        </Col>

        <Col xs={24} sm={24} md={18} lg={19} xl={19}>
          <div className={styles.mobileFilter}>
            <Card className={styles.mobileFilterCard}>
              {renderStatusMenu()}
            </Card>
          </div>

          <div className={styles.ordersWrapper}>
            <Spin spinning={isFetching}>
              {queryData?.data?.length === 0 ? (
                <Card className={styles.emptyCard}>
                  <Empty
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description={
                      <div className={styles.emptyDescription}>
                        <Text>Chưa có đơn hàng nào</Text>
                        <br />
                        <Button type="primary" className={styles.shopNowBtn}>
                          <Link to="/">Mua sắm ngay</Link>
                        </Button>
                      </div>
                    }
                  />
                </Card>
              ) : (
                <Space
                  direction="vertical"
                  size="large"
                  className={styles.ordersList}
                >
                  {queryData?.data?.map((order) => (
                    <Card key={order._id} className={styles.orderCard}>
                      <div className={styles.orderHeader}>
                        <div className={styles.orderInfo}>
                          <Space>
                            <Text strong className={styles.orderId}>
                              #{order._id?.slice(-8)}
                            </Text>
                            <Divider type="vertical" />
                            <Text type="secondary" className={styles.orderDate}>
                              <CalendarOutlined />
                              {new Date(order.createdAt).toLocaleDateString(
                                "vi-VN"
                              )}
                            </Text>
                          </Space>
                        </div>
                        <div className={styles.orderStatus}>
                          <Space>
                            {getStatusTag(order.orderStatus)}
                            <Tag
                              color={order.isPaid ? "success" : "warning"}
                              icon={<CreditCardOutlined />}
                            >
                              {order.isPaid
                                ? "Đã thanh toán"
                                : "Chưa thanh toán"}
                            </Tag>
                          </Space>
                        </div>
                      </div>

                      <Divider className={styles.orderDivider} />

                      <div className={styles.orderItems}>
                        {order.items?.slice(0, 2).map((item, index) => (
                          <div key={index} className={styles.orderItem}>
                            <Image
                              src={item.image}
                              alt={item.name}
                              width={80}
                              height={80}
                              className={styles.itemImage}
                              preview={false}
                              fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMIAAADDCAYAAADQvc6UAAABRWlDQ1BJQ0MgUHJvZmlsZQAAKJFjYGASSSwoyGFhYGDIzSspCnJ3UoiIjFJgf8LAwSDCIMogwMCcmFxc4BgQ4ANUwgCjUcG3awyMIPqyLsis7PPOq3QdDFcvjV3jOD1boQVTPQrgSkktTgbSf4A4LbmgqISBgTEFyFYuLykAsTuAbJEioKOA7DkgdjqEvQHEToKwj4DVhAQ5A9k3gGyB5IxEoBmML4BsnSQk8XQkNtReEOBxcfXxUQg1Mjc0dyHgXNJBSWpFCYh2zi+oLMpMzyhRcASGUqqCZ16yno6CkYGRAQMDKMwhqj/fAIcloxgHQqxAjIHBEugw5sUIsSQpBobtQPdLciLEVJYzMPBHMDBsayhILEqEO4DxG0txmrERhM29nYGBddr//5/DGRjYNRkY/l7////39v///y4Dmn+LgeHANwDrkl1AuO+pmgAAADhlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAAqACAAQAAAABAAAAwqADAAQAAAABAAAAwwAAAAD9b/HnAAAHlklEQVR4Ae3dP3Pu3BUE8A2B2G..."
                            />
                            <div className={styles.itemInfo}>
                              <Text strong className={styles.itemName}>
                                {item.name}
                              </Text>
                              <div className={styles.itemDetails}>
                                <Text type="secondary">
                                  Số lượng: {item.amount}
                                </Text>
                                <Text className={styles.itemPrice}>
                                  {(item.newPrice * item.amount).toLocaleString(
                                    "vi-VN"
                                  )}
                                  đ
                                </Text>
                              </div>
                            </div>
                          </div>
                        ))}
                        {order.items?.length > 2 && (
                          <div className={styles.moreItems}>
                            <Text type="secondary">
                              +{order.items.length - 2} sản phẩm khác
                            </Text>
                          </div>
                        )}
                      </div>

                      <Divider className={styles.orderDivider} />

                      <div className={styles.orderFooter}>
                        <div className={styles.totalSection}>
                          <Text>Tổng tiền: </Text>
                          <Text strong className={styles.totalAmount}>
                            {order.totalPrice?.toLocaleString("vi-VN")}đ
                          </Text>
                        </div>
                        <div className={styles.actionButtons}>
                          <Space>
                            <Link to={`/order-details/${order._id}`}>
                              <Button type="primary" icon={<EyeOutlined />}>
                                Chi tiết
                              </Button>
                            </Link>
                            {canReturnOrder(order) && (
                              <Tooltip title="Yêu cầu trả hàng trong vòng 7 ngày kể từ khi nhận hàng">
                                <Button 
                                  icon={<RollbackOutlined />}
                                  onClick={() => handleOpenReturnModal(order)}
                                  style={{ color: '#722ed1', borderColor: '#722ed1' }}
                                >
                                  Trả hàng
                                </Button>
                              </Tooltip>
                            )}
                            <Button icon={<ReloadOutlined />}>Mua lại</Button>
                          </Space>
                        </div>
                      </div>
                    </Card>
                  ))}
                </Space>
              )}
            </Spin>

            {queryData?.total > 0 && (
              <div className={styles.paginationWrapper}>
                <Pagination
                  current={pagination.current}
                  pageSize={pagination.pageSize}
                  total={queryData?.total || 0}
                  onChange={handlePageChange}
                  showSizeChanger={false}
                  showQuickJumper
                  showTotal={(total, range) =>
                    `${range[0]}-${range[1]} của ${total} đơn hàng`
                  }
                  className={styles.pagination}
                />
              </div>
            )}
          </div>
        </Col>
      </Row>

      {/* Modal trả hàng */}
      <Modal
        title={
          <Space>
            <RollbackOutlined style={{ color: '#722ed1' }} />
            <span>Yêu cầu trả hàng</span>
          </Space>
        }
        open={returnModal.visible}
        onCancel={handleCloseReturnModal}
        footer={null}
        width={600}
        destroyOnClose
      >
        <Alert
          message="Lưu ý về chính sách trả hàng"
          description="Bạn chỉ có thể trả hàng trong vòng 7 ngày kể từ khi nhận hàng. Sản phẩm phải còn nguyên vẹn, chưa sử dụng và có đầy đủ bao bì."
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
        />

        <Form
          form={returnForm}
          layout="vertical"
          onFinish={handleSubmitReturn}
        >
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                label="Lý do trả hàng"
                name="reason"
                rules={[{ required: true, message: 'Vui lòng chọn lý do trả hàng!' }]}
              >
                <Select placeholder="Chọn lý do trả hàng">
                  <Select.Option value="defective">Sản phẩm bị lỗi/hỏng</Select.Option>
                  <Select.Option value="not_as_described">Không đúng mô tả</Select.Option>
                  <Select.Option value="wrong_size">Sai kích thước</Select.Option>
                  <Select.Option value="wrong_color">Sai màu sắc</Select.Option>
                  <Select.Option value="not_satisfied">Không hài lòng</Select.Option>
                  <Select.Option value="other">Lý do khác</Select.Option>
                </Select>
              </Form.Item>
            </Col>

            <Col span={24}>
              <Form.Item
                label="Mô tả chi tiết"
                name="description"
                rules={[{ required: true, message: 'Vui lòng mô tả chi tiết lý do trả hàng!' }]}
              >
                <TextArea
                  rows={4}
                  placeholder="Vui lòng mô tả chi tiết tình trạng sản phẩm và lý do muốn trả hàng..."
                  maxLength={500}
                  showCount
                />
              </Form.Item>
            </Col>

            <Col span={24}>
              <Form.Item
                label="Phương thức hoàn tiền"
                name="refundMethod"
                initialValue="bank"
                rules={[{ required: true, message: 'Vui lòng chọn phương thức hoàn tiền!' }]}
              >
                <Radio.Group>
                  <Radio value="bank">Chuyển khoản ngân hàng</Radio>
                </Radio.Group>
              </Form.Item>
            </Col>

            {/* Thông tin ngân hàng - luôn hiển thị vì chỉ có một phương thức */}
            <Col span={24}>
              <Form.Item
                label="Tên ngân hàng"
                name="bankName"
                rules={[{ required: true, message: 'Vui lòng nhập tên ngân hàng!' }]}
              >
                <Input placeholder="VD: Vietcombank, BIDV, Techcombank..." />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                label="Số tài khoản"
                name="accountNumber"
                rules={[{ required: true, message: 'Vui lòng nhập số tài khoản!' }]}
              >
                <Input placeholder="Nhập số tài khoản ngân hàng" />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                label="Chủ tài khoản"
                name="accountHolder"
                rules={[{ required: true, message: 'Vui lòng nhập tên chủ tài khoản!' }]}
              >
                <Input placeholder="Nhập tên chủ tài khoản" />
              </Form.Item>
            </Col>
          </Row>

          <Divider />

          <div style={{ textAlign: 'right' }}>
            <Space>
              <Button onClick={handleCloseReturnModal}>
                Hủy
              </Button>
              <Button 
                type="primary" 
                htmlType="submit"
                loading={submittingReturn}
                icon={<RollbackOutlined />}
              >
                Gửi yêu cầu trả hàng
              </Button>
            </Space>
          </div>
        </Form>
      </Modal>
    </div>
  );
}

export default MyOrder;
