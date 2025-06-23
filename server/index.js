const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const path = require("path");
const logger = require("morgan"); // From app.js

// --- Configure dotenv
dotenv.config();

// --- Import custom modules\
const connectDB = require("./src/config/connect");
const mainRoutes = require("./src/routes");
const vnpayRoutes = require("./src/routes/order"); // From app.js

// --- Initialize Express app
const app = express();
const port = process.env.PORT || 3001;

// --- Connect to Database
mongoose.set("strictQuery", false);
connectDB();

// --- View engine setup (for VNPay templates from app.js)
app.set("views", path.join(__dirname, "src/views"));
app.set("view engine", "jade");

// --- Middlewares
app.use(logger("dev")); // From app.js
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
// For VNPay assets (from app.js)
app.use(express.static(path.join(__dirname, "src/public")));

// --- Routes
mainRoutes(app); // Main application routes
app.use("/order", vnpayRoutes); // VNPay routes from app.js

// --- Error Handling (from app.js)
// Catch 404 and forward to error handler
app.use(function (req, res, next) {
  const err = new Error("Not Found");
  err.status = 404;
  next(err);
});

// General error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

// --- Start server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
