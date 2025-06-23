const orderService = require("../services/orderService");
const dotenv = require("dotenv");
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
    const { limit, page } = req.query;
    if (!userId) {
      return res
        .status(400)
        .json({ status: "Err", message: "User ID is required" });
    }
    const response = await orderService.getOrdersByUserId(userId, limit, page);
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
};

const vnpayReturn = async (req, res) => {
  let vnp_Params = req.query;
  let secureHash = vnp_Params["vnp_SecureHash"];

  delete vnp_Params["vnp_SecureHash"];
  delete vnp_Params["vnp_SecureHashType"];

  vnp_Params = sortObject(vnp_Params);
  let secretKey = process.env.VNP_HashSecret;
  let signData = querystring.stringify(vnp_Params, { encode: false });
  let hmac = crypto.createHmac("sha512", secretKey);
  let signed = hmac.update(Buffer.from(signData, "utf-8")).digest("hex");

  const client_url = process.env.CLIENT_URL || "http://localhost:3000";
  const queryString = querystring.stringify(vnp_Params, { encode: false });

  if (secureHash === signed) {
    res.redirect(`${client_url}/payment-success?${queryString}`);
  } else {
    res.redirect(`${client_url}/payment-failed?message=InvalidSignature`);
  }
};

const vnpayIpn = async (req, res) => {
  let vnp_Params = req.query;
  let secureHash = vnp_Params["vnp_SecureHash"];

  delete vnp_Params["vnp_SecureHash"];
  delete vnp_Params["vnp_SecureHashType"];

  vnp_Params = sortObject(vnp_Params);
  let secretKey = process.env.VNP_HashSecret;
  let signData = querystring.stringify(vnp_Params, { encode: false });
  let hmac = crypto.createHmac("sha512", secretKey);
  let signed = hmac.update(Buffer.from(signData, "utf-8")).digest("hex");

  if (secureHash === signed) {
    const orderId = vnp_Params["vnp_TxnRef"];
    const rspCode = vnp_Params["vnp_ResponseCode"];
    try {
      // Gọi service để cập nhật đơn hàng
      await orderService.updateOrderAfterPayment(orderId, rspCode, vnp_Params);
      // Phản hồi cho VNPay
      res.status(200).json({ RspCode: "00", Message: "Success" });
    } catch (error) {
      console.error("IPN Error:", error.message);
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
      res.status(200).json({ RspCode: responseCode, Message: message });
    }
  } else {
    res.status(200).json({ RspCode: "97", Message: "Fail checksum" });
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
    // Kiểm tra quyền: chỉ admin hoặc chủ đơn hàng mới được xem
    if (req.user.isAdmin || req.user.id === response.data.user) {
      return res.status(200).json(response);
    }
    return res.status(403).json({ status: "Err", message: "Forbidden" });
  } catch (error) {
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

module.exports = {
  createOrder,
  getOrdersByUserId,
  cancelOrder,
  createPaymentUrl,
  vnpayReturn,
  vnpayIpn,
  getOrderDetails,
  getAllOrders,
};
