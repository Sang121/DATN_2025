const dotenv = require("dotenv");
dotenv.config();
const { GoogleGenerativeAI } = require("@google/generative-ai");
const Product = require("../models/productModel");
const User = require("../models/userModel");
const Order = require("../models/orderModel");
const mongoose = require("mongoose"); // Imported for potential aggregation helpers if needed, though not directly used for basic models
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

// A simple in-memory store for conversation history.
// IMPORTANT: In a production application, this should be replaced with a persistent storage
// like a database (e.g., MongoDB, Redis) or a proper session management system,
// as in-memory storage will be lost when the server restarts or scales.
const conversationHistory = {}; // Key: userId, Value: Array of { role: 'user' | 'model', parts: [{ text: '...' }] }

/**
 * Handles chat interactions for regular users (customers).
 * Provides information about products based on available data.
 * Maintains conversation context.
 */
const UserChatbot = async (req, res) => {
  const { question, userId } = req.body; // userId is crucial for conversation history

  // Basic input validation
  if (!question) {
    return res.status(400).json({ error: "Question is required" });
  }
  if (!userId) {
    return res
      .status(400)
      .json({ error: "User ID is required for conversation history" });
  }

  // Initialize history for the user if it doesn't exist
  if (!conversationHistory[userId]) {
    conversationHistory[userId] = [];
  }

  try {
    // Fetch product data for the customer-facing chatbot
    const products = await Product.find({});
    const orderData = await Order.find({ user: userId });

    // Format product data more concisely
    const productData = products
      .filter((product) => product.totalStock > 0) // Only show in-stock products
      .slice(0, 20) // Limit to 20 products to keep prompt manageable
      .map((product) => {
        const availableVariants = product.variants.filter((v) => v.stock > 0);
        const sizeOptions = [
          ...new Set(availableVariants.map((v) => v.size)),
        ].join(", ");
        const colorOptions = [
          ...new Set(availableVariants.map((v) => v.color)),
        ].join(", ");

        return `• ${product.name} - ${product.price.toLocaleString()}đ ${
          product.discount > 0 ? `(Giảm ${product.discount}%)` : ""
        }
   Danh mục: ${product.category} | Giới tính: ${product.gender} | Đã bán: ${
     product.sold
   }
   Size: ${sizeOptions || "N/A"} | Màu: ${colorOptions || "N/A"}`;
      })
      .join("\n");

    const orderDataString = orderData
      .slice(-3) // Only show last 3 orders
      .map(
        (order) =>
          `• Đơn ${order._id
            .toString()
            .slice(-6)} - ${order.createdAt.toLocaleDateString(
            "vi-VN"
          )} - ${order.totalPrice.toLocaleString()}đ - ${order.orderStatus}`
      )
      .join("\n");

    // Initialize the chat session with the model, providing the conversation history
    const chat = genAI
      .getGenerativeModel({ model: "gemini-2.0-flash" })
      .startChat({
        history: conversationHistory[userId],
        generationConfig: {
          maxOutputTokens: 400, // Reduced for more concise responses
          temperature: 0.8, // Slightly higher for more creative suggestions
          topP: 0.9,
          topK: 40,
        },
      });

    // Define the prompt for the user chatbot
    const promptText = `
      Bạn là một trợ lý bán hàng chuyên nghiệp và thân thiện của cửa hàng S-Fashion.  
      Nhiệm vụ của bạn là tư vấn sản phẩm và giải đáp các thắc mắc liên quan đến sản phẩm cho khách hàng.

      Đây là danh sách sản phẩm hiện có trong cửa hàng:
      ${productData}
      Đây là thông tin đơn hàng của khách hàng:
      ${orderDataString || "Chưa có đơn hàng nào."}

      🎯 VAI TRÒ CỦA BẠN:
      • Tư vấn sản phẩm phù hợp với nhu cầu và ngân sách khách hàng
      • Gợi ý phối đồ theo từng dịp: công sở, dạo phố, hẹn hò, dự tiệc
      • Tư vấn size, màu sắc dựa trên sở thích cá nhân
      • Giải đáp thắc mắc về chất liệu, cách bảo quản sản phẩm
      • Hỗ trợ đặt hàng và theo dõi đơn hàng hiện có

      💡 CÁCH TƯ VẤN:
      • Hỏi rõ dịp sử dụng, sở thích màu sắc, ngân sách
      • Đề xuất 2-3 sản phẩm phù hợp với giải thích lý do
      • Gợi ý cách phối đồ tạo nhiều outfit khác nhau
      • Thông báo tình trạng còn hàng và khuyến mãi (nếu có)

      🚫 GIỚI HẠN:
      • Không tư vấn về thanh toán, vận chuyển, đổi trả (chuyển sang CSKH)
      • Không thảo luận chủ đề ngoài thời trang
      • Chỉ đề xuất sản phẩm có trong danh sách

      Hãy trả lời ngắn gọn, thân thiện và hữu ích. Sử dụng emoji để tạo sự sinh động.

      Câu hỏi: ${question}
    `;

    // Send the prompt to the generative model
    const result = await chat.sendMessage(promptText);
    let answer = result.response.text();

    // Add helpful suggestions if the response is too short
    if (answer.length < 100 && !question.toLowerCase().includes("cảm ơn")) {
      answer +=
        "\n\n💭 Bạn có muốn tôi gợi ý thêm sản phẩm phù hợp hoặc cách phối đồ không?";
    }

    // Store the current turn (user question and AI answer) in history for future context
    conversationHistory[userId].push({
      role: "user",
      parts: [{ text: question }],
    });
    conversationHistory[userId].push({
      role: "model",
      parts: [{ text: answer }],
    });

    // Limit conversation history to prevent memory issues
    if (conversationHistory[userId].length > 20) {
      conversationHistory[userId] = conversationHistory[userId].slice(-20);
    }

    res.status(200).json({ answer });
  } catch (error) {
    console.error("Error occurred while processing user chat:", error);
    res
      .status(500)
      .json({ error: "Internal Server Error", details: error.message });
  }
};

