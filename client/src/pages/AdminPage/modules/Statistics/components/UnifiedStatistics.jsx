import React, { useState } from "react";
import {
  Row,
  Col,
  Card,
  Select,
  Button,
  Typography,
  Spin,
  Alert,
  Table,
  Progress,
  Statistic,
} from "antd";
import { ReloadOutlined } from "@ant-design/icons";
import { useQuery } from "@tanstack/react-query";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  getOverviewStats,
  getTopSellingProducts,
  getRevenueByPeriod,
  formatCurrency,
  formatNumber,
} from "../../../../../services/statisticsService";
import {
  getComparisonStats,
  getProductTrends,
} from "../../../../../services/statisticsAdvancedService";
import OverviewCards from "./OverviewCards";
import moment from "moment";

const { Title } = Typography;
const { Option } = Select;

const UnifiedStatistics = ({ refreshKey, onRefresh }) => {
  const [trendDays, setTrendDays] = useState(30);
  const [comparisonPeriod, setComparisonPeriod] = useState("month");
  const [revenuePeriod, setRevenuePeriod] = useState("7days");

  // API calls
  const {
    data: overview,
    isLoading: overviewLoading,
    error: overviewError,
  } = useQuery({
    queryKey: ["overview-stats", refreshKey],
    queryFn: getOverviewStats,
    staleTime: 300000,
    retry: 2,
  });

  const { data: topProducts, isLoading: productsLoading } = useQuery({
    queryKey: ["top-products", refreshKey],
    queryFn: () => getTopSellingProducts(10),
    staleTime: 300000,
    retry: 2,
  });

  const { data: revenueData, isLoading: revenueLoading } = useQuery({
    queryKey: ["revenue-period", revenuePeriod, refreshKey],
    queryFn: () => getRevenueByPeriod(revenuePeriod),
    staleTime: 300000,
    retry: 2,
  });

  const { data: productTrends, isLoading: trendsLoading } = useQuery({
    queryKey: ["product-trends", trendDays, refreshKey],
    queryFn: () => getProductTrends(trendDays),
  });

  // Comparison dates calculation
  const getComparisonDates = () => {
    const today = moment();
    let currentStart, currentEnd, previousStart, previousEnd;

    if (comparisonPeriod === "week") {
      currentStart = today.clone().startOf("week").format("YYYY-MM-DD");
      currentEnd = today.format("YYYY-MM-DD");
      previousStart = today
        .clone()
        .subtract(1, "week")
        .startOf("week")
        .format("YYYY-MM-DD");
      previousEnd = today
        .clone()
        .subtract(1, "week")
        .endOf("week")
        .format("YYYY-MM-DD");
    } else {
      currentStart = today.clone().startOf("month").format("YYYY-MM-DD");
      currentEnd = today.format("YYYY-MM-DD");
      previousStart = today
        .clone()
        .subtract(1, "month")
        .startOf("month")
        .format("YYYY-MM-DD");
      previousEnd = today
        .clone()
        .subtract(1, "month")
        .endOf("month")
        .format("YYYY-MM-DD");
    }

    return { currentStart, currentEnd, previousStart, previousEnd };
  };

  const comparisonDates = getComparisonDates();
  const { data: comparisonData, isLoading: comparisonLoading } = useQuery({
    queryKey: ["comparison-stats", comparisonPeriod, refreshKey],
    queryFn: () =>
      getComparisonStats(
        comparisonDates.currentStart,
        comparisonDates.currentEnd,
        comparisonDates.previousStart,
        comparisonDates.previousEnd
      ),
  });

  // Loading state
  if (overviewLoading) {
    return (
      <div style={{ textAlign: "center", padding: "50px" }}>
        <Spin size="large" />
        <div style={{ marginTop: "16px" }}>Đang tải dữ liệu thống kê...</div>
      </div>
    );
  }

  // Error state
  if (overviewError) {
    return (
      <Alert
        message="Không thể tải dữ liệu thống kê"
        description={`Lỗi: ${overviewError.message}`}
        type="error"
        showIcon
        style={{ margin: "24px" }}
      />
    );
  }

  // Product table columns
  const productColumns = [
    {
      title: "Sản phẩm",
      dataIndex: "name",
      key: "name",
      ellipsis: true,
      render: (text) => text || "N/A",
    },
    {
      title: "Đã bán",
      dataIndex: "sold",
      key: "sold",
      render: (value) => formatNumber(value || 0),
      align: "right",
      sorter: (a, b) => (a.sold || 0) - (b.sold || 0),
    },
    {
      title: "Doanh thu",
      dataIndex: "revenue",
      key: "revenue",
      render: (value) => formatCurrency(value || 0),
      align: "right",
      sorter: (a, b) => (a.revenue || 0) - (b.revenue || 0),
    },
    {
      title: "Tỷ lệ",
      key: "percentage",
      render: (_, record) => {
        const total =
          topProducts?.data?.reduce((sum, item) => sum + (item.sold || 0), 0) ||
          1;
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
      {/* Filter Controls */}
      <Card style={{ marginBottom: "24px" }}>
        <Row gutter={[16, 16]} align="middle" justify="space-between">
          <Col xs={24} sm={24} md={18} lg={20} xl={20}>
            <Row gutter={[12, 12]} align="middle">
              <Col xs={24} sm={12} md={8} lg={8}>
                <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                  <span style={{ fontWeight: 500, fontSize: "14px" }}>Doanh thu theo thời gian:</span>
                  <Select
                    value={revenuePeriod}
                    onChange={setRevenuePeriod}
                    style={{ width: "100%" }}
                    size="middle"
                  >
                    <Option value="7days">7 ngày gần đây</Option>
                    <Option value="30days">30 ngày gần đây</Option>
                    <Option value="12months">12 tháng gần đây</Option>
                  </Select>
                </div>
              </Col>
              <Col xs={24} sm={12} md={8} lg={8}>
                <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                  <span style={{ fontWeight: 500, fontSize: "14px" }}>Xu hướng sản phẩm:</span>
                  <Select
                    value={trendDays}
                    onChange={setTrendDays}
                    style={{ width: "100%" }}
                    size="middle"
                  >
                    <Option value={7}>7 ngày</Option>
                    <Option value={15}>15 ngày</Option>
                    <Option value={30}>30 ngày</Option>
                    <Option value={60}>60 ngày</Option>
                  </Select>
                </div>
              </Col>
              <Col xs={24} sm={24} md={8} lg={8}>
                <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                  <span style={{ fontWeight: 500, fontSize: "14px" }}>So sánh:</span>
                  <Select
                    value={comparisonPeriod}
                    onChange={setComparisonPeriod}
                    style={{ width: "100%" }}
                    size="middle"
                  >
                    <Option value="week">Tuần này vs tuần trước</Option>
                    <Option value="month">Tháng này vs tháng trước</Option>
                  </Select>
                </div>
              </Col>
            </Row>
          </Col>
          <Col xs={24} sm={24} md={6} lg={4} xl={4}>
            <Button
              icon={<ReloadOutlined />}
              onClick={onRefresh}
              type="primary"
              block
              size="middle"
            >
              Làm mới dữ liệu
            </Button>
          </Col>
        </Row>
      </Card>

      {/* Overview Cards */}
      <OverviewCards data={overview?.data} loading={overviewLoading} />

      {/* Main Content */}
      <Row gutter={[16, 16]} style={{ marginTop: "24px" }}>
        {/* Revenue Chart */}
        <Col xs={24} sm={24} md={24} lg={14} xl={14}>
          <Card
            title={<Title level={4}>📈 Doanh thu theo thời gian</Title>}
            loading={revenueLoading}
            className="chart-container"
          >
            {revenueData?.data && revenueData.data.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={revenueData.data}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date" 
                    fontSize={12}
                    angle={window.innerWidth < 768 ? -45 : 0}
                    textAnchor={window.innerWidth < 768 ? "end" : "middle"}
                    height={window.innerWidth < 768 ? 60 : 30}
                  />
                  <YAxis 
                    tickFormatter={formatCurrency}
                    fontSize={12}
                    width={window.innerWidth < 768 ? 60 : 80}
                  />
                  <Tooltip
                    formatter={(value) => [formatCurrency(value), "Doanh thu"]}
                  />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="#1890ff"
                    strokeWidth={2}
                    dot={{ r: window.innerWidth < 768 ? 2 : 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div
                style={{ textAlign: "center", padding: "50px", color: "#999" }}
              >
                Chưa có dữ liệu doanh thu
              </div>
            )}
          </Card>
        </Col>

        {/* Comparison Stats */}
        <Col xs={24} sm={24} md={24} lg={10} xl={10}>
          <Card
            title={<Title level={4}>📊 So sánh hiệu suất</Title>}
            loading={comparisonLoading}
          >
            {comparisonData?.data ? (
              <div>
                <Row gutter={[12, 12]}>
                  <Col xs={24} sm={12} md={12} lg={24} xl={12}>
                    <Card
                      size="small"
                      title="Kỳ hiện tại"
                      style={{ background: "#f6ffed" }}
                    >
                      <Statistic
                        title="Doanh thu"
                        value={comparisonData.data.current.revenue}
                        formatter={formatCurrency}
                        valueStyle={{ fontSize: "14px" }}
                      />
                      <Statistic
                        title="Đơn hàng"
                        value={comparisonData.data.current.orders}
                        valueStyle={{ fontSize: "12px" }}
                      />
                      <Statistic
                        title="AOV"
                        value={comparisonData.data.current.avgOrderValue}
                        formatter={formatCurrency}
                        valueStyle={{ fontSize: "12px" }}
                      />
                    </Card>
                  </Col>
                  <Col xs={24} sm={12} md={12} lg={24} xl={12}>
                    <Card
                      size="small"
                      title="Kỳ trước"
                      style={{ background: "#fff7e6" }}
                    >
                      <Statistic
                        title="Doanh thu"
                        value={comparisonData.data.previous.revenue}
                        formatter={formatCurrency}
                        valueStyle={{ fontSize: "14px" }}
                      />
                      <Statistic
                        title="Đơn hàng"
                        value={comparisonData.data.previous.orders}
                        valueStyle={{ fontSize: "12px" }}
                      />
                      <Statistic
                        title="AOV"
                        value={comparisonData.data.previous.avgOrderValue}
                        formatter={formatCurrency}
                        valueStyle={{ fontSize: "12px" }}
                      />
                    </Card>
                  </Col>
                </Row>
                <div
                  style={{
                    marginTop: 16,
                    padding: "12px",
                    background: "#f0f2f5",
                    borderRadius: "6px",
                    textAlign: "center",
                  }}
                >
                  <div style={{ fontSize: "14px", fontWeight: "bold" }}>
                    Tăng trưởng doanh thu:
                    <span
                      style={{
                        color:
                          comparisonData.data.growth.revenue >= 0
                            ? "#52c41a"
                            : "#ff4d4f",
                        marginLeft: 8,
                        fontSize: "16px",
                      }}
                    >
                      {comparisonData.data.growth.revenue >= 0 ? "+" : ""}
                      {comparisonData.data.growth.revenue.toFixed(2)}%
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div
                style={{ textAlign: "center", padding: "50px", color: "#999" }}
              >
                Đang tải dữ liệu so sánh...
              </div>
            )}
          </Card>
        </Col>

        {/* Top Products Table */}
        <Col xs={24} sm={24} md={24} lg={14} xl={14}>
          <Card
            title={<Title level={4}>🏆 Top sản phẩm bán chạy</Title>}
            loading={productsLoading}
            className="chart-container"
          >
            <Table
              dataSource={topProducts?.data || []}
              columns={productColumns}
              pagination={{ 
                pageSize: window.innerWidth < 768 ? 5 : 8, 
                showSizeChanger: false,
                showQuickJumper: false,
                showTotal: (total, range) => 
                  `${range[0]}-${range[1]} của ${total} sản phẩm`
              }}
              size="small"
              className="statistics-table"
              rowKey={(record) => record._id || `product-${record.name || Math.random()}`}
              locale={{
                emptyText: "Chưa có dữ liệu sản phẩm",
              }}
              scroll={{ x: 600 }}
            />
          </Card>
        </Col>

        {/* Product Trends Chart */}
        <Col xs={24} sm={24} md={24} lg={10} xl={10}>
          <Card
            title={
              <Title level={4}>📈 Xu hướng sản phẩm ({trendDays} ngày)</Title>
            }
            loading={trendsLoading}
          >
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={productTrends?.data?.slice(0, window.innerWidth < 768 ? 5 : 8) || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="productName"
                  angle={-45}
                  textAnchor="end"
                  height={100}
                  interval={0}
                  fontSize={10}
                />
                <YAxis fontSize={10} />
                <Tooltip
                  formatter={(value, name) => [
                    name === "totalUnits"
                      ? `${value} sản phẩm`
                      : formatCurrency(value),
                    name === "totalUnits" ? "Số lượng bán" : "Doanh thu",
                  ]}
                />
                <Legend />
                <Bar dataKey="totalUnits" fill="#1890ff" name="Số lượng bán" />
                <Bar dataKey="totalRevenue" fill="#52c41a" name="Doanh thu" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>

        {/* Quick Metrics */}
        <Col span={24}>
          <Card title={<Title level={4}>📊 Chỉ số nhanh</Title>}>
            <Row gutter={[16, 16]}>
              <Col xs={12} sm={6} md={6} lg={6} xl={6}>
                <Statistic
                  title="Conversion Rate"
                  value={overview?.data?.conversionRate || 0}
                  precision={2}
                  suffix="%"
                  valueStyle={{ color: "#722ed1", fontSize: window.innerWidth < 768 ? "16px" : "20px" }}
                />
              </Col>
              <Col xs={12} sm={6} md={6} lg={6} xl={6}>
                <Statistic
                  title="Tỷ lệ hoàn thành"
                  value={
                    ((overview?.data?.completedOrders || 0) /
                      (overview?.data?.totalOrders || 1)) *
                    100
                  }
                  precision={1}
                  suffix="%"
                  valueStyle={{ color: "#52c41a", fontSize: window.innerWidth < 768 ? "16px" : "20px" }}
                />
              </Col>
              <Col xs={12} sm={6} md={6} lg={6} xl={6}>
                <Statistic
                  title="Đơn hàng/Ngày"
                  value={Math.round((overview?.data?.totalOrders || 0) / 30)}
                  valueStyle={{ color: "#1890ff", fontSize: window.innerWidth < 768 ? "16px" : "20px" }}
                />
              </Col>
              <Col xs={12} sm={6} md={6} lg={6} xl={6}>
                <Statistic
                  title="Doanh thu/Đơn"
                  value={overview?.data?.avgOrderValue || 0}
                  formatter={formatCurrency}
                  valueStyle={{ color: "#fa8c16", fontSize: window.innerWidth < 768 ? "16px" : "20px" }}
                />
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default UnifiedStatistics;
