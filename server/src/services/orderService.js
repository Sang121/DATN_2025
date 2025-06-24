const Order = require("../models/orderModel");
const Product = require("../models/productModel");
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
          !item.price ||
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
      }      // Cập nhật stock và sold của product variants
      await updateProductStock(orderData.items);
      
      // Nếu phương thức thanh toán là VNPAY, đánh dấu đơn hàng đã thanh toán
      if (orderData.paymentMethod === "VNPAY") {
        orderData.isPaid = true;
        orderData.paidAt = new Date();
      }
      
      // Thêm lịch sử trạng thái ban đầu
      if (!orderData.statusHistory) {
        orderData.statusHistory = [];
      }

      orderData.statusHistory.push({
        status: orderData.orderStatus || "pending",
        updatedAt: new Date(),
        note: "Đơn hàng mới được tạo" + (orderData.paymentMethod === "VNPAY" ? " - Đã thanh toán qua VNPAY" : ""),
      });

      // Create order
      const createdOrder = await Order.create(orderData);

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
  const originalOrderId = orderId.split("_")[0];
  const order = await Order.findById(originalOrderId);

  if (!order) {
    const err = new Error("Order not found");
    err.code = "ORDER_NOT_FOUND";
    throw err;
  }

  if (order.isPaid) {
    return { status: "Success", message: "Order has already been paid" };
  }

  if (vnpResponseCode === "00") {
    order.isPaid = true;
    order.paidAt = new Date();
    order.paymentInfo = {
      id: vnpParams.vnp_TransactionNo,
      status: "Success",
      update_time: new Date(),
      email_address: order.shippingInfo.email,
    };
    order.orderStatus = "processing";
    // Khi thanh toán thành công mới trừ kho
    await updateProductStock(order.items);
  } else {
    order.orderStatus = "payment_failed";
  }

  const updatedOrder = await order.save();
  return {
    status: "Success",
    message: "Order status updated successfully",
    data: updatedOrder,
  };
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

      // Chỉ chủ đơn hàng mới có quyền hủy
      if (order.user.toString() !== userId) {
        return reject({
          status: "Err",
          message: "You are not authorized to cancel this order",
        });
      }

      // Chỉ cho phép hủy khi đơn hàng đang ở trạng thái "pending"
      if (order.orderStatus !== "pending") {
        return reject({
          status: "Err",
          message: `Order cannot be cancelled. Status: ${order.orderStatus}`,
        });
      }

      // Hoàn trả lại số lượng sản phẩm vào kho
      await revertProductStock(order.items);

      order.orderStatus = "cancelled";
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

      resolve({
        status: "Success",
        message: "Order counts retrieved successfully",
        total: totalOrders,
        pending: pendingOrders,
        processing: processingOrders,
        delivered: deliveredOrders,
        cancelled: cancelledOrders,
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
      if (previousStatus === "delivered" && newStatus !== "delivered") {
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
      }      // Thêm logic xử lý các trường hợp cụ thể
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
            note: "Thanh toán COD được xác nhận khi giao hàng thành công"
          });
        }
      }

      if (newStatus === "cancelled" && previousStatus !== "cancelled") {
        // Nếu hủy đơn hàng, hoàn trả số lượng sản phẩm vào kho
        await revertProductStock(order.items);
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
