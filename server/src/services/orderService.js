const Order = require("../models/orderModel");
const Product = require("../models/productModel");
const emailService = require("./emailService");
const dotenv = require("dotenv");
dotenv.config();

// Helper function to process image URLs for an order or a list of orders
const processOrderImages = (orderData) => {
  const baseURL =
    process.env.VITE_API_URL || `http://localhost:${process.env.PORT || 3001}`;

  // Function to process a single order
  const processSingleOrder = (order) => {
    // If it's a Mongoose doc, convert to object. Otherwise, it's already a plain object.
    const orderObject = order.toObject ? order.toObject() : order;

    if (!orderObject.items || !Array.isArray(orderObject.items)) {
      return orderObject; // Return as is if no items array
    }

    // Create a new items array with updated image paths
    const newItems = orderObject.items.map((item) => {
      // Create a copy of the item to avoid side-effects
      const newItem = { ...item };
      if (newItem.image && !newItem.image.startsWith("http")) {
        const normalizedPath = newItem.image.replace(/\\/g, "/");
        newItem.image = `${baseURL}/uploads/${normalizedPath}`;
      }
      return newItem;
    });

    // Return a new order object with the new items array
    return {
      ...orderObject,
      items: newItems,
    };
  };

  // Check if it's an array of orders or a single order
  if (Array.isArray(orderData)) {
    return orderData.map(processSingleOrder);
  } else {
    return processSingleOrder(orderData);
  }
};

// Hàm cập nhật stock và sold của product variants
const updateProductStock = async (orderItems) => {
  try {
    // BƯỚC 1: Kiểm tra stock trước khi cập nhật
    for (const item of orderItems) {
      const product = await Product.findById(item.product);
      if (!product) {
        throw new Error(`Product ${item.product} not found`);
      }
      const variant = product.variants.find(
        (v) => v._id.toString() === item.id
      );
      if (!variant) {
        throw new Error(
          `Variant with id ${item.id} not found in product ${item.product}`
        );
      }
      if (variant.stock < item.amount) {
        throw new Error(
          `Insufficient stock for ${item.name} - ${variant.size} ${variant.color}. Available: ${variant.stock}, Requested: ${item.amount}`
        );
      }
    }

    // BƯỚC 2: Cập nhật stock và sold sau khi đã validate
    for (const item of orderItems) {
      await Product.updateOne(
        { _id: item.product, "variants._id": item.id },
        {
          $inc: {
            "variants.$.stock": -item.amount,
            "variants.$.sold": +item.amount,
            totalStock: -item.amount,
            sold: +item.amount,
          },
        }
      );
    }
  } catch (error) {
    // Ném lỗi để hàm gọi có thể bắt và xử lý
    throw new Error(`Error updating product stock: ${error.message}`);
  }
};

// Hàm hoàn trả stock và sold khi hủy đơn hàng
const revertProductStock = async (orderItems) => {
  try {
    for (const item of orderItems) {
      await Product.updateOne(
        { _id: item.product, "variants._id": item.id },
        {
          $inc: {
            "variants.$.stock": +item.amount, // Hoàn trả số lượng
            "variants.$.sold": -item.amount, // Giảm số lượng đã bán
            totalStock: +item.amount,
            sold: -item.amount,
          },
        }
      );
    }
  } catch (error) {
    throw new Error(`Error reverting product stock: ${error.message}`);
  }
};

