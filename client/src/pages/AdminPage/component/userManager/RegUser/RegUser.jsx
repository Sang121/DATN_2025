import React from "react";
import {
  Form,
  Input,
  Button,
  Divider,
  Card,
  Typography,
  Row,
  Col,
  Space,
  message as antdMessage,
} from "antd";
import {
  UserAddOutlined,
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  HomeOutlined,
  LockOutlined,
  CheckCircleOutlined,
  IdcardOutlined,
} from "@ant-design/icons";
import styles from "./RegUser.module.css";
import { useMutation } from "@tanstack/react-query";
import { signUpUser } from "../../../../../services/userService";

const { Title } = Typography;

function RegUser({ onSuccess }) {
  const [form] = Form.useForm();

  const signUpMutation = useMutation({
    mutationFn: signUpUser,
    onSuccess: () => {
      antdMessage.success("Thêm mới tài khoản thành công.");
      form.resetFields();
      if (onSuccess) {
        onSuccess();
      }
    },
    onError: (error) => {
      console.error(
        "Registration failed:",
        error.response?.data?.error?.message
      );
      let errorMessage = "Thêm mới thất bại. Vui lòng thử lại.";
      if (error.response?.data) {
        errorMessage =
          error.response.data.error?.message ||
          error.response.data.message ||
          error.response.data;
      } else if (error.message === "Network Error") {
        errorMessage = "Lỗi kết nối mạng. Vui lòng kiểm tra internet.";
      }
      antdMessage.error(`Lỗi: ${errorMessage}`);
    },
  });

  const onFinish = (values) => {
    signUpMutation.mutate(values);
  };

  return (
    <div style={{ padding: "20px" }}>
      <Card className={styles.formCard}>
        <div className={styles.header}>
          <UserAddOutlined className={styles.headerIcon} />
          <Title level={4} className={styles.headerTitle}>
            Thêm người dùng mới
          </Title>
        </div>
        <Divider className={styles.customDivider} />

        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          className={styles.signupForm}
          size="large"
        >
          <Row gutter={[24, 24]}>
            <Col xs={24} sm={12}>
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
                <Input prefix={<UserOutlined />} placeholder="Tên đăng nhập" />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12}>
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
                <Input prefix={<IdcardOutlined />} placeholder="Họ và tên" />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12}>
              <Form.Item
                name="phone"
                rules={[
                  {
                    required: true,
                    message: "Vui lòng nhập số điện thoại!",
                  },
                  {
                    pattern: /^[0-9]{9,12}$/,
                    message: "Số điện thoại không hợp lệ!",
                  },
                ]}
              >
                <Input prefix={<PhoneOutlined />} placeholder="Số điện thoại" />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12}>
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
            </Col>

            <Col xs={24}>
              <Form.Item
                name="address"
                rules={[
                  { required: true, message: "Vui lòng nhập địa chỉ!" },
                  { min: 5, message: "Địa chỉ phải có ít nhất 5 ký tự!" },
                ]}
              >
                <Input prefix={<HomeOutlined />} placeholder="Địa chỉ" />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12}>
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
            </Col>

            <Col xs={24} sm={12}>
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
            </Col>
          </Row>

          <div className={styles.formActions}>
            <Space>
              <Button onClick={onSuccess}>Hủy</Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={signUpMutation.isLoading}
                icon={<CheckCircleOutlined />}
              >
                Thêm người dùng
              </Button>
            </Space>
          </div>
        </Form>
      </Card>
    </div>
  );
}

export default RegUser;
