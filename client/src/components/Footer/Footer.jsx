import React from "react";
import styles from "./Footer.module.css";
import { Link } from "react-router-dom";
import { Layout, Row, Col, Typography, Space, Divider, Button } from "antd";
import {
  FacebookOutlined,
  InstagramOutlined,
  MailOutlined,
  PhoneOutlined,
  HomeOutlined,
  ShopOutlined,
} from "@ant-design/icons";

const { Footer: AntFooter } = Layout;
const { Title, Text, Paragraph } = Typography;

function Footer() {
  return (
    <AntFooter className={styles.footer}>
      <div className={styles.footerContainer}>
        <Row gutter={[24, 32]}>
          <Col xs={24} sm={12} md={8} lg={8} xl={8}>
            <div className={styles.footerSection}>
              <Title level={4}>Về chúng tôi</Title>
              <Paragraph>
                Chúng tôi là cửa hàng thời trang uy tín, cung cấp những sản phẩm
                chất lượng cao với mẫu mã đa dạng, phù hợp với nhiều phong cách
                và độ tuổi khác nhau.
              </Paragraph>
              <div className={styles.socialLinks}>
                <a
                  href="https://www.facebook.com/Libra245"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button
                    icon={<FacebookOutlined />}
                    shape="circle"
                    size="large"
                    className={styles.socialButton}
                  />
                </a>
                <a
                  href="https://www.instagram.com/imsn.02/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button
                    icon={<InstagramOutlined />}
                    shape="circle"
                    size="large"
                    className={styles.socialButton}
                  />
                </a>
              </div>
            </div>
          </Col>

          <Col xs={24} sm={12} md={8} lg={8} xl={8}>
            <div className={styles.footerSection}>
              <Title level={4}>Chính sách</Title>
              <ul className={styles.footerLinks}>
                <li>
                  <a href="https://help.shopee.vn/portal/article/77244">
                    Chính sách bảo mật
                  </a>
                </li>
                <li>
                  <a href="https://help.shopee.vn/portal/article/77245">
                    Quy chế hoạt động
                  </a>
                </li>
                <li>
                  <a href="https://help.shopee.vn/portal/article/77250">
                    Chính sách vận chuyển
                  </a>
                </li>
                <li>
                  <a href="https://help.shopee.vn/portal/article/77251">
                    Chính sách hoàn hàng và trả tiền
                  </a>
                </li>
              </ul>
            </div>
          </Col>

          <Col xs={24} sm={24} md={8} lg={8} xl={8}>
            <div className={styles.footerSection}>
              <Title level={4}>Liên hệ</Title>
              <Space
                direction="vertical"
                size="middle"
                className={styles.contactInfo}
              >
                <div className={styles.contactItem}>
                  <HomeOutlined className={styles.contactIcon} />
                  <Text>
                    Quang trung, Yên Nghĩa, Thành phố Hà Nội, Việt Nam
                  </Text>
                </div>
                <div className={styles.contactItem}>
                  <PhoneOutlined className={styles.contactIcon} />
                  <Text>Tổng đài hỗ trợ: 0345123230</Text>
                </div>
                <div className={styles.contactItem}>
                  <MailOutlined className={styles.contactIcon} />
                  <Text>Email: 20010797@st.phenikaa-uni.edu.vn</Text>
                </div>
                <div className={styles.contactItem}>
                  <ShopOutlined className={styles.contactIcon} />
                  <Text>Quản Lý: Sáng - 0352797320</Text>
                </div>
              </Space>
            </div>
          </Col>
        </Row>

        <Divider className={styles.footerDivider} />

        <div className={styles.copyright}>
          <Text>© 2025 - Bản quyền thuộc về Công ty TNHH 1 thành viên</Text>
        </div>
      </div>
    </AntFooter>
  );
}

export default Footer;
