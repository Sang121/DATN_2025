import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Table,
  Spin,
  Alert,
  Button,
  Tag,
  message,
  Tooltip,
  Modal,
  Radio,
} from "antd";
import { useNavigate } from "react-router-dom";
import * as orderService from "../../../../services/orderService";
import styles from "./OrderManager.module.css";
import * as XLSX from "xlsx";
import { FileExcelOutlined, LoadingOutlined } from "@ant-design/icons";

const OrderManager = () => {
  const navigate = useNavigate();
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
  });
  const [exportModalVisible, setExportModalVisible] = useState(false);
  const [exportType, setExportType] = useState("current");
  const [exporting, setExporting] = useState(false);

  const {
    data: queryData,
    isLoading,
    isError,
    error,
    isFetching,
  } = useQuery({
    queryKey: ["orders", pagination.current, pagination.pageSize],
    queryFn: () =>
      orderService.getAllOrders(pagination.pageSize, pagination.current - 1),
    keepPreviousData: true,
  });

  // Mở modal xuất Excel
  const showExportModal = () => {
    setExportModalVisible(true);
  };

  // Xử lý sự kiện thay đổi loại xuất
  const handleExportTypeChange = (e) => {
    setExportType(e.target.value);
  };

  // Xử lý đóng modal
  const handleCancelExport = () => {
    setExportModalVisible(false);
  };

  // Chuẩn bị dữ liệu để xuất Excel
  const prepareExportData = (orders) => {
    return orders.map((order) => {
      return {
        "Mã đơn hàng": order._id,
        "Khách hàng": order.shippingInfo?.fullName || "N/A",
        Email: order.shippingInfo?.email || "N/A",
        "Số điện thoại": order.shippingInfo?.phone || "N/A",
        "Địa chỉ": order.shippingInfo?.address || "N/A",
        "Phương thức thanh toán": order.paymentMethod || "N/A",
        "Tổng tiền": order.totalPrice.toLocaleString("vi-VN") + " VND",
        "Trạng thái đơn hàng": formatOrderStatus(order.orderStatus),
        "Trạng thái thanh toán": order.isPaid
          ? "Đã thanh toán"
          : "Chưa thanh toán",
        "Ngày tạo": new Date(order.createdAt).toLocaleDateString("vi-VN"),
        "Cập nhật cuối": new Date(
          order.updatedAt || order.createdAt
        ).toLocaleDateString("vi-VN"),
      };
    });
  };

  // Hàm xuất dữ liệu sang Excel
  const exportToExcel = async () => {
    try {
      setExporting(true);

      let exportData = [];

      if (exportType === "current") {
        // Xuất dữ liệu từ trang hiện tại
        if (!queryData?.data || queryData.data.length === 0) {
          message.warning("Không có dữ liệu để xuất");
          setExporting(false);
          setExportModalVisible(false);
          return;
        }
        exportData = prepareExportData(queryData.data);
      } else {
        // Xuất tất cả dữ liệu
        const allOrdersResponse = await orderService.getAllOrdersForExport();
        if (!allOrdersResponse?.data || allOrdersResponse.data.length === 0) {
          message.warning("Không có dữ liệu để xuất");
          setExporting(false);
          setExportModalVisible(false);
          return;
        }
        exportData = prepareExportData(allOrdersResponse.data);
      }

      // Tạo workbook và worksheet
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(exportData);

      // Thiết lập độ rộng các cột
      const columnWidths = [
        { wch: 30 }, // Mã đơn hàng
        { wch: 25 }, // Khách hàng
        { wch: 30 }, // Email
        { wch: 15 }, // Số điện thoại
        { wch: 40 }, // Địa chỉ
        { wch: 20 }, // Phương thức thanh toán
        { wch: 15 }, // Tổng tiền
        { wch: 20 }, // Trạng thái đơn hàng
        { wch: 20 }, // Trạng thái thanh toán
        { wch: 15 }, // Ngày tạo
        { wch: 15 }, // Cập nhật cuối
      ];
      ws["!cols"] = columnWidths;

      // Thêm worksheet vào workbook
      XLSX.utils.book_append_sheet(wb, ws, "Danh sách đơn hàng");

      // Tạo tên file với định dạng "Danh_sach_don_hang-YYYY-MM-DD.xlsx"
      const currentDate = new Date();
      const fileName = `Danh_sach_don_hang-${currentDate
        .toISOString()
        .slice(0, 10)
        .replace(/\//g, "-")}.xlsx`;

      // Xuất file
      XLSX.writeFile(wb, fileName);
      message.success("Xuất Excel thành công!");
    } catch (error) {
      console.error("Error exporting to Excel:", error);
      message.error("Có lỗi xảy ra khi xuất Excel. Vui lòng thử lại sau.");
    } finally {
      setExporting(false);
      setExportModalVisible(false);
    }
  };
  // Helper function để format trạng thái đơn hàng
  const formatOrderStatus = (status) => {
    switch (status) {
      case "pending":
        return "Chờ xử lý";
      case "pending_payment":
        return "Chờ thanh toán";
      case "processing":
        return "Đang xử lý";
      case "delivered":
        return "Đã giao";
      case "cancelled":
        return "Đã hủy";
      case "payment_failed":
        return "Thanh toán thất bại";
      default:
        return status;
    }
  };

  const handleDetailsClick = (orderId) => {
    navigate(`/admin/order-details/${orderId}`);
  };

  // Cập nhật xử lý sự kiện cho đúng với Ant Design Table
  const handleTableChange = (newPagination, filters, sorter) => {
    console.log("Table parameters:", {
      pagination: newPagination,
      filters,
      sorter,
    });
    setPagination({
      current: newPagination.current,
      pageSize: newPagination.pageSize,
    });

    // Cuộn trang lên đầu sau khi chuyển trang
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };
  const columns = [
    {
      title: "Mã đơn hàng",
      dataIndex: "_id",
      key: "_id",
      render: (text) => <code>{text}</code>,
      sorter: (a, b) => a._id.localeCompare(b._id),
    },
    {
      title: "Khách hàng",
      dataIndex: "shippingInfo",
      key: "customer",
      render: (shippingInfo) => shippingInfo?.fullName || "N/A",
      sorter: (a, b) =>
        (a.shippingInfo?.fullName || "").localeCompare(
          b.shippingInfo?.fullName || ""
        ),
    },
    {
      title: "Tổng tiền",
      dataIndex: "totalPrice",
      key: "totalPrice",
      render: (price) =>
        new Intl.NumberFormat("vi-VN", {
          style: "currency",
          currency: "VND",
        }).format(price),
      sorter: (a, b) => a.totalPrice - b.totalPrice,
    },
    {
      title: "Trạng thái",
      dataIndex: "orderStatus",
      key: "orderStatus",
      render: (status) => {
        let color = "default";
        let text = status;
        switch (status) {
          case "pending":
            color = "gold";
            text = "Chờ xử lý";
            break;
          case "processing":
            color = "processing";
            text = "Đang xử lý";
            break;
          case "delivered":
            color = "success";
            text = "Đã giao";
            break;
          case "cancelled":
            color = "error";
            text = "Đã hủy";
            break;
          case "payment_failed":
            color = "red";
            text = "Thanh toán thất bại";
            break;
        }
        return <Tag color={color}>{text}</Tag>;
      },
      filters: [
        { text: "Chờ xử lý", value: "pending" },
        { text: "Đang xử lý", value: "processing" },
        { text: "Đã giao", value: "delivered" },
        { text: "Đã hủy", value: "cancelled" },
        { text: "Thanh toán thất bại", value: "payment_failed" },
      ],
      onFilter: (value, record) => record.orderStatus === value,
    },
    {
      title: "Thanh toán",
      dataIndex: "isPaid",
      key: "isPaid",
      render: (isPaid) => (
        <Tag color={isPaid ? "green" : "volcano"}>
          {isPaid ? "ĐÃ THANH TOÁN" : "CHƯA THANH TOÁN"}
        </Tag>
      ),
      filters: [
        { text: "Đã thanh toán", value: true },
        { text: "Chưa thanh toán", value: false },
      ],
      onFilter: (value, record) => record.isPaid === value,
    },
    {
      title: "Ngày tạo",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date) => new Date(date).toLocaleDateString("vi-VN"),
      sorter: (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
      defaultSortOrder: "descend",
    },
    {
      title: "Hành động",
      key: "action",
      render: (_, record) => (
        <Button type="primary" onClick={() => handleDetailsClick(record._id)}>
          Xem chi tiết
        </Button>
      ),
    },
  ];

  if (isLoading && !queryData) {
    return (
      <div className={styles.loadingContainer}>
        <Spin size="large" />
      </div>
    );
  }

  if (isError) {
    return (
      <Alert message="Lỗi" description={error.message} type="error" showIcon />
    );
  }
  return (
    <div className={styles.orderManagerContainer}>
      <div className={styles.headerContainer}>
        <div className={styles.title}>Quản lý đơn hàng</div>
        <Tooltip title="Xuất danh sách đơn hàng ra Excel">
          <Button
            type="primary"
            icon={<FileExcelOutlined />}
            onClick={showExportModal}
            className={styles.exportButton}
            disabled={isLoading || !queryData?.data?.length}
          >
            Xuất Excel
          </Button>
        </Tooltip>
      </div>
      <Table
        columns={columns}
        dataSource={queryData?.data || []}
        rowKey="_id"
        loading={isLoading || isFetching}
        pagination={{
          ...pagination,
          total: queryData?.total || 0,
          current: pagination.current,
          pageSize: pagination.pageSize,
          showSizeChanger: true,
          pageSizeOptions: ["5", "10", "20", "50"],
          showTotal: (total, range) =>
            `${range[0]}-${range[1]} của ${total} đơn hàng`,
        }}
        onChange={handleTableChange}
        scroll={{ x: true }}
      />
      <Modal
        title="Xuất danh sách đơn hàng"
        open={exportModalVisible}
        onOk={exportToExcel}
        onCancel={handleCancelExport}
        okText="Xuất Excel"
        cancelText="Hủy"
        confirmLoading={exporting}
      >
        <p>Chọn dữ liệu muốn xuất:</p>
        <Radio.Group onChange={handleExportTypeChange} value={exportType}>
          <Radio value="current">
            Trang hiện tại ({queryData?.data?.length || 0} đơn hàng)
          </Radio>
          <Radio value="all">
            Tất cả đơn hàng ({queryData?.total || 0} đơn hàng)
          </Radio>
        </Radio.Group>
        {exporting && (
          <div className={styles.exportingIndicator}>
            <LoadingOutlined /> Đang xuất dữ liệu...
          </div>
        )}
      </Modal>
    </div>
  );
};

export default OrderManager;
