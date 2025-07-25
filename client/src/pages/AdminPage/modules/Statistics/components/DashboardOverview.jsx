import React from "react";
import { Row, Col, Card, Statistic, Table, Progress, Typography, Spin, Alert } from "antd";
import { useQuery } from "@tanstack/react-query";
import { 
  getOverviewStats,
  getTopSellingProducts,
  getRevenueByPeriod,
  formatCurrency,
  formatNumber 
} from "../../../../../services/statisticsService";
import OverviewCards from "./OverviewCards";

const { Title } = Typography;

const DashboardOverview = ({ refreshKey }) => {
  // API cơ bản - Hiệu suất cao
  const { data: overview, isLoading: overviewLoading, error: overviewError } = useQuery({
    queryKey: ["overview-stats", refreshKey],
    queryFn: getOverviewStats,
    staleTime: 300000, // 5 phút
    refetchInterval: 300000,
    retry: 2,
    onError: (error) => {
      console.error("Overview Stats Error:", error);
    }
  });

  const { data: topProducts, isLoading: productsLoading, error: productsError } = useQuery({
    queryKey: ["top-products-dashboard", refreshKey],
    queryFn: () => getTopSellingProducts(5),
    staleTime: 300000,
    retry: 2,
    onError: (error) => {
      console.error("Top Products Error:", error);
    }
  });

  const { data: revenueData, isLoading: revenueLoading, error: revenueError } = useQuery({
    queryKey: ["revenue-dashboard", "7days", refreshKey],
    queryFn: () => getRevenueByPeriod("7days"),
    staleTime: 300000,
    retry: 2,
    onError: (error) => {
      console.error("Revenue Data Error:", error);
    }
  });

  // Loading state
  if (overviewLoading) {
    return (
      <div style={{ textAlign: "center", padding: "50px" }}>
        <Spin size="large" />
        <div style={{ marginTop: "16px" }}>Đang tải dữ liệu tổng quan...</div>
      </div>
    );
  }

  // Error state
  if (overviewError) {
    return (
      <Alert
        message="Không thể tải dữ liệu tổng quan"
        description={`Lỗi: ${overviewError.message}`}
        type="error"
        showIcon
        style={{ margin: "24px" }}
      />
    );
  }

  // No data state
  if (!overview?.data) {
    return (
      <Alert
        message="Không có dữ liệu"
        description="Chưa có dữ liệu thống kê để hiển thị."
        type="info"
        showIcon
        style={{ margin: "24px" }}
      />
    );
  }

  // Cột cho bảng sản phẩm bán chạy
  const productColumns = [
    {
      title: "Sản phẩm",
      dataIndex: "name",
      key: "name",
      ellipsis: true,
      render: (text) => text || "N/A"
    },
    {
      title: "Đã bán",
      dataIndex: "sold",
      key: "sold",
      render: (value) => formatNumber(value || 0),
      align: "right",
    },
    {
      title: "Doanh thu",
      dataIndex: "revenue",
      key: "revenue",
      render: (value) => formatCurrency(value || 0),
      align: "right",
    },
    {
      title: "Tỷ lệ",
      key: "percentage",
      render: (_, record) => {
        const total = topProducts?.data?.reduce((sum, item) => sum + (item.sold || 0), 0) || 1;
        const percentage = ((record.sold || 0) / total) * 100;
        return (
          <Progress 
            percent={Math.round(percentage)} 
            size="small" 
            format={() => `${percentage.toFixed(1)}%`}
          />
        );
      },
    },
  ];

  return (
    <div className="fade-in">
      {/* Cards Tổng quan */}
      <OverviewCards data={overview.data} loading={overviewLoading} />

      <Row gutter={[16, 16]} style={{ marginTop: "24px" }}>
        {/* Doanh thu 7 ngày gần đây */}
        <Col xs={24} lg={14}>
          <Card 
            title={<Title level={4}>📈 Doanh thu 7 ngày gần đây</Title>}
            loading={revenueLoading}
            className="chart-container"
          >
            {revenueError ? (
              <Alert 
                message="Không thể tải dữ liệu doanh thu" 
                type="warning" 
                showIcon 
              />
            ) : revenueData?.data && revenueData.data.length > 0 ? (
              <div>
                {revenueData.data.map((day, index) => (
                  <div 
                    key={index}
                    style={{ 
                      display: "flex", 
                      justifyContent: "space-between", 
                      alignItems: "center",
                      padding: "8px 0",
                      borderBottom: index < revenueData.data.length - 1 ? "1px solid #f0f0f0" : "none"
                    }}
                  >
                    <span style={{ fontWeight: 500 }}>
                      {day.date || "N/A"}
                    </span>
                    <span style={{ color: "#1890ff", fontWeight: "bold" }}>
                      {formatCurrency(day.revenue || 0)}
                    </span>
                  </div>
                ))}
                <div style={{ 
                  marginTop: "16px", 
                  padding: "12px", 
                  background: "#f6ffed", 
                  borderRadius: "6px",
                  textAlign: "center"
                }}>
                  <strong>Tổng 7 ngày: </strong>
                  <span style={{ color: "#52c41a", fontSize: "16px", fontWeight: "bold" }}>
                    {formatCurrency(
                      revenueData.data.reduce((sum, day) => sum + (day.revenue || 0), 0)
                    )}
                  </span>
                </div>
              </div>
            ) : (
              <div style={{ textAlign: "center", padding: "20px", color: "#999" }}>
                Chưa có dữ liệu doanh thu
              </div>
            )}
          </Card>
        </Col>

        {/* Top sản phẩm bán chạy */}
        <Col xs={24} lg={10}>
          <Card 
            title={<Title level={4}>🏆 Top 5 sản phẩm bán chạy</Title>}
            loading={productsLoading}
            className="chart-container"
          >
            {productsError ? (
              <Alert 
                message="Không thể tải dữ liệu sản phẩm" 
                type="warning" 
                showIcon 
              />
            ) : (
              <Table
                dataSource={topProducts?.data || []}
                columns={productColumns}
                pagination={false}
                size="small"
                className="statistics-table"
                rowKey={(record, index) => record._id || `product-${index}`}
                scroll={{ y: 300 }}
                locale={{
                  emptyText: "Chưa có dữ liệu sản phẩm"
                }}
              />
            )}
          </Card>
        </Col>
      </Row>

      {/* Metrics nhanh */}
      <Row gutter={[16, 16]} style={{ marginTop: "24px" }}>
        <Col span={24}>
          <Card title={<Title level={4}>📊 Chỉ số nhanh</Title>}>
            <Row gutter={16}>
              <Col xs={12} sm={6}>
                <Statistic
                  title="Conversion Rate"
                  value={overview.data.conversionRate || 0}
                  precision={2}
                  suffix="%"
                  valueStyle={{ color: "#722ed1" }}
                />
              </Col>
              <Col xs={12} sm={6}>
                <Statistic
                  title="Tỷ lệ hoàn thành"
                  value={((overview.data.completedOrders || 0) / (overview.data.totalOrders || 1)) * 100}
                  precision={1}
                  suffix="%"
                  valueStyle={{ color: "#52c41a" }}
                />
              </Col>
              <Col xs={12} sm={6}>
                <Statistic
                  title="Đơn hàng/Ngày"
                  value={Math.round((overview.data.totalOrders || 0) / 30)}
                  valueStyle={{ color: "#1890ff" }}
                />
              </Col>
              <Col xs={12} sm={6}>
                <Statistic
                  title="Doanh thu/Đơn"
                  value={formatCurrency(overview.data.avgOrderValue || 0)}
                  valueStyle={{ color: "#fa8c16" }}
                />
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default DashboardOverview;
