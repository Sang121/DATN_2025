import React, { useState } from "react";
import { Tabs, Card, Row, Col, Button, Space } from "antd";
import { 
  DashboardOutlined, 
  BarChartOutlined, 
  ReloadOutlined 
} from "@ant-design/icons";

// Import components và providers
import DashboardOverview from "./components/DashboardOverview";
import AdvancedAnalytics from "./components/AdvancedAnalytics";
import StatisticsQueryProvider from "./providers/StatisticsQueryProvider";
import StatisticsErrorBoundary from "./components/StatisticsErrorBoundary";
import "./styles/Statistics.css";

const { TabPane } = Tabs;

const OptimizedStatistics = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [refreshKey, setRefreshKey] = useState(0);

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  const tabItems = [
    {
      key: "overview",
      label: (
        <span>
          <DashboardOutlined />
          Tổng quan
        </span>
      ),
      children: <DashboardOverview refreshKey={refreshKey} />,
      description: "Sử dụng API cơ bản - Load nhanh"
    },
    {
      key: "advanced",
      label: (
        <span>
          <BarChartOutlined />
          Phân tích nâng cao
        </span>
      ),
      children: <AdvancedAnalytics refreshKey={refreshKey} />,
      description: "Sử dụng API nâng cao - Chi tiết"
    },
  ];

  return (
    <div style={{ padding: "24px" }}>
      {/* Header Controls */}
      <Card style={{ marginBottom: "24px" }}>
        <Row justify="space-between" align="middle">
          <Col>
            <h2 style={{ margin: 0 }}>📊 Thống kê doanh số bán hàng</h2>
          </Col>
          <Col>
            <Space>
              <Button 
                icon={<ReloadOutlined />} 
                onClick={handleRefresh}
                type="primary"
              >
                Làm mới dữ liệu
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Main Tabs */}
      <Tabs 
        activeKey={activeTab}
        onChange={setActiveTab}
        size="large"
        tabBarStyle={{ marginBottom: "24px" }}
      >
        {tabItems.map(item => (
          <TabPane key={item.key} tab={item.label}>
            <div style={{ minHeight: "500px" }}>
              {item.children}
            </div>
          </TabPane>
        ))}
      </Tabs>
    </div>
  );
};

// Wrap component với QueryProvider và Error Boundary
const StatisticsPageWithProvider = () => {
  return (
    <StatisticsErrorBoundary>
      <StatisticsQueryProvider>
        <OptimizedStatistics />
      </StatisticsQueryProvider>
    </StatisticsErrorBoundary>
  );
};

export default StatisticsPageWithProvider;
