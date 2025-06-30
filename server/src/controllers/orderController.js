const orderService = require("../services/orderService");
const dotenv = require("dotenv");
dotenv.config();
const moment = require("moment");
const querystring = require("qs");
const crypto = require("crypto");

function sortObject(obj) {
  let sorted = {};
  let str = [];
  let key;
  for (key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      str.push(encodeURIComponent(key));
    }
  }
  str.sort();
  for (key = 0; key < str.length; key++) {
    sorted[str[key]] = encodeURIComponent(obj[str[key]]).replace(/%20/g, "+");
  }
  return sorted;
}

const createOrder = async (req, res) => {
  try {
    const response = await orderService.createOrder(req.body);
    return res.status(200).json(response);
  } catch (error) {
    return res.status(500).json({ status: "Err", message: error.message });
  }
};

const getOrdersByUserId = async (req, res) => {
  try {
    const userId = req.params.userId;
    const { limit, page, status } = req.query;
    if (!userId) {
      return res
        .status(400)
        .json({ status: "Err", message: "User ID is required" });
    }
    const response = await orderService.getOrdersByUserId(
      userId,
      limit,
      page,
      status
    );
    return res.status(200).json(response);
  } catch (error) {
    return res.status(500).json({ status: "Err", message: error.message });
  }
};

const cancelOrder = async (req, res) => {
  try {
    const orderId = req.params.orderId;
    const userId = req.user.id; // Lấy từ authUserMiddleware

    if (!orderId) {
      return res
        .status(400)
        .json({ status: "Err", message: "Order ID is required" });
    }

    const response = await orderService.cancelOrder(orderId, userId);
    return res.status(200).json(response);
  } catch (error) {
    return res.status(500).json({ status: "Err", message: error.message });
  }
};

const createPaymentUrl = async (req, res) => {
  process.env.TZ = "Asia/Ho_Chi_Minh";
  let date = new Date();
  let createDate = moment(date).format("YYYYMMDDHHmmss");

  let ipAddr =
    req.headers["x-forwarded-for"] ||
    req.connection.remoteAddress ||
    req.socket.remoteAddress ||
    req.connection.socket.remoteAddress;
  let tmnCode = process.env.VNP_TmnCode;
  let secretKey = process.env.VNP_HashSecret;
  let vnpUrl = process.env.VNP_Url;
  let returnUrl = process.env.VNP_ReturnUrl;
  let ipnUrl = process.env.VNP_IPN_Url;

  // Log để debug
  console.log("VNPAY Config:", {
    tmnCode,
    hasSecretKey: !!secretKey,
    vnpUrl,
    returnUrl,
    ipnUrl,
  });
  // Thêm timestamp vào orderId để đảm bảo tính duy nhất cho mỗi giao dịch
  let orderId = req.body.orderId + "_" + moment(date).format("DDHHmmss");
  let amount = req.body.amount;
  let bankCode = req.body.bankCode;

  let locale = req.body.language || "vn";
  let currCode = "VND";
  let vnp_Params = {};
  vnp_Params["vnp_Version"] = "2.1.0";
  vnp_Params["vnp_Command"] = "pay";
  vnp_Params["vnp_TmnCode"] = tmnCode;
  vnp_Params["vnp_Locale"] = locale;
  vnp_Params["vnp_CurrCode"] = currCode;
  vnp_Params["vnp_TxnRef"] = orderId;
  vnp_Params["vnp_OrderInfo"] = "Thanh toan cho ma GD:" + orderId;
  vnp_Params["vnp_OrderType"] = "other";
  vnp_Params["vnp_Amount"] = amount * 100;
  vnp_Params["vnp_ReturnUrl"] = returnUrl;
  // Thêm IPN URL nếu được cấu hình
  // if (ipnUrl) {
  //   vnp_Params["vnp_IpnUrl"] = ipnUrl;
  // }
  vnp_Params["vnp_IpAddr"] = ipAddr;
  vnp_Params["vnp_CreateDate"] = createDate;
  if (bankCode) {
    vnp_Params["vnp_BankCode"] = bankCode;
  }

  vnp_Params = sortObject(vnp_Params);
  let signData = querystring.stringify(vnp_Params, { encode: false });
  let hmac = crypto.createHmac("sha512", secretKey);
  let signed = hmac.update(Buffer.from(signData, "utf-8")).digest("hex");
  vnp_Params["vnp_SecureHash"] = signed;
  vnpUrl += "?" + querystring.stringify(vnp_Params, { encode: false });

  res.status(200).json({ vnpUrl });
  console.log("VNPAY Payment URL created:", vnpUrl);
};

