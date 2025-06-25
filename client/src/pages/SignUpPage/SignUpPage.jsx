import React from "react";
import {
  Form,
  Input,
  Button,
  Divider,
  Modal,
  message as antdMessage,
} from "antd";
import { CloseOutlined } from "@ant-design/icons";
import styles from "./SignUpPage.module.css";
import { Link } from "react-router-dom"; //
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { signUpUser } from "../../services/userService";

function SignUpPage({ open, onClose, onSwitchToSignIn, onLoginSuccess }) {
  const [form] = Form.useForm();

  const queryClient = useQueryClient();

  const signUpMutation = useMutation({
    mutationFn: signUpUser,
    onSuccess: async (data) => {
      console.log("Registration successful:", data);
      // Hiển thị thông báo thành công bằng antd.message
      antdMessage.success(
        "Đăng ký tài khoản thành công! Vui lòng đăng nhập để tiếp tục."
      );
      form.resetFields();
      onSwitchToSignIn();
      onClose();

      // Gọi callback onLoginSuccess nếu có
      if (onLoginSuccess) {
        // Chuyển đổi dữ liệu người dùng nếu cần thiết
        const userDataToDispatch = {
          id: data.user.id,
          username: data.user.username,
          email: data.user.email,
          // Thêm các trường khác nếu cần thiết
        };
        onLoginSuccess(userDataToDispatch);
      }
    },
    onError: (error) => {
      console.error("Registration failed:", error.response.data.error.message);
      let errorMessage = "Đăng ký thất bại. Vui lòng thử lại.";
      if (error.response?.data) {
        errorMessage = error.response.data;
      } else if (error.message === "Network Error") {
        errorMessage = "Lỗi kết nối mạng. Vui lòng kiểm tra internet.";
      }
      antdMessage.error("signup", errorMessage);
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
        width={700}
        centered
        closable={false}
      >
        <div className={styles.signupBackdrop}>
          <div className={styles.signupModal}>
            <button
              className={styles.customCloseBtn}
              onClick={onClose}
              aria-label="Đóng"
            >
              <CloseOutlined style={{ fontSize: 22 }} />
            </button>
            <div className={styles.signupLeft}>
              <div className={styles.signupFormBlock}>
                <h2>Đăng ký tài khoản</h2>
                <div className={styles.subTitle}>
                  Đã có tài khoản?{" "}
                  <span
                    style={{
                      color: "#1a94ff",
                      cursor: "pointer",
                      textDecoration: "underline",
                    }}
                    onClick={onSwitchToSignIn}
                  >
                    Đăng nhập
                  </span>
                </div>
                <Form
                  form={form} // Gán form instance
                  layout="vertical"
                  onFinish={onFinish}
                  className={styles.signupForm}
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
                    <Input size="large" placeholder="Tên đăng nhập" />
                  </Form.Item>
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
                    <Input size="large" placeholder="Số điện thoại" />
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
                    <Input size="large" placeholder="Email" />
                  </Form.Item>
                  <Form.Item
                    name="address"
                    rules={[
                      { required: true, message: "Vui lòng nhập địa chỉ!" },
                      { min: 5, message: "Địa chỉ phải có ít nhất 5 ký tự!" },
                    ]}
                  >
                    <Input size="large" placeholder="Địa chỉ" />
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
                    <Input.Password size="large" placeholder="Mật khẩu" />
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
                      size="large"
                      placeholder="Nhập lại mật khẩu"
                    />
                  </Form.Item>
                  <Button
                    type="primary"
                    htmlType="submit"
                    className={styles.submitBtn}
                    block
                    size="large"
                    loading={signUpMutation.isLoading}
                  >
                    Đăng ký
                  </Button>
                </Form>
              </div>
            </div>
            <div className={styles.signupRight}>
              <img
                src="https://salt.tikicdn.com/ts/upload/df/48/21/b4d225f471fe06887284e1341751b36e.png"
                alt="promo"
                className={styles.rightImg}
              />
              <div className={styles.rightText}>
                <div className={styles.rightTitle}>
                  Chào mừng bạn đến với S-Fashion
                </div>
                <div className={styles.rightDesc}>
                  Đăng ký để nhận ưu đãi hấp dẫn!
                </div>
              </div>
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
}

export default SignUpPage;
