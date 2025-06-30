import React, { useState, useEffect } from "react";
import {
  List,
  Card,
  Tag,
  Button,
  Typography,
  Spin,
  Alert,
  Avatar,
  Menu,
  Divider,
  Empty,
  Row,
  Col,
  Space,
  Pagination,
  Image,
  Badge,
  Tooltip,
} from "antd";
import {
  FilterOutlined,
  ClockCircleOutlined,
  CarOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  AppstoreOutlined,
  UnorderedListOutlined,
  ShoppingOutlined,
  EyeOutlined,
  ReloadOutlined,
  CalendarOutlined,
  CreditCardOutlined,
} from "@ant-design/icons";
import { useSelector } from "react-redux";
import { useQuery } from "@tanstack/react-query";
import * as orderService from "../../services/orderService";
import styles from "./Myorder.module.css";
import { Link } from "react-router-dom";
import { useMediaQuery } from "react-responsive";

const { Title, Text, Paragraph } = Typography;

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

  // Đếm số lượng cho từng loại trạng thái
  const [orderCounts, setOrderCounts] = useState({
    all: 0,
    pending: 0,
    processing: 0,
    delivered: 0,
    cancelled: 0,
  }); // Lấy tổng số đơn hàng và số lượng đơn hàng theo từng trạng thái
  useEffect(() => {
    const fetchOrderCounts = async () => {
      if (!userId) return;

      try {
        // Lấy tổng số đơn hàng và phân loại theo trạng thái
        const allOrdersCount = await orderService.getOrdersCount(userId);

        // Kiểm tra dữ liệu trả về từ API
        if (allOrdersCount && typeof allOrdersCount === "object") {
          // Cập nhật state với dữ liệu từ API
          setOrderCounts({
            all: allOrdersCount.total || 0,
            pending: allOrdersCount.pending || 0,
            processing: allOrdersCount.processing || 0,
            delivered: allOrdersCount.delivered || 0,
            cancelled: allOrdersCount.cancelled || 0,
          });

          console.log("Fetched order counts:", allOrdersCount);
        }
      } catch (error) {
        console.error("Không thể lấy số lượng đơn hàng:", error);
      }
    };

    fetchOrderCounts();
  }, [userId, activeStatus]); // Thêm activeStatus để cập nhật khi chuyển tab
useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'smooth'
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

      // Gọi API với tham số status nếu không phải "all"
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
      // Chỉ cập nhật thông tin tổng số đơn hàng cho view hiện tại
      // không cần cập nhật các counts khác vì đã có API getOrdersCount làm việc đó
      if (activeStatus !== "all") {
        // Khi đang lọc theo trạng thái, chỉ cập nhật số lượng hiện tại
        setOrderCounts((prev) => ({
          ...prev,
          [activeStatus]: data.total || 0,
        }));
      } else {
        // Khi xem tất cả, cập nhật tổng số đơn hàng
        setOrderCounts((prev) => ({ ...prev, all: data.total || 0 }));
      }
    },
  });
  const handleStatusChange = (status) => {
    console.log(`Changing status filter to: ${status}`);
    setActiveStatus(status);
    setPagination((prev) => ({ ...prev, current: 1 })); // Reset về trang đầu khi thay đổi bộ lọc
  };
  const handlePageChange = (page, pageSize) => {
    setPagination({ current: page, pageSize });

    // Cuộn trang lên đầu sau khi chuyển trang
    window.scrollTo({
      top: 0,
      behavior: "smooth", // Tạo hiệu ứng cuộn mượt
    });
  };

  if (isLoading) {
    return (
      <Spin size="large" style={{ display: "block", marginTop: "50px" }} />
    );
  }

  if (isError) {
    return <Alert message={error.message} type="error" showIcon />;
  } // Render status menu function để tái sử dụng
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
        {/* Sidebar - Desktop Only */}
        <Col xs={0} sm={0} md={6} lg={5} xl={5}>
          <Card className={styles.sidebarCard}>
            <div className={styles.sidebarHeader}>
              <FilterOutlined />
              <span>Lọc theo trạng thái</span>
            </div>
            {renderStatusMenu()}
          </Card>
        </Col>

        {/* Main Content */}
        <Col xs={24} sm={24} md={18} lg={19} xl={19}>
          {/* Mobile Filter */}
          <div className={styles.mobileFilter}>
            <Card className={styles.mobileFilterCard}>
              {renderStatusMenu()}
            </Card>
          </div>

          {/* Orders List */}
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
                      {/* Order Header */}
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

                      {/* Order Items */}
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
                                  {(item.price * item.amount).toLocaleString(
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

                      {/* Order Footer */}
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
                            <Button icon={<ReloadOutlined />}>Mua lại</Button>
                          </Space>
                        </div>
                      </div>
                    </Card>
                  ))}
                </Space>
              )}
            </Spin>

            {/* Pagination */}
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
    </div>
  );
}

export default MyOrder;
