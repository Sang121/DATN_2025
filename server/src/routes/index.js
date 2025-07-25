const userRouter = require("./userRouter");
const productRouter = require("./productRouter");
const orderRouter = require("./orderRouter");
const ChatbotRouter = require("./ChatbotRouter");
const statisticsRouter = require("./statisticsRouter");
const statisticsAdvancedRouter = require("./statisticsAdvancedRouter");

const routes = (app) => {
  app.use("/api/user", userRouter);
  app.use("/api/product", productRouter);
  app.use("/api/order", orderRouter);
  app.use("/api/ai", ChatbotRouter);
  app.use("/api/statistics", statisticsRouter);
  app.use("/api/statistics/advanced", statisticsAdvancedRouter);
};
module.exports = routes;
