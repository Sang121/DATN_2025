const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();

const genneralAccessToken = async (payload) => {
  const access_token = jwt.sign(
    {
      ...payload,
    },
    process.env.ACCESS_TOKEN,
    {
      expiresIn: "1h", // Tăng thời gian hết hạn lên 1 giờ để đảm bảo người dùng có đủ thời gian hoạt động
    }
  );
  return access_token;
};

const genneralRefreshToken = async (payload) => {
  console.log(payload);
  const refreshToken = jwt.sign(
    {
      ...payload,
    },
    process.env.REFRESH_TOKEN,
    {
      expiresIn: "365d", // Thời gian hết hạn của Refresh Token (dài)
    }
  );
  return refreshToken; // Trả về biến có tên đúng
};

module.exports = {
  genneralAccessToken,
  genneralRefreshToken,
};
