const ReturnRequest = require('../models/ReturnRequest');
const Order = require('../models/orderModel');
const Product = require('../models/productModel');
const User = require('../models/userModel');

const returnRequestController = {
  // Tạo yêu cầu trả hàng
  createReturnRequest: async (req, res) => {
    try {
      const { orderId } = req.params;
      const { reason, description, refundMethod, bankInfo } = req.body;
      const userId = req.user.id;

      // Kiểm tra đơn hàng
      const order = await Order.findById(orderId).populate('items.product');
      if (!order) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy đơn hàng'
        });
      }

      // Kiểm tra quyền sở hữu đơn hàng
      if (order.user.toString() !== userId) {
        return res.status(403).json({
          success: false,
          message: 'Bạn không có quyền thực hiện hành động này'
        });
      }

      // Kiểm tra trạng thái đơn hàng
      if (!order.isDelivered && order.orderStatus !== 'delivered') {
        return res.status(400).json({
          success: false,
          message: 'Chỉ có thể trả hàng cho đơn hàng đã giao thành công'
        });
      }

      // Kiểm tra thời hạn trả hàng (7 ngày)
      const deliveredDate = new Date(order.deliveredAt);
      const currentDate = new Date();
      const daysDiff = Math.floor((currentDate - deliveredDate) / (1000 * 60 * 60 * 24));
      
      if (daysDiff > 7) {
        return res.status(400).json({
          success: false,
          message: 'Đã quá thời hạn trả hàng (7 ngày kể từ khi nhận hàng)'
        });
      }

      // Kiểm tra xem đã có yêu cầu trả hàng chưa
      const existingReturn = await ReturnRequest.findOne({ 
        order: orderId,
        status: { $in: ['pending', 'approved'] }
      });
      
      if (existingReturn) {
        return res.status(400).json({
          success: false,
          message: 'Đơn hàng này đã có yêu cầu trả hàng'
        });
      }

      // Tính tổng tiền hoàn trả
      const refundAmount = order.totalPrice;

      // Tạo yêu cầu trả hàng
      const returnRequest = new ReturnRequest({
        order: orderId,
        reason,
        description,
        refundMethod: 'bank', // Luôn là chuyển khoản ngân hàng
        bankInfo, // Luôn required
        refundAmount,
        originalPaymentMethod: order.paymentMethod
      });

      await returnRequest.save();

      // Cập nhật trạng thái đơn hàng thành "return_requested"
      await Order.findByIdAndUpdate(orderId, {
        orderStatus: 'return_requested'
      });

      res.status(201).json({
        success: true,
        message: 'Tạo yêu cầu trả hàng thành công',
        data: {
          _id: returnRequest._id,
          order: orderId,
          reason: returnRequest.reason,
          description: returnRequest.description,
          refundMethod: returnRequest.refundMethod,
          status: returnRequest.status,
          refundAmount: returnRequest.refundAmount,
          createdAt: returnRequest.createdAt
        }
      });

    } catch (error) {
      console.error('Error creating return request:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi server khi tạo yêu cầu trả hàng',
        error: error.message
      });
    }
  },

  // Lấy danh sách yêu cầu trả hàng của user
  getUserReturnRequests: async (req, res) => {
    try {
      const userId = req.user.id;
      const { page = 0, limit = 10, status } = req.query;

      const query = {};
      if (status) {
        query.status = status;
      }

      // Lấy danh sách orders của user trước
      const userOrders = await Order.find({ user: userId }).select('_id');
      const orderIds = userOrders.map(order => order._id);

      query.order = { $in: orderIds };

      const returnRequests = await ReturnRequest.find(query)
        .populate({
          path: 'order',
          populate: {
            path: 'items.product',
            select: 'name images price'
          }
        })
        .sort({ createdAt: -1 })
        .skip(page * limit)
        .limit(parseInt(limit));

      const total = await ReturnRequest.countDocuments(query);

      res.json({
        success: true,
        data: returnRequests,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      });

    } catch (error) {
      console.error('Error getting user return requests:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi server khi lấy danh sách yêu cầu trả hàng',
        error: error.message
      });
    }
  },

  // Lấy danh sách tất cả yêu cầu trả hàng (admin)
  getAllReturnRequests: async (req, res) => {
    try {
      const { page = 0, limit = 10, status } = req.query;

      const query = {};
      if (status) {
        query.status = status;
      }

      const returnRequests = await ReturnRequest.find(query)
        .populate('order')
        .populate('processedBy', 'fullName email')
        .sort({ createdAt: -1 })
        .skip(page * limit)
        .limit(parseInt(limit));

      const total = await ReturnRequest.countDocuments(query);

      res.json({
        success: true,
        data: returnRequests,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      });

    } catch (error) {
      console.error('Error getting all return requests:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi server khi lấy danh sách yêu cầu trả hàng',
        error: error.message
      });
    }
  },

  // Xử lý yêu cầu trả hàng (admin)
  processReturnRequest: async (req, res) => {
    try {
      const { id } = req.params;
      const { action, adminNote } = req.body; // action: 'approve' or 'reject'
      const adminId = req.user.id;

      const returnRequest = await ReturnRequest.findById(id)
        .populate('order');

      if (!returnRequest) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy yêu cầu trả hàng'
        });
      }

      if (returnRequest.status !== 'pending') {
        return res.status(400).json({
          success: false,
          message: 'Yêu cầu trả hàng này đã được xử lý'
        });
      }

      // Cập nhật trạng thái yêu cầu trả hàng
      returnRequest.status = action === 'approve' ? 'approved' : 'rejected';
      returnRequest.adminNote = adminNote;
      returnRequest.processedBy = adminId;
      returnRequest.processedAt = new Date();

      await returnRequest.save();

      if (action === 'approve') {
        try {
          // Cập nhật trạng thái đơn hàng thành 'returned'
          const order = await Order.findById(returnRequest.order._id);
          if (order) {
            order.orderStatus = 'returned';
            order.returnedAt = new Date();
            await order.save();
          }

          // Cập nhật lại số lượng sản phẩm trong kho
          for (const item of order.items) {
            try {
              await Product.findByIdAndUpdate(
                item.product,
                { $inc: { countInStock: item.amount } }
              );
            } catch (inventoryError) {
              console.error(`Failed to update inventory for product ${item.product}:`, inventoryError);
              // Continue với các sản phẩm khác
            }
          }

          // Đánh dấu là đã hoàn thành
          returnRequest.status = 'completed';
          await returnRequest.save();

          console.log(`Return request ${id} approved and processed successfully`);
        } catch (approvalError) {
          console.error('Error during approval process:', approvalError);
          // Vẫn trả về success vì yêu cầu đã được approve, chỉ có thể có lỗi trong post-processing
        }
      } else {
        // Nếu từ chối, cập nhật lại trạng thái order về 'delivered'
        try {
          const order = await Order.findById(returnRequest.order._id);
          if (order) {
            order.orderStatus = 'delivered';
            await order.save();
          }
        } catch (rejectError) {
          console.error('Error during rejection process:', rejectError);
        }
      }

      res.json({
        success: true,
        message: action === 'approve' ? 'Đã phê duyệt yêu cầu trả hàng' : 'Đã từ chối yêu cầu trả hàng',
        data: returnRequest
      });

    } catch (error) {
      console.error('Error processing return request:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi server khi xử lý yêu cầu trả hàng',
        error: error.message
      });
    }
  },

  // Lấy chi tiết yêu cầu trả hàng
  getReturnRequestDetail: async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      const isAdmin = req.user.isAdmin;

      const returnRequest = await ReturnRequest.findById(id)
        .populate('order')
        .populate('processedBy', 'fullName email');

      if (!returnRequest) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy yêu cầu trả hàng'
        });
      }

      // Kiểm tra quyền truy cập
      if (!isAdmin && returnRequest.order.user._id.toString() !== userId) {
        return res.status(403).json({
          success: false,
          message: 'Bạn không có quyền xem yêu cầu này'
        });
      }

      res.json({
        success: true,
        data: returnRequest
      });

    } catch (error) {
      console.error('Error getting return request detail:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi server khi lấy chi tiết yêu cầu trả hàng',
        error: error.message
      });
    }
  },

  // Thống kê yêu cầu trả hàng
  getReturnRequestStats: async (req, res) => {
    try {
      const { startDate, endDate } = req.query;

      const matchStage = {};
      if (startDate && endDate) {
        matchStage.createdAt = {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        };
      }

      // Thống kê theo status
      const statusStats = await ReturnRequest.aggregate([
        { $match: matchStage },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
            totalRefundAmount: { $sum: '$refundAmount' }
          }
        }
      ]);

      // Thống kê theo lý do
      const reasonStats = await ReturnRequest.aggregate([
        { $match: matchStage },
        {
          $group: {
            _id: '$reason',
            count: { $sum: 1 }
          }
        }
      ]);

      // Tổng quan
      const overviewStats = await ReturnRequest.aggregate([
        { $match: matchStage },
        {
          $group: {
            _id: null,
            totalRequests: { $sum: 1 },
            totalRefundAmount: { $sum: '$refundAmount' },
            pendingRequests: {
              $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
            },
            approvedRequests: {
              $sum: { $cond: [{ $eq: ['$status', 'approved'] }, 1, 0] }
            },
            rejectedRequests: {
              $sum: { $cond: [{ $eq: ['$status', 'rejected'] }, 1, 0] }
            },
            completedRequests: {
              $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
            },
            avgRefundAmount: { $avg: '$refundAmount' }
          }
        }
      ]);

      // Thống kê theo thời gian (theo ngày trong 30 ngày qua)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const timelineStats = await ReturnRequest.aggregate([
        {
          $match: {
            createdAt: { $gte: thirtyDaysAgo }
          }
        },
        {
          $group: {
            _id: {
              year: { $year: '$createdAt' },
              month: { $month: '$createdAt' },
              day: { $dayOfMonth: '$createdAt' }
            },
            count: { $sum: 1 },
            refundAmount: { $sum: '$refundAmount' }
          }
        },
        { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
      ]);

      res.json({
        success: true,
        data: {
          overview: overviewStats[0] || {
            totalRequests: 0,
            totalRefundAmount: 0,
            pendingRequests: 0,
            approvedRequests: 0,
            rejectedRequests: 0,
            completedRequests: 0,
            avgRefundAmount: 0
          },
          statusStats: statusStats,
          reasonStats: reasonStats,
          timeline: timelineStats
        }
      });

    } catch (error) {
      console.error('Error getting return request stats:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi server khi lấy thống kê yêu cầu trả hàng',
        error: error.message
      });
    }
  },

  // Đánh dấu đã hoàn tiền
  markAsCompleted: async (req, res) => {
    try {
      const { id } = req.params;
      const adminId = req.user.id;

      const returnRequest = await ReturnRequest.findById(id);

      if (!returnRequest) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy yêu cầu trả hàng'
        });
      }

      if (returnRequest.status !== 'approved') {
        return res.status(400).json({
          success: false,
          message: 'Chỉ có thể hoàn tiền cho yêu cầu đã được phê duyệt'
        });
      }

      // Cập nhật trạng thái completed
      returnRequest.status = 'completed';
      returnRequest.completedBy = adminId;
      returnRequest.completedAt = new Date();
      
      await returnRequest.save();

      // Cập nhật trạng thái đơn hàng thành 'refunded'
      try {
        const order = await Order.findById(returnRequest.order);
        if (order) {
          order.orderStatus = 'refunded';
          order.isRefunded = true;
          order.refundedAt = new Date();
          await order.save();
        }
      } catch (orderUpdateError) {
        console.error('Error updating order status to refunded:', orderUpdateError);
      }

      res.json({
        success: true,
        message: 'Đã cập nhật trạng thái hoàn tiền thành công',
        data: returnRequest
      });
    } catch (error) {
      console.error('Error marking return request as completed:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi server khi cập nhật trạng thái hoàn tiền',
        error: error.message
      });
    }
  }
};

module.exports = returnRequestController;
