import React from "react";
import { Alert, Button, Card } from "antd";
import { ReloadOutlined, BugOutlined } from "@ant-design/icons";

class StatisticsErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null,
      errorInfo: null 
    };
  }

  static getDerivedStateFromError() {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log error details
    console.error("Statistics Component Error:", error);
    console.error("Error Info:", errorInfo);
    
    this.setState({
      error: error,
      errorInfo: errorInfo
    });

    // You can also log the error to an error reporting service here
    // logErrorToService(error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ 
      hasError: false, 
      error: null, 
      errorInfo: null 
    });
  };

  render() {
    if (this.state.hasError) {
      return (
        <Card 
          style={{ 
            margin: "24px",
            textAlign: "center",
            minHeight: "400px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}
        >
          <div>
            <BugOutlined style={{ fontSize: "64px", color: "#ff4d4f", marginBottom: "24px" }} />
            
            <Alert
              message="Có lỗi xảy ra trong Statistics Component"
              description={
                <div>
                  <p><strong>Lỗi:</strong> {this.state.error?.message || "Unknown error"}</p>
                  <details style={{ marginTop: "16px", textAlign: "left" }}>
                    <summary>Chi tiết lỗi (dành cho developer)</summary>
                    <pre style={{ 
                      fontSize: "12px", 
                      backgroundColor: "#f5f5f5", 
                      padding: "12px", 
                      borderRadius: "4px",
                      overflow: "auto",
                      maxHeight: "200px"
                    }}>
                      {this.state.error?.stack}
                      {this.state.errorInfo?.componentStack}
                    </pre>
                  </details>
                </div>
              }
              type="error"
              showIcon
              style={{ marginBottom: "24px", textAlign: "left" }}
            />

            <div>
              <Button 
                type="primary" 
                icon={<ReloadOutlined />} 
                onClick={this.handleRetry}
                size="large"
              >
                Thử lại
              </Button>
              
              <Button 
                style={{ marginLeft: "12px" }}
                onClick={() => window.location.reload()}
              >
                Reload trang
              </Button>
            </div>

            <div style={{ marginTop: "24px", color: "#666", fontSize: "14px" }}>
              <p>Nếu lỗi vẫn tiếp tục, vui lòng:</p>
              <ul style={{ textAlign: "left", display: "inline-block" }}>
                <li>Kiểm tra kết nối mạng</li>
                <li>Đảm bảo server backend đang chạy</li>
                <li>Kiểm tra console để biết thêm chi tiết</li>
                <li>Liên hệ team phát triển nếu cần thiết</li>
              </ul>
            </div>
          </div>
        </Card>
      );
    }

    return this.props.children;
  }
}

export default StatisticsErrorBoundary;
