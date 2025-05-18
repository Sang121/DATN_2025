import React from "react";
import { Form, Input, Button, Divider } from "antd";
import {
  FacebookFilled,
  GoogleOutlined,
  CloseOutlined,
} from "@ant-design/icons";
import styles from "./SignInPage.module.css";
import { Link } from "react-router-dom";
import { Modal } from "antd";

function SignInPage({ open, onClose, onSwitchToSignUp }) {
  const onFinish = (values) => {
    // Xử lý đăng nhập ở đây
    console.log(values);
  };

  return (
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
                layout="vertical"
                onFinish={onFinish}
                className={styles.signinForm}
              >
                <Form.Item
                  name="phone"
                  rules={[
                    { required: true, message: "Vui lòng nhập số điện thoại!" },
                    {
                      pattern: /^[0-9]{9,12}$/,
                      message: "Số điện thoại không hợp lệ!",
                    },
                  ]}
                >
                  <Input
                    size="large"
                    placeholder="Mật khẩu"
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
                  <Input
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
                >
                  Tiếp Tục
                </Button>
              </Form>
              <div className={styles.emailLogin}>
                <a href="#">Đăng nhập bằng email</a>
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
  );
}

export default SignInPage;