const vnpayReturn = async (req, res) => {
  try {
    console.log("VNPay Return URL hit:", req.originalUrl);
    console.log("VNPay Return query params:", req.query);

    let vnp_Params = req.query;
    let secureHash = vnp_Params["vnp_SecureHash"];

    if (!secureHash) {
      console.error("No secure hash in VNPay return");
      return res.redirect(
        `${
          process.env.CLIENT_URL || "http://localhost:5173"
        }/payment-failed?message=MissingSecureHash`
      );
    }

    delete vnp_Params["vnp_SecureHash"];
    delete vnp_Params["vnp_SecureHashType"];

    vnp_Params = sortObject(vnp_Params);
    let secretKey = process.env.VNP_HashSecret;

    if (!secretKey) {
      console.error("VNP_HashSecret not found in environment variables");
      return res.redirect(
        `${
          process.env.CLIENT_URL || "http://localhost:5173"
        }/payment-failed?message=ConfigurationError`
      );
    }

    let signData = querystring.stringify(vnp_Params, { encode: false });
    let hmac = crypto.createHmac("sha512", secretKey);
    let signed = hmac.update(Buffer.from(signData, "utf-8")).digest("hex");
    const client_url = process.env.CLIENT_URL || "http://localhost:5173";
    const queryString = querystring.stringify(vnp_Params, { encode: false });

    console.log("VNPAY Return verification:");
    console.log("- Expected signature:", signed);
    console.log("- Received signature:", secureHash);
    console.log(
      "- Redirect to:",
      `${client_url}/payment-success?${queryString}`
    );

    if (secureHash === signed) {
      // Lấy ID gốc của đơn hàng từ vnp_TxnRef
      const originalOrderId = vnp_Params["vnp_TxnRef"].split("_")[0];
      console.log("Payment response for order ID:", originalOrderId);

      // Cập nhật trạng thái đơn hàng
      try {
        const rspCode = vnp_Params["vnp_ResponseCode"];
        const result = await orderService.updateOrderAfterPayment(
          vnp_Params["vnp_TxnRef"],
          rspCode,
          vnp_Params
        );
        console.log("Order updated successfully:", result);

        // Redirect dựa trên kết quả thanh toán
        if (rspCode === "00") {
          res.redirect(`${client_url}/payment-success?${queryString}`);
        } else {
          res.redirect(
            `${client_url}/payment-failed?message=PaymentFailed&code=${rspCode}`
          );
        }
      } catch (error) {
        console.error("Failed to update order on return:", error);
        // Vẫn redirect nếu chữ ký hợp lệ, nhưng ghi log lỗi
        if (vnp_Params["vnp_ResponseCode"] === "00") {
          res.redirect(`${client_url}/payment-success?${queryString}`);
        } else {
          res.redirect(
            `${client_url}/payment-failed?message=PaymentFailed&updateError=true`
          );
        }
      }
    } else {
      console.log("Invalid signature in VNPAY return");
      res.redirect(`${client_url}/payment-failed?message=InvalidSignature`);
    }
  } catch (error) {
    console.error("Error in vnpayReturn:", error);
    const client_url = process.env.CLIENT_URL || "http://localhost:5173";
    res.redirect(`${client_url}/payment-failed?message=SystemError`);
  }
};

const vnpayIpn = async (req, res) => {
  try {
    console.log("VNPAY IPN Received:", req.method);

    // VNPay có thể gửi yêu cầu dưới dạng GET hoặc POST
    let vnp_Params = req.method === "GET" ? req.query : req.body;

    // Log for debugging
    console.log("VNPAY IPN Params:", JSON.stringify(vnp_Params));

    let secureHash = vnp_Params["vnp_SecureHash"];

    if (!secureHash) {
      console.log("VNPAY IPN Failed - No secure hash provided");
      return res
        .status(200)
        .json({ RspCode: "97", Message: "No secure hash provided" });
    }

    delete vnp_Params["vnp_SecureHash"];
    delete vnp_Params["vnp_SecureHashType"];

    vnp_Params = sortObject(vnp_Params);
    let secretKey = process.env.VNP_HashSecret;

    if (!secretKey) {
      console.error("VNP_HashSecret not found in environment variables");
      return res
        .status(200)
        .json({ RspCode: "99", Message: "Configuration error" });
    }

    let signData = querystring.stringify(vnp_Params, { encode: false });
    let hmac = crypto.createHmac("sha512", secretKey);
    let signed = hmac.update(Buffer.from(signData, "utf-8")).digest("hex");

    console.log("Expected signature:", signed);
    console.log("Received signature:", secureHash);

    if (secureHash === signed) {
      const orderId = vnp_Params["vnp_TxnRef"];
      const rspCode = vnp_Params["vnp_ResponseCode"];

      console.log(
        "VNPAY IPN Processing - Order ID:",
        orderId,
        "Response Code:",
        rspCode
      );

      try {
        // Extract original order ID if it contains timestamp
        const originalOrderId = orderId.includes("_")
          ? orderId.split("_")[0]
          : orderId;
        console.log("Original Order ID:", originalOrderId);

        // Gọi service để cập nhật đơn hàng
        const result = await orderService.updateOrderAfterPayment(
          orderId,
          rspCode,
          vnp_Params
        );
        console.log(
          "VNPAY IPN Success - Order updated:",
          originalOrderId,
          result
        );

        // Phản hồi cho VNPay
        return res.status(200).json({ RspCode: "00", Message: "Success" });
      } catch (error) {
        console.error("IPN Error:", error.message, error.stack);
        let responseCode;
        let message;

        // Dựa vào mã lỗi từ service để trả về mã lỗi tương ứng cho VNPay
        if (error.code === "ORDER_NOT_FOUND") {
          responseCode = "01"; // Order not found
          message = "Order not found";
        } else {
          responseCode = "99"; // Unknown error
          message = "Unknown error";
        }

         
        return res
          .status(200)
          .json({ RspCode: responseCode, Message: message });
      }
    } else {
      return res.status(200).json({ RspCode: "97", Message: "Fail checksum" });
    }
  } catch (error) {
    console.error("Unexpected error in VNPAY IPN:", error);
    return res.status(200).json({ RspCode: "99", Message: "System error" });
  }
};