const createOrder = (orderData) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (
        !orderData.items ||
        !orderData.shippingInfo ||
        !orderData.paymentMethod ||
        !orderData.deliveryMethod ||
        !orderData.itemsPrice ||
        !orderData.taxPrice ||
        !orderData.totalPrice ||
        !orderData.user
      ) {
        return reject({
          status: "Err",
          message: "Missing required fields service",
          data: null,
        });
      }

      // Validate numeric fields
      if (isNaN(orderData.itemsPrice) || orderData.itemsPrice <= 0) {
        return reject({
          status: "Err",
          message: "Price must be a positive number",
          data: null,
        });
      }

      if (isNaN(orderData.taxPrice) || orderData.taxPrice < 0) {
        return reject({
          status: "Err",
          message: "Tax must be a positive number",
          data: null,
        });
      }

      if (
        !orderData.items ||
        !Array.isArray(orderData.items) ||
        orderData.items.length === 0
      ) {
        return reject({
          status: "Err",
          message: "Products are required",
          data: null,
        });
      } // Validate each item
      for (const item of orderData.items) {
        if (
          !item.id ||
          !item.name ||
          !item.newPrice ||
          !item.amount ||
          !item.product
        ) {
          return reject({
            status: "Err",
            message:
              "Invalid item data. ID, name, price, amount and product are required",
            data: null,
          });
        }

        // Validate variant information
        if (!item.variant || !item.variant.size || !item.variant.color) {
          return reject({
            status: "Err",
            message: "Invalid variant data. Size and color are required",
            data: null,
          });
        }
      } // Cập nhật stock và sold của product variants
      await updateProductStock(orderData.items); // Thiết lập trạng thái ban đầu cho đơn hàng dựa vào phương thức thanh toán
      if (orderData.paymentMethod === "VNPAY") {
        // Đơn hàng VNPAY có trạng thái ban đầu là "chờ thanh toán"
        orderData.isPaid = false;
        orderData.orderStatus = "pending payment";
      } else {
        // Các đơn hàng khác (COD) có trạng thái ban đầu là "chờ xử lý"
        orderData.isPaid = false;
        orderData.orderStatus = orderData.orderStatus || "pending";
      }

      // Thêm lịch sử trạng thái ban đầu
      if (!orderData.statusHistory) {
        orderData.statusHistory = [];
      }

      orderData.statusHistory.push({
        status: orderData.orderStatus,
        updatedAt: new Date(),
        note:
          orderData.paymentMethod === "VNPAY"
            ? "Đơn hàng mới được tạo - Đang chờ thanh toán qua VNPAY"
            : "Đơn hàng mới được tạo",
      });

      // Create order
      const createdOrder = await Order.create(orderData);

      // Chỉ gửi email cho phương thức thanh toán không phải VNPAY
      if (orderData.paymentMethod !== "VNPAY") {
        await emailService.sendMail(orderData);
      }

      if (createdOrder) {
        resolve({
          status: "Success",
          message: "Order created successfully",
          data: createdOrder,
        });
      } else {
        throw new Error("Failed to create order - no data returned");
      }
    } catch (error) {
      reject({
        status: "Err",
        message: error.message || "Error creating order",
      });
    }
  });
};

const getOrdersByUserId = (userId, limit = 5, page = 0, status) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!userId) {
        return reject({ status: "Err", message: "User ID is required" });
      }

      // Xây dựng query dựa trên tham số status
      const query = { user: userId };
      if (status && status !== "all") {
        query.orderStatus = status;
      }

      // Đếm tổng số đơn hàng theo query
      const totalOrders = await Order.countDocuments(query);

      // Lấy đơn hàng với query và phân trang
      const orders = await Order.find(query)
        .sort({
          createdAt: -1,
        })
        .skip(page * limit)
        .limit(limit)
        .lean();

      // Process image URLs for all orders
      const processedOrders = processOrderImages(orders);

      resolve({
        status: "Success",
        message: "Orders retrieved successfully",
        data: processedOrders,
        total: totalOrders,
        pageCurrent: Number(page) + 1,
        totalPage: Math.ceil(totalOrders / limit),
      });
    } catch (error) {
      reject({
        status: "Err",
        message: "Error retrieving orders",
        error: error.message,
      });
    }
  });
};

