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
            enum: [
              "S",
              "M",
              "L",
              "XL",
              "XXL", // Size áo
              "35",
              "36",
              "37",
              "38",
              "39",
              "40",
              "41",
              "42",
              "43",
              "44", // Size giày
            ], // Các size có sẵn
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
          ref: "Product",
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
    isRefunded: { type: Boolean, default: false }, // Trạng thái hoàn tiền,
    returnedAt: { type: Date }, // Thời gian trả hàng,
    refundedAt: { type: Date }, // Thời gian hoàn tiền,
    orderStatus: {
      type: String,
      enum: [
        "pending",
        "pending payment",
        "processing",
        "delivered",
        "cancelled",
        "payment_failed",
        "return_requested", // Đã yêu cầu hoàn tiền, chờ duyệt
        "returned",
        "refunded",
      ],
      default: "pending",
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    statusHistory: [
      {
        status: { type: String },
        updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
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
