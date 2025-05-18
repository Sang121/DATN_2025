import React from "react";
import { Form, Input, Button, Divider, Modal } from "antd";
import { Link } from "react-router-dom";
import styles from "./SignUpPage.module.css";
import {
 
  CloseOutlined,
} from "@ant-design/icons";
function SignUpPage({ open, onClose, onSwitchToSignIn }) {
  const onFinish = (values) => {
    
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
                layout="vertical"
                onFinish={onFinish}
                className={styles.signupForm}
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
                  <Input size="large" placeholder="Số điện thoại" />
                </Form.Item>
                <Form.Item
                  name="email"
                  rules={[
                    { required: true, message: "Vui lòng nhập email!" },
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
                  name="confirm"
                  dependencies={["password"]}
                  hasFeedback
                  rules={[
                    { required: true, message: "Vui lòng nhập lại mật khẩu!" },
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
                Chào mừng bạn đến với Ecommerce
              </div>
              <div className={styles.rightDesc}>
                Đăng ký để nhận ưu đãi hấp dẫn!
              </div>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}

export default SignUpPage;
