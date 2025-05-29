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
      expiresIn: "30s", // Thời gian hết hạn của Access Token (ngắn)
    }
  );
  return access_token;
};

const genneralRefreshToken = async (payload) => {
  console.log(payload);
  // Nên đổi tên biến `access_token` thành `refreshToken` cho rõ ràng
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
