import { useState, useEffect } from "react";
import { Editor } from "@tinymce/tinymce-react";
import {
  Form,
  Input,
  InputNumber,
  Select,
  Button,
  Card,
  Table,
  Typography,
  Divider,
  Upload,
  Space,
  Row,
  Col,
  message,
 
} from "antd";
import { UploadOutlined, DeleteOutlined } from "@ant-design/icons";
import {
  createProduct,
  uploadImage,
  updateProduct,
  deleteImage,
} from "../../../../../services/productService";
import classNames from "classnames/bind";
import styles from "./AddProduct.module.css";

const { Title, Text } = Typography;
const { Option } = Select;
const cx = classNames.bind(styles);

function AddProduct({ mode = "add", productData, onSuccess }) {
  const [tempImages, setTempImages] = useState([]);
  const [form] = Form.useForm();
  const [product, setProduct] = useState({
    name: "",
    category: "",
    gender: "",
    price: "",
    discount: "",
    description: "",

    images: [],
    tempImageUrls: [],
    variants: []
  });

  const [variant, setVariant] = useState({
    size: '',
    color: '',
    stock: 0
  });

  const addVariant = () => {
    console.log("Adding variant:", variant);
    console.log("Current product variants:", product);
    if (!variant.size || !variant.color || variant.stock < 0) {
      message.error('Vui lòng điền đầy đủ thông tin size, màu và số lượng');
      return;
    }

    setProduct((prev) => ({
      ...prev,
      variants: [...(prev.variants || []), { ...variant }]
    }));

    // Reset variant state
    setVariant({
      size: '',
      color: '',
      stock: 0
    });
  };

  useEffect(() => {
    if (mode === "edit" && product) {
      setProduct({
        ...product,
        tempImageUrls: [],
      });
      form.setFieldsValue(product);
    }
  }, [mode, product, form]);
  const removeVariant = (index) => {
    if (!productData || !productData.variants) return;
    setProduct((prev) => ({
      ...prev,
      variants: prev.variants.filter((_, i) => i !== index),
    }));
  };
  const categories = [
    { value: "Áo", label: "Áo" },
    { value: "Quần", label: "Quần" },
    { value: "Váy", label: "Váy" },
    { value: "Phụ kiện", label: "Phụ kiện" },
    { value: "Giày dép", label: "Giày dép" },
    { value: "Túi xách", label: "Túi xách" },
    { value: "Ba Lô", label: "Ba Lô" },
    { value: "Khác", label: "Khác" },
  ];
 
  const genders = [
    { value: "Nam", label: "Nam" },
    { value: "Nữ", label: "Nữ" },
    { value: "Nam Nữ", label: "Unisex" },
  ];

  const handleChange = (name, value) => {
    if (name === "category") {
      setProduct((prev) => ({
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
      setProduct((prev) => ({
        ...prev,
        attributes: {
          ...prev.attributes,
          [attributeName]: value,
        },
      }));
    } else {
      setProduct((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleEditorChange = (content) => {
    setProduct((prev) => ({
      ...prev,
      description: content,
    }));
  };

  const handleImageChange = async (info) => {
    if (info.file.status === "uploading") {
      return;
    }

    if (info.file.status === "done") {
      // Lưu file gốc để upload sau
      setTempImages((prev) => [...prev, info.file.originFileObj]);

      // Tạo URL tạm thời chỉ để hiển thị trong UI
      const imageUrl = URL.createObjectURL(info.file.originFileObj);

      // Lưu tạm ảnh để hiển thị trong UI, không phải để gửi lên server
      setProduct((prev) => ({
        ...prev,
        // Không thêm blob URL vào mảng images
        tempImageUrls: [...(prev.tempImageUrls || []), imageUrl],
        // Hiển thị ảnh trong UI nhưng không lưu blob URL vào images
        images: [...prev.images, imageUrl],
      }));
    }
  };

  const handleRemoveImage = async (indexToRemove) => {
    try {
      // Lấy URL ảnh cần xóa
      const imageToDelete = product.images[indexToRemove];

      // Kiểm tra nếu là blob URL (ảnh tạm thời)
      if (imageToDelete.startsWith("blob:")) {
        // Xóa khỏi tempImages - tìm index tương ứng
        const tempIndex = product.tempImageUrls?.findIndex(
          (url) => url === imageToDelete
        );
        if (tempIndex !== -1 && tempIndex !== undefined) {
          setTempImages((prev) =>
            prev.filter((_, index) => index !== tempIndex)
          );
        }

        // Xóa khỏi tempImageUrls và images
        setProduct((prev) => ({
          ...prev,
          tempImageUrls: prev.tempImageUrls?.filter(
            (_, index) => index !== tempIndex
          ),
          images: prev.images.filter((_, index) => index !== indexToRemove),
        }));
      } else {
        // Nếu là ảnh thật (đã lưu trên server)
        const imageName = imageToDelete.split("/").pop();

        // Xóa ảnh khỏi state
        setProduct((prev) => ({
          ...prev,
          images: prev.images.filter((_, index) => index !== indexToRemove),
        }));

        // Nếu đang ở chế độ edit, xóa file ảnh trên server
        if (mode === "edit") {
          try {
            await deleteImage(imageName);
          } catch (error) {
            console.error("Error deleting image file:", error);
          }
        }
      }
    } catch (error) {
      console.error("Error in handleRemoveImage:", error);
      message.error("Không thể xóa ảnh. Vui lòng thử lại sau.");
    }
  };
  const handleSubmit = async () => {
    try {
      // Validate required fields
      if (
        !product.name ||
        !product.category ||
        !product.gender ||
        !product.price 
      ) {
        message.error("Vui lòng điền đầy đủ thông tin bắt buộc");
        return;
      }

      // Validate numeric fields
      if (isNaN(Number(product.price)) || Number(product.price) <= 0) {
        message.error("Giá sản phẩm phải lớn hơn 0");
        return;
      }

      if (
        isNaN(Number(product.discount)) ||
        Number(product.discount) < 0 ||
        Number(product.discount) > 100
      ) {
        message.error("Giảm giá phải từ 0 đến 100");
        return;
      }
      console.log("Creating product with data:", product);

      if (isNaN(Number(product.variants.stock) < 0)) {
        message.error("Số lượng tồn kho không được âm");
        return;
      }
      if (product.variants.length === 0) {
        message.error("Vui lòng thêm ít nhất một biến thể sản phẩm");
        return;
      }

      // Prepare product data
      const productData = {
        name: product.name,
        category: product.category,
        gender: product.gender,
        price: Number(product.price),
        discount: Number(product.discount || 0),
        description: product.description || "",
        variants: product.variants.map((variant) => ({
          size: variant.size,
          color: variant.color,
          stock: Number(variant.stock),
        })),
        attributes: product.attributes || {},
        images: [],
      };

      // Handle images
      if (mode === "edit") {
        // Xử lý ảnh trước khi cập nhật
        let finalImages = [];

        // Xử lý ảnh cũ (nếu có)
        if (product.images && product.images.length > 0) {
          // Lọc ra các ảnh thực (không phải blob URL)
          const realImages = product.images.filter(
            (img) => !img.startsWith("blob:")
          );

          finalImages = realImages.map((imageUrl) => {
            // Nếu là URL đầy đủ, lấy tên file
            if (imageUrl.startsWith("http")) {
              return imageUrl.split("/").pop();
            }
            // Nếu đã là tên file, giữ nguyên
            return imageUrl;
          });
        }

        // Xử lý ảnh mới (nếu có)
        if (tempImages.length > 0) {
          const imagePromises = tempImages.map(async (file) => {
            const imageFormData = new FormData();
            imageFormData.append("images", file);
            const res = await uploadImage(imageFormData);
            // Chỉ lấy tên file từ đường dẫn
            const imageUrl = res.data[0];
            const imageName = imageUrl.split("/").pop();
            return imageName;
          });

          const uploadedImageUrls = await Promise.all(imagePromises);
          // Thêm ảnh mới vào danh sách ảnh
          finalImages = [...finalImages, ...uploadedImageUrls];
        }

        // Chuẩn bị dữ liệu cập nhật
        productData.images = finalImages;

        const res = await updateProduct(product._id, productData);

        if (res.status === "Ok") {
          message.success("Cập nhật sản phẩm thành công");
          if (onSuccess) {
            onSuccess();
          }
        } else {
          message.error(res.message || "Cập nhật sản phẩm thất bại");
        }
      } else {
        // Handle images for new product
        if (tempImages.length > 0) {
          try {
            const imagePromises = tempImages.map(async (file) => {
              const imageFormData = new FormData();
              imageFormData.append("images", file);
              const res = await uploadImage(imageFormData);
              if (!res.data || !res.data[0]) {
                throw new Error("Upload image failed");
              }
              return res.data[0];
            });

            const uploadedImageUrls = await Promise.all(imagePromises);
            productData.images = uploadedImageUrls;
          } catch (error) {
            console.error("Error uploading images:", error);
            message.error("Lỗi khi tải ảnh lên. Vui lòng thử lại.");
            return;
          }
        }

        try {
          const res = await createProduct(productData);

          if (res.status === "Success") {
            message.success("Thêm sản phẩm thành công");
            if (onSuccess) {
              onSuccess();
            }
          } else {
            message.error(res.message || "Thêm sản phẩm thất bại");
          }
        } catch (error) {
          console.error("Error creating product:", error);
          const errorMessage =
            error.response?.data?.message ||
            error.response?.data?.error ||
            error.message ||
            "Lỗi khi thêm sản phẩm";
          message.error(errorMessage);
        }
      }
    } catch (error) {
      console.error(
        mode === "edit"
          ? "Lỗi khi cập nhật sản phẩm:"
          : "Lỗi khi thêm sản phẩm:",
        error
      );
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        (mode === "edit"
          ? "Lỗi khi cập nhật sản phẩm"
          : "Lỗi khi thêm sản phẩm");
      message.error(errorMessage);
    }
  };

  const uploadProps = {
    name: "file",
    multiple: true,
    accept: "image/*",
    beforeUpload: (file) => {
      const isLt5M = file.size / 1024 / 1024 < 5;
      if (!isLt5M) {
        message.error("Ảnh phải nhỏ hơn 5MB!");
        return Upload.LIST_IGNORE;
      }
      return true;
    },
    customRequest: ({ onSuccess }) => {
      setTimeout(() => {
        onSuccess("ok");
      }, 0);
    },
    onChange: handleImageChange,
    showUploadList: false,
  };

  return (
    <div style={{ padding: "20px" }}>
      <Card className={cx("form-card")}>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={product}
        >
          <Title level={4}>Thông tin cơ bản</Title>
          <Divider />

          <Row gutter={[24, 24]}>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Tên sản phẩm"
                name="name"
                rules={[
                  { required: true, message: "Vui lòng nhập tên sản phẩm" },
                ]}
              >
                <Input
                  onChange={(e) => handleChange("name", e.target.value)}
                  placeholder="Nhập tên sản phẩm"
                />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12}>
              <Form.Item
                label="Danh mục"
                name="category"
                rules={[{ required: true, message: "Vui lòng chọn danh mục" }]}
              >
                <Select
                  onChange={(value) => handleChange("category", value)}
                  placeholder="Chọn danh mục"
                >
                  {categories.map((category) => (
                    <Option key={category.value} value={category.value}>
                      {category.label}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>

            <Col xs={24} sm={12}>
              <Form.Item
                label="Giới tính"
                name="gender"
                rules={[{ required: true, message: "Vui lòng chọn giới tính" }]}
              >
                <Select
                  onChange={(value) => handleChange("gender", value)}
                  placeholder="Chọn giới tính"
                >
                  {genders.map((gender) => (
                    <Option key={gender.value} value={gender.value}>
                      {gender.label}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>

            <Col xs={24} sm={12}>
              <Form.Item
                label="Giá"
                name="price"
                rules={[{ required: true, message: "Vui lòng nhập giá" }]}
              >
                <InputNumber
                  style={{ width: "100%" }}
                  min={0}
                  formatter={(value) =>
                    `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                  }
                  parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
                  onChange={(value) => handleChange("price", value)}
                />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12}>
              <Form.Item
                label="Giảm giá (%)"
                name="discount"
                rules={[{ required: true, message: "Vui lòng nhập giảm giá" }]}
              >
                <InputNumber
                  style={{ width: "100%" }}
                  min={0}
                  max={100}
                  onChange={(value) => handleChange("discount", value)}
                />
              </Form.Item>
            </Col>
          </Row>
          <Card title="Thêm biến thể sản phẩm">
            <Row gutter={16}>
              <Col span={6}>
                <Form.Item label="Size">
                  <Select
                    value={variant.size}
                    onChange={(value) =>
                      setVariant((prev) => ({ ...prev, size: value }))
                    }
                  >
                    <Option value="S">S</Option>
                    <Option value="M">M</Option>
                    <Option value="L">L</Option>
                    <Option value="XL">XL</Option>
                    <Option value="XXL">XXL</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item label="Màu sắc">
                  <Select
                    value={variant.color}
                    onChange={(value) => setVariant((prev) => ({ ...prev, color: value }))}
                  >
                    <Option value="Đỏ">Đỏ</Option>
                    <Option value="Xanh">Xanh</Option>
                    <Option value="Vàng">Vàng</Option>
                    <Option value="Đen">Đen</Option>
                    <Option value="Trắng">Trắng</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item label="Số lượng">
                  <InputNumber
                    min={0}
                    value={variant.stock}
                    onChange={(value) =>
                      setVariant((prev) => ({ ...prev, stock: value }))
                    }
                  />
                </Form.Item>
              </Col>
              <Col span={6}>
                <Button type="primary" onClick={addVariant}>
                  Thêm biến thể
                </Button>
              </Col>
            </Row>

            {/* Hiển thị danh sách biến thể */}
            <Table
              dataSource={product?.variants || []}
              columns={[
                {
                  title: "Size",
                  dataIndex: "size",
                  key: "size",
                },
                {
                  title: "Màu sắc",
                  dataIndex: "color",
                  key: "color",
                },
                {
                  title: "Số lượng",
                  dataIndex: "stock",
                  key: "stock",
                },
                {
                  title: "Thao tác",
                  key: "action",
                  render: (_, __, index) => (
                    <Button
                      type="link"
                      icon={<DeleteOutlined />}
                      onClick={() => removeVariant(index)}
                    ></Button>
                  ),
                },
              ]}
            />
          </Card>
          <Title level={4} style={{ marginTop: 24 }}>
            Mô tả sản phẩm
          </Title>
          <Divider />

          <Form.Item
            name="description"
            rules={[{ required: true, message: "Vui lòng nhập mô tả" }]}
          >
            <Editor
              apiKey="hfm046cu8943idr5fja0r5l2vzk9l8vkj5cp3hx2ka26l84x"
              init={{
                height: 300,
                menubar: false,
                plugins: [
                  "advlist autolink lists link image charmap print preview anchor",
                  "searchreplace visualblocks code fullscreen",
                  "insertdatetime media table paste code help wordcount",
                ],
                toolbar:
                  "undo redo | formatselect | bold italic backcolor | \
                  alignleft aligncenter alignright alignjustify | \
                  bullist numlist outdent indent | removeformat | help",
              }}
              onEditorChange={handleEditorChange}
              value={product.description}
            />
          </Form.Item>

          <Title level={4} style={{ marginTop: 24 }}>
            Hình ảnh sản phẩm
          </Title>
          <Divider />

          <Form.Item
            name="images"
            rules={[
              { required: true, message: "Vui lòng tải lên ít nhất một ảnh" },
            ]}
          >
            <div className={cx("upload-section")}>
              <Upload {...uploadProps}>
                <Button icon={<UploadOutlined />}>Chọn ảnh</Button>
              </Upload>
              <Text type="secondary">Hỗ trợ: JPG, PNG (Tối đa 5MB)</Text>
            </div>
          </Form.Item>

          {product.images.length > 0 && (
            <div className={cx("image-preview")}>
              <Row gutter={[16, 16]}>
                {product.images.map((image, index) => (
                  <Col xs={8} sm={8} md={6} key={index}>
                    <Card
                      hoverable
                      cover={
                        <img
                          alt={`Product ${index + 1}`}
                          src={image}
                          className={cx("preview-image")}
                        />
                      }
                      actions={[
                        <DeleteOutlined
                          key="delete"
                          onClick={() => handleRemoveImage(index)}
                        />,
                      ]}
                    />
                  </Col>
                ))}
              </Row>
            </div>
          )}

          <div className={cx("form-actions")}>
            <Space>
              <Button onClick={onSuccess}>Hủy</Button>
              <Button type="primary" htmlType="submit">
                {mode === "edit" ? "Cập nhật sản phẩm" : "Thêm sản phẩm"}
              </Button>
            </Space>
          </div>
        </Form>
      </Card>
    </div>
  );
}

export default AddProduct;
