import React from 'react';
import { Card, Spin, Alert } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';

/**
 * Loading card component for admin modules
 */
export const LoadingCard = ({ 
  title = "Đang tải...", 
  height = 200,
  showSpinner = true 
}) => {
  return (
    <Card style={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        {showSpinner && <Spin size="large" />}
        <div style={{ marginTop: showSpinner ? '16px' : 0 }}>{title}</div>
      </div>
    </Card>
  );
};

/**
 * Error card component for admin modules
 */
export const ErrorCard = ({ 
  error, 
  onRetry, 
  title = "Có lỗi xảy ra",
  height = 200 
}) => {
  return (
    <Card style={{ height }}>
      <Alert
        message={title}
        description={error?.message || "Vui lòng thử lại sau"}
        type="error"
        showIcon
        action={
          onRetry && (
            <button 
              onClick={onRetry}
              style={{ 
                border: 'none', 
                background: 'transparent', 
                cursor: 'pointer',
                color: '#ff4d4f' 
              }}
            >
              <ReloadOutlined /> Thử lại
            </button>
          )
        }
      />
    </Card>
  );
};

/**
 * Empty state card component
 */
export const EmptyCard = ({ 
  title = "Không có dữ liệu", 
  description = "Chưa có dữ liệu để hiển thị",
  height = 200,
  icon = "📊"
}) => {
  return (
    <Card style={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center', color: '#999' }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>{icon}</div>
        <h3 style={{ color: '#999', margin: 0 }}>{title}</h3>
        <p style={{ color: '#999', margin: '8px 0 0 0' }}>{description}</p>
      </div>
    </Card>
  );
};

export default {
  LoadingCard,
  ErrorCard,
  EmptyCard
};
