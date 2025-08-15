import React, { useState } from "react";
import {
  Card,
  Table,
  Tag,
  Button,
  Space,
  Modal,
  Form,
  Input,
  message,
  Tooltip,
  Typography,
  Row,
  Col,
  Descriptions,
  Alert,
  Select,
} from "antd";
import {
  EyeOutlined,
  CheckOutlined,
  CloseOutlined,
  RollbackOutlined,
  CreditCardOutlined,
  UserOutlined,
  CalendarOutlined,
  DollarOutlined,
} from "@ant-design/icons";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as orderService from "../../../../../services/orderService";
import styles from "./ReturnRequestManager.module.css";

const { Title, Text } = Typography;
const { TextArea } = Input;

const ReturnRequestManager = () => {
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });
  const [selectedStatus, setSelectedStatus] = useState(null);
  const [detailModal, setDetailModal] = useState({
    visible: false,
    data: null,
  });
  const [processModal, setProcessModal] = useState({
    visible: false,
    requestId: null,
    action: null,
  });
  const [form] = Form.useForm();
  const queryClient = useQueryClient();

  // Fetch return requests
  const { data, isLoading } = useQuery({
    queryKey: [
      "return-requests",
      pagination.current,
      pagination.pageSize,
      selectedStatus,
    ],
    queryFn: () =>
      orderService.getReturnRequests(
        pagination.current - 1,
        pagination.pageSize,
        selectedStatus
      ),
    keepPreviousData: true,
  });

  // Process return request mutation
  const processReturnMutation = useMutation({
    mutationFn: ({ requestId, action, adminNote }) =>
      orderService.processReturnRequest(requestId, action, adminNote),
    onSuccess: (data, variables) => {
      message.success(
        variables.action === "approve"
          ? "Đã phê duyệt yêu cầu trả hàng thành công!"
          : "Đã từ chối yêu cầu trả hàng!"
      );
      queryClient.invalidateQueries(["return-requests"]);
      setProcessModal({ visible: false, requestId: null, action: null });
      form.resetFields();
    },
    onError: (error) => {
      message.error(`Có lỗi xảy ra: ${error.message}`);
    },
  });

  // Mark as completed mutation
  const markCompletedMutation = useMutation({
    mutationFn: (requestId) =>
      orderService.markReturnRequestCompleted(requestId),
    onSuccess: () => {
      message.success("Đã cập nhật trạng thái hoàn tiền thành công!");
      queryClient.invalidateQueries(["return-requests"]);
      setDetailModal({ visible: false, data: null });
    },
    onError: (error) => {
      message.error(`Có lỗi xảy ra: ${error.message}`);
    },
  });

  // Status colors
  const getStatusTag = (status) => {
    const statusMap = {
      pending: { color: "orange", text: "Chờ xử lý" },
      approved: { color: "green", text: "Đã phê duyệt" },
      rejected: { color: "red", text: "Đã từ chối" },
      completed: { color: "blue", text: "Hoàn thành" },
    };
    const statusInfo = statusMap[status] || { color: "default", text: status };
    return <Tag color={statusInfo.color}>{statusInfo.text}</Tag>;
  };

  // Reason mapping
  const getReasonText = (reason) => {
    const reasonMap = {
      defective: "Sản phẩm bị lỗi/hỏng",
      not_as_described: "Không đúng mô tả",
      wrong_size: "Sai kích thước",
      wrong_color: "Sai màu sắc",
      not_satisfied: "Không hài lòng",
      other: "Lý do khác",
    };
    return reasonMap[reason] || reason;
  };

  // Table columns
  const columns = [
    {
      title: "Mã yêu cầu",
      dataIndex: "_id",
      key: "_id",
      render: (id) => `#${id.slice(-8)}`,
      width: 120,
    },
    {
      title: "Đơn hàng",
      dataIndex: ["order", "_id"],
      key: "orderId",
      render: (orderId) => `#${orderId?.slice(-8)}`,
      width: 120,
    },
    {
      title: "Khách hàng",
      dataIndex: ["order", "shippingInfo", "fullName"],
      key: "customerName",
      width: 150,
    },
    {
      title: "Lý do",
      dataIndex: "reason",
      key: "reason",
      render: getReasonText,
      width: 150,
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: getStatusTag,
      width: 120,
    },
    {
      title: "Ngày tạo",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date) => new Date(date).toLocaleDateString("vi-VN"),
      width: 120,
    },
    {
      title: "Thao tác",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Tooltip title="Xem chi tiết">
            <Button
              icon={<EyeOutlined />}
              onClick={() => setDetailModal({ visible: true, data: record })}
              size="small"
            />
          </Tooltip>
          {record.status === "pending" && (
            <>
              <Tooltip title="Phê duyệt">
                <Button
                  icon={<CheckOutlined />}
                  type="primary"
                  size="small"
                  onClick={() =>
                    setProcessModal({
                      visible: true,
                      requestId: record._id,
                      action: "approve",
                    })
                  }
                />
              </Tooltip>
              <Tooltip title="Từ chối">
                <Button
                  icon={<CloseOutlined />}
                  danger
                  size="small"
                  onClick={() =>
                    setProcessModal({
                      visible: true,
                      requestId: record._id,
                      action: "reject",
                    })
                  }
                />
              </Tooltip>
            </>
          )}
          {record.status === "approved" && (
            <Tooltip title="Đã hoàn tiền">
              <Button
                icon={<DollarOutlined />}
                type="primary"
                size="small"
                style={{ backgroundColor: "#52c41a" }}
                onClick={() => {
                  Modal.confirm({
                    title: "Xác nhận hoàn tiền",
                    content: "Bạn có chắc chắn đã hoàn tiền cho khách hàng?",
                    onOk: () => markCompletedMutation.mutate(record._id),
                  });
                }}
                loading={markCompletedMutation.isLoading}
              />
            </Tooltip>
          )}
        </Space>
      ),
      width: 150,
    },
  ];

  const handleTableChange = (newPagination) => {
    setPagination(newPagination);
  };

  const handleProcessSubmit = async (values) => {
    await processReturnMutation.mutateAsync({
      requestId: processModal.requestId,
      action: processModal.action,
      adminNote: values.adminNote || "",
    });
  };

  return (
    <div className={styles.container}>
      <Card>
        <div className={styles.header}>
          <Title level={3}>
            <RollbackOutlined /> Quản lý yêu cầu trả hàng
          </Title>
          <Space>
            <Select
              placeholder="Lọc theo trạng thái"
              allowClear
              style={{ width: 200 }}
              onChange={setSelectedStatus}
              options={[
                { value: "pending", label: "Chờ xử lý" },
                { value: "approved", label: "Đã phê duyệt" },
                { value: "rejected", label: "Đã từ chối" },
                { value: "completed", label: "Hoàn thành" },
              ]}
            />
          </Space>
        </div>

        <Table
          columns={columns}
          dataSource={data?.data || []}
          loading={isLoading}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: data?.total || 0,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} của ${total} yêu cầu`,
          }}
          onChange={handleTableChange}
          rowKey="_id"
          scroll={{ x: 800 }}
        />
      </Card>

      {/* Detail Modal */}
      <Modal
        title="Chi tiết yêu cầu trả hàng"
        open={detailModal.visible}
        onCancel={() => setDetailModal({ visible: false, data: null })}
        footer={[
          <Button
            key="close"
            onClick={() => setDetailModal({ visible: false, data: null })}
          >
            Đóng
          </Button>,
          ...(detailModal.data?.status === "approved"
            ? [
                <Button
                  key="complete"
                  type="primary"
                  icon={<DollarOutlined />}
                  loading={markCompletedMutation.isLoading}
                  onClick={() => {
                    Modal.confirm({
                      title: "Xác nhận hoàn tiền",
                      content: (
                        <div>
                          <p>Bạn có chắc chắn đã hoàn tiền cho khách hàng?</p>
                          <p>
                            <strong>Thông tin chuyển khoản:</strong>
                          </p>
                          <p>
                            Ngân hàng: {detailModal.data?.bankInfo?.bankName}
                          </p>
                          <p>
                            Số TK: {detailModal.data?.bankInfo?.accountNumber}
                          </p>
                          <p>
                            Chủ TK: {detailModal.data?.bankInfo?.accountHolder}
                          </p>
                        </div>
                      ),
                      onOk: () =>
                        markCompletedMutation.mutate(detailModal.data._id),
                    });
                  }}
                >
                  Đã hoàn tiền
                </Button>,
              ]
            : []),
        ]}
        width={800}
      >
        {detailModal.data && (
          <div>
            <Descriptions column={2} bordered>
              <Descriptions.Item label="Mã yêu cầu">
                #{detailModal.data._id?.slice(-8)}
              </Descriptions.Item>
              <Descriptions.Item label="Mã đơn hàng">
                #{detailModal.data.order?._id?.slice(-8)}
              </Descriptions.Item>
              <Descriptions.Item label="Khách hàng">
                <Space>
                  <UserOutlined />
                  {detailModal.data.order.shippingInfo.fullName}
                </Space>
              </Descriptions.Item>
              <Descriptions.Item label="Trạng thái">
                {getStatusTag(detailModal.data.status)}
              </Descriptions.Item>
              <Descriptions.Item label="Lý do trả hàng">
                {getReasonText(detailModal.data.reason)}
              </Descriptions.Item>
              <Descriptions.Item label="Ngày tạo">
                <Space>
                  <CalendarOutlined />
                  {new Date(detailModal.data.createdAt).toLocaleString("vi-VN")}
                </Space>
              </Descriptions.Item>
              <Descriptions.Item label="Phương thức hoàn tiền">
                <Space>
                  <CreditCardOutlined />
                  Chuyển khoản ngân hàng
                </Space>
              </Descriptions.Item>
              {detailModal.data.processedAt && (
                <Descriptions.Item label="Ngày xử lý">
                  <Space>
                    <CalendarOutlined />
                    {new Date(detailModal.data.processedAt).toLocaleString(
                      "vi-VN"
                    )}
                  </Space>
                </Descriptions.Item>
              )}
              {detailModal.data.completedAt && (
                <Descriptions.Item label="Ngày hoàn tiền">
                  <Space>
                    <DollarOutlined />
                    {new Date(detailModal.data.completedAt).toLocaleString(
                      "vi-VN"
                    )}
                  </Space>
                </Descriptions.Item>
              )}
            </Descriptions>

            <div style={{ marginTop: 16 }}>
              <Text strong>Mô tả chi tiết:</Text>
              <div
                style={{
                  marginTop: 8,
                  padding: 12,
                  background: "#f9f9f9",
                  borderRadius: 6,
                  border: "1px solid #f0f0f0",
                }}
              >
                {detailModal.data.description}
              </div>
            </div>

            {detailModal.data.bankInfo && (
              <div style={{ marginTop: 16 }}>
                <Text strong>Thông tin ngân hàng:</Text>
                <Descriptions column={1} size="small" style={{ marginTop: 8 }}>
                  <Descriptions.Item label="Ngân hàng">
                    {detailModal.data.bankInfo.bankName}
                  </Descriptions.Item>
                  <Descriptions.Item label="Số tài khoản">
                    {detailModal.data.bankInfo.accountNumber}
                  </Descriptions.Item>
                  <Descriptions.Item label="Chủ tài khoản">
                    {detailModal.data.bankInfo.accountHolder}
                  </Descriptions.Item>
                </Descriptions>
              </div>
            )}

            {detailModal.data.adminNote && (
              <div style={{ marginTop: 16 }}>
                <Text strong>Ghi chú của admin:</Text>
                <div
                  style={{
                    marginTop: 8,
                    padding: 12,
                    background: "#f6ffed",
                    borderRadius: 6,
                    border: "1px solid #b7eb8f",
                  }}
                >
                  {detailModal.data.adminNote}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Process Modal */}
      <Modal
        title={`${
          processModal.action === "approve" ? "Phê duyệt" : "Từ chối"
        } yêu cầu trả hàng`}
        open={processModal.visible}
        onCancel={() => {
          setProcessModal({ visible: false, requestId: null, action: null });
          form.resetFields();
        }}
        onOk={() => form.submit()}
        confirmLoading={processReturnMutation.isLoading}
        okText={processModal.action === "approve" ? "Phê duyệt" : "Từ chối"}
        okButtonProps={{
          type: processModal.action === "approve" ? "primary" : "danger",
        }}
      >
        <Alert
          message={
            processModal.action === "approve"
              ? "Phê duyệt yêu cầu trả hàng"
              : "Từ chối yêu cầu trả hàng"
          }
          description={
            processModal.action === "approve"
              ? 'Sau khi phê duyệt, đơn hàng sẽ được chuyển sang trạng thái "returned" và tiến hành hoàn tiền cho khách hàng.'
              : "Vui lòng cung cấp lý do từ chối để khách hàng hiểu rõ."
          }
          type={processModal.action === "approve" ? "info" : "warning"}
          showIcon
          style={{ marginBottom: 16 }}
        />

        <Form form={form} layout="vertical" onFinish={handleProcessSubmit}>
          <Form.Item
            label="Ghi chú"
            name="adminNote"
            rules={
              processModal.action === "reject"
                ? [{ required: true, message: "Vui lòng nhập lý do từ chối!" }]
                : []
            }
          >
            <TextArea
              rows={4}
              placeholder={
                processModal.action === "approve"
                  ? "Ghi chú thêm (không bắt buộc)..."
                  : "Nhập lý do từ chối yêu cầu trả hàng..."
              }
              maxLength={500}
              showCount
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ReturnRequestManager;
