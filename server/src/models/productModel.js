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
  sold: {
    type: Number,
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
      ],
    }, // Loại sản phẩm: áo, quần, váy, đồng hồ, phụ kiện, giày dép, túi xách
    gender: {
      type: String,
      required: true,
      enum: ["Nam", "Nữ", "Unisex"],
    }, // Giới tính: nam, nữ, unisex
    price: { type: Number, required: true }, // Giá
    discount: { type: Number, default: 0 }, // Mức giảm giá
    sold: { type: Number, default: 0 }, // Số lượng đã bán
    rating: { type: Number, default: 5 }, // Đánh giá
    totalStock: { type: Number, default: 0 }, // Số lượng tồn kho
    description: { type: String }, // Mô tả sản phẩm
    images: [{ type: String }], // Danh sách URL hình ảnh
    variants: [variantSchema], // Danh sách các biến thể sản phẩm (size, color, stock)
    isFeatured: { type: Boolean, default: false }, // Sản phẩm nổi bật
    isNew: { type: Boolean, default: false }, // Sản phẩm mới
    // Thuộc tính sản phẩm
  },
  { timestamps: true }
);
productSchema.pre("save", function (next) {
  if (this.variants && this.variants.length > 0) {
    this.totalStock = this.variants.reduce(
      (sum, variant) => sum + (variant.stock || 0),
      0
    );
    this.sold = this.variants.reduce(
      (sum, variant) => sum + (variant.sold || 0),
      0
    );
  } else {
    this.totalStock = 0;
    this.sold = 0;
  }
  next();
});

// Middleware để tự động cập nhật totalStock khi update variants
productSchema.pre("findOneAndUpdate", function (next) {
  const update = this.getUpdate();

  // Kiểm tra nếu có cập nhật variants
  if (update.$set && update.$set.variants) {
    const variants = update.$set.variants;
    if (Array.isArray(variants)) {
      // Tính toán totalStock từ variants mới
      const newTotalStock = variants.reduce(
        (sum, variant) => sum + (variant.stock || 0),
        0
      );
      const newTotalSold = variants.reduce(
        (sum, variant) => sum + (variant.sold || 0),
        0
      );

      // Set totalStock mới
      update.$set.totalStock = newTotalStock;
      update.$set.sold = newTotalSold;
    }
  }

  next();
});

// Post middleware để đảm bảo totalStock được cập nhật
productSchema.post("findOneAndUpdate", async function (doc) {
  if (doc && doc.variants) {
    const calculatedTotalStock = doc.variants.reduce(
      (sum, variant) => sum + (variant.stock || 0),
      0
    );
    const calculatedTotalSold = doc.variants.reduce(
      (sum, variant) => sum + (variant.sold || 0),
      0
    );

    // Nếu totalStock không khớp, cập nhật lại
    if (
      doc.totalStock !== calculatedTotalStock ||
      doc.sold !== calculatedTotalSold
    ) {
      await this.model.updateOne(
        { _id: doc._id },
        {
          $set: {
            totalStock: calculatedTotalStock,
            sold: calculatedTotalSold,
          },
        }
      );
    }
  }
});
const Product = mongoose.model("Product", productSchema);
module.exports = Product;
