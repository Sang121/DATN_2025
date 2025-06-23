import React, { useState } from "react";
import { List, Card, Tag, Button, Typography, Spin, Alert, Avatar } from "antd";
import { useSelector } from "react-redux";
import { useQuery } from "@tanstack/react-query";
import * as orderService from "../../services/orderService";
import styles from "./MyOrder.module.css";
import { Link } from "react-router-dom";

const { Title, Text } = Typography;

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

  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 5, // Hiển thị 5 đơn hàng mỗi trang
  });

  const { data: queryData, isLoading, isError, error, isFetching } = useQuery({
    queryKey: ["my-orders", userId, pagination.current, pagination.pageSize],
    queryFn: () => {
      if (!userId) {
        return Promise.reject(new Error("Vui lòng đăng nhập để xem đơn hàng."));
      }
      return orderService.getOrdersByUserId(
        userId,
        pagination.pageSize,
        pagination.current - 1
      );
    },
    enabled: !!userId,
    keepPreviousData: true,
  });
  const handlePageChange = (page, pageSize) => {
    setPagination({ current: page, pageSize });
    
    // Cuộn trang lên đầu sau khi chuyển trang
    window.scrollTo({
      top: 0,
      behavior: 'smooth' // Tạo hiệu ứng cuộn mượt
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

  return (
    <div className={styles.orderContainer}>
      <Title level={2} className={styles.title}>
        Đơn hàng của tôi
      </Title>
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
                      <Text>{(item.price * item.amount).toLocaleString()}đ</Text>
                    </List.Item>
                  )}
                />
                <div className={styles.orderFooter}>
                  <Title level={4} className={styles.totalAmount}>
                    Tổng tiền: <span>{order.totalPrice.toLocaleString()}đ</span>
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
  );
}

export default MyOrder;
