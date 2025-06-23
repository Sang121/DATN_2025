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
      }
      // Cho phép admin đi qua, hoặc kiểm tra user id
      if (
        user.isAdmin ||
        user.id === req.params.id ||
        user.id === req.params.userId
      ) {
        req.user = user;
        next();
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
