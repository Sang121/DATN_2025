const mongoose = require('mongoose');
const { FaPhone } = require('react-icons/fa');
const  orderSchema = new mongoose.Schema({
    orderItems:[
        {
            name: { type: String, required: true }, // Tên sản phẩm,
            amount: { type: Number, required: true }, // Số lượng sản phẩm,
            price: { type: Number, required: true }, // Giá sản phẩm,
            image: { type: String, required: true }, // Hình ảnh sản phẩm,
            size: { type: String, required: true }, // Kích thước sản phẩm,
            product:{
                type: mongoose.Schema.Types.ObjectId,
                ref: 'products',
                required: true
            },
        },
    ],
    shippingAddress: {
        fullName: { type: String, required: true }, // Tên người nhận,
        address: { type: String, required: true }, // Địa chỉ giao hàng,
        city: { type: String, required: true }, // Thành phố,
       phone: { type: String, required: true }, // Số điện thoại,
        country: { type: String, required: true }, // Quốc gia,
    },
    paymentMethod: { type: String, required: true }, // Phương thức thanh toán,
    itemsPrice: { type: Number, required: true }, // Giá trị sản phẩm,
    shippingPrice: { type: Number, required: true }, // Giá trị vận chuyển,
    taxPrice: { type: Number, required: true }, // Giá trị thuế,
    totalPrice: { type: Number, required: true }, // Tổng giá trị đơn hàng,
    isPaid: { type: Boolean, default: false }, // Trạng thái thanh toán,
    paidAt: { type: Date }, // Thời gian thanh toán,
    isDelivered: { type: Boolean, default: false }, // Trạng thái giao hàng,
    deliveredAt: { type: Date }, // Thời gian giao hàng,
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users',
        required: true
    }
}, {
    timestamps: true
});
const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
