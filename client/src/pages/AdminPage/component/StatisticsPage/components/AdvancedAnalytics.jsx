import React, { useState, useMemo } from "react";
import { Row, Col, Card, DatePicker, Select, Button, Typography, Spin, Alert } from "antd";
import { useQuery } from "@tanstack/react-query";
import { 
  LineChart, Line, AreaChart, Area, BarChart, Bar, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from "recharts";
import { 
  getHourlyRevenue, 
  getComparisonStats, 
  getAdvancedCustomerStats, 
  getProductTrends 
} from "../../../../../services/statisticsAdvancedService";
import { formatCurrency } from "../../../../../services/statisticsService";
import moment from "moment";

const { Title } = Typography;
const { Option } = Select;

const AdvancedAnalytics = ({ refreshKey }) => {
  const [selectedDate, setSelectedDate] = useState(moment().format("YYYY-MM-DD"));
  const [trendDays, setTrendDays] = useState(30);
  const [comparisonPeriod, setComparisonPeriod] = useState("month");

  // API nâng cao - Dữ liệu chi tiết
  const { data: hourlyData, isLoading: hourlyLoading } = useQuery({
    queryKey: ["hourly-revenue", selectedDate, refreshKey],
    queryFn: () => getHourlyRevenue(selectedDate),
    enabled: !!selectedDate,
  });

  const { data: customerAnalytics, isLoading: customerLoading } = useQuery({
    queryKey: ["advanced-customers", refreshKey],
    queryFn: getAdvancedCustomerStats,
  });

  const { data: productTrends, isLoading: trendsLoading } = useQuery({
    queryKey: ["product-trends", trendDays, refreshKey],
    queryFn: () => getProductTrends(trendDays),
  });

  // Tính toán comparison dates dựa trên period (FIX: useMemo để tránh re-calculation)
  const comparisonDates = useMemo(() => {
    const today = moment();
    let currentStart, currentEnd, previousStart, previousEnd;
    
    if (comparisonPeriod === "week") {
      currentStart = today.clone().startOf("week").format("YYYY-MM-DD");
      currentEnd = today.format("YYYY-MM-DD");
      previousStart = today.clone().subtract(1, "week").startOf("week").format("YYYY-MM-DD");
      previousEnd = today.clone().subtract(1, "week").endOf("week").format("YYYY-MM-DD");
    } else {
      currentStart = today.clone().startOf("month").format("YYYY-MM-DD");
      currentEnd = today.format("YYYY-MM-DD");
      previousStart = today.clone().subtract(1, "month").startOf("month").format("YYYY-MM-DD");
      previousEnd = today.clone().subtract(1, "month").endOf("month").format("YYYY-MM-DD");
    }
    
    return { currentStart, currentEnd, previousStart, previousEnd };
  }, [comparisonPeriod]); // Chỉ re-calculate khi period thay đổi

  const { data: comparisonData, isLoading: comparisonLoading } = useQuery({
    queryKey: ["comparison-stats", comparisonPeriod, refreshKey],
    queryFn: () => getComparisonStats(
      comparisonDates.currentStart, 
      comparisonDates.currentEnd, 
      comparisonDates.previousStart, 
      comparisonDates.previousEnd
    ),
  });

  if (hourlyLoading || customerLoading || trendsLoading || comparisonLoading) {
    return (
      <div style={{ textAlign: "center", padding: "50px" }}>
        <Spin size="large" />
        <div style={{ marginTop: "16px" }}>Đang tải phân tích nâng cao...</div>
      </div>
    );
  }

  return (
    <div>
      <Row gutter={[16, 16]} style={{ marginBottom: "24px" }}>
        {/* Controls */}
        <Col span={24}>
          <Card>
            <Row gutter={16} align="middle">
              <Col>
                <label>Doanh thu theo giờ:</label>
                <DatePicker 
                  value={moment(selectedDate)}
                  onChange={(date) => setSelectedDate(date?.format("YYYY-MM-DD"))}
                  style={{ marginLeft: 8 }}
                />
              </Col>
              <Col>
                <label>Xu hướng sản phẩm:</label>
                <Select 
                  value={trendDays}
                  onChange={setTrendDays}
                  style={{ width: 120, marginLeft: 8 }}
                >
                  <Option value={7}>7 ngày</Option>
                  <Option value={15}>15 ngày</Option>
                  <Option value={30}>30 ngày</Option>
                  <Option value={60}>60 ngày</Option>
                </Select>
              </Col>
              <Col>
                <label>So sánh:</label>
                <Select 
                  value={comparisonPeriod}
                  onChange={setComparisonPeriod}
                  style={{ width: 120, marginLeft: 8 }}
                >
                  <Option value="week">Tuần này vs tuần trước</Option>
                  <Option value="month">Tháng này vs tháng trước</Option>
                </Select>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        {/* Hourly Revenue Chart */}
        <Col xs={24} lg={12}>
          <Card title={<Title level={4}>⏰ Doanh thu theo giờ</Title>}>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={hourlyData?.data || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="hour" />
                <YAxis tickFormatter={formatCurrency} />
                <Tooltip formatter={(value) => [formatCurrency(value), "Doanh thu"]} />
                <Area 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#1890ff" 
                  fill="#1890ff" 
                  fillOpacity={0.3}
                />
              </AreaChart>
            </ResponsiveContainer>
          </Card>
        </Col>

        {/* Comparison Stats */}
        <Col xs={24} lg={12}>
          <Card title={<Title level={4}>📊 So sánh hiệu suất</Title>}>
            {comparisonData?.data && (
              <div>
                <Row gutter={16}>
                  <Col span={12}>
                    <Card size="small" title="Kỳ hiện tại">
                      <div>Doanh thu: {formatCurrency(comparisonData.data.current.revenue)}</div>
                      <div>Đơn hàng: {comparisonData.data.current.orders}</div>
                      <div>AOV: {formatCurrency(comparisonData.data.current.avgOrderValue)}</div>
                    </Card>
                  </Col>
                  <Col span={12}>
                    <Card size="small" title="Kỳ trước">
                      <div>Doanh thu: {formatCurrency(comparisonData.data.previous.revenue)}</div>
                      <div>Đơn hàng: {comparisonData.data.previous.orders}</div>
                      <div>AOV: {formatCurrency(comparisonData.data.previous.avgOrderValue)}</div>
                    </Card>
                  </Col>
                </Row>
                <div style={{ marginTop: 16, textAlign: "center" }}>
                  <div style={{ fontSize: "16px", fontWeight: "bold" }}>
                    Tăng trưởng doanh thu: 
                    <span style={{ 
                      color: comparisonData.data.growth.revenue >= 0 ? "#52c41a" : "#ff4d4f",
                      marginLeft: 8 
                    }}>
                      {comparisonData.data.growth.revenue.toFixed(2)}%
                    </span>
                  </div>
                </div>
              </div>
            )}
          </Card>
        </Col>

        {/* Customer Segmentation */}
        <Col xs={24} lg={12}>
          <Card title={<Title level={4}>👥 Phân khúc khách hàng</Title>}>
            {customerAnalytics?.data && (
              <div>
                <div style={{ marginBottom: 16 }}>
                  <strong>Customer Lifetime Value:</strong>
                  <div style={{ fontSize: "18px", color: "#1890ff" }}>
                    {formatCurrency(customerAnalytics.data.lifetimeValue.average)}
                  </div>
                </div>
                <div style={{ marginBottom: 16 }}>
                  <strong>Đơn hàng TB/Khách:</strong> {customerAnalytics.data.lifetimeValue.avgOrdersPerCustomer}
                </div>
                <div>
                  <strong>Thời gian trung bình:</strong> {customerAnalytics.data.lifetimeValue.avgLifetimeDays} ngày
                </div>
              </div>
            )}
          </Card>
        </Col>

        {/* Product Trends */}
        <Col xs={24} lg={12}>
          <Card title={<Title level={4}>📈 Xu hướng sản phẩm ({trendDays} ngày)</Title>}>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={productTrends?.data?.slice(0, 5) || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="productName" 
                  angle={-45}
                  textAnchor="end"
                  height={100}
                />
                <YAxis />
                <Tooltip 
                  formatter={(value, name) => [
                    name === "totalUnits" ? `${value} sản phẩm` : formatCurrency(value),
                    name === "totalUnits" ? "Số lượng bán" : "Doanh thu"
                  ]}
                />
                <Legend />
                <Bar dataKey="totalUnits" fill="#1890ff" name="Số lượng bán" />
                <Bar dataKey="totalRevenue" fill="#52c41a" name="Doanh thu" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default AdvancedAnalytics;