const updateOrderAfterPayment = async (orderId, vnpResponseCode, vnpParams) => {
  try {
    console.log("Updating order after payment:", {
      orderId,
      vnpResponseCode,
      params: vnpParams,
    });

    // Lấy ID gốc nếu có timestamp
    const originalOrderId = orderId.includes("_")
      ? orderId.split("_")[0]
      : orderId;
    console.log("Looking up order with ID:", originalOrderId);

    const order = await Order.findById(originalOrderId);

    if (!order) {
      console.error(`Order not found: ${originalOrderId}`);
      const err = new Error("Order not found");
      err.code = "ORDER_NOT_FOUND";
      throw err;
    }

    console.log("Found order:", {
      id: order._id,
      status: order.orderStatus,
      isPaid: order.isPaid,
      paymentMethod: order.paymentMethod,
    });

    // Chỉ xử lý cho đơn hàng VNPAY
    if (order.paymentMethod !== "VNPAY") {
      console.log(`Order ${originalOrderId} is not a VNPAY payment`);
      return {
        status: "Success",
        message: "Not a VNPAY order, no action needed",
        data: order,
      };
    }

    // Kiểm tra nếu đơn hàng đã được thanh toán
    if (order.isPaid) {
      console.log(`Order ${originalOrderId} has already been paid`);
      return { status: "Success", message: "Order has already been paid" };
    }

    const now = new Date();

    if (vnpResponseCode === "00") {
      console.log(`Payment successful for order ${originalOrderId}`);

      // Cập nhật trạng thái thanh toán
      order.isPaid = true;
      order.paidAt = now;
      order.paymentInfo = {
        id: vnpParams.vnp_TransactionNo || "unknown",
        status: "Success",
        update_time: now,
        email_address: order.shippingInfo.email,
        amount: vnpParams.vnp_Amount
          ? Number(vnpParams.vnp_Amount) / 100
          : order.totalPrice,
        bankCode: vnpParams.vnp_BankCode || "unknown",
      };

      // Cập nhật trạng thái đơn hàng
      order.orderStatus = "pending";

      // Thêm vào lịch sử trạng thái
      order.statusHistory.push({
        status: "pending",
        updatedBy: null, // Không có ID người dùng trong ngữ cảnh này
        updatedAt: now,
        note:
          "Thanh toán VNPAY thành công" +
          (vnpParams.vnp_BankCode
            ? ` qua ngân hàng ${vnpParams.vnp_BankCode}`
            : ""),
      });

      // Thêm lịch sử trạng thái thanh toán
      order.statusHistory.push({
        status: "payment_updated",
        updatedBy: null,
        updatedAt: now,
        note:
          "Đã thanh toán thành công qua VNPAY" +
          (vnpParams.vnp_TransactionNo
            ? ` - Mã giao dịch: ${vnpParams.vnp_TransactionNo}`
            : ""),
      });

      // Lưu đơn hàng trước
      const updatedOrder = await order.save();

      // Gửi email xác nhận đơn hàng CHỈ KHI thanh toán VNPAY thành công
      try {
        // Chuyển đổi Mongoose document thành plain object để gửi email
        const orderForEmail = updatedOrder.toObject();
        await emailService.sendMail(orderForEmail);
        console.log(`Email confirmation sent for order ${originalOrderId}`);
      } catch (emailError) {
        console.error("Error sending confirmation email:", emailError);
        // Không ném lỗi ở đây vì đơn hàng vẫn đã được cập nhật thành công
      }

      return {
        status: "Success",
        message: "Order status updated and confirmation email sent",
        data: updatedOrder,
      };
    } else {
      console.log(
        `Payment failed for order ${originalOrderId} with code: ${vnpResponseCode}`
      );

      // Cập nhật trạng thái đơn hàng thành thất bại
      order.orderStatus = "payment_failed";

      // Thêm vào lịch sử trạng thái
      order.statusHistory.push({
        status: "payment_failed",
        updatedBy: null,
        updatedAt: now,
        note: `Thanh toán VNPAY thất bại với mã: ${vnpResponseCode}`,
      });

      const updatedOrder = await order.save();
      return {
        status: "Success",
        message: "Order status updated to payment_failed",
        data: updatedOrder,
      };
    }
  } catch (error) {
    console.error("Error updating order after payment:", error);
    throw error;
  }
};

const getOrderDetails = (orderId) => {
  return new Promise(async (resolve, reject) => {
    try {
      const order = await Order.findById(orderId).lean();
      if (!order) {
        return reject({ status: "Err", message: "Order not found" });
      }
      // Process image URLs for the order
      const processedOrder = processOrderImages(order);
      resolve({
        status: "Success",
        message: "Order details retrieved successfully",
        data: processedOrder,
      });
    } catch (error) {
      reject({
        status: "Err",
        message: "Error retrieving order details",
        error: error.message,
      });
    }
  });
};

const getAllOrders = (limit = 10, page = 0) => {
  return new Promise(async (resolve, reject) => {
    try {
      const totalOrders = await Order.countDocuments();
      const allOrders = await Order.find({})
        .sort({ createdAt: -1 })
        .skip(page * limit)
        .limit(limit)
        .lean();

      // Process image URLs for all orders
      const processedOrders = processOrderImages(allOrders);
      resolve({
        status: "Success",
        message: "All orders retrieved successfully",
        data: processedOrders,
        total: totalOrders,
        pageCurrent: Number(page) + 1,
        totalPage: Math.ceil(totalOrders / limit),
      });
    } catch (error) {
      reject({
        status: "Err",
        message: "Error retrieving all orders",
        error: error.message,
      });
    }
  });
};

