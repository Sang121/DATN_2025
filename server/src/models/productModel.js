const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true }, // Tên sản phẩm
    category: {
      type: String,
      required: true,
      enum: [
        "Áo",
        "Quần",
        "Váy",
        "Đồng hồ",
        "Phụ kiện",
        "Giày dép",
        "Túi xách",
        "Balo",
        "Khác",
      ],
    }, // Loại sản phẩm: áo, quần, váy, đồng hồ, phụ kiện, giày dép, túi xách
    gender: {
      type: String,
      required: true,
      enum: ["Nam", "Nữ", "Unisex"],
    }, // Giới tính: nam, nữ, unisex
    price: { type: Number, required: true }, // Giá\
    discount: { type: Number, default: 0.1 }, // Mức giảm giá
    sold: { type: Number, default: 0 }, // Số lượng đã bán
    rating: { type: Number, default: 5 }, // Đánh giá
    stock: { type: Number, default: 0 }, // Số lượng tồn kho
    description: { type: String }, // Mô tả sản phẩm
    images: [{ type: String }], // Danh sách URL hình ảnh
    attributes: {
      type: Map,
      of: String,
      default: {
        size: "", // Kích thước: S, M, L, XL, XXL
        color: "", // Màu sắc
        material: "", // Chất liệu
        brand: "", // Thương hiệu
      },
    }, // Thuộc tính sản phẩm
  },
  { timestamps: true }
);
const Product = mongoose.model("Product", productSchema);
module.exports = Product;
