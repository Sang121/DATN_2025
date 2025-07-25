import React from "react";
import { Card, Result, Button } from "antd";
import { BarChartOutlined } from "@ant-design/icons";

const StatisticsFallback = () => {
  return (
    <Card style={{ margin: "24px", minHeight: "400px" }}>
      <Result
        icon={<BarChartOutlined style={{ color: "#1890ff" }} />}
        title="Thống kê doanh số"
        subTitle="Chức năng thống kê đang được phát triển"
        extra={
          <div>
            <p>Các tính năng sẽ có:</p>
            <ul style={{ textAlign: "left", display: "inline-block" }}>
              <li>📊 Tổng quan doanh thu</li>
              <li>📈 Biểu đồ doanh số theo thời gian</li>
              <li>🏆 Top sản phẩm bán chạy</li>
              <li>👥 Thống kê khách hàng</li>
              <li>📱 Responsive trên mobile</li>
            </ul>
            <Button type="primary" style={{ marginTop: "16px" }}>
              Quay lại Dashboard
            </Button>
          </div>
        }
      />
    </Card>
  );
};

export default StatisticsFallback;
