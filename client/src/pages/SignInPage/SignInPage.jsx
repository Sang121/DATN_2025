// src/pages/SignInPage/SignInPage.jsx
import React from "react";
import { Form, Input, Button, Divider, message as antdMessage } from "antd";
import {
  FacebookFilled,
  GoogleOutlined,
  CloseOutlined,
} from "@ant-design/icons";
import styles from "./SignInPage.module.css";
import { Link } from "react-router-dom";
import { Modal } from "antd";
import { jwtDecode } from "jwt-decode";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { signInUser } from "../../services/userService";
import { getDetailUser } from "../../services/userService";
import { useDispatch } from "react-redux";
import { updateUser } from "../../redux/slices/userSlice";
function SignInPage({ open, onClose, onSwitchToSignUp, onLoginSuccess }) {
  const [form] = Form.useForm();
  const queryClient = useQueryClient();
  const dispatch = useDispatch();

  const signInMutation = useMutation({
    mutationFn: signInUser,
    onSuccess: async (data) => {
      console.log("Login successful:", data);
      const access_token = data.access_token;
      sessionStorage.setItem("access_token", access_token);

      let decodedToken = null;
      let userId = null;
      if (access_token) {
        decodedToken = jwtDecode(access_token);

        userId = decodedToken.id;
      }

      antdMessage.success("Đăng nhập thành công!");

      let userDetail = null;
      if (userId) {
        const res = await getDetailUser(userId, access_token);
        console.log("userId:", userId, " access_token:", access_token);
        console.log("User detail:", res.data);
        userDetail = res.data;
      } else {
        console.error("Không thể lấy userId từ token", userDetail);
      }

      const userDataToDispatch = {
        _id: userId,
        username: userDetail?.username || decodedToken?.username || "",
        email: userDetail?.email || decodedToken?.email || "",
        phone: userDetail?.phone || decodedToken?.phone || "",
        isAdmin: userDetail?.isAdmin || false,
        access_token: access_token,
      };

      dispatch(updateUser(userDataToDispatch)); // Cập nhật Redux store
      if (onLoginSuccess) {
        onLoginSuccess(userDataToDispatch);
      }

      form.resetFields();
      onClose();
      queryClient.invalidateQueries({ queryKey: ["userData"] });
      queryClient.invalidateQueries({ queryKey: ["cart"] });
    },

    onError: (error) => {
      console.error("signin failed:", error);
      let errorMessage = "Đăng nhập thất bại. Vui lòng thử lại.";
      if (error.response && error.response.data && error.response.data.error) {
        errorMessage = error.response.data.error.message || errorMessage;
      } else if (error.message === "Network Error") {
        errorMessage = "Lỗi kết nối mạng. Vui lòng kiểm tra internet.";
      }

      antdMessage.error(errorMessage);
    },
  });

  const onFinish = (values) => {
    signInMutation.mutate(values);
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
        <div className={styles.signinBackdrop}>
          <div className={styles.signinModal}>
            <button
              className={styles.customCloseBtn}
              onClick={onClose}
              aria-label="Đóng"
            >
              <CloseOutlined style={{ fontSize: 22 }} />
            </button>
            <div className={styles.signinLeft}>
              <div className={styles.signinFormBlock}>
                <h2>Xin chào,</h2>
                <div className={styles.subTitle}>
                  Đăng nhập hoặc{" "}
                  <span
                    style={{
                      color: "#1a94ff",
                      cursor: "pointer",
                      textDecoration: "underline",
                    }}
                    onClick={onSwitchToSignUp}
                  >
                    Tạo tài khoản
                  </span>
                </div>
                <Form
                  form={form}
                  layout="vertical"
                  onFinish={onFinish}
                  className={styles.signinForm}
                >
                  <Form.Item
                    name="identifier"
                    rules={[
                      {
                        transform: (value) => value.trim().toLowerCase(),
                        required: true,
                        message: "Vui lòng nhập email hoặc tên đăng nhập",
                      },
                    ]}
                  >
                    <Input
                      size="large"
                      placeholder="Email hoặc Tên đăng nhập"
                      className={styles.input}
                    />
                  </Form.Item>
                  <Form.Item
                    name="password"
                    rules={[
                      { required: true, message: "Vui lòng nhập mật khẩu!" },
                      {
                        min: 6,
                        message: "Mật khẩu phải có ít nhất 6 ký tự!",
                      },
                    ]}
                  >
                    <Input.Password
                      size="large"
                      placeholder="Mật khẩu"
                      className={styles.input}
                    />
                  </Form.Item>
                  <Button
                    type="primary"
                    htmlType="submit"
                    className={styles.submitBtn}
                    block
                    size="large"
                    loading={signInMutation.isLoading}
                  >
                    Tiếp Tục
                  </Button>
                </Form>
                <div className={styles.emailLogin}>
                  <a href="#">Quên mật khẩu?</a>
                </div>
                <Divider plain className={styles.divider}>
                  Hoặc tiếp tục bằng
                </Divider>
                <div className={styles.socialLogin}>
                  <Button
                    icon={<FacebookFilled />}
                    className={styles.socialBtn}
                    size="large"
                    style={{ background: "#1877f3", color: "#fff" }}
                    block
                  >
                    Facebook
                  </Button>
                  <Button
                    icon={<GoogleOutlined />}
                    className={styles.socialBtn}
                    size="large"
                    style={{
                      background: "#fff",
                      color: "#222",
                      border: "1px solid #ddd",
                    }}
                    block
                  >
                    Google
                  </Button>
                </div>
                <div className={styles.policyText}>
                  Bằng việc tiếp tục, bạn đã đọc và đồng ý với{" "}
                  <a href="#">điều khoản sử dụng</a> và{" "}
                  <a href="#">Chính sách bảo mật thông tin cá nhân</a> của
                  Ecommerce
                </div>
              </div>
            </div>
            <div className={styles.signinRight}>
              <Link to="/">
                <img
                  src="https://salt.tikicdn.com/ts/upload/df/48/21/b4d225f471fe06887284e1341751b36e.png"
                  alt="promo"
                  className={styles.rightImg}
                />
              </Link>
              <div className={styles.rightText}>
                <div className={styles.rightTitle}>Mua sắm tại Ecommerce</div>
                <div className={styles.rightDesc}>Siêu ưu đãi mỗi ngày</div>
              </div>
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
}

export default SignInPage;