const cancelOrder = (orderId, userId) => {
  return new Promise(async (resolve, reject) => {
    try {
      const order = await Order.findById(orderId);

      if (!order) {
        return reject({ status: "Err", message: "Order not found" });
      }

      // Nếu là gọi từ VNPAY callback (userId không được cung cấp)
      // hoặc nếu người dùng là chủ đơn hàng
      const isSystemCancel = !userId;
      const isOwnerCancel = userId && order.user.toString() === userId;

      if (!isSystemCancel && !isOwnerCancel) {
        return reject({
          status: "Err",
          message: "You are not authorized to cancel this order",
        });
      }

      // Chỉ cho phép hủy khi đơn hàng đang ở trạng thái "pending" hoặc "pending payment"
      if (
        order.orderStatus !== "pending" &&
        order.orderStatus !== "pending payment"
      ) {
        return reject({
          status: "Err",
          message: `Order cannot be cancelled. Status: ${order.orderStatus}`,
        });
      }

      // Hoàn trả lại số lượng sản phẩm vào kho
      await revertProductStock(order.items);

      order.orderStatus = "cancelled";

      // Thêm vào lịch sử trạng thái
      if (!order.statusHistory) {
        order.statusHistory = [];
      }

      order.statusHistory.push({
        status: "cancelled",
        updatedBy: userId || null,
        updatedAt: new Date(),
        note: isSystemCancel
          ? "Đơn hàng bị hủy do không hoàn tất thanh toán"
          : "Đơn hàng bị hủy bởi người dùng",
      });

      const updatedOrder = await order.save();

      resolve({
        status: "Success",
        message: "Order cancelled successfully",
        data: updatedOrder,
      });
    } catch (error) {
      reject({
        status: "Err",
        message: error.message || "Error cancelling order",
      });
    }
  });
};

const getOrdersCount = (userId) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!userId) {
        return reject({ status: "Err", message: "User ID is required" });
      }

      // Get total orders count
      const totalOrders = await Order.countDocuments({ user: userId });

      // Get counts by status
      const pendingOrders = await Order.countDocuments({
        user: userId,
        orderStatus: "pending",
      });

      const processingOrders = await Order.countDocuments({
        user: userId,
        orderStatus: "processing",
      });

      const deliveredOrders = await Order.countDocuments({
        user: userId,
        orderStatus: "delivered",
      });

      const cancelledOrders = await Order.countDocuments({
        user: userId,
        orderStatus: "cancelled",
      });

      const returnedOrders = await Order.countDocuments({
        user: userId,
        orderStatus: "returned",
      });

      const refundedOrders = await Order.countDocuments({
        user: userId,
        orderStatus: "refunded",
      });

      resolve({
        status: "Success",
        message: "Order counts retrieved successfully",
        total: totalOrders,
        pending: pendingOrders,
        processing: processingOrders,
        delivered: deliveredOrders,
        cancelled: cancelledOrders,
        returned: returnedOrders,
        refunded: refundedOrders,
      });
    } catch (error) {
      reject({
        status: "Err",
        message: "Error retrieving order counts",
        error: error.message,
      });
    }
  });
};

