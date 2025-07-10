import React, { useState } from "react";
import { UserAddOutlined, FileExcelOutlined } from "@ant-design/icons";
import { Button, Input, message, Switch, Typography } from "antd";
import { Space, Table, Spin, Tag } from "antd";
import {
  deleteUser,
  getAllUser,
  updateUser,
} from "../../../../services/userService";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import RegUser from "./RegUser/RegUser";
import styles from "./userManager.module.css";
import * as XLSX from "xlsx";

const { Title } = Typography;

function UserManager() {
  const [editingRowId, setEditingRowId] = useState(null); // Theo dõi dòng đang chỉnh sửa
  const [editedData, setEditedData] = useState({}); // Lưu dữ liệu đã chỉnh sửa
  const queryClient = useQueryClient();
  const [showRegUser, setShowRegUser] = useState(false);

  const handleShowRegUser = () => {
    setShowRegUser(true);
  };

 

  const handleRegUserSuccess = () => {
    setShowRegUser(false);
    queryClient.invalidateQueries(["getAllUsers"]);
  };

  const columns = [
    {
      title: "Stt",
      dataIndex: "_id",
      key: "stt",
      render: (id, record, index) => index + 1,
    },
    {
      title: "Name",
      dataIndex: "username",
      key: "username",
      render: (text, record) =>
        editingRowId === record._id ? (
          <Input
            value={editedData.username ?? record.username}
            onChange={(e) =>
              setEditedData({ ...editedData, username: e.target.value })
            }
          />
        ) : (
          text
        ),
    },

    {
      title: "Phone",
      dataIndex: "phone",
      key: "phone",
      render: (text, record) =>
        editingRowId === record._id ? (
          <Input
            value={editedData.phone ?? record.phone}
            onChange={(e) =>
              setEditedData({ ...editedData, phone: e.target.value })
            }
          />
        ) : (
          text
        ),
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      render: (text, record) =>
        editingRowId === record._id ? (
          <Input
            value={editedData.email ?? record.email}
            onChange={(e) =>
              setEditedData({ ...editedData, email: e.target.value })
            }
          />
        ) : (
          text
        ),
    },
    {
      title: "Address",
      dataIndex: "address",
      key: "address",
      render: (text, record) =>
        editingRowId === record._id ? (
          <Input
            value={editedData.address ?? record.address}
            onChange={(e) =>
              setEditedData({ ...editedData, address: e.target.value })
            }
          />
        ) : (
          text
        ),
    },
    {
      title: "Type Login",
      dataIndex: "typeLogin",
      key: "typeLogin",
      render: (text, record) =>
        editingRowId === record._id ? (
          <Input
            value={editedData.address ?? record.address}
            onChange={(e) =>
              setEditedData({ ...editedData, address: e.target.value })
            }
          />
        ) : (
          text
        ),
    },
    {
      title: "Trạng thái",
      dataIndex: "isAdmin",
      key: "isAdmin",
      render: (isAdmin, record) =>
        editingRowId === record._id ? (
          <Switch
            checked={editedData.isAdmin ?? record.isAdmin}
            // value={isAdmin}
            // defaultChecked={isAdmin}
            checkedChildren="Admin"
            unCheckedChildren="Người Dùng"
            onChange={(checked) => {
              setEditedData({ ...editedData, isAdmin: checked });
            }}
          />
        ) : (
          <Tag color={isAdmin ? "geekblue" : "green"}>
            {isAdmin ? "Admin" : "Người dùng"}
          </Tag>
        ),
    },
    {
      title: "Action",
      key: "Action",
      render: (_, record) => (
        <Space size="middle">
          {editingRowId === record._id ? (
            <>
              <Button
                onClick={() => handleUpdateUser(record._id, record)} // Truyền record gốc vào đây
                type="link"
                loading={updateUserMutation.isPending}
              >
                Lưu
              </Button>
              <Button
                onClick={() => setEditingRowId(null)}
                type="primary"
                danger
                loading={updateUserMutation.isPending}
              >
                Hủy
              </Button>
            </>
          ) : (
            <>
              <Button onClick={() => handleEditRow(record)} type="link">
                Chỉnh sửa
              </Button>
              <Button
                onClick={() => handleDeleteUser(record._id)}
                type="primary"
                danger
                loading={deleteUserMutation.isPending}
              >
                Xóa
              </Button>
            </>
          )}
        </Space>
      ),
    },
  ];

  const {
    data: users = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["getAllUsers"],
    queryFn: getAllUser,
  });

  // Hàm cập nhật người dùng
  const updateUserMutation = useMutation({
    mutationFn: ({ userId, userData }) => updateUser(userId, userData), // Hàm gọi API update user
    onSuccess: () => {
      message.success("Cập nhật thông tin người dùng thành công.");
      setEditingRowId(null);
      setEditedData({});
      queryClient.invalidateQueries(["getAllUsers"]);
    },
    onError: (error) => {
      console.error("Lỗi cập nhật thông tin người dùng:", error);
      message.error(
        `Cập nhật thông tin người dùng thất bại: ${
          error.message || "Lỗi không xác định."
        }`
      );
    },
  });
  const deleteUserMutation = useMutation({
    mutationFn: (id) => deleteUser(id),
    onSuccess: () => {
      message.success("Xóa người dùng thành công.");
      queryClient.invalidateQueries(["getAllUsers"]);
    },
    onError: (error) => {
      message.error(
        `Xóa người dùng thất bại: ${error.message || "Lỗi không xác định."}`
      );
    },
  });
  const handleEditRow = (record) => {
    setEditingRowId(record._id); // Đặt ID của dòng đang chỉnh sửa
    setEditedData(...record);
  };
  const validateFields = (data) => {
    const errors = {};

    if (!data.username || data.username.trim() === "") {
      errors.username = "Tên người dùng không được để trống.";
    }

    if (!data.phone || !/^\d{10}$/.test(data.phone)) {
      errors.phone = "Số điện thoại phải có 10 chữ số.";
    }

    if (!data.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      errors.email = "Email không hợp lệ.";
    }

    if (!data.address || data.address.trim() === "") {
      errors.address = "Địa chỉ không được để trống.";
    }

    return errors;
  };
  const handleUpdateUser = (id) => {
    const originalRecord = users.find((user) => user._id === id);

    // 2. Gộp dữ liệu đã chỉnh sửa (editedData) với dữ liệu gốc
    // Ưu tiên các giá trị từ editedData nếu có, nếu không thì dùng giá trị gốc
    const dataToValidate = {
      ...originalRecord, // Lấy tất cả dữ liệu gốc
      ...editedData, // Ghi đè các trường đã chỉnh sửa
    };

    const validationErrors = validateFields(dataToValidate);

    if (Object.keys(validationErrors).length > 0) {
      Object.values(validationErrors).forEach((error) => message.error(error));
      return;
    }

    updateUserMutation.mutate({ userId: id, userData: editedData });
  };
  const handleDeleteUser = (id) => {
    deleteUserMutation.mutate(id);
  };

  // Thêm hàm xuất Excel
  const handleExportExcel = () => {
    // Chuẩn bị data để xuất
    const exportData = users.map((user, index) => ({
      "STT": index + 1,
      "Họ và tên": user.username,
      "Tên đăng nhập": user.username,
      "Số điện thoại": user.phone,
      "Email": user.email,
      "Giới tính": user.gender,
      "Địa chỉ": user.address,
      "Vai trò": user.isAdmin ? "Admin" : "Người dùng",
      "Tổng đơn hàng": user.totalOrder || 0,
      "Ngày tạo": new Date(user.createdAt).toLocaleDateString("vi-VN"),
    }));

    // Tạo workbook và worksheet
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(exportData);

    // Tùy chỉnh độ rộng cột
    const colWidths = [
      { wch: 5 }, // STT
      { wch: 25 }, // Họ và tên
      { wch: 15 }, // Tên đăng nhập
      { wch: 15 }, // Số điện thoại
      { wch: 30 }, // Email
      { wch: 10 }, // Giới tính
      { wch: 40 }, // Địa chỉ
      { wch: 15 }, // Vai trò
      { wch: 15 }, // Tổng đơn hàng
      { wch: 20 }, // Ngày tạo
    ];
    ws["!cols"] = colWidths;

    // Thêm worksheet vào workbook
    XLSX.utils.book_append_sheet(wb, ws, "Danh sách người dùng");

    // Tạo tên file với timestamp
    const fileName = `danh_sach_nguoi_dung_${new Date()
      .toLocaleDateString("vi-VN")
      .replace(/\//g, "-")}.xlsx`;

    // Xuất file
    XLSX.writeFile(wb, fileName);

    message.success("Xuất file Excel thành công!");
  };

  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <Spin size="large" tip="Đang tải dữ liệu..." />
      </div>
    );
  }

  if (isError) {
    return (
      <div className={styles.errorContainer}>
        {message.error("Lỗi tải dữ liệu người dùng.")}
        Lỗi: Không thể tải dữ liệu người dùng.
      </div>
    );
  }

  return (
    <div className={styles.wrapper}>
      {!showRegUser ? (
        <>
          <div className={styles.header}>
            <Title level={4}>Quản lý người dùng</Title>
            <Space>
              <Button
                type="primary"
                icon={<FileExcelOutlined />}
                onClick={handleExportExcel}
                style={{ backgroundColor: "#52c41a" }}
              >
                Xuất Excel
              </Button>
              <Button
                type="primary"
                icon={<UserAddOutlined />}
                onClick={handleShowRegUser}
              >
                Thêm người dùng
              </Button>
            </Space>
          </div>

          <Table
            columns={[...columns]}
            dataSource={users}
            rowKey={(record) => record._id}
            pagination={{ pageSize: 10 }}
            bordered
            scroll={{ x: "max-content" }}
          />
        </>
      ) : (
        <RegUser onSuccess={handleRegUserSuccess} />
      )}
    </div>
  );
}

export default UserManager;
