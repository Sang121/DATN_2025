import { useState } from "react";
import { Editor } from "@tinymce/tinymce-react";
import {
  Form,
  Input,
  InputNumber,
  Select,
  Button,
  Card,
  Typography,
  Divider,
  Upload,
  Space,
  Row,
  Col,
  message,
  Modal,
} from "antd";
import {
  UploadOutlined,
  DeleteOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import {
  createProduct,
  uploadImage,
} from "../../../../services/productService";
import { useMediaQuery } from "react-responsive";
import classNames from "classnames/bind";
import styles from "./AddProduct.module.css";

const { Title, Text } = Typography;
const { Option } = Select;
const cx = classNames.bind(styles);

function AddProduct({ onSuccess }) {
  const [tempImages, setTempImages] = useState([]);
  const [form] = Form.useForm();
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

  // Responsive breakpoints
  const isMobile = useMediaQuery({ maxWidth: 767 });
  const isTablet = useMediaQuery({ minWidth: 768, maxWidth: 1023 });

  const categories = [
    { value: "Áo", label: "Áo" },
    { value: "Quần", label: "Quần" },
    { value: "Váy", label: "Váy" },
    { value: "Đầm", label: "Đầm" },
    { value: "Phụ kiện", label: "Phụ kiện" },
    { value: "Giày dép", label: "Giày dép" },
    { value: "Túi xách", label: "Túi xách" },
    { value: "Ba Lô", label: "Ba Lô" },
    { value: "Khác", label: "Khác" },
  ];

  const genders = [
    { value: "Nam", label: "Nam" },
    { value: "Nữ", label: "Nữ" },
    { value: "Unisex", label: "Unisex" },
  ];

  const handleChange = (name, value) => {
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

  const handleImageChange = async (info) => {
    if (info.file.status === "uploading") {
      return;
    }

    if (info.file.status === "done") {
      setTempImages((prev) => [...prev, info.file.originFileObj]);
      const imageUrl = URL.createObjectURL(info.file.originFileObj);
      setProductData((prev) => ({
        ...prev,
        images: [...prev.images, imageUrl],
      }));
    }
  };

  const handleRemoveImage = (indexToRemove) => {
    setTempImages((prev) => prev.filter((_, index) => index !== indexToRemove));
    setProductData((prev) => ({
      ...prev,
      images: prev.images.filter((_, index) => index !== indexToRemove),
    }));
  };

  const handleSubmit = async () => {
    try {
      const formData = new FormData();

      Object.keys(productData).forEach((key) => {
        if (key !== "images") {
          formData.append(
            key,
            typeof productData[key] === "object"
              ? JSON.stringify(productData[key])
              : productData[key]
          );
        }
      });

      const imagePromises = tempImages.map(async (file) => {
        const imageFormData = new FormData();
        imageFormData.append("images", file);
        const res = await uploadImage(imageFormData);
        return res.data[0];
      });

      const uploadedImageUrls = await Promise.all(imagePromises);
      formData.append("images", JSON.stringify(uploadedImageUrls));

      const res = await createProduct(formData);

      if (res.status === 200) {
        message.success("Thêm sản phẩm thành công");
        if (onSuccess) {
          onSuccess();
        }
      } else {
        message.error(res.message || "Thêm sản phẩm thất bại");
      }
    } catch (error) {
      console.error("Lỗi khi thêm sản phẩm:", error);
      message.error(error.response?.data?.message || "Lỗi khi thêm sản phẩm");
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
          initialValues={productData}
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

            <Col xs={24} sm={12}>
              <Form.Item
                label="Số lượng tồn kho"
                name="stock"
                rules={[{ required: true, message: "Vui lòng nhập số lượng" }]}
              >
                <InputNumber
                  style={{ width: "100%" }}
                  min={0}
                  onChange={(value) => handleChange("stock", value)}
                />
              </Form.Item>
            </Col>
          </Row>

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

          {productData.images.length > 0 && (
            <div className={cx("image-preview")}>
              <Row gutter={[16, 16]}>
                {productData.images.map((image, index) => (
                  <Col xs={12} sm={8} md={6} key={index}>
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
                Thêm sản phẩm
              </Button>
            </Space>
          </div>
        </Form>
      </Card>
    </div>
  );
}

export default AddProduct;
