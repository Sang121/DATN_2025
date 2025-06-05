const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config();
mongoose.set("strictQuery", false);
const cors = require("cors");
const connectDB = require("./src/config/connect");
const routes = require("./src/routes");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const path = require("path"); // Import path module

const app = express();
const port = process.env.PORT || 3001;

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  })
);
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
console.log(
  "Serving static files from:",
  path.join(__dirname, "..", "uploads")
);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

connectDB();
routes(app);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
