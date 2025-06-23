const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const path = require("path");
const logger = require("morgan");

// --- Configure dotenv
dotenv.config();

// --- Import custom modules
const connectDB = require("./src/config/connect");
const mainRoutes = require("./src/routes");

// --- Initialize Express app
const app = express();
const port = process.env.PORT || 3001;

// --- Connect to Database
mongoose.set("strictQuery", false);
connectDB();

// --- Middlewares
app.use(logger("dev"));
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  })
);
app.use(cookieParser());

// --- Static folders
// For user-uploaded content
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// --- Routes
mainRoutes(app); // Main application routes

// --- Error Handling
// Catch 404 and forward to error handler
app.use(function (req, res, next) {
  const err = new Error("Not Found");
  err.status = 404;
  next(err);
});

// General error handler
app.use(function (err, req, res, next) {
  res.status(err.status || 500).json({
    message: err.message,
    error: req.app.get("env") === "development" ? err : {},
  });
});

// --- Start server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
