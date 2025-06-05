import classNames from "classnames/bind";
import styles from "./ProductManager.module.css";
import { useState } from "react";
import { message, Table, Button, Space, Spin, Alert, Pagination } from "antd";
import { DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import AddProduct from "./AddProduct/AddProduct";
import { deleteProduct, getAllProduct } from "../../../services/productService";
import { useQuery, useQueryClient } from "@tanstack/react-query";

const cx = classNames.bind(styles);

function ProductManager() {
  const [type, setType] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(8);
  const queryClient = useQueryClient();

  const {
    data: productData,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["products", page, limit],
    queryFn: () => getAllProduct(limit, page),
  });

  if (isLoading) {
    return (
      <div className={cx("status-container")}>
        <Spin size="large" tip="Đang tải dữ liệu..." />
      </div>
    );
  }

  if (isError) {
    return (
      <div className={cx("status-container")}>
        <Alert
          message="Lỗi"
          description={
            error?.message ||
            "Không thể tải dữ liệu sản phẩm. Vui lòng thử lại sau."
          }
          type="error"
          showIcon
        />
      </div>
    );
  }

  if (!productData?.data) {
    return (
      <div className={cx("status-container")}>
        <p>Không tìm thấy sản phẩm nào.</p>
      </div>
    );
  }

  const handlePageChange = (newPage) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const DeleteProduct = async (id) => {
    try {
      const res = await deleteProduct(id);
      message.success(res.message);
      queryClient.invalidateQueries(["products"]);
    } catch (e) {
      message.error("Lỗi khi xóa sản phẩm", e);
    }
  };

  const columns = [
    {
      title: "ID",
      dataIndex: "index",
      key: "index",
      width: 80,
      render: (_, __, index) => (page - 1) * limit + index + 1,
    },
    {
      title: "Ảnh",
      dataIndex: "images",
      key: "images",
      width: 120,
      render: (images) => (
        <img
          src={images[0]}
          alt="product"
          style={{
            width: "80px",
            height: "80px",
            objectFit: "cover",
            borderRadius: "4px",
          }}
        />
      ),
    },
    {
      title: "Tên sản phẩm",
      dataIndex: "name",
      key: "name",
      width: 200,
      ellipsis: true,
    },
    {
      title: "Giá",
      dataIndex: "price",
      key: "price",
      width: 150,
      render: (price) => `${price.toLocaleString()} VNĐ`,
    },
    {
      title: "Số lượng còn lại",
      dataIndex: "stock",
      key: "stock",
      width: 150,
    },
    {
      title: "Hành động",
      key: "action",
      width: 120,
      render: (_, record) => (
        <Space size="middle">
          <Button
            type="primary"
            danger
            icon={<DeleteOutlined />}
            onClick={() => DeleteProduct(record._id)}
          >
            Xóa
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div className={cx("wrapper")}>
      <div className={cx("header")}>
        <h4>
          {type === 0
            ? "Danh sách sản phẩm"
            : type === 1
            ? "Thêm sản phẩm"
            : "Sửa sản phẩm"}
        </h4>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setType(type === 0 ? 1 : 0)}
        >
          {type === 0 ? "Thêm sản phẩm" : "Quay lại"}
        </Button>
      </div>

      {type === 0 ? (
        <div className={cx("product-list")}>
          <Table
            columns={columns}
            dataSource={productData.data}
            rowKey="_id"
            pagination={false}
            scroll={{ x: 1000 }}
            loading={isLoading}
            bordered
          />

          <div className={cx("pagination-wrapper")}>
            <Pagination
              current={page}
              total={productData.total}
              pageSize={limit}
              onChange={handlePageChange}
              showSizeChanger={false}
              showQuickJumper
              showTotal={(total) => `Tổng số ${total} sản phẩm`}
            />
          </div>
        </div>
      ) : type === 1 ? (
        <AddProduct
          onSuccess={() => {
            setType(0);
            setPage(1);
            queryClient.invalidateQueries(["products"]);
          }}
        />
      ) : null}
    </div>
  );
}

export default ProductManager;
