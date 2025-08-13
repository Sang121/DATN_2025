import classNames from "classnames/bind";
import styles from "./ProductManager.module.css";
import { useRef, useState, useMemo } from "react";
import {
  message,
  Table,
  Button,
  Space,
  Spin,
  Alert,
  Pagination,
  Input,
  Select,
} from "antd";
import Highlighter from "react-highlight-words";
import { FileExcelOutlined } from "@ant-design/icons";
import * as XLSX from "xlsx";

import {
  DeleteOutlined,
  PlusOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import AddProduct from "./AddProduct/AddProduct";
import {
  deleteProduct,
  getAllProduct,
} from "../../../../../services/productService";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

const cx = classNames.bind(styles);

function ProductManager() {
  const [type, setType] = useState(0); // 0: list, 1: add, 2: edit
  const [page, setPage] = useState(1);
  const [limit] = useState(8);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("all"); // State cho filter category
  const [selectedGender, setSelectedGender] = useState("all"); // State cho filter gender

  const queryClient = useQueryClient();
  const [searchText, setSearchText] = useState("");
  const [searchedColumn, setSearchedColumn] = useState("");
  const searchInput = useRef(null);

  // Danh sách category từ enum model
  const categoryOptions = [
    "Áo",
    "Quần",
    "Đồ thể thao",
    "Đồ lót",
    "Đồ ngủ",
    "Áo khoác",
    "Váy",
    "Đồng hồ",
    "Phụ kiện",
    "Đồ bơi",
    "Giày dép",
    "Túi xách",
    "Balo",
    "Khác",
  ];
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
    queryKey: ["products"],
    queryFn: () => getAllProduct(999999, 1), // Fetch with very large limit to get all products
  });

  // Calculate filtered data
  const filteredData = useMemo(() => {
    if (!productData?.data) return [];
    return productData.data.filter((product) => {
      const categoryMatch =
        selectedCategory === "all" || product.category === selectedCategory;
      const genderMatch =
        selectedGender === "all" || product.gender === selectedGender;
      return categoryMatch && genderMatch;
    });
  }, [productData?.data, selectedCategory, selectedGender]);

  // Calculate paginated data from filtered results
  const paginatedData = useMemo(() => {
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    return filteredData.slice(startIndex, endIndex);
  }, [filteredData, page, limit]);

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
      render: (price) =>
        `${Intl.NumberFormat("vi-VN", {
          style: "currency",
          currency: "VND",
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

  // Add export to Excel function
  const handleExportExcel = async () => {
    try {
      // Use already filtered data instead of filtering again
      const exportProducts = filteredData;

      // Prepare data for export
      const exportData = exportProducts.map((product, index) => ({
        STT: index + 1,
        "Mã SP": product._id,
        "Tên sản phẩm": product.name,
        Giá: product.price,
        "Khuyến mãi(%)": product.discount || "",
        "Tổng tồn kho": product.totalStock,
        "Đã bán": product.sold,
        "Danh mục": product.category,
        "Giới tính": product.gender,
        Variants: product.variants
          .map((v) => `${v.size}-${v.color}: ${v.stock}`)
          .join(", "),
      }));

      // Create workbook and worksheet
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(exportData);

      // Set column widths
      const colWidths = [
        { wch: 5 }, // STT
        { wch: 20 }, // Mã SP
        { wch: 40 }, // Tên sản phẩm
        { wch: 15 }, // Giá
        { wch: 15 }, // Khuyến mãi(%)
        { wch: 15 }, // Tổng tồn kho
        { wch: 15 }, // Đã bán
        { wch: 15 }, // Danh mục
        { wch: 10 }, // Giới tính
        { wch: 50 }, // Variants
      ];
      ws["!cols"] = colWidths;

      // Add worksheet to workbook
      let sheetName = "Danh sách sản phẩm";
      if (selectedCategory !== "all" || selectedGender !== "all") {
        const categoryPart = selectedCategory !== "all" ? selectedCategory : "";
        const genderPart = selectedGender !== "all" ? selectedGender : "";
        const filterParts = [categoryPart, genderPart].filter(Boolean);
        sheetName = `Sản phẩm - ${filterParts.join(" - ")}`;
      }
      XLSX.utils.book_append_sheet(wb, ws, sheetName);

      // Generate filename with current date, category and gender
      let filenameParts = [];
      if (selectedCategory !== "all") {
        filenameParts.push(selectedCategory.replace(/\s+/g, "_"));
      }
      if (selectedGender !== "all") {
        filenameParts.push(selectedGender);
      }
      const filterText =
        filenameParts.length > 0 ? filenameParts.join("_") : "tat_ca";
      const fileName = `san_pham_${filterText}_${new Date()
        .toLocaleDateString("vi-VN")
        .replace(/\//g, "-")}.xlsx`;

      // Export file
      XLSX.writeFile(wb, fileName);

      message.success("Xuất file Excel thành công!");
    } catch (error) {
      message.error("Có lỗi khi xuất file Excel: " + error.message);
    }
  };

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
        <Space>
          {type === 0 && (
            <Button
              type="primary"
              icon={<FileExcelOutlined />}
              onClick={handleExportExcel}
              style={{ backgroundColor: "#52c41a" }}
            >
              Xuất Excel
            </Button>
          )}
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
        </Space>
      </div>

      {type === 0 ? (
        <div className={cx("product-list")}>
          {/* Category and Gender Filters */}
          <div
            style={{
              marginBottom: 16,
              display: "flex",
              alignItems: "center",
              gap: 16,
              flexWrap: "wrap",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span>Lọc theo danh mục:</span>
              <Select
                value={selectedCategory}
                onChange={(value) => {
                  setSelectedCategory(value);
                  setPage(1); // Reset to first page when filtering
                }}
                style={{ width: 200 }}
                placeholder="Chọn danh mục"
              >
                <Select.Option value="all">Tất cả danh mục</Select.Option>
                {categoryOptions.map((category) => (
                  <Select.Option key={category} value={category}>
                    {category}
                  </Select.Option>
                ))}
              </Select>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span>Lọc theo giới tính:</span>
              <Select
                value={selectedGender}
                onChange={(value) => {
                  setSelectedGender(value);
                  setPage(1); // Reset to first page when filtering
                }}
                style={{ width: 150 }}
                placeholder="Chọn giới tính"
              >
                <Select.Option value="all">Tất cả</Select.Option>
                <Select.Option value="Nam">Nam</Select.Option>
                <Select.Option value="Nữ">Nữ</Select.Option>
                <Select.Option value="Unisex">Unisex</Select.Option>
              </Select>
            </div>

            {/* Reset Filters Button */}
            {(selectedCategory !== "all" || selectedGender !== "all") && (
              <Button
                onClick={() => {
                  setSelectedCategory("all");
                  setSelectedGender("all");
                  setPage(1); // Reset to first page when clearing filters
                }}
                type="default"
                size="small"
              >
                Reset bộ lọc
              </Button>
            )}
          </div>

          {/* Filter Status Display */}
          {(selectedCategory !== "all" || selectedGender !== "all") && (
            <div
              style={{
                marginBottom: 16,
                padding: "8px 12px",
                backgroundColor: "#f6f6f6",
                borderRadius: "6px",
                fontSize: "14px",
              }}
            >
              <span>Đang lọc: </span>
              {selectedCategory !== "all" && (
                <span style={{ color: "#1890ff" }}>
                  Danh mục "{selectedCategory}"
                </span>
              )}
              {selectedCategory !== "all" && selectedGender !== "all" && (
                <span> và </span>
              )}
              {selectedGender !== "all" && (
                <span style={{ color: "#1890ff" }}>
                  Giới tính "{selectedGender}"
                </span>
              )}
            </div>
          )}

          <Table
            columns={columns}
            dataSource={paginatedData}
            rowKey="_id"
            pagination={false}
            scroll={{ x: 1000 }}
            loading={isLoading}
            bordered
          />

          <div className={cx("pagination-wrapper")}>
            <Pagination
              current={page}
              total={filteredData.length}
              pageSize={limit}
              onChange={handlePageChange}
              showSizeChanger={false}
              showQuickJumper
              showTotal={(total) => {
                const isFiltered =
                  selectedCategory !== "all" || selectedGender !== "all";
                return isFiltered
                  ? `Hiển thị ${total} sản phẩm (đã lọc từ ${productData.total} sản phẩm)`
                  : `Tổng số ${total} sản phẩm`;
              }}
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
