import React from "react";
import { Row, Col, Card, Statistic } from "antd";
import { 
  DollarOutlined, 
  ShoppingCartOutlined, 
  UserOutlined, 
  TrophyOutlined,
  RiseOutlined,
  FallOutlined,
  RollbackOutlined,
  ExclamationCircleOutlined
} from "@ant-design/icons";
import { formatCurrency, formatNumber, formatPercentage } from "../../../../../services/statisticsService";

const OverviewCards = ({ data, loading }) => {
  if (!data) return null;

  const getGrowthIcon = (growth) => {
    if (growth > 0) return <RiseOutlined style={{ color: "#52c41a" }} />;
    if (growth < 0) return <FallOutlined style={{ color: "#ff4d4f" }} />;
    return null;
  };

  const getGrowthColor = (growth) => {
    if (growth > 0) return "#52c41a";
    if (growth < 0) return "#ff4d4f";
    return "#666";
  };

  const cards = [
    {
      title: "Tổng doanh thu",
      value: formatCurrency(data.totalRevenue || 0),
      icon: <DollarOutlined style={{ color: "#1890ff", fontSize: "24px" }} />,
      growth: data.revenueGrowth,
      color: "#1890ff"
    },
    {
      title: "Tổng đơn hàng",
      value: formatNumber(data.totalOrders || 0),
      icon: <ShoppingCartOutlined style={{ color: "#52c41a", fontSize: "24px" }} />,
      growth: data.ordersGrowth, // Fix: đảm bảo key đúng
      color: "#52c41a"
    },
    {
      title: "Khách hàng mới",
      value: formatNumber(data.newCustomers || 0),
      icon: <UserOutlined style={{ color: "#722ed1", fontSize: "24px" }} />,
      growth: data.customersGrowth,
      color: "#722ed1"
    }
  ];

  return (
    <Row gutter={[16, 16]}>
      {cards.map((card, index) => (
        <Col xs={24} sm={12} md={8} lg={8} key={index}>
          <Card 
            loading={loading}
            style={{ 
              borderLeft: `4px solid ${card.color}`,
              transition: "transform 0.2s",
            }}
            className="overview-card"
            hoverable
          >
            <Statistic
              title={
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span>{card.title}</span>
                  {card.icon}
                </div>
              }
              value={card.value}
              suffix={
                card.growth !== undefined && card.growth !== null ? (
                  <div style={{ fontSize: "12px", marginTop: "4px" }}>
                    {getGrowthIcon(card.growth)}
                    <span style={{ 
                      color: getGrowthColor(card.growth),
                      marginLeft: "4px" 
                    }}>
                      {formatPercentage(Math.abs(card.growth))}
                    </span>
                  </div>
                ) : null
              }
              valueStyle={{ 
                fontSize: "20px", 
                fontWeight: "bold",
                color: card.color 
              }}
            />
          </Card>
        </Col>
      ))}
    </Row>
  );
};

export default OverviewCards;
