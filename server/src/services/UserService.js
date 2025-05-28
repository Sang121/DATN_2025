const User = require("../models/userModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { genneralRefreshToken, genneralAccessToken } = require("./jwtService");
//const genneralRefreshToken = require('./jwtService');
const validateEmail = (email) => {
  const emailRegex = /^[\w.-]+@[\w.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email);
};

const validateUsername = (username) => {
  const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
  return usernameRegex.test(username);
};

const createUser = (newUser) => {
  return new Promise(async (resolve, reject) => {
    const { username, email, address, password, phone } = newUser;

    if (!validateEmail(email)) {
      return reject({
        status: 400,
        message: "Email không hợp lệ!",
      });
    }

    if (!validateUsername(username)) {
      return reject({
        status: 400,
        message: "Tên đăng nhập không hợp lệ! Tên đăng nhập chỉ được chứa chữ cái, số và dấu gạch dưới, từ 3 đến 20 ký tự.",
      });
    }

    try {
      const existingUser = await User.findOne({
        $or: [
          { username: username.trim().toLowerCase() },
          { email: email.trim().toLowerCase() },
        ],
      });
      if (existingUser) {
        return reject({
          status: 400,
          message: "Tên đăng nhập hoặc email đã tồn tại!",
        });
      }
      const hashedPassword = await bcrypt.hashSync(password, 10);
      const createUser = await User.create({
        username: username.trim().toLowerCase(),
        email: email.trim().toLowerCase(),
        address,
        password: hashedPassword,
        phone,
      });
      if (createUser) {
        resolve({
          status: "Ok",
          message: "User created successfully",
          data: createUser,
        });
      } else {
        reject({ message: "User created Unsuccessfully" });
      }
    } catch (error) {
      reject({ message: "Server error while create user", error });
    }
  });
};
const loginUser = (loginData) => {
  return new Promise(async (resolve, reject) => {
    const { identifier, password } = loginData;
    const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    const isEmail = emailRegex.test(identifier);
    const newLoginData = isEmail
      ? { email: identifier.trim().toLowerCase() }
      : { username: identifier.trim().toLowerCase() };
    try {
      const existingUser = await User.findOne(newLoginData);
      if (existingUser === null) {
        reject({
          status: "Err",
          message: "Email hoặc tên người dùng không tồn tại!",
        });
      }
      const comparePassword = bcrypt.compareSync(
        password,
        existingUser.password
      );
      if (!comparePassword) {
        return reject({ status: "Err", message: "Mật khẩu không đúng!" });
      }

      const access_token = await genneralAccessToken({
        id: existingUser._id,
        isAdmin: existingUser.isAdmin,
      });
      const refresh_token = await genneralRefreshToken({
        id: existingUser._id,
        isAdmin: existingUser.isAdmin,
      });

      resolve({
        status: "Ok",
        message: "Success",
        access_token,
        refresh_token,
      });
    } catch (error) {
      console.error("Error during login:", error); // Log lỗi chi tiết
      reject({ status: "Err", message: "Server error while login", error });
    }
  });
};
const updateUser = (id, data) => {
  return new Promise(async (resolve, reject) => {
    try {
      const existingUser = await User.findById(id);
      if (!existingUser) {
        reject({
          status: "Err",
          message: "User not found",
        });
      }

      const updateUser = await User.findByIdAndUpdate(id, data, { new: true });
      console.log(updateUser);

      resolve({ status: "Ok", message: "Success", data: updateUser });
    } catch (error) {
      reject({ message: "Server error while update user", error });
    }
  });
};
const deleteUser = (id) => {
  return new Promise(async (resolve, reject) => {
    try {
      const existingUser = await User.findById(id);
      if (!existingUser) {
        return reject({
          status: "Err",
          message: "User not found",
        });
      }
      await User.findByIdAndDelete(id);

      resolve({ status: "Ok", message: "Delete user success" });
    } catch (error) {
      reject({ message: "Server error while delete user", error });
    }
  });
};
const getAllUser = () => {
  return new Promise(async (resolve, reject) => {
    try {
      const allUser = await User.find();
      resolve({
        status: "Ok",
        message: "Get all  user success",
        data: allUser,
      });
      // }else{
      //     reject({ message: 'User created Unsuccessfully' });
      // }
    } catch (error) {
      reject({ message: "Server error while get user", error });
    }
  });
};
const getDetailUser = (id) => {
  return new Promise(async (resolve, reject) => {
    try {
      const existingUser = await User.findById(id);
      if (!existingUser) {
        resolve({
          status: "Ok",
          message: "User not found",
        });
      }

      resolve({
        status: "Ok",
        message: "Get user success",
        data: existingUser,
      });
    } catch (error) {
      reject({ message: "Server error while get user", error });
    }
  });
};
const refreshToken = (token) => {
  if (!token) {
    return Promise.reject({
      status: "Err",
      message: "The token is required",
    });
  }
  return new Promise(async (resolve, reject) => {
    try {
      jwt.verify(token, process.env.REFRESH_TOKEN, async (err, user) => {
        if (err) {
          reject({
            status: "Err",
            message: "The authentication",
          });
        }
        const { payload } = user;
        const access_token = await genneralAccessToken({
          id: payload?.id,
          isAdmin: payload?.isAdmin,
        });

        resolve({
          status: "Ok",
          message: "Refresh token success",
          access_token,
        });
      });
    } catch (error) {
      reject({ message: "Server error while get user", error });
    }
  });
};
const logoutUser = (token) => {
  return new Promise(async (resolve, reject) => {
    try {
    } catch (error) {
      reject({ message: "Server error while get user", error });
    }
  });
};
module.exports = {
  createUser,
  loginUser,
  updateUser,
  deleteUser,
  getAllUser,
  getDetailUser,
  refreshToken,
  logoutUser,
};
