const mongoose = require("mongoose");
const variantSchema = new mongoose.Schema({
  size: {
    type: String,
    required: true,
    enum: ["S", "M", "L", "XL", "XXL"], // Các size có sẵn
  },
  color: {
    type: String,
    required: true,
  },
  stock: {
    type: Number,
    required: true,
    min: 0,
  },
});
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
    totalStock: { type: Number, default: 0 }, // Số lượng tồn kho
    description: { type: String }, // Mô tả sản phẩm
    images: [{ type: String }], // Danh sách URL hình ảnh
    variants: [variantSchema], // Danh sách các biến thể sản phẩm (size, color, stock)
    isFeatured: { type: Boolean, default: false }, // Sản phẩm nổi bật
    isNew: { type: Boolean, default: false }, // Sản phẩm mới
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
productSchema.pre("save", function (next) {
  if (this.variants && this.variants.length > 0) {
    this.totalStock = this.variants.reduce(
      (sum, variant) => sum + variant.stock,
      0
    );
  }
  next();
});
const Product = mongoose.model("Product", productSchema);
module.exports = Product;
