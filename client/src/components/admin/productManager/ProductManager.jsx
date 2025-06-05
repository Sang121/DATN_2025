import classNames from "classnames/bind";
import styles from "./ProductManager.module.css";
import { useState } from "react";
import { message } from "antd";
import AddProduct from "./AddProduct/AddProduct";
import { deleteProduct, getAllProduct } from "../../../services/productService";
import Pagination from "@mui/material/Pagination";
import { Spin, Alert } from "antd";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import { useQuery } from "@tanstack/react-query";
const cx = classNames.bind(styles);

function ProductManager() {
  const [type, setType] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const category = "o";
  const {
    data: products,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["products", category],
    queryFn: () => getAllProduct(category),
  });
  if (isLoading) {
    return (
      <div>
        <div className={styles.statusContainer}>
          <Spin size="large" />
          <p>Loading products...</p>
        </div>
      </div>
    );
  }
  if (isError) {
    return (
      <div className={styles.statusContainer}>
        {/* Error.message lấy thông báo từ đối tượng lỗi */}
        <Alert
          message="Error"
          description={
            error?.message || "Failed to load products. Please try again later."
          }
          type="error"
          showIcon
        />
      </div>
    );
  }

  if (!products || products.length === 0) {
    return (
      <div className={styles.statusContainer}>
        <p>No products found for this category. Please try a different one.</p>
      </div>
    );
  }

  const handlePageChange = (event, page) => {
    setCurrentPage(page);
  };

  const DeleteProduct = async (id) => {
    try {
      const res = await deleteProduct(id);
      message.success(res.message);
      getAllProduct("o");
    } catch (e) {
      message.error("Lỗi khi xóa sản phẩm", e);
    }
  };

  const renderTableRows = () => {
    return products.map((product, index) => (
      <TableRow key={product._id}>
        <TableCell>{index + 1}</TableCell>
        <TableCell align="center">
          <img
            style={{ width: "100px" }}
            src={product.images[0]}
            alt={product.name}
          />
        </TableCell>
        <TableCell align="center">{product.name}</TableCell>
        <TableCell align="center">
          {product.price.toLocaleString()} VNĐ
        </TableCell>
        <TableCell align="center">{product.stock}</TableCell>
        <TableCell align="center">
          <button
            onClick={() => DeleteProduct(product._id)}
            style={{ marginLeft: "10px" }}
            type="button"
            className="btn btn-danger"
          >
            Xóa
          </button>
        </TableCell>
      </TableRow>
    ));
  };

  return (
    <div className={cx("wrapper")}>
      <header className={cx("header")}>
        <h4>
          {type === 0
            ? "Danh sách sản phẩm"
            : type === 1
            ? "Thêm sản phẩm"
            : "Sửa sản phẩm"}
        </h4>
        <button
          onClick={() => setType(type === 0 ? 1 : 0)}
          type="button"
          className="btn btn-primary"
        >
          {type === 0 ? "Thêm sản phẩm" : "Quay lại"}
        </button>
      </header>

      {type === 0 ? (
        <div className={cx("product-list")}>
          <TableContainer component={Paper}>
            <Table sx={{ minWidth: 650 }}>
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell align="center">Ảnh</TableCell>
                  <TableCell align="center">Tên sản phẩm</TableCell>
                  <TableCell align="center">Giá</TableCell>
                  <TableCell align="center">Số lượng còn lại</TableCell>
                  <TableCell align="center">Hành động</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>{renderTableRows()}</TableBody>
            </Table>
          </TableContainer>

          <div className={cx("pagination-wrapper")}>
            <Pagination
              page={currentPage}
              color="primary"
              onChange={handlePageChange}
            />
          </div>
        </div>
      ) : type === 1 ? (
        <AddProduct
          onSuccess={() => {
            setType(0);
            setCurrentPage(1);
          }}
        />
      ) : null}
    </div>
  );
}

export default ProductManager;
