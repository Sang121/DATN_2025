import classNames from "classnames/bind";
import styles from "./AddProduct.module.css";
import { useState } from "react";
import { Editor } from "@tinymce/tinymce-react";
import {
  Box,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Grid,
  Paper,
  Divider,
  Stack,
  IconButton,
  Card,
  CardMedia,
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import DeleteIcon from "@mui/icons-material/Delete";
import {
  createProduct,
  uploadImage,
} from "../../../../services/productService";

import toast, { Toaster } from "react-hot-toast";

const cx = classNames.bind(styles);

function AddProduct({ onSuccess }) {
  const [productData, setProductData] = useState({
    name: "",
    category: "",
    gender: "",
    price: "",
    discount: "",
    stock: "",
    description: "",
    images: [],
    attributes: {
      size: "",
      color: "",
      material: "",
      brand: "",
    },
  });

  const categories = [
    { value: "ao", label: "Áo" },
    { value: "quan", label: "Quần" },
    { value: "vay", label: "Váy" },
    { value: "dongHo", label: "Đầm" },
    { value: "phuKien", label: "Phụ kiện" },
    { value: "giayDep", label: "Giày dép" },
    { value: "tuiXach", label: "Túi xách" },
    { value: "balo", label: "Ba Lô" },
    { value: "khac", label: "Khác" },
  ];

  const genders = [
    { value: "nam", label: "Nam" },
    { value: "nu", label: "Nữ" },
    { value: "unisex", label: "Unisex" },
  ];

  const categoryAttributes = {
    ao: [
      { name: "size", label: "Kích thước", type: "text" },
      { name: "color", label: "Màu sắc", type: "text" },
      { name: "material", label: "Chất liệu", type: "text" },
      { name: "brand", label: "Thương hiệu", type: "text" },
    ],
    quan: [
      { name: "size", label: "Kích thước", type: "text" },
      { name: "color", label: "Màu sắc", type: "text" },
      { name: "material", label: "Chất liệu", type: "text" },
      { name: "brand", label: "Thương hiệu", type: "text" },
    ],
    vay: [
      { name: "size", label: "Kích thước", type: "text" },
      { name: "color", label: "Màu sắc", type: "text" },
      { name: "material", label: "Chất liệu", type: "text" },
      { name: "brand", label: "Thương hiệu", type: "text" },
    ],
    dam: [
      { name: "size", label: "Kích thước", type: "text" },
      { name: "color", label: "Màu sắc", type: "text" },
      { name: "material", label: "Chất liệu", type: "text" },
      { name: "brand", label: "Thương hiệu", type: "text" },
    ],
    phu_kien: [
      { name: "color", label: "Màu sắc", type: "text" },
      { name: "material", label: "Chất liệu", type: "text" },
      { name: "brand", label: "Thương hiệu", type: "text" },
    ],
    giay_dep: [
      { name: "size", label: "Kích thước", type: "text" },
      { name: "color", label: "Màu sắc", type: "text" },
      { name: "brand", label: "Thương hiệu", type: "text" },
    ],
    tui_xach: [
      { name: "color", label: "Màu sắc", type: "text" },
      { name: "material", label: "Chất liệu", type: "text" },
      { name: "brand", label: "Thương hiệu", type: "text" },
    ],
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "category") {
      setProductData((prev) => ({
        ...prev,
        [name]: value,
        attributes: {
          size: "",
          color: "",
          material: "",
          brand: "",
        },
      }));
    } else if (name.startsWith("attr_")) {
      const attributeName = name.replace("attr_", "");
      setProductData((prev) => ({
        ...prev,
        attributes: {
          ...prev.attributes,
          [attributeName]: value,
        },
      }));
    } else {
      setProductData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleEditorChange = (content) => {
    setProductData((prev) => ({
      ...prev,
      description: content,
    }));
  };

  const handleImageChange = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    const formData = new FormData();
    files.forEach((file) => {
      formData.append("images", file);
    });

    try {
      const res = await uploadImage(formData);
      if (res.status === "Ok" && res.metadata) {
        setProductData((prev) => ({
          ...prev,
          images: [...prev.images, ...res.metadata], // Thêm URL ảnh mới vào mảng images
        }));
        toast.success(res.message);
      } else {
        toast.error(res.message || "Upload ảnh thất bại.");
      }
    } catch (error) {
      console.error("Lỗi khi upload ảnh:", error);
      toast.error(
        "Lỗi khi upload ảnh: " +
          (error.response?.data?.message || error.message)
      );
    }
  };

  console.log(productData.images);

  const handleRemoveImage = (indexToRemove) => {
    setProductData((prev) => ({
      ...prev,
      images: prev.images.filter((_, index) => index !== indexToRemove),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Gửi productData (đã có URL ảnh) lên server
      console.log("productData", productData);
      const res = await createProduct(productData);
      if (res?.status == 200) {
        toast.success(res.message);
        if (onSuccess) {
          onSuccess(); // Gọi onSuccess để parent component cập nhật
        }
      } else {
        toast.error(res.message || "Thêm sản phẩm thất bại");
      }
    } catch (error) {
      console.error("Lỗi khi thêm sản phẩm:", error);
      toast.error("Lỗi kết nối hoặc server khi thêm sản phẩm.");
    }
  };

  return (
    <Box
      className={cx("wrapper")}
      sx={{ p: 3, backgroundColor: "#f5f5f5", minHeight: "100vh" }}
    >
      <Toaster />
      <Paper
        elevation={0}
        sx={{
          p: 4,
          borderRadius: 2,
          backgroundColor: "white",
          boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
        }}
      >
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography
                variant="subtitle1"
                sx={{ mb: 2, fontWeight: 500, color: "#455a64" }}
              >
                Thông tin cơ bản
              </Typography>
              <Divider sx={{ mb: 3 }} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                label="Tên sản phẩm"
                name="name"
                value={productData.name}
                onChange={handleChange}
                variant="outlined"
                sx={{
                  "& .MuiOutlinedInput-root": {
                    "&:hover fieldset": {
                      borderColor: "#1a237e",
                    },
                  },
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Danh mục</InputLabel>
                <Select
                  name="category"
                  value={productData.category}
                  label="Danh mục"
                  onChange={handleChange}
                >
                  {categories.map((category) => (
                    <MenuItem key={category.value} value={category.value}>
                      {category.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Giới tính</InputLabel>
                <Select
                  name="gender"
                  value={productData.gender}
                  label="Giới tính"
                  onChange={handleChange}
                >
                  {genders.map((gender) => (
                    <MenuItem key={gender.value} value={gender.value}>
                      {gender.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                label="Giá"
                name="price"
                type="number"
                value={productData.price}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                label="Giảm giá(%)"
                name="discount"
                type="number"
                value={productData.discount}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Số lượng tồn kho"
                name="stock"
                type="number"
                value={productData.stock}
                onChange={handleChange}
              />
            </Grid>
            {productData.category && (
              <>
                <Grid item xs={12}>
                  <Typography
                    variant="subtitle1"
                    sx={{ mt: 2, mb: 2, fontWeight: 500, color: "#455a64" }}
                  >
                    Thông tin chi tiết
                  </Typography>
                  <Divider sx={{ mb: 3 }} />
                </Grid>

                {categoryAttributes[productData.category]?.map((attr) => (
                  <Grid item xs={12} sm={6} key={attr.name}>
                    <TextField
                      required
                      fullWidth
                      label={attr.label}
                      name={`attr_${attr.name}`}
                      type={attr.type}
                      value={productData.attributes[attr.name] || ""}
                      onChange={handleChange}
                    />
                  </Grid>
                ))}
              </>
            )}
            <div style={{ width: "100%", padding: "15px" }}>
              <Editor
                apiKey="hfm046cu8943idr5fja0r5l2vzk9l8vkj5cp3hx2ka26l84x"
                init={{
                  plugins:
                    "anchor autolink charmap codesample emoticons image link lists media searchreplace table visualblocks wordcount",
                  toolbar:
                    "undo redo | blocks fontfamily fontsize | bold italic underline strikethrough | link image media table | align lineheight | numlist bullist indent outdent | emoticons charmap | removeformat",
                }}
                initialValue="Mô tả sản phẩm"
                onEditorChange={handleEditorChange}
              />
            </div>
            <Grid item xs={12}>
              <Typography
                variant="subtitle1"
                sx={{ mt: 2, mb: 2, fontWeight: 500, color: "#455a64" }}
              >
                Hình ảnh sản phẩm
              </Typography>
              <Divider sx={{ mb: 3 }} />

              <Box
                sx={{
                  border: "2px dashed #1a237e",
                  borderRadius: 2,
                  p: 3,
                  textAlign: "center",
                  mb: 3,
                  backgroundColor: "#f5f5f5",
                }}
              >
                <input
                  type="file"
                  hidden
                  multiple
                  accept="image/*"
                  id="image-upload"
                  onChange={handleImageChange}
                />
                <label htmlFor="image-upload">
                  <Button
                    component="span"
                    variant="outlined"
                    startIcon={<CloudUploadIcon />}
                    sx={{
                      color: "#1a237e",
                      borderColor: "#1a237e",
                      "&:hover": {
                        borderColor: "#1a237e",
                        backgroundColor: "rgba(26, 35, 126, 0.04)",
                      },
                    }}
                  >
                    Chọn ảnh
                  </Button>
                </label>
                <Typography variant="body2" sx={{ mt: 1, color: "#666" }}>
                  Hỗ trợ: JPG, PNG (Tối đa 5MB)
                </Typography>
              </Box>
            </Grid>
            {productData.images.length > 0 && ( // Chỉ hiển thị khối này nếu có ảnh
              <Grid item xs={12}>
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
                  {productData.images.map((image, index) => (
                    <Card
                      key={index}
                      sx={{ width: 120, height: 120, position: "relative" }}
                    >
                      <CardMedia
                        component="img"
                        // === ĐIỂM QUAN TRỌNG NHẤT: SỬ DỤNG URL ẢNH LÀM THUỘC TÍNH `image` ===
                        image={image}
                        alt={`Product Image ${index + 1}`}
                        sx={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />
                      <IconButton
                        onClick={() => handleRemoveImage(index)}
                        sx={{
                          position: "absolute",
                          top: 0,
                          right: 0,
                          color: "red",
                          backgroundColor: "rgba(255,255,255,0.7)",
                          "&:hover": {
                            backgroundColor: "rgba(255,255,255,0.9)",
                          },
                        }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Card>
                  ))}
                </Box>
              </Grid>
            )}

            <Grid item xs={12}>
              <Box
                sx={{
                  mt: 4,
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: 2,
                }}
              >
                <Button
                  variant="outlined"
                  sx={{
                    minWidth: 120,
                    borderColor: "#1a237e",
                    color: "#1a237e",
                    "&:hover": {
                      borderColor: "#1a237e",
                      backgroundColor: "rgba(26, 35, 126, 0.04)",
                    },
                  }}
                  onClick={() => onSuccess()}
                >
                  Hủy
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  sx={{
                    minWidth: 120,
                    backgroundColor: "#1a237e",
                    "&:hover": {
                      backgroundColor: "#0d1b6e",
                    },
                  }}
                >
                  Thêm sản phẩm
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Box>
  );
}

export default AddProduct;
