const User = require("../models/userModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { processImageUrls } = require("./productService");
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
        message:
          "Tên đăng nhập không hợp lệ! Tên đăng nhập chỉ được chứa chữ cái, số và dấu gạch dưới, từ 3 đến 20 ký tự.",
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
        return reject({
          status: "Err",
          message: "User not found",
        });
      }

      // `new: true` để trả về document đã cập nhật
      const updatedUser = await User.findByIdAndUpdate(id, data, { new: true });

      // TẠO  ACCESS_TOKEN VÀ REFRESH_TOKEN MỚI SAU KHI CẬP NHẬT
      const access_token = await genneralAccessToken({
        id: updatedUser._id,
        isAdmin: updatedUser.isAdmin,
      });
      const refresh_token = await genneralRefreshToken({
        id: updatedUser._id,
        isAdmin: updatedUser.isAdmin,
      });

      resolve({
        status: "Ok",
        message: "Success",
        data: updatedUser, // Trả về thông tin user đã cập nhật
        access_token, // Trả về access_token mới
        refresh_token, // Trả về refresh_token mới
      });
    } catch (error) {
      reject({ message: "Server error while updating user", error });
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
          return reject({
            // Sử dụng return để thoát khỏi hàm
            status: "Err",
            message:
              "The authentication failed: Refresh token invalid or expired",
          });
        }
        const payload = user;
        const newUser = await User.findById(payload.id); // Tạo access_token mới từ refresh token hợp lệ
        const access_token = await genneralAccessToken({
          id: payload?.id,
          isAdmin: payload?.isAdmin,
        });

        resolve({
          status: "Ok",
          message: "Refresh token success",
          newUser,
          access_token, // TRẢ VỀ ACCESS_TOKEN MỚI
        });
      });
    } catch (error) {
      reject({ message: "Server error while refreshing token", error });
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
const addFavorite = (userId, productId) => {
  return new Promise(async (resolve, reject) => {
    try {
      const user = await User.findById(userId);
      if (!user) {
        return reject({ status: "Err", message: "User not found" });
      }
      console.log("userId", userId);
      console.log("productId", productId);
      if (user.favorite.includes(productId)) {
        return reject({
          status: "Err",
          message: "Product already in favorites",
        });
      }
      user.favorite.push(productId);
      await user.save();
      console.log("user.favorite", user.favorite);
      resolve({ status: "Ok", message: "Product added to favorites" });
    } catch (error) {
      reject({ message: "Server error while adding favorite", error });
    }
  });
};
const removeFavorite = (userId, productId) => {
  return new Promise(async (resolve, reject) => {
    try {
      const user = await User.findById(userId);
      if (!user) {
        return reject({ status: "Err", message: "User not found" });
      }
      if (!user.favorite.includes(productId)) {
        return reject({
          status: "Err",
          message: "Product not found in favorites",
        });
      }
      user.favorite = user.favorite.filter((id) => id !== productId);
      await user.save();
      resolve({ status: "Ok", message: "Product removed from favorites" });
    } catch (error) {
      reject({ message: "Server error while removing favorite", error });
    }
  });
};
const getCart = (userId) => {
  return new Promise(async (resolve, reject) => {
    try {
      const user = await User.findById(userId);
      if (!user) {
        return reject({ status: "Err", message: "User not found" });
      }
      resolve({
        status: "Ok",
        message: "Cart retrieved successfully",
        data: user.cart,
      });
    } catch (error) {
      reject({ message: "Server error while retrieving cart", error });
    }
  });
};
const addToCart = (userId, product) => {
  return new Promise(async (resolve, reject) => {
    try {
      const user = await User.findById(userId);
      if (!user) {
        return reject({ status: "Err", message: "User not found" });
      }
      const existingCartItem = user.cart.find(
        (item) => item.variantId === product.id
      );
      console.log("existingCartItem", existingCartItem);
      console.log("product", product);
      if (existingCartItem) {
        const oldAmount = existingCartItem.amount;

        existingCartItem.amount = oldAmount + (product.amount || 1);

        await user.save();

        resolve({
          status: "Ok",
          message: "Product amount updated in cart",
          data: {
            productId: product.productId,
            variantId: product.variantId,
            oldAmount: oldAmount,
            newAmount: existingCartItem.amount,
          },
        });
      } else {
        product.amount = product.amount || 1;
        user.cart.push(product);
        await user.save();
        resolve({
          status: "Ok",
          message: "Product added to cart",
          data: {
            productId: product.productId,
            variantId: product.variantId,
            amount: product.amount,
          },
        });
      }
    } catch (error) {
      console.error("Error in addToCart:", error);
      reject({ message: "Server error while adding to cart", error });
    }
  });
};
const updateCart = (userId, id, amount) => {
  return new Promise(async (resolve, reject) => {
    try {
      const user = await User.findById(userId);
      if (!user) {
        return reject({ status: "Err", message: "User not found" });
      }
      const cartItem = user.cart.find((item) => item.id === id);
      if (!cartItem) {
        return reject({ status: "Err", message: "Product not found in cart" });
      }
      cartItem.amount = amount;
      await user.save();
      resolve({ status: "Ok", message: "Cart updated successfully" });
    } catch (error) {
      reject({ message: "Server error while updating cart", error });
    }
  });
};
const removeFromCart = (userId, id) => {
  return new Promise(async (resolve, reject) => {
    try {
      const user = await User.findById(userId);
      if (!user) {
        return reject({ status: "Err", message: "User not found" });
      }
      user.cart = user.cart.filter((item) => item.id !== id);
      await user.save();
      resolve({ status: "Ok", message: "Product removed from cart" });
    } catch (error) {
      reject({ message: "Server error while removing from cart", error });
    }
  });
};
const getFavorite = (userId) => {
  return new Promise(async (resolve, reject) => {
    try {
      const user = await User.findById(userId).populate("favorite");
      if (!user) {
        return reject({ status: "Err", message: "User not found" });
      }
      if (user.favorite.length === 0) {
        return reject({ status: "Err", message: "No favorite products found" });
      }
      const processedProducts = user.favorite.map(processImageUrls);

      resolve({
        status: "Ok",
        message: "Favorite products retrieved successfully",
        data: processedProducts,
      });
    } catch (error) {
      reject({
        message: "Server error while retrieving favorite products",
        error,
      });
    }
  });
};
module.exports = {
  createUser,
  loginUser,
  updateUser,
  deleteUser,
  addFavorite,
  removeFavorite,
  getAllUser,
  getDetailUser,
  refreshToken,
  logoutUser,
  getCart,
  addToCart,
  updateCart,
  removeFromCart,
  getFavorite,
};
