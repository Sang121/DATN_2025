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
        message: "The input is required",
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
    return res.status(500).json({ message: error.message, error });
  }
};
const loginUser = async (req, res) => {
  try {
    const { identifier, password } = req.body;
    if (!identifier || !password) {
      return res.status(400).json({
        status: "Err",
        message: "The input is required",
      });
    }

    const loginData = { identifier, password };

    console.log("loginData", loginData);
    const response = await UserService.loginUser(loginData);
    const { refresh_token, ...newResponse } = response;
    res.cookie("refresh_token", refresh_token, {
      httpOnly: true,
      secure: false,
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
      return res.status(400).json({
        status: "Err",
        message: "the userId is required",
      });
    }

    const response = await UserService.updateUser(userId, data);
    // Bóc tách access_token và refresh_token từ phản hồi của UserService
    const { refresh_token, access_token, ...restResponse } = response;

    // Set refresh_token vào cookie
    res.cookie("refresh_token", refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // Đặt secure: true trong production
      sameSite: "strict",
    });

    // Trả về access_token trong body của response cho frontend
    return res.status(200).json({ ...restResponse, access_token });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
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
    return res.status(200).json(response);
  } catch (error) {
    return res.status(500).json({ message: "Server error", error });
  }
};
const refreshToken = async (req, res) => {
  try {
    const token = req.cookies.refresh_token; // Lấy token từ cookie
    if (!token) {
      return res.status(401).json({ message: "No refresh token found" });
    }
    const response = await UserService.refreshToken(token);
    return res.status(200).json(response);
  } catch (error) {
    return res
      .status(401)
      .json({ message: error.message || "Error refreshing token" });
  }
};

const logoutUser = async (req, res) => {
  try {
    res.clearCookie("refresh_token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // Đặt secure: true trong production
      sameSite: "strict",
    });
    return res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
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
