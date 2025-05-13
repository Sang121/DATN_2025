import React from 'react';
import { Result, Button } from 'antd';
import { Link } from 'react-router-dom';
import './NotFoundPage.css'; // Import file CSS tùy chỉnh

function NotFoundPage() {
  return (
    <div className="not-found-container">
      <Result
        status="404"
        title={<span className="not-found-title-animated">404</span>}
        subTitle="Rất tiếc, trang bạn đang tìm kiếm không tồn tại."
        extra={[
          <Link to="/" key="home">
            <Button type="primary" size="large">
              Về Trang Chủ
            </Button>
          </Link>,
        ]}
      />
      <div className="not-found-animation-container">
        <div className="star"></div>
        <div className="star star2"></div>
        <div className="star star3"></div>
      </div>
    </div>
  );
}

export default NotFoundPage;