/**
 * Handles chat interactions for admin users.
 * Provides analytical data, statistics, and reports about the store.
 * Focuses on performance by aggregating data efficiently.
 */
const AdminChatbot = async (req, res) => {
  const { question, userId } = req.body;

  if (!question) {
    return res.status(400).json({ error: "Question is required" });
  }
  if (!userId) {
    return res
      .status(400)
      .json({ error: "User ID is required for conversation history" });
  }

  // Initialize history for the admin if it doesn't exist
  if (!conversationHistory[userId]) {
    conversationHistory[userId] = [];
  }

  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      0,
      23,
      59,
      59
    );

    const totalProducts = await Product.countDocuments();
    const topSellingProducts = await Product.find()
      .sort({ sold: -1 })
      .limit(5)
      .select("name sold");
    const nearOutOfStockProducts = await Product.find({ stock: { $lt: 5 } })
      .sort({ sold: -1 })
      .select("name sold");

    const totalOrders = await Order.countDocuments();
    const pendingOrders = await Order.countDocuments({
      orderStatus: "pending",
    });
    const completedOrders = await Order.countDocuments({
      orderStatus: "delivered",
    });
    const processingOrders = await Order.countDocuments({
      orderStatus: "processing",
    });

    const totalRevenueResult = await Order.aggregate([
      { $match: { orderStatus: "delivered" } },
      { $group: { _id: null, total: { $sum: "$totalPrice" } } },
    ]);
    const totalRevenue =
      totalRevenueResult.length > 0 ? totalRevenueResult[0].total : 0;

    const monthlyRevenueResult = await Order.aggregate([
      {
        $match: {
          orderStatus: "delivered",
          createdAt: { $gte: startOfMonth, $lte: endOfMonth },
        },
      },
      { $group: { _id: null, total: { $sum: "$totalPrice" } } },
    ]);
    const monthlyRevenue =
      monthlyRevenueResult.length > 0 ? monthlyRevenueResult[0].total : 0;

    // Aggregate User Data
    const totalUsers = await User.countDocuments();
    const totalAdmins = await User.countDocuments({ isAdmin: true });

    // Store aggregated data in an object
    const aggregatedData = {
      totalProducts,
      nearOutOfStockProducts,
      topSellingProducts:
        topSellingProducts
          .map((p) => `${p.name} (${p.sold} đã bán)`)
          .join(", ") || "Chưa có sản phẩm nào được bán",
      totalOrders,
      pendingOrders,
      completedOrders,
      totalRevenue: totalRevenue.toLocaleString("vi-VN") + " VND",
      monthlyRevenue: monthlyRevenue.toLocaleString("vi-VN") + " VND",
      currentMonth: now.getMonth() + 1,
      currentYear: now.getFullYear(),
      totalUsers,
      totalAdmins,
    };

    // Format aggregated data into a string for the prompt
    const aggregatedDataString = `
    --- Dữ liệu Tổng Quan Cửa Hàng (Cập nhật tới ${new Date().toLocaleDateString(
      "vi-VN"
    )}) ---
    - Tổng số sản phẩm: ${aggregatedData.totalProducts}
    - 5 sản phẩm bán chạy nhất: ${aggregatedData.topSellingProducts}
    - Sản phẩm sắp hết hàng( dưới 5 sản phẩm tồn kho): ${
      aggregatedData.nearOutOfStockProducts
        .map((p) => `${p.name} (${p.sold} đã bán)`)
        .join(", ") || "Chưa có sản phẩm nào sắp hết hàng"
    }
    - Tổng số đơn hàng: ${aggregatedData.totalOrders}
    - Đơn hàng đang chờ xử lý: ${aggregatedData.pendingOrders}
    - Đơn hàng đang được giao: ${aggregatedData.processingOrders}
    - Đơn hàng đã giao: ${aggregatedData.completedOrders}
    - Tổng doanh thu (tất cả thời gian, đơn đã giao): ${
      aggregatedData.totalRevenue
    }
    - Doanh thu tháng ${aggregatedData.currentMonth}/${
      aggregatedData.currentYear
    } (đơn đã giao): ${aggregatedData.monthlyRevenue}
    - Tổng số người dùng: ${aggregatedData.totalUsers}
    - Số lượng quản trị viên: ${aggregatedData.totalAdmins}
    --- Hết Dữ liệu Tổng Quan ---
    `;

    // Initialize the chat session for Admin, providing the conversation history
    const chat = genAI
      .getGenerativeModel({ model: "gemini-2.0-flash" })
      .startChat({
        history: conversationHistory[userId],
        generationConfig: {
          maxOutputTokens: 1000, // Allow longer responses for detailed reports
          temperature: 0.7, // Maintain natural conversation
        },
      });

    // Define the prompt for the Admin chatbot
    const promptText = `
      Bạn là một trợ lý quản lý (Admin Chatbot) chuyên nghiệp và thông minh cho cửa hàng S-Fashion.
      Nhiệm vụ của bạn là hỗ trợ quản trị viên (Admin) bằng cách phân tích, thống kê, và cung cấp các báo cáo bán hàng dựa trên dữ liệu cửa hàng.

      ${aggregatedDataString}

      Bạn có thể cung cấp các thông tin sau:
      - Các số liệu tổng quan về cửa hàng (doanh thu, số đơn, sản phẩm bán chạy, tồn kho...).
      - Báo cáo doanh số theo tháng/năm.
      - Thống kê về đơn hàng (tổng, chờ xử lý, đã hoàn thành).
      - Thống kê người dùng.
      - Đề xuất các hành động dựa trên dữ liệu (ví dụ: nhập hàng, giảm giá sản phẩm sắp hết hàng).
      - Đề xuất các chiến lược kinh doanh dựa trên xu hướng bán hàng.
      Khi Admin hỏi về thông tin, hãy sử dụng dữ liệu tổng quan đã cung cấp ở trên để trả lời.

      Khi Admin hỏi về thông tin mà bạn có thể cung cấp từ dữ liệu tổng quan trên, hãy trả lời trực tiếp, rõ ràng và sử dụng các số liệu đã cung cấp.
      Nếu Admin hỏi về thông tin chi tiết hơn (ví dụ: doanh số của một tháng cụ thể không phải tháng hiện tại, danh sách chi tiết tất cả các đơn hàng Pending, thông tin của một người dùng cụ thể, hoặc thông tin sản phẩm chi tiết không có trong top bán chạy) mà dữ liệu tổng hợp hiện tại chưa có, hãy yêu cầu Admin cung cấp thêm chi tiết (ví dụ: "Bạn muốn xem doanh số tháng nào?", "Mã đơn hàng bạn muốn tra cứu là gì?") hoặc thông báo rằng bạn chỉ có thể cung cấp dữ liệu tổng quan để tối ưu hiệu suất và tránh tải quá nhiều dữ liệu.

      Đảm bảo câu trả lời của bạn luôn ở trong ngữ cảnh của cuộc trò chuyện và cực kỳ hữu ích cho Admin. Đợi Admin hỏi rồi mới trả lời, không tự động cung cấp thông tin nếu không có câu hỏi cụ thể.
      Nếu câu hỏi không liên quan đến quản lý cửa hàng hoặc dữ liệu kinh doanh, hãy lịch sự từ chối và khuyên Admin tập trung vào các vấn đề quản lý.

      Câu hỏi của Admin: ${question}
    `;

    // Send the prompt to the generative model
    const result = await chat.sendMessage(promptText);
    const answer = result.response.text();

    // Store the current turn (user question and AI answer) in history for future context
    conversationHistory[userId].push({
      role: "user",
      parts: [{ text: question }],
    });
    conversationHistory[userId].push({
      role: "model",
      parts: [{ text: answer }],
    });

    res.status(200).json({ answer });
  } catch (error) {
    console.error("Error occurred while processing admin chat:", error);
    res
      .status(500)
      .json({ error: "Internal Server Error", details: error.message });
  }
};

module.exports = {
  UserChatbot,
  AdminChatbot,
};
