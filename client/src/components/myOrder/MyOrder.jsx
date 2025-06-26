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
} from "@ant-design/icons";
import { useSelector } from "react-redux";
import { useQuery } from "@tanstack/react-query";
import * as orderService from "../../services/orderService";
import styles from "./Myorder.module.css";
import { Link } from "react-router-dom";
import { useMediaQuery } from "react-responsive";

const { Title, Text, Paragraph } = Typography;

const getStatusTag = (status) => {
  switch (status) {
    case "pending":
      return <Tag color="gold">Chờ xử lý</Tag>;
    case "processing":
      return <Tag color="processing">Đang xử lý</Tag>;
    case "delivered":
      return <Tag color="success">Đã giao hàng</Tag>;
    case "cancelled":
      return <Tag color="error">Đã hủy</Tag>;
    case "payment_failed":
      return <Tag color="red">Thanh toán thất bại</Tag>;
    default:
      return <Tag>{status}</Tag>;
  }
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
  const renderStatusMenu = () => (
    <Menu
      mode={isMobile ? "horizontal" : "inline"}
      selectedKeys={[activeStatus]}
      onClick={({ key }) => handleStatusChange(key)}
      className={isMobile ? styles.filterMenu : styles.sidebarMenu}
    >
      <Menu.Item key="all" icon={<UnorderedListOutlined />}>
        Tất cả đơn hàng
        <span className={styles.statusCount}>{orderCounts.all || 0}</span>
      </Menu.Item>
      <Menu.Item key="pending" icon={<ClockCircleOutlined />}>
        Chờ xử lý
        <span className={styles.statusCount}>{orderCounts.pending || 0}</span>
      </Menu.Item>
      <Menu.Item key="processing" icon={<CarOutlined />}>
        Đang giao hàng
        <span className={styles.statusCount}>
          {orderCounts.processing || 0}
        </span>
      </Menu.Item>
      <Menu.Item key="delivered" icon={<CheckCircleOutlined />}>
        Giao thành công
        <span className={styles.statusCount}>{orderCounts.delivered || 0}</span>
      </Menu.Item>
      <Menu.Item key="cancelled" icon={<ExclamationCircleOutlined />}>
        Đã hủy
        <span className={styles.statusCount}>{orderCounts.cancelled || 0}</span>
      </Menu.Item>
    </Menu>
  );

  return (
    <div className={styles.orderContainer}>
      <Title level={2} className={styles.title}>
        Đơn hàng của tôi
      </Title>

      {/* Layout cho mobile và desktop */}
      <div className={styles.orderLayout}>
        {/* Sidebar chỉ hiển thị trên desktop */}
        <div className={styles.orderSidebar}>
          <div className={styles.statusHeading}>
            <FilterOutlined className={styles.icon} />
            <span>Trạng thái đơn hàng</span>
          </div>
          {renderStatusMenu()}
        </div>

        <div className={styles.orderContent}>
          {/* Menu filter hiển thị trên mobile */}
          <div
            className={`${styles.mobileOrderSidebar} ${
              !isMobile ? styles.hideOnDesktop : ""
            }`}
          >
            {renderStatusMenu()}
          </div>

          <Spin spinning={isFetching}>
            <List
              grid={{ gutter: 16, xs: 1, sm: 1, md: 1, lg: 1, xl: 1, xxl: 1 }}
              dataSource={queryData?.data || []}
              pagination={{
                current: pagination.current,
                pageSize: pagination.pageSize,
                total: queryData?.total || 0,
                onChange: handlePageChange,
              }}
              renderItem={(order) => (
                <List.Item>
                  <Card className={styles.orderCard}>
                    <div className={styles.cardHeader}>
                      <Text strong className={styles.orderId}>
                        Mã đơn hàng: #{order._id.slice(-8)}
                      </Text>
                      <div>
                        {getStatusTag(order.orderStatus)}
                        <Tag color={order.isPaid ? "green" : "orange"}>
                          {order.isPaid ? "Đã thanh toán" : "Chưa thanh toán"}
                        </Tag>
                      </div>
                    </div>
                    <List
                      dataSource={order.items}
                      renderItem={(item) => (
                        <List.Item className={styles.productItem}>
                          <List.Item.Meta
                            avatar={<Avatar src={item.image} size={64} />}
                            title={<Text strong>{item.name}</Text>}
                            description={`Số lượng: ${item.amount}`}
                          />
                          <Text>
                            {(item.price * item.amount).toLocaleString()}đ
                          </Text>
                        </List.Item>
                      )}
                    />
                    <div className={styles.orderFooter}>
                      <Title level={4} className={styles.totalAmount}>
                        Tổng tiền:{" "}
                        <span>{order.totalPrice.toLocaleString()}đ</span>
                      </Title>
                      <div className={styles.actionButtons}>
                        <Link to={`/order-details/${order._id}`}>
                          <Button type="primary">Xem chi tiết</Button>
                        </Link>
                        <Button>Mua lại</Button>
                      </div>
                    </div>
                  </Card>
                </List.Item>
              )}
            />
          </Spin>
        </div>
      </div>
    </div>
  );
}

export default MyOrder;
