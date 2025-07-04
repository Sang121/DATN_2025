const mongoose = require("mongoose");
const orderSchema = new mongoose.Schema(
  {
    items: [
      {
        name: { type: String, required: true }, // Tên sản phẩm,
        amount: { type: Number, required: true }, // Số lượng sản phẩm,
        originalPrice: { type: Number, required: true }, // Giá gốc sản phẩm,
        newPrice: { type: Number, required: true }, // Giá sản phẩm,
        image: { type: String, required: true }, // Hình ảnh sản phẩm,
        variant: {
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
        },
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "products",
          required: true,
        },
      },
    ],
    shippingInfo: {
      fullName: { type: String, required: true }, // Tên người nhận,
      address: { type: String, required: true }, // Địa chỉ giao hàng,
      phone: { type: String, required: true }, // Số điện thoại,
      email: { type: String, required: true }, // Email người nhận,
    },

    deliveryMethod: { type: String, required: true }, // Phương thức giao hàng,
    paymentMethod: { type: String, required: true }, // Phương thức thanh toán,
    itemsPrice: { type: Number, required: true }, // Giá trị sản phẩm,
    totalDiscount: { type: Number, required: true }, // Giá trị giảm giá,
    taxPrice: { type: Number, required: true }, // Giá trị thuế,
    totalPrice: { type: Number, required: true }, // Tổng giá trị đơn hàng,
    isPaid: { type: Boolean, default: false }, // Trạng thái thanh toán,
    paidAt: { type: Date }, // Thời gian thanh toán,
    isDelivered: { type: Boolean, default: false }, // Trạng thái giao hàng,
    deliveredAt: { type: Date }, // Thời gian giao hàng,
    orderStatus: {
      type: String,
      enum: [
        "pending",
        "pending payment",
        "processing",
        "delivered",
        "cancelled",
        "payment_failed",
      ],
      default: "pending",
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
    statusHistory: [
      {
        status: { type: String },
        updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "users" },
        updatedAt: { type: Date, default: Date.now },
        note: { type: String },
      },
    ],
  },
  {
    timestamps: true,
  }
);
const Order = mongoose.model("Order", orderSchema);

module.exports = Order;
