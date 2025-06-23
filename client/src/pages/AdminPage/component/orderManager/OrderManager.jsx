import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Table, Spin, Alert, Button, Tag } from 'antd';
import { useNavigate } from 'react-router-dom';
import * as orderService from '../../../../services/orderService';
import styles from './OrderManager.module.css';

const OrderManager = () => {
  const navigate = useNavigate();
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
  });
  const { data: queryData, isLoading, isError, error, isFetching } = useQuery({
    queryKey: ['orders', pagination.current, pagination.pageSize],
    queryFn: () => orderService.getAllOrders(pagination.pageSize, pagination.current - 1),
    keepPreviousData: true, // Giữ lại dữ liệu cũ khi đang fetch dữ liệu mới
  });

  const handleDetailsClick = (orderId) => {
    navigate(`/order-details/${orderId}`);
  };  // Cập nhật xử lý sự kiện cho đúng với Ant Design Table
  const handleTableChange = (newPagination) => {
    setPagination({
      current: newPagination.current,
      pageSize: newPagination.pageSize,
    });
    
    // Cuộn trang lên đầu sau khi chuyển trang
    window.scrollTo({
      top: 0,
      behavior: 'smooth' // Tạo hiệu ứng cuộn mượt
    });
  };

  const columns = [
    {
      title: 'Mã đơn hàng',
      dataIndex: '_id',
      key: '_id',
      render: (text) => <code>{text}</code>,
    },
    {
      title: 'Khách hàng',
      dataIndex: 'shippingInfo',
      key: 'customer',
      render: (shippingInfo) => shippingInfo?.fullName || 'N/A',
    },
    {
      title: 'Tổng tiền',
      dataIndex: 'totalPrice',
      key: 'totalPrice',
      render: (price) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price),
    },
    {
        title: 'Trạng thái',
        dataIndex: 'orderStatus',
        key: 'orderStatus',
        render: (status) => {
            let color = 'default';
            let text = status;
            switch (status) {
                case 'pending': color = 'gold'; text = 'Chờ xử lý'; break;
                case 'processing': color = 'processing'; text = 'Đang xử lý'; break;
                case 'delivered': color = 'success'; text = 'Đã giao'; break;
                case 'cancelled': color = 'error'; text = 'Đã hủy'; break;
                case 'payment_failed': color = 'red'; text = 'Thanh toán thất bại'; break;
            }
            return <Tag color={color}>{text}</Tag>;
        },
    },
    {
        title: 'Thanh toán',
        dataIndex: 'isPaid',
        key: 'isPaid',
        render: (isPaid) => (
            <Tag color={isPaid ? 'green' : 'volcano'}>
                {isPaid ? 'ĐÃ THANH TOÁN' : 'CHƯA THANH TOÁN'}
            </Tag>
        ),
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => new Date(date).toLocaleDateString('vi-VN'),
    },
    {
      title: 'Hành động',
      key: 'action',
      render: (_, record) => (
        <Button type="primary" onClick={() => handleDetailsClick(record._id)}>
          Xem chi tiết
        </Button>
      ),
    },
  ];

  if (isLoading && !queryData) { // Chỉ hiển thị loading toàn trang khi chưa có dữ liệu
    return <div className={styles.loadingContainer}><Spin size="large" /></div>;
  }

  if (isError) {
    return <Alert message="Lỗi" description={error.message} type="error" showIcon />;
  }
  return (
    <div className={styles.orderManagerContainer}>
      <h2>Quản lý đơn hàng</h2>
      <Table
        columns={columns}
        dataSource={queryData?.data || []}
        rowKey="_id"
        loading={isLoading || isFetching} // Hiển thị loading trên bảng khi fetch lại hoặc đang chờ dữ liệu mới
        pagination={{
          ...pagination,
          total: queryData?.total || 0,
          current: pagination.current,
          pageSize: pagination.pageSize,
          showSizeChanger: true,
          pageSizeOptions: ['5', '10', '20', '50'],
          showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} đơn hàng`,
        }}
        onChange={handleTableChange}
        scroll={{ x: true }}
      />
    </div>
  );
};

export default OrderManager;
