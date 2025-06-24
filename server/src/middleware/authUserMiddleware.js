const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();

const authUserMiddleware = (req, res, next) => {
  try {
    const token = req.headers.token?.split(" ")[1];
    if (!token) {
      return res
        .status(401)
        .json({ status: "Error", message: "Vui lòng đăng nhập để tiếp tục." });
    }

    jwt.verify(token, process.env.ACCESS_TOKEN, (err, user) => {
      if (err) {
        return res
          .status(403)
          .json({ status: "Error", message: "Token is invalid" });
      } // Luôn gán thông tin user vào request
      req.user = user;
      const userId = req.headers.userid;

      // Cho phép admin đi qua
      if (user.isAdmin) {
        return next();
      }
      // Kiểm tra quyền truy cập dựa trên params hoặc body
      if (
        // Kiểm tra params
        user.id === userId ||
        // Kiểm tra body - cho các request POST như createOrder
        (req.body.user && user.id === req.body.user) ||
        // Cho qua các endpoint tạo đơn hàng
        req.originalUrl.includes("/check-token")
      ) {
        return next();
      } else {
        return res.status(403).json({
          status: "Error",
          message: "Bạn không có quyền truy cập tài nguyên này.",
        });
      }
    });
  } catch (error) {
    return res
      .status(500)
      .json({ status: "Error", message: "Lỗi máy chủ", error: error.message });
  }
};

module.exports = authUserMiddleware;
