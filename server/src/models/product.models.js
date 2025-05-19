const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
    {
        name: { type: String, required: true }, // Tên sản phẩm
        category: {
            type: String,
            required: true,
            enum: ['ao', 'quan', 'vay', 'dongho', 'phu_kien', 'giay_dep', 'tui_xach','balo','khac'],
        }, // Loại sản phẩm: áo, quần, váy, đồng hồ, phụ kiện, giày dép, túi xách
        gender: {
            type: String,
            required: true,
            enum: ['nam', 'nu', 'unisex'],
        }, // Giới tính: nam, nữ, unisex
        price: { type: Number, required: true }, // Giá
        stock: { type: Number, default: 0 }, // Số lượng tồn kho
        description: { type: String }, // Mô tả sản phẩm
        images: [{ type: String }], // Danh sách URL hình ảnh
        attributes: {
            type: Map,
            of: String,
            default: {
                size: '', // Kích thước: S, M, L, XL, XXL
                color: '', // Màu sắc
                material: '', // Chất liệu
                brand: '', // Thương hiệu
            },
        }, // Thuộc tính sản phẩm
    },
    { timestamps: true },
);

module.exports = mongoose.model('products', productSchema);
