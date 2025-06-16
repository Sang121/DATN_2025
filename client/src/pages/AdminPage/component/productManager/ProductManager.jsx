import classNames from "classnames/bind";
import styles from "./ProductManager.module.css";
import { useRef, useState } from "react";
import {
  message,
  Table,
  Button,
  Space,
  Spin,
  Alert,
  Pagination,
  Input,
} from "antd";
import Highlighter from "react-highlight-words";

import { DeleteOutlined, PlusOutlined, SearchOutlined } from "@ant-design/icons";
import AddProduct from "./AddProduct/AddProduct";
import {
  deleteProduct,
  getAllProduct,
} from "../../../../services/productService";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

const cx = classNames.bind(styles);

function ProductManager() {
  const [type, setType] = useState(0); // 0: list, 1: add, 2: edit
  const [page, setPage] = useState(1);
  const [limit] = useState(8);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const queryClient = useQueryClient();
  const [searchText, setSearchText] = useState("");
  const [searchedColumn, setSearchedColumn] = useState("");
  const searchInput = useRef(null);
  const deleteProductMutation = useMutation({
    mutationFn: (id) => deleteProduct(id),
    onSuccess: () => {
      message.success("Xóa sản phẩm thành công.");
      queryClient.invalidateQueries(["getAllProduct"]);
    },
    onError: (error) => {
      message.error(
        `Xóa sản phẩm thất bại: ${error.message || "Lỗi không xác định."}`
      );
    },
  });

  const {
    data: productData,
    isLoading,
    isError,
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
        {message.error("Không thể tải dữ liệu sản phẩm. Vui lòng thử lại sau.")}
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

  const handleEditProduct = (record) => {
    setSelectedProduct(record);
    setType(2); // Switch to edit mode
  };

  const handleDeleteProduct = (id) => {
    deleteProductMutation.mutate(id);
  };
  const handleSearch = (selectedKeys, confirm, dataIndex) => {
    confirm();
    setSearchText(selectedKeys[0]);
    setSearchedColumn(dataIndex);
  };
  const handleReset = (clearFilters) => {
    clearFilters();
    setSearchText("");
  };
  const getColumnSearchProps = (dataIndex) => ({
    filterDropdown: ({
      setSelectedKeys,
      selectedKeys,
      confirm,
      clearFilters,
      close,
    }) => (
      <div style={{ padding: 8 }} onKeyDown={(e) => e.stopPropagation()}>
        <Input
          ref={searchInput}
          placeholder={`Search ${dataIndex}`}
          value={selectedKeys[0]}
          onChange={(e) =>
            setSelectedKeys(e.target.value ? [e.target.value] : [])
          }
          onPressEnter={() => handleSearch(selectedKeys, confirm, dataIndex)}
          style={{ marginBottom: 8, display: "block" }}
        />
        <Space>
          <Button
            type="primary"
            onClick={() => handleSearch(selectedKeys, confirm, dataIndex)}
            icon={<SearchOutlined />}
            size="small"
            style={{ width: 90 }}
          >
            Search
          </Button>
          <Button
            onClick={() => clearFilters && handleReset(clearFilters)}
            size="small"
            style={{ width: 90 }}
          >
            Reset
          </Button>
          <Button
            type="link"
            size="small"
            onClick={() => {
              confirm({ closeDropdown: false });
              setSearchText(selectedKeys[0]);
              setSearchedColumn(dataIndex);
            }}
          >
            Filter
          </Button>
          <Button
            type="link"
            size="small"
            onClick={() => {
              close();
            }}
          >
            close
          </Button>
        </Space>
      </div>
    ),
    filterIcon: (filtered) => (
      <SearchOutlined style={{ color: filtered ? "#1677ff" : undefined }} />
    ),
    onFilter: (value, record) =>
      record[dataIndex].toString().toLowerCase().includes(value.toLowerCase()),
    filterDropdownProps: {
      onOpenChange(open) {
        if (open) {
          setTimeout(() => {
            var _a;
            return (_a = searchInput.current) === null || _a === void 0
              ? void 0
              : _a.select();
          }, 100);
        }
      },
    },
    render: (text) =>
      searchedColumn === dataIndex ? (
        <Highlighter
          highlightStyle={{ backgroundColor: "#ffc069", padding: 0 }}
          searchWords={[searchText]}
          autoEscape
          textToHighlight={text ? text.toString() : ""}
        />
      ) : (
        text
      ),
  });


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
      ...getColumnSearchProps("name"),
    },
    {
      title: "Giá",
      dataIndex: "price",
      key: "price",
      width: 150,
      render: (price) => `$${Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(price)}`,
      sorter: (a, b) => a.price - b.price,
      ...getColumnSearchProps("price"),
    },
    {
      title: "Số lượng còn lại",
      dataIndex: "totalStock",
      key: "totalStock",
      width: 150,
      sorter: (a, b) => a.price - b.price,
    },
    {
      title: "Action",
      key: "Action",
      width: 150,
      render: (_, record) => (
        <Space size="small">
          <Button onClick={() => handleEditProduct(record)} type="link">
            Chỉnh sửa
          </Button>
          <Button
            onClick={() => handleDeleteProduct(record._id)}
            type="primary"
            danger
            loading={deleteProductMutation.isPending}
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
            : "Chỉnh sửa sản phẩm"}
        </h4>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => {
            setType(type === 0 ? 1 : 0);
            setSelectedProduct(null);
          }}
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
      ) : (
        <AddProduct
          mode={type === 2 ? "edit" : "add"}
          productData={selectedProduct}
          onSuccess={() => {
            setType(0);
            setPage(1);
            setSelectedProduct(null);
            queryClient.invalidateQueries(["products"]);
          }}
        />
      )}
    </div>
  );
}

export default ProductManager;