const updateOrderStatus = (orderId, newStatus, adminUserId, note) => {
  return new Promise(async (resolve, reject) => {
    try {
      const order = await Order.findById(orderId);

      if (!order) {
        return reject({
          status: "Err",
          message: "Order not found",
        });
      }

      const previousStatus = order.orderStatus;

      // Kiểm tra logic trước khi cập nhật trạng thái
      if (
        previousStatus === "delivered" &&
        newStatus !== "delivered" &&
        newStatus !== "returned"
      ) {
        return reject({
          status: "Err",
          message: "Không thể thay đổi trạng thái của đơn hàng đã giao",
        });
      }

      if (previousStatus === "cancelled" && newStatus !== "cancelled") {
        return reject({
          status: "Err",
          message: "Không thể thay đổi trạng thái của đơn hàng đã hủy",
        });
      } // Thêm logic xử lý các trường hợp cụ thể
      if (newStatus === "delivered") {
        // Nếu trạng thái mới là đã giao, cập nhật thời gian giao hàng
        order.deliveredAt = new Date();

        // Nếu phương thức thanh toán là "COD" (thanh toán khi nhận hàng), đánh dấu đã thanh toán
        if (order.paymentMethod === "COD" && !order.isPaid) {
          order.isPaid = true;
          order.paidAt = new Date();

          // Thêm ghi chú vào lịch sử về việc cập nhật tự động trạng thái thanh toán
          if (!order.statusHistory) {
            order.statusHistory = [];
          }

          order.statusHistory.push({
            status: "payment_updated",
            updatedBy: adminUserId,
            updatedAt: new Date(),
            note: "Thanh toán COD được xác nhận khi giao hàng thành công",
          });
        }
      }

      if (newStatus === "cancelled" && previousStatus !== "cancelled") {
        // Nếu hủy đơn hàng, hoàn trả số lượng sản phẩm vào kho
        await revertProductStock(order.items);
      }

      // Xử lý logic cho trạng thái returned
      if (newStatus === "returned") {
        // Chỉ cho phép chuyển sang returned từ trạng thái delivered
        if (previousStatus !== "delivered") {
          return reject({
            status: "Err",
            message: "Chỉ có thể trả hàng từ đơn hàng đã giao thành công",
          });
        }
        // Đánh dấu thời gian trả hàng
        order.returnedAt = new Date();

        // Hoàn trả số lượng sản phẩm vào kho
        await revertProductStock(order.items);
      }

      // Xử lý logic cho trạng thái refunded
      if (newStatus === "refunded") {
        // Chỉ cho phép chuyển sang refunded từ trạng thái returned
        if (previousStatus !== "returned") {
          return reject({
            status: "Err",
            message: "Chỉ có thể hoàn tiền từ đơn hàng đã được trả về",
          });
        }
        // Đánh dấu thời gian hoàn tiền
        order.refundedAt = new Date();

        // Cập nhật trạng thái thanh toán (đã hoàn tiền)
        order.isPaid = false;
        order.isRefunded = true;
      }

      // Cập nhật trạng thái mới
      order.orderStatus = newStatus;

      // Thêm log lịch sử cập nhật nếu cần
      if (!order.statusHistory) {
        order.statusHistory = [];
      }

      order.statusHistory.push({
        status: newStatus,
        updatedBy: adminUserId,
        updatedAt: new Date(),
        note: note || "",
      });

      const updatedOrder = await order.save();

      resolve({
        status: "Success",
        message: "Order status updated successfully",
        data: processOrderImages(updatedOrder),
      });
    } catch (error) {
      reject({
        status: "Err",
        message: error.message || "Error updating order status",
      });
    }
  });
};

const updatePaymentStatus = (orderId, isPaid, adminUserId, note) => {
  return new Promise(async (resolve, reject) => {
    try {
      const order = await Order.findById(orderId);

      if (!order) {
        return reject({
          status: "Err",
          message: "Order not found",
        });
      }

      // Cập nhật trạng thái thanh toán
      order.isPaid = isPaid;
      if (isPaid) {
        order.paidAt = new Date();
      }

      // Thêm log lịch sử cập nhật
      if (!order.statusHistory) {
        order.statusHistory = [];
      }

      order.statusHistory.push({
        status: order.orderStatus,
        updatedBy: adminUserId,
        updatedAt: new Date(),
        note: `Trạng thái thanh toán được cập nhật thành: ${
          isPaid ? "Đã thanh toán" : "Chưa thanh toán"
        }${note ? " - " + note : ""}`,
      });

      const updatedOrder = await order.save();

      resolve({
        status: "Success",
        message: "Payment status updated successfully",
        data: processOrderImages(updatedOrder),
      });
    } catch (error) {
      reject({
        status: "Err",
        message: error.message || "Error updating payment status",
      });
    }
  });
};

module.exports = {
  createOrder,
  getOrdersByUserId,
  updateOrderAfterPayment,
  updateProductStock,
  getOrderDetails,
  getAllOrders,
  cancelOrder,
  getOrdersCount,
  updateOrderStatus,
  updatePaymentStatus,
};
