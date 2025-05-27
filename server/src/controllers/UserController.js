const UserService = require("../services/UserService");

const createUser = async (req, res) => {
  try {
    const { username, email, password, address, confirmPassword, phone } =
      req.body;
    const reg = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    const isCheckEmail = reg.test(email);
    if (
      !username ||
      !email ||
      !password ||
      !address ||
      !confirmPassword ||
      !phone
    ) {
      return res.status(200).json({
        status: "Err",
        message: "the input is required",
      });
    } else if (isCheckEmail === false) {
      return res.status(200).json({
        status: "Err",
        message: "The input must be email format",
      });
    } else if (password !== confirmPassword) {
      return res.status(200).json({
        status: "200",
        message: "Password must be equal confirm password",
      });
    }

    const response = await UserService.createUser(req.body);

    return res.status(201).json(response);
  } catch (error) {
    console.error("Error creating user:", error);
    return res.status(500).json({ message: "Server error", error });
  }
};
const loginUser = async (req, res) => {
  try {
    const { identifier, password } = req.body; // identifier có thể là username hoặc email
    if (!identifier || !password) {
      return res.status(200).json({
        status: "Err",
        message: "The input is required",
      });
    }

    const loginData = { identifier: identifier.trim(), password };

    console.log("loginData", loginData);
    const response = await UserService.loginUser(loginData);
    const { refresh_token, ...newResponse } = response;
    res.cookie("refresh_token", refresh_token, {
      httpOnly: true,
      secure: false, // Set to true if using HTTPS
      // secure: true, // Uncomment this line if your server is using HTTPS
      sameSite: "strict",
    });

    console.log("response", newResponse);
    return res.status(201).json(newResponse);
  } catch (error) {
    return res.status(500).json({ message: "Server error when login", error });
  }
};
const updateUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const data = req.body;
    if (!userId) {
      return res.status(200).json({
        status: "Err",
        message: "the userId is required",
      });
    }
    console.log("data", data);
    console.log("userId", userId);

    const response = await UserService.updateUser(userId, data);
    const { refresh_token, ...newResponse } = response;
    response.cookies("refresh_token", refresh_token, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
    });
    return res.status(200).json(newResponse);
  } catch (error) {
    return res.status(404).json({ message: "Server error", error });
  }
};
const deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;
    if (!userId) {
      return res.status(200).json({
        status: "Err",
        message: "the userId is required",
      });
    }

    const response = await UserService.deleteUser(userId);
    return res.status(200).json(response);
  } catch (error) {
    return res.status(404).json({ message: "Server error", error });
  }
};
const getAllUser = async (req, res) => {
  try {
    const response = await UserService.getAllUser();
    return res.status(200).json(response);
  } catch (error) {
    return res.status(404).json({ message: "Server error", error });
  }
};
const getDetailUser = async (req, res) => {
  try {
    const userId = req.params.id;
    if (!userId) {
      return res.status(400).json({
        status: "Err",
        message: "User ID is required",
      });
    }

    const response = await UserService.getDetailUser(userId);
    return res.status(200).json(response); // Đảm bảo trả về username và các thông tin cần thiết
  } catch (error) {
    return res.status(500).json({ message: "Server error", error });
  }
};
const refreshToken = async (req, res) => {
  try {
    const token = req.cookies.refresh_token;
    if (!token) {
      return res.status(200).json({
        status: "Err",
        message: "the token is required",
      });
    }

    const response = await UserService.refreshToken(token);
    return res.status(200).json(response);
  } catch (error) {
    return res
      .status(404)
      .json({ message: "Error when get refresh token", error });
  }
};
const logoutUser = async (req, res) => {
  try {
    res.clearCookie("refresh_token", {
      httpOnly: true,
      secure: false, // Set to true if using HTTPS
      sameSite: "strict",
    });
    const response = await UserService.logoutUser();
    return res.status(200).json({
      status: "Ok",
      message: "Logout success",
      data: response,
    });
  } catch (error) {
    return res.status(404).json({ message: "Server error", error });
  }
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