const getOrderDetails = async (req, res) => {
  try {
    const orderId = req.params.orderId;
    if (!orderId) {
      return res
        .status(400)
        .json({ status: "Err", message: "Order ID is required" });
    }

    const response = await orderService.getOrderDetails(orderId);

    // Convert các ID sang string để so sánh
    const tokenUserId = req.user ? String(req.user.id) : null;
    const orderUserId = response.data.user ? String(response.data.user) : null;

    // Kiểm tra quyền: chỉ admin hoặc chủ đơn hàng mới được xem
    if (
      req.user &&
      (req.user.isAdmin || String(req.user.id) === String(response.data.user))
    ) {
      return res.status(200).json(response);
    }

    return res.status(403).json({
      status: "Err",
      message: "Forbidden: You don't have permission to view this order",
      yourId: tokenUserId,
      orderId: orderUserId,
      isAdmin: req.user ? req.user.isAdmin : false,
    });
  } catch (error) {
    console.error("Error in getOrderDetails:", error);
    return res.status(500).json({ status: "Err", message: error.message });
  }
};

const getAllOrders = async (req, res) => {
  try {
    const { limit, page } = req.query;
    const response = await orderService.getAllOrders(limit, page);
    return res.status(200).json(response);
  } catch (error) {
    return res.status(500).json({ status: "Err", message: error.message });
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const orderId = req.params.orderId;
    const { status, note } = req.body;

    // Kiểm tra status có hợp lệ không
    const validStatuses = [
      "pending",
      "processing",
      "delivered",
      "cancelled",
      "payment_failed",
    ];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        status: "Err",
        message: "Trạng thái không hợp lệ",
      });
    }

    // Kiểm tra user có quyền admin không (thông qua middleware)
    if (!req.user.isAdmin) {
      return res.status(403).json({
        status: "Err",
        message: "Không có quyền thực hiện thao tác này",
      });
    }

    const response = await orderService.updateOrderStatus(
      orderId,
      status,
      req.user.id,
      note
    );
    return res.status(200).json(response);
  } catch (error) {
    return res.status(500).json({ status: "Err", message: error.message });
  }
};

const getOrdersCount = async (req, res) => {
  try {
    const userId = req.params.userId;
    if (!userId) {
      return res
        .status(400)
        .json({ status: "Err", message: "User ID is required" });
    }
    const response = await orderService.getOrdersCount(userId);
    return res.status(200).json(response);
  } catch (error) {
    return res.status(500).json({ status: "Err", message: error.message });
  }
};

const updatePaymentStatus = async (req, res) => {
  try {
    const orderId = req.params.orderId;
    const { isPaid, note } = req.body;

    // Kiểm tra user có quyền admin không (thông qua middleware)
    if (!req.user.isAdmin) {
      return res.status(403).json({
        status: "Err",
        message: "Không có quyền thực hiện thao tác này",
      });
    }

    const response = await orderService.updatePaymentStatus(
      orderId,
      isPaid,
      req.user.id,
      note
    );
    return res.status(200).json(response);
  } catch (error) {
    return res.status(500).json({ status: "Err", message: error.message });
  }
};

// Controller xử lý client request cập nhật đơn hàng sau thanh toán
const updateOrderAfterPaymentClient = async (req, res) => {
  try {
    const { orderId, vnpResponseCode, vnpParams } = req.body;

    if (!orderId || vnpResponseCode === undefined) {
      return res.status(400).json({
        status: "Err",
        message: "Missing required parameters (orderId or vnpResponseCode)",
      });
    }

   

    const response = await orderService.updateOrderAfterPayment(
      orderId,
      vnpResponseCode,
      vnpParams || {}
    );

    return res.status(200).json(response);
  } catch (error) {
    console.error("Error in updateOrderAfterPaymentClient:", error);
    return res.status(500).json({
      status: "Err",
      message: error.message || "Failed to update order after payment",
    });
  }
};

module.exports = {
  createOrder,
  getOrdersByUserId,
  cancelOrder,
  createPaymentUrl,
  vnpayReturn,
  vnpayIpn,
  getOrderDetails,
  getAllOrders,
  updateOrderStatus,
  getOrdersCount,
  updatePaymentStatus,
  updateOrderAfterPaymentClient,
};
