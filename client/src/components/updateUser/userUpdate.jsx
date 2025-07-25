import React, { useEffect, useMemo } from "react";
import {
  Form,
  Select,
  Row,
  Col,
  Button,
  Input,
  Avatar,
  Typography,
  message as antdMessage,
  Badge,
  Space,
} from "antd";
import { useMutation } from "@tanstack/react-query";
import { updateUser } from "../../services/userService";
import { useDispatch } from "react-redux";
import { updateUser as updateReduxUser } from "../../redux/slices/userSlice";
import {
  UserOutlined,
  MailOutlined,
  SaveOutlined,
  EditOutlined,
} from "@ant-design/icons";
import styles from "./userUpdate.module.css";

const { Title, Text } = Typography;
const { Option } = Select;

function UserUpdate() {
  const user = useMemo(
    () => JSON.parse(sessionStorage.getItem("userState"))?.user || {},
    []
  );

  const [form] = Form.useForm();
  const dispatch = useDispatch();
  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "smooth",
    });
  }, []);
  useEffect(() => {
    form.setFieldsValue({
      fullName: user.fullName,
      gender: user.gender,
      email: user.email,
      phone: user.phone,
      address: user.address,
    });
  }, [user, form]);

  const updateUserMutation = useMutation({
    mutationFn: ({ id, userData }) => updateUser(id, userData),
    onSuccess: (data) => {
      console.log("Cập nhật thông tin tài khoản thành công:", data);
      antdMessage.success("Cập nhật thông tin tài khoản thành công.");

      const newAccessToken = data.access_token;
      const updatedUserData = data.data;

      const updatedUser = {
        ...user,
        ...updatedUserData,
        access_token: newAccessToken,
      };

      sessionStorage.setItem(
        "userState",
        JSON.stringify({ user: updatedUser })
      );

      dispatch(updateReduxUser(updatedUser));
    },
    onError: (error) => {
      console.error(
        "Cập nhật thất bại:",
        error.response?.data || error.message
      );
      let errorMessage = "Cập nhật thất bại. Vui lòng thử lại.";
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message === "Network Error") {
        errorMessage = "Lỗi kết nối mạng. Vui lòng kiểm tra internet.";
      }
      antdMessage.error(errorMessage);
    },
  });

  const onFinish = (values) => {
    const { fullName, gender, email, phone, address } = values;
    updateUserMutation.mutate({
      id: user._id,
      userData: { fullName, gender, email, phone, address },
    });
  };

  return (
    <div className={styles.container}>
      {/* Simple Header */}
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.avatarSection}>
            <Badge
              count={<EditOutlined className={styles.editIcon} />}
              offset={[-8, 8]}
            >
              <Avatar
                size={64}
                icon={<UserOutlined />}
                src={user.avatar}
                className={styles.avatar}
              />
            </Badge>
          </div>
          <div className={styles.userInfo}>
            <Title level={3} className={styles.userName}>
              {user.fullName || user.username || "Người dùng"}
            </Title>
            <Text className={styles.userEmail}>
              {user.email || "email@example.com"}
            </Text>
            <div className={styles.userStats}>
              <span className={styles.verifiedText}>✓ Đã xác thực</span>
            </div>
          </div>
        </div>
      </div>

      {/* Simple Form */}
      <div className={styles.formSection}>
        <div className={styles.formCard}>
          <div className={styles.cardHeader}>
            <Title level={4} className={styles.cardTitle}>
              Thông tin cá nhân
            </Title>
            <Text className={styles.cardDescription}>
              Cập nhật thông tin để có trải nghiệm tốt hơn
            </Text>
          </div>

          <Form
            form={form}
            name="user_update"
            onFinish={onFinish}
            layout="vertical"
            className={styles.form}
            initialValues={{
              fullName: user.fullName,
              gender: user.gender,
              email: user.email,
              phone: user.phone,
              address: user.address,
            }}
          >
            {/* Basic Information */}
            <div className={styles.section}>
              <div className={styles.sectionHeader}>
                <UserOutlined className={styles.sectionIcon} />
                <Text className={styles.sectionTitle}>Thông tin cơ bản</Text>
              </div>

              <Row gutter={16}>
                <Col xs={24} sm={12}>
                  <Form.Item
                    label="Họ và tên"
                    name="fullName"
                    rules={[
                      { required: true, message: "Vui lòng nhập họ và tên" },
                    ]}
                  >
                    <Input
                      placeholder="Nhập họ và tên"
                      size="large"
                      className={styles.input}
                    />
                  </Form.Item>
                </Col>

                <Col xs={24} sm={12}>
                  <Form.Item
                    name="gender"
                    label="Giới tính"
                    rules={[
                      { required: true, message: "Vui lòng chọn giới tính" },
                    ]}
                  >
                    <Select
                      placeholder="Chọn giới tính"
                      size="large"
                      className={styles.select}
                    >
                      <Option value="male">Nam</Option>
                      <Option value="female">Nữ</Option>
                      <Option value="other">Khác</Option>
                    </Select>
                  </Form.Item>
                </Col>
              </Row>
            </div>

            {/* Contact Information */}
            <div className={styles.section}>
              <div className={styles.sectionHeader}>
                <MailOutlined className={styles.sectionIcon} />
                <Text className={styles.sectionTitle}>Thông tin liên hệ</Text>
              </div>

              <Row gutter={16}>
                <Col xs={24} sm={12}>
                  <Form.Item
                    label="Email"
                    name="email"
                    rules={[
                      { required: true, message: "Vui lòng nhập email" },
                      { type: "email", message: "Email không hợp lệ" },
                    ]}
                  >
                    <Input
                      placeholder="Email của bạn"
                      size="large"
                      className={styles.input}
                    />
                  </Form.Item>
                </Col>

                <Col xs={24} sm={12}>
                  <Form.Item
                    label="Số điện thoại"
                    name="phone"
                    rules={[
                      {
                        required: true,
                        message: "Vui lòng nhập số điện thoại",
                      },
                      {
                        pattern: /^[0-9]{10,11}$/,
                        message: "Số điện thoại không hợp lệ",
                      },
                    ]}
                  >
                    <Input
                      placeholder="Số điện thoại"
                      size="large"
                      className={styles.input}
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item
                label="Địa chỉ"
                name="address"
                rules={[{ required: true, message: "Vui lòng nhập địa chỉ" }]}
              >
                <Input.TextArea
                  placeholder="Địa chỉ của bạn"
                  autoSize={{ minRows: 3, maxRows: 5 }}
                  className={styles.textarea}
                />
              </Form.Item>
            </div>

            {/* Action Buttons */}
            <div className={styles.actionSection}>
              <Button
                type="default"
                size="large"
                className={styles.cancelButton}
                onClick={() => form.resetFields()}
              >
                Đặt lại
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                icon={<SaveOutlined />}
                className={styles.submitButton}
                loading={updateUserMutation.isPending}
                size="large"
              >
                Cập nhật
              </Button>
            </div>
          </Form>
        </div>
      </div>
    </div>
  );
}

export default UserUpdate;
