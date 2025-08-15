const mongoose = require('mongoose');

const returnRequestSchema = new mongoose.Schema({
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true
  },
  reason: {
    type: String,
    required: true,
    enum: ['defective', 'not_as_described', 'wrong_size', 'wrong_color', 'not_satisfied', 'other']
  },
  description: {
    type: String,
    required: true,
    maxlength: 500
  },
  refundMethod: {
    type: String,
    required: true,
    enum: ['bank'], // Chỉ hỗ trợ chuyển khoản ngân hàng
    default: 'bank'
  },
  bankInfo: {
    bankName: {
      type: String,
      required: true // Luôn required vì chỉ hỗ trợ chuyển khoản
    },
    accountNumber: {
      type: String,
      required: true // Luôn required vì chỉ hỗ trợ chuyển khoản
    },
    accountHolder: {
      type: String,
      required: true // Luôn required vì chỉ hỗ trợ chuyển khoản
    }
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'completed'],
    default: 'pending'
  },
  adminNote: {
    type: String,
    maxlength: 500
  },
  processedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user'
  },
  processedAt: {
    type: Date
  },
  completedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user'
  },
  completedAt: {
    type: Date
  },
  refundAmount: {
    type: Number,
    required: true
  },
  originalPaymentMethod: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

// Index for better query performance
returnRequestSchema.index({ order: 1 });
returnRequestSchema.index({ status: 1 });
returnRequestSchema.index({ createdAt: -1 });

module.exports = mongoose.model('ReturnRequest', returnRequestSchema);
