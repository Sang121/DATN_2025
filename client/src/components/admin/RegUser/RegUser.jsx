import React from "react";
import {
  Form,
  Input,
  Button,
  Divider,
  Modal,
  message as antdMessage,
  Row, // Thêm Row
  Col, // Thêm Col
  Space, // Thêm Space
} from "antd";
import {
  CloseOutlined,
  UserAddOutlined, // Icon cho tiêu đề
  UserOutlined, // Icon cho username
  MailOutlined, // Icon cho email
  PhoneOutlined, // Icon cho phone
  HomeOutlined, // Icon cho address
  LockOutlined, // Icon cho password
  CheckCircleOutlined, // Icon cho nút thêm
  IdcardOutlined, // Icon cho FullName
} from "@ant-design/icons"; // Import thêm các icon mới
import styles from "./RegUser.module.css";
import { useMutation } from "@tanstack/react-query";
import { signUpUser } from "../../../services/userService";

function RegUser({ open, onClose }) {
  const [form] = Form.useForm();

  const signUpMutation = useMutation({
    mutationFn: signUpUser,
    onSuccess: (data) => {
      console.log("Registration successful:", data);
      antdMessage.success("Thêm mới tài khoản thành công.");
      form.resetFields();
      onClose();
    },
    onError: (error) => {
      console.error("Registration failed:", error.response.data.error.message);
      let errorMessage = "Thêm mới thất bại. Vui lòng thử lại.";
      if (error.response?.data) {
        // Attempt to parse nested error message if available
        errorMessage =
          error.response.data.error?.message ||
          error.response.data.message ||
          error.response.data;
      } else if (error.message === "Network Error") {
        errorMessage = "Lỗi kết nối mạng. Vui lòng kiểm tra internet.";
      }
      antdMessage.error(`Lỗi: ${errorMessage}`); // Cải thiện thông báo lỗi
    },
  });

  const onFinish = (values) => {
    signUpMutation.mutate(values);
  };

  return (
    <>
      <Modal
        open={open}
        onCancel={onClose}
        footer={null}
        width={700} // Giữ nguyên hoặc điều chỉnh theo ý muốn
        centered
        closable={false}
        className={styles.customModal} // Thêm class để tùy chỉnh modal
      >
        <div className={styles.signupContainer}>
          {" "}
          {/* Đổi tên backdrop thành container */}
          <button
            className={styles.customCloseBtn}
            onClick={onClose}
            aria-label="Đóng"
          >
            <CloseOutlined style={{ fontSize: 22 }} />
          </button>
          <div className={styles.signupContent}>
            {/* Phần bên trái (form) */}
            <div className={styles.signupLeft}>
              <div className={styles.header}>
                <UserAddOutlined className={styles.headerIcon} />
                <h2 className={styles.headerTitle}>Thêm người dùng mới</h2>
              </div>
              <Divider className={styles.customDivider} />{" "}
              {/* Divider rõ ràng hơn */}
              <div className={styles.signupFormBlock}>
                <Form
                  form={form}
                  layout="vertical"
                  onFinish={onFinish}
                  className={styles.signupForm}
                  size="large" // Thêm size cho form
                >
                  <Form.Item
                    name="username"
                    rules={[
                      {
                        required: true,
                        message: "Vui lòng nhập tên đăng nhập!",
                      },
                      {
                        min: 4,
                        transform: (value) => value,
                        message: "Tên đăng nhập phải có ít nhất 4 ký tự!",
                      },
                    ]}
                  >
                    <Input
                      prefix={<UserOutlined />}
                      placeholder="Tên đăng nhập"
                    />
                  </Form.Item>
                  <Form.Item
                    name="fullName"
                    rules={[
                      {
                        required: true,
                        message: "Vui lòng nhập họ và tên!",
                      },
                      {
                        min: 4,
                        transform: (value) => value,
                        message: "Họ và tên phải có ít nhất 4 ký tự!",
                      },
                    ]}
                  >
                    <Input
                      prefix={<IdcardOutlined />}
                      placeholder="Họ và tên"
                    />
                  </Form.Item>
                  <Form.Item
                    name="phone"
                    rules={[
                      {
                        required: true,
                        message: "Vui lòng nhập số điện thoại!",
                      },
                      {
                        pattern: /^[0-9]{9,12}$/, // Kích thước này có thể cần điều chỉnh tùy theo yêu cầu của bạn
                        message: "Số điện thoại không hợp lệ!",
                      },
                    ]}
                  >
                    <Input
                      prefix={<PhoneOutlined />}
                      placeholder="Số điện thoại"
                    />
                  </Form.Item>
                  <Form.Item
                    name="email"
                    rules={[
                      {
                        required: true,
                        message: "Vui lòng nhập email!",
                        transform: (value) => value,
                      },
                      { type: "email", message: "Email không hợp lệ!" },
                    ]}
                  >
                    <Input prefix={<MailOutlined />} placeholder="Email" />
                  </Form.Item>
                  <Form.Item
                    name="address"
                    rules={[
                      { required: true, message: "Vui lòng nhập địa chỉ!" },
                      { min: 5, message: "Địa chỉ phải có ít nhất 5 ký tự!" },
                    ]}
                  >
                    <Input prefix={<HomeOutlined />} placeholder="Địa chỉ" />
                  </Form.Item>
                  <Form.Item
                    name="password"
                    rules={[
                      { required: true, message: "Vui lòng nhập mật khẩu!" },
                      { min: 6, message: "Mật khẩu phải có ít nhất 6 ký tự!" },
                      {
                        pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/,
                        message: "Mật khẩu phải có chữ hoa, chữ thường và số!",
                      },
                    ]}
                    hasFeedback
                  >
                    <Input.Password
                      prefix={<LockOutlined />}
                      placeholder="Mật khẩu"
                    />
                  </Form.Item>
                  <Form.Item
                    name="confirmPassword"
                    dependencies={["password"]}
                    hasFeedback
                    rules={[
                      {
                        required: true,
                        message: "Vui lòng nhập lại mật khẩu!",
                      },
                      ({ getFieldValue }) => ({
                        validator(_, value) {
                          if (!value || getFieldValue("password") === value) {
                            return Promise.resolve();
                          }
                          return Promise.reject(
                            new Error("Mật khẩu nhập lại không khớp!")
                          );
                        },
                      }),
                    ]}
                  >
                    <Input.Password
                      prefix={<LockOutlined />}
                      placeholder="Nhập lại mật khẩu"
                    />
                  </Form.Item>
                  <Form.Item>
                    {" "}
                    {/* Bọc nút trong Form.Item để dễ styling hơn */}
                    <Button
                      type="primary"
                      htmlType="submit"
                      className={styles.submitBtn}
                      block
                      size="large"
                      loading={signUpMutation.isLoading}
                      icon={<CheckCircleOutlined />} // Thêm icon vào nút
                    >
                      Thêm người dùng
                    </Button>
                  </Form.Item>
                </Form>
              </div>
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
}

export default RegUser;
