import { Form, Select, Divider, Row, Col } from "antd";
import React, { useState, useMemo } from "react";
import {
  Button,
  Input,
  Avatar,
  Typography,
  Upload,
  message as antdMessage,
} from "antd";
import { useMutation } from "@tanstack/react-query";
import { updateUser } from "../../services/userService";
import { useDispatch } from "react-redux";
import { updateUser as updateReduxUser } from "../../redux/slices/userSlice";
import {
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  HomeOutlined,
  ManOutlined,
  WomanOutlined,
  SaveOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import styles from "./userUpdate.module.css";

const { Title, Text } = Typography;
const { Option } = Select;

function UserUpdate() {
  // Sử dụng useMemo để đảm bảo user không thay đổi tham chiếu sau mỗi lần render
  const user = useMemo(
    () => JSON.parse(sessionStorage.getItem("userState"))?.user || {},
    []
  );

  const [form] = Form.useForm();
  const dispatch = useDispatch();
  const [avatarUrl, setAvatarUrl] = useState(user.avatar || "");

  React.useEffect(() => {
    form.setFieldsValue({
      fullName: user.fullName,
      gender: user.gender,
      email: user.email,
      phone: user.phone,
      address: user.address,
    });
    setAvatarUrl(user.avatar || "");
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

  // Tạm thời chỉ hiển thị phần tải lên avatar, chưa có xử lý tải lên thực tế
  const handleAvatarChange = (info) => {
    if (info.file.status === "done") {
      antdMessage.success(`${info.file.name} tải lên thành công`);
      // Trong thực tế, bạn sẽ lấy URL từ phản hồi tải lên
      // setAvatarUrl(info.file.response.url);
    } else if (info.file.status === "error") {
      antdMessage.error(`${info.file.name} tải lên thất bại.`);
    }
  };

  return (
    <div className={styles.userUpdateContainer}>
      <Title level={2} className={styles.formTitle}>
        <UserOutlined className={styles.titleIcon} /> Thông tin tài khoản
      </Title>

      {/* <div className={styles.userAvatar}>
        <Avatar
          size={100}
          icon={<UserOutlined />}
          src={avatarUrl}
          className={styles.avatarImage}
        />
        <Upload
          name="avatar"
          showUploadList={false}
          action="https://run.mocky.io/v3/435e224c-44fb-4773-9faf-380c5e6a2188"
          onChange={handleAvatarChange}
          className={styles.avatarUploader}
        >
          <Button icon={<UploadOutlined />} className={styles.uploadButton}>
            Cập nhật ảnh đại diện
          </Button>
        </Upload>
      </div> */}

      <Form
        form={form}
        name="user_update"
        onFinish={onFinish}
        layout="vertical"
        className={styles.updateForm}
        initialValues={{
          fullName: user.fullName,
          gender: user.gender,
          email: user.email,
          phone: user.phone,
          address: user.address,
        }}
      >
        <Divider orientation="left" className={styles.sectionDivider}>
          Thông tin cá nhân
        </Divider>

        <Row gutter={24}>
          <Col xs={24} sm={12}>
            <Form.Item
              label="Họ và tên"
              name="fullName"
              rules={[{ required: true, message: "Họ và tên là bắt buộc!" }]}
            >
              <Input
                prefix={<UserOutlined className={styles.inputIcon} />}
                placeholder="Nhập họ và tên của bạn"
                size="large"
              />
            </Form.Item>
          </Col>

          <Col xs={24} sm={12}>
            <Form.Item
              name="gender"
              label="Giới tính"
              rules={[{ required: true, message: "Vui lòng chọn giới tính!" }]}
            >
              <Select
                placeholder="Chọn giới tính"
                size="large"
                className={styles.selectField}
              >
                <Option value="male">
                  <ManOutlined /> Nam
                </Option>
                <Option value="female">
                  <WomanOutlined /> Nữ
                </Option>
                <Option value="other">Khác</Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Divider orientation="left" className={styles.sectionDivider}>
          Thông tin liên hệ
        </Divider>

        <Row gutter={24}>
          <Col xs={24} sm={12}>
            <Form.Item
              label="Email"
              name="email"
              rules={[
                { required: true, message: "Email là bắt buộc!" },
                { type: "email", message: "Email không hợp lệ!" },
              ]}
            >
              <Input
                prefix={<MailOutlined className={styles.inputIcon} />}
                placeholder="Email của bạn"
                size="large"
              />
            </Form.Item>
          </Col>

          <Col xs={24} sm={12}>
            <Form.Item
              label="Số điện thoại"
              name="phone"
              rules={[
                { required: true, message: "Số điện thoại là bắt buộc" },
                {
                  pattern: /^[0-9]{10,11}$/,
                  message: "Số điện thoại không hợp lệ!",
                },
              ]}
            >
              <Input
                prefix={<PhoneOutlined className={styles.inputIcon} />}
                placeholder="Số điện thoại của bạn"
                size="large"
              />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          label="Địa chỉ"
          name="address"
          rules={[{ required: true, message: "Địa chỉ là bắt buộc" }]}
        >
          <Input.TextArea
            placeholder="Địa chỉ của bạn"
            size="large"
            autoSize={{ minRows: 2, maxRows: 6 }}
            className={styles.textareaField}
            prefix={<HomeOutlined className={styles.inputIcon} />}
          />
        </Form.Item>

        <div className={styles.formActions}>
          <Button
            type="primary"
            htmlType="submit"
            icon={<SaveOutlined />}
            className={styles.submitButton}
            loading={updateUserMutation.isPending}
            size="large"
          >
            Cập nhật thông tin
          </Button>
        </div>
      </Form>
    </div>
  );
}

export default UserUpdate;
