const Order = require("../models/orderModel");
const Product = require("../models/productModel");
const User = require("../models/userModel");
const moment = require("moment");

/**
 * Lấy tổng quan doanh số
 */
const getOverviewStats = () => {
  return new Promise(async (resolve, reject) => {
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
      const startOfLastMonth = new Date(
        now.getFullYear(),
        now.getMonth() - 1,
        1
      );
      const endOfLastMonth = new Date(
        now.getFullYear(),
        now.getMonth(),
        0,
        23,
        59,
        59
      );

      // Tổng doanh thu
      const totalRevenueResult = await Order.aggregate([
        { $match: { orderStatus: "delivered" } },
        { $group: { _id: null, total: { $sum: "$totalPrice" } } },
      ]);
      const totalRevenue =
        totalRevenueResult.length > 0 ? totalRevenueResult[0].total : 0;

      // Doanh thu tháng này
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

      // Doanh thu tháng trước
      const lastMonthRevenueResult = await Order.aggregate([
        {
          $match: {
            orderStatus: "delivered",
            createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth },
          },
        },
        { $group: { _id: null, total: { $sum: "$totalPrice" } } },
      ]);
      const lastMonthRevenue =
        lastMonthRevenueResult.length > 0 ? lastMonthRevenueResult[0].total : 0;

      // Tổng số đơn hàng
      const totalOrders = await Order.countDocuments();
      const monthlyOrders = await Order.countDocuments({
        createdAt: { $gte: startOfMonth, $lte: endOfMonth },
      });
      const lastMonthOrders = await Order.countDocuments({
        createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth },
      });

      // Tổng số sản phẩm đã bán
      const totalProductsSoldResult = await Order.aggregate([
        { $match: { orderStatus: "delivered" } },
        { $unwind: "$items" },
        { $group: { _id: null, total: { $sum: "$items.amount" } } },
      ]);
      const totalProductsSold =
        totalProductsSoldResult.length > 0
          ? totalProductsSoldResult[0].total
          : 0;

      // Tổng số khách hàng
      const totalCustomers = await User.countDocuments({ isAdmin: false });

      // Low stock products (less than 10 items)
      const lowStockProducts = await Product.countDocuments({ totalStock: { $lt: 10 } });
      
      // Average order value
      const avgOrderValueResult = await Order.aggregate([
        { $match: { orderStatus: "delivered" } },
        { $group: { _id: null, avgValue: { $avg: "$totalPrice" } } },
      ]);
      const averageOrderValue = avgOrderValueResult.length > 0 ? avgOrderValueResult[0].avgValue : 0;

      // Tính phần trăm thay đổi (FIX: Division by zero và logic error)
      const revenueGrowth =
        lastMonthRevenue > 0
          ? parseFloat(
              ((monthlyRevenue - lastMonthRevenue) / lastMonthRevenue) * 100
            ).toFixed(2)
          : monthlyRevenue > 0 ? 100 : 0; // Nếu tháng trước = 0 mà tháng này > 0 thì tăng 100%

      const orderGrowth =
        lastMonthOrders > 0
          ? parseFloat(
              ((monthlyOrders - lastMonthOrders) / lastMonthOrders) * 100
            ).toFixed(2)
          : monthlyOrders > 0 ? 100 : 0; // Nếu tháng trước = 0 mà tháng này > 0 thì tăng 100%

      // Calculate conversion rate (delivered orders / total orders)
      const deliveredOrdersCount = await Order.countDocuments({ orderStatus: "delivered" });
      const conversionRate = totalOrders > 0 ? 
        parseFloat((deliveredOrdersCount / totalOrders * 100).toFixed(2)) : 0;

      resolve({
        status: "Ok",
        message: "Overview statistics retrieved successfully",
        data: {
          // Main metrics
          totalRevenue: Math.round(totalRevenue) || 0,
          monthlyRevenue: Math.round(monthlyRevenue) || 0,
          revenueGrowth: parseFloat(revenueGrowth) || 0,
          totalOrders: totalOrders || 0,
          monthlyOrders: monthlyOrders || 0,
          ordersGrowth: parseFloat(orderGrowth) || 0, // Fix: ordersGrowth thay vì orderGrowth
          totalProductsSold: totalProductsSold || 0,
          totalCustomers: totalCustomers || 0,
          newCustomers: monthlyOrders || 0, // Estimate new customers as monthly orders
          avgOrderValue: Math.round(averageOrderValue) || 0,
          customersGrowth: 0, // TODO: Calculate customer growth
          aovGrowth: 0, // TODO: Calculate AOV growth
          lowStockProducts: lowStockProducts || 0,
          conversionRate: conversionRate || 0,
          completedOrders: deliveredOrdersCount || 0,
          // Additional metrics for better insights
          metrics: {
            revenuePerCustomer: totalCustomers > 0 ? Math.round(totalRevenue / totalCustomers) : 0,
            ordersPerCustomer: totalCustomers > 0 ? parseFloat((totalOrders / totalCustomers).toFixed(2)) : 0,
            lastMonthRevenue: Math.round(lastMonthRevenue) || 0,
            lastMonthOrders: lastMonthOrders || 0,
            averageDailyRevenue: Math.round(monthlyRevenue / 30) || 0,
            averageDailyOrders: Math.round(monthlyOrders / 30) || 0,
          },
        },
      });
    } catch (error) {
      reject({
        status: "Err",
        message: "Error retrieving overview statistics",
        error: error.message,
      });
    }
  });
};

/**
 * Lấy doanh số theo thời gian (7 ngày, 30 ngày, 12 tháng)
 */
const getRevenueByPeriod = (period = "7days") => {
  return new Promise(async (resolve, reject) => {
    try {
      let matchStage = { orderStatus: "delivered" };
      let groupStage, sortStage, limitStage;
      const now = new Date();

      switch (period) {
        case "7days":
          const sevenDaysAgo = new Date(
            now.getTime() - 7 * 24 * 60 * 60 * 1000
          );
          matchStage.createdAt = { $gte: sevenDaysAgo };
          groupStage = {
            _id: {
              year: { $year: "$createdAt" },
              month: { $month: "$createdAt" },
              day: { $dayOfMonth: "$createdAt" },
            },
            revenue: { $sum: "$totalPrice" },
            orders: { $sum: 1 },
          };
          sortStage = { "_id.year": 1, "_id.month": 1, "_id.day": 1 };
          break;

        case "30days":
          const thirtyDaysAgo = new Date(
            now.getTime() - 30 * 24 * 60 * 60 * 1000
          );
          matchStage.createdAt = { $gte: thirtyDaysAgo };
          groupStage = {
            _id: {
              year: { $year: "$createdAt" },
              month: { $month: "$createdAt" },
              day: { $dayOfMonth: "$createdAt" },
            },
            revenue: { $sum: "$totalPrice" },
            orders: { $sum: 1 },
          };
          sortStage = { "_id.year": 1, "_id.month": 1, "_id.day": 1 };
          break;

        case "12months":
          const twelveMonthsAgo = new Date(
            now.getFullYear() - 1,
            now.getMonth(),
            1
          );
          matchStage.createdAt = { $gte: twelveMonthsAgo };
          groupStage = {
            _id: {
              year: { $year: "$createdAt" },
              month: { $month: "$createdAt" },
            },
            revenue: { $sum: "$totalPrice" },
            orders: { $sum: 1 },
          };
          sortStage = { "_id.year": 1, "_id.month": 1 };
          break;

        default:
          return reject({
            status: "Err",
            message: "Invalid period. Use '7days', '30days', or '12months'",
          });
      }

      const revenueData = await Order.aggregate([
        { $match: matchStage },
        { $group: groupStage },
        { $sort: sortStage },
      ]);

      // Format dữ liệu trả về
      const formattedData = revenueData.map((item) => {
        let date, sortKey;
        if (period === "12months") {
          date = moment([item._id.year, item._id.month - 1]).format("MM/YYYY");
          sortKey = `${item._id.year}-${String(item._id.month).padStart(2, '0')}`;
        } else {
          date = moment([
            item._id.year,
            item._id.month - 1,
            item._id.day,
          ]).format("DD/MM/YYYY");
          sortKey = `${item._id.year}-${String(item._id.month).padStart(2, '0')}-${String(item._id.day).padStart(2, '0')}`;
        }

        return {
          date,
          revenue: Math.round(item.revenue),
          orders: item.orders,
          averageOrderValue: item.orders > 0 ? Math.round(item.revenue / item.orders) : 0,
          sortKey,
        };
      });

      // Sort data by sortKey to ensure proper chronological order
      formattedData.sort((a, b) => a.sortKey.localeCompare(b.sortKey));

      // Calculate growth percentages
      const dataWithGrowth = formattedData.map((item, index) => {
        let revenueGrowth = 0;
        let orderGrowth = 0;
        
        if (index > 0) {
          const previousItem = formattedData[index - 1];
          if (previousItem.revenue > 0) {
            revenueGrowth = ((item.revenue - previousItem.revenue) / previousItem.revenue * 100).toFixed(2);
          }
          if (previousItem.orders > 0) {
            orderGrowth = ((item.orders - previousItem.orders) / previousItem.orders * 100).toFixed(2);
          }
        }
        
        return {
          ...item,
          revenueGrowth: parseFloat(revenueGrowth),
          orderGrowth: parseFloat(orderGrowth),
        };
      });

      // Calculate summary statistics
      const totalRevenue = formattedData.reduce((sum, item) => sum + item.revenue, 0);
      const totalOrders = formattedData.reduce((sum, item) => sum + item.orders, 0);
      const averageRevenue = formattedData.length > 0 ? totalRevenue / formattedData.length : 0;

      resolve({
        status: "Ok",
        message: `Revenue data for ${period} retrieved successfully`,
        data: dataWithGrowth,
        summary: {
          totalRevenue: Math.round(totalRevenue),
          totalOrders,
          averageRevenue: Math.round(averageRevenue),
          period,
          dataPoints: formattedData.length,
        },
      });
    } catch (error) {
      reject({
        status: "Err",
        message: "Error retrieving revenue by period",
        error: error.message,
      });
    }
  });
};

/**
 * Lấy top sản phẩm bán chạy
 */
const getTopSellingProducts = (limit = 10) => {
  return new Promise(async (resolve, reject) => {
    try {
      const topProducts = await Product.find()
        .sort({ sold: -1 })
        .limit(limit)
        .select("name sold totalStock price discount images category");

      const processedProducts = topProducts.map((product) => {
        const baseURL =
          process.env.VITE_API_URL ||
          `http://localhost:${process.env.PORT || 3001}`;
        let imageUrl = null;

        if (product.images && product.images.length > 0) {
          // Remove any leading slash and normalize path
          const normalizedPath = product.images[0].replace(/^\/+|\\+/g, '').replace(/\\/g, "/");
          imageUrl = `${baseURL}/uploads/${normalizedPath}`;
        }

        // Calculate accurate revenue based on actual sold quantity and discounted price
        const finalPrice = product.price * (1 - product.discount / 100);
        const revenue = product.sold * finalPrice;

        return {
          _id: product._id,
          name: product.name,
          sold: product.sold,
          totalStock: product.totalStock,
          price: product.price,
          discount: product.discount,
          category: product.category,
          image: imageUrl,
          revenue: Math.round(revenue),
          finalPrice: Math.round(finalPrice),
          // Add growth calculation (can be enhanced with historical data)
          growth: 0, // Placeholder for growth calculation
        };
      });

      resolve({
        status: "Ok",
        message: "Top selling products retrieved successfully",
        data: processedProducts,
      });
    } catch (error) {
      reject({
        status: "Err",
        message: "Error retrieving top selling products",
        error: error.message,
      });
    }
  });
};

/**
 * Lấy thống kê theo danh mục sản phẩm
 */
const getCategoryStats = () => {
  return new Promise(async (resolve, reject) => {
    try {
      // Thống kê doanh số theo danh mục từ đơn hàng đã giao
      const categoryRevenue = await Order.aggregate([
        { $match: { orderStatus: "delivered" } },
        { $unwind: "$items" },
        {
          $lookup: {
            from: "products",
            localField: "items.product",
            foreignField: "_id",
            as: "productInfo",
          },
        },
        { $unwind: "$productInfo" },
        {
          $group: {
            _id: "$productInfo.category",
            revenue: {
              $sum: { $multiply: ["$items.amount", "$items.newPrice"] },
            },
            totalSold: { $sum: "$items.amount" },
            orders: { $sum: 1 },
          },
        },
        { $sort: { revenue: -1 } },
      ]);

      // Thống kê tồn kho theo danh mục
      const categoryStock = await Product.aggregate([
        {
          $group: {
            _id: "$category",
            totalProducts: { $sum: 1 },
            totalStock: { $sum: "$totalStock" },
            averagePrice: { $avg: "$price" },
          },
        },
      ]);

      // Calculate total revenue for percentage calculations
      const totalRevenue = categoryRevenue.reduce((sum, item) => sum + item.revenue, 0);

      // Kết hợp dữ liệu
      const categoryStats = categoryRevenue.map((revItem) => {
        const stockItem = categoryStock.find(
          (stock) => stock._id === revItem._id
        );
        
        // Calculate percentage
        const percentage = totalRevenue > 0 ? ((revItem.revenue / totalRevenue) * 100).toFixed(2) : 0;
        
        return {
          category: revItem._id || "Không xác định",
          revenue: Math.round(revItem.revenue),
          totalSold: revItem.totalSold,
          orders: revItem.orders,
          totalProducts: stockItem ? stockItem.totalProducts : 0,
          totalStock: stockItem ? stockItem.totalStock : 0,
          averagePrice: stockItem ? Math.round(stockItem.averagePrice) : 0,
          percentage: parseFloat(percentage),
          // Add color for frontend charts
          color: `#${Math.floor(Math.random()*16777215).toString(16)}`,
        };
      });

      resolve({
        status: "Ok",
        message: "Category statistics retrieved successfully",
        data: categoryStats,
        summary: {
          totalCategories: categoryStats.length,
          totalRevenue: Math.round(totalRevenue),
        },
      });
    } catch (error) {
      reject({
        status: "Err",
        message: "Error retrieving category statistics",
        error: error.message,
      });
    }
  });
};

/**
 * Lấy thống kê trạng thái đơn hàng
 */
const getOrderStatusStats = () => {
  return new Promise(async (resolve, reject) => {
    try {
      const statusStats = await Order.aggregate([
        {
          $group: {
            _id: "$orderStatus",
            count: { $sum: 1 },
            totalValue: { $sum: "$totalPrice" },
          },
        },
        { $sort: { count: -1 } },
      ]);

      // Status translation mapping
      const statusTranslation = {
        pending: "Chờ xử lý",
        processing: "Đang xử lý", 
        shipped: "Đã gửi",
        delivered: "Đã giao",
        cancelled: "Đã hủy",
        returned: "Đã trả",
      };

      // Color mapping for frontend
      const statusColors = {
        pending: "#ffa726",
        processing: "#42a5f5",
        shipped: "#66bb6a",
        delivered: "#4caf50",
        cancelled: "#ef5350",
        returned: "#ff7043",
      };

      const totalOrders = statusStats.reduce((sum, stat) => sum + stat.count, 0);
      const totalValue = statusStats.reduce((sum, stat) => sum + stat.totalValue, 0);

      const formattedStats = statusStats.map((stat) => {
        const percentage = totalOrders > 0 ? ((stat.count / totalOrders) * 100).toFixed(2) : 0;
        
        return {
          status: stat._id,
          statusName: statusTranslation[stat._id] || stat._id,
          count: stat.count,
          totalValue: Math.round(stat.totalValue),
          percentage: parseFloat(percentage),
          color: statusColors[stat._id] || "#9e9e9e",
        };
      });

      resolve({
        status: "Ok",
        message: "Order status statistics retrieved successfully",
        data: formattedStats,
        summary: {
          totalOrders,
          totalValue: Math.round(totalValue),
        },
      });
    } catch (error) {
      reject({
        status: "Err",
        message: "Error retrieving order status statistics",
        error: error.message,
      });
    }
  });
};

/**
 * Lấy thống kê khách hàng
 */
const getCustomerStats = () => {
  return new Promise(async (resolve, reject) => {
    try {
      // Top khách hàng theo tổng giá trị đơn hàng
      const topCustomers = await Order.aggregate([
        { $match: { orderStatus: "delivered" } },
        {
          $group: {
            _id: "$user",
            totalSpent: { $sum: "$totalPrice" },
            totalOrders: { $sum: 1 },
            averageOrderValue: { $avg: "$totalPrice" },
          },
        },
        { $sort: { totalSpent: -1 } },
        { $limit: 10 },
        {
          $lookup: {
            from: "users",
            localField: "_id",
            foreignField: "_id",
            as: "userInfo",
          },
        },
        { $unwind: "$userInfo" },
        {
          $project: {
            _id: 1,
            totalSpent: 1,
            totalOrders: 1,
            averageOrderValue: 1,
            username: "$userInfo.username",
            email: "$userInfo.email",
            fullName: "$userInfo.fullName",
            createdAt: "$userInfo.createdAt",
          },
        },
      ]);

      // Thống kê khách hàng mới theo tháng (12 tháng gần nhất)
      const now = new Date();
      const twelveMonthsAgo = new Date(now.getFullYear() - 1, now.getMonth(), 1);

      const monthlyNewCustomers = await User.aggregate([
        {
          $match: {
            isAdmin: false,
            createdAt: { $gte: twelveMonthsAgo },
          },
        },
        {
          $group: {
            _id: {
              year: { $year: "$createdAt" },
              month: { $month: "$createdAt" },
            },
            count: { $sum: 1 },
          },
        },
        { $sort: { "_id.year": 1, "_id.month": 1 } },
      ]);

      // Customer activity stats
      const totalCustomers = await User.countDocuments({ isAdmin: false });
      const activeCustomers = await Order.distinct("user", { 
        orderStatus: "delivered",
        createdAt: { $gte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) }
      });

      // Format data
      const formattedTopCustomers = topCustomers.map((customer, index) => ({
        rank: index + 1,
        _id: customer._id,
        fullName: customer.fullName || customer.username || "Chưa cập nhật",
        email: customer.email,
        totalSpent: Math.round(customer.totalSpent),
        totalOrders: customer.totalOrders,
        averageOrderValue: Math.round(customer.averageOrderValue),
        customerSince: customer.createdAt,
      }));

      const formattedNewCustomers = monthlyNewCustomers.map((item) => ({
        month: moment([item._id.year, item._id.month - 1]).format("MM/YYYY"),
        count: item.count,
        year: item._id.year,
        monthNumber: item._id.month,
      }));

      resolve({
        status: "Ok",
        message: "Customer statistics retrieved successfully",
        data: {
          topCustomers: formattedTopCustomers,
          monthlyNewCustomers: formattedNewCustomers,
          summary: {
            totalCustomers,
            activeCustomers: activeCustomers.length,
            activePercentage: totalCustomers > 0 ? ((activeCustomers.length / totalCustomers) * 100).toFixed(2) : 0,
          },
        },
      });
    } catch (error) {
      reject({
        status: "Err",
        message: "Error retrieving customer statistics",
        error: error.message,
      });
    }
  });
};

/**
 * Lấy thống kê doanh thu theo khoảng thời gian tùy chỉnh
 */
const getRevenueByDateRange = (startDate, endDate) => {
  return new Promise(async (resolve, reject) => {
    try {
      const start = new Date(startDate);
      const end = new Date(endDate);
      
      if (start > end) {
        return reject({
          status: "Err",
          message: "Start date cannot be after end date",
        });
      }

      const revenueData = await Order.aggregate([
        {
          $match: {
            orderStatus: "delivered",
            createdAt: { $gte: start, $lte: end },
          },
        },
        {
          $group: {
            _id: {
              year: { $year: "$createdAt" },
              month: { $month: "$createdAt" },
              day: { $dayOfMonth: "$createdAt" },
            },
            revenue: { $sum: "$totalPrice" },
            orders: { $sum: 1 },
            averageOrderValue: { $avg: "$totalPrice" },
          },
        },
        { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 } },
      ]);

      const formattedData = revenueData.map((item) => {
        const date = moment([
          item._id.year,
          item._id.month - 1,
          item._id.day,
        ]).format("DD/MM/YYYY");

        return {
          date,
          revenue: Math.round(item.revenue),
          orders: item.orders,
          averageOrderValue: Math.round(item.averageOrderValue),
        };
      });

      const totalRevenue = formattedData.reduce((sum, item) => sum + item.revenue, 0);
      const totalOrders = formattedData.reduce((sum, item) => sum + item.orders, 0);

      resolve({
        status: "Ok",
        message: "Custom date range revenue data retrieved successfully",
        data: formattedData,
        summary: {
          totalRevenue: Math.round(totalRevenue),
          totalOrders,
          averageRevenue: formattedData.length > 0 ? Math.round(totalRevenue / formattedData.length) : 0,
          dateRange: { startDate, endDate },
        },
      });
    } catch (error) {
      reject({
        status: "Err",
        message: "Error retrieving custom date range revenue data",
        error: error.message,
      });
    }
  });
};

/**
 * Lấy thống kê sản phẩm chi tiết
 */
const getProductAnalytics = () => {
  return new Promise(async (resolve, reject) => {
    try {
      // Top products with detailed analytics
      const productAnalytics = await Product.aggregate([
        {
          $lookup: {
            from: "orders",
            let: { productId: "$_id" },
            pipeline: [
              { $match: { orderStatus: "delivered" } },
              { $unwind: "$items" },
              {
                $match: {
                  $expr: { $eq: ["$items.product", "$$productId"] },
                },
              },
              {
                $group: {
                  _id: null,
                  totalSold: { $sum: "$items.amount" },
                  totalRevenue: { $sum: { $multiply: ["$items.amount", "$items.newPrice"] } },
                  orderCount: { $sum: 1 },
                },
              },
            ],
            as: "salesData",
          },
        },
        {
          $addFields: {
            salesInfo: { $arrayElemAt: ["$salesData", 0] },
          },
        },
        {
          $project: {
            name: 1,
            category: 1,
            price: 1,
            discount: 1,
            totalStock: 1,
            sold: 1,
            images: 1,
            actualSold: { $ifNull: ["$salesInfo.totalSold", 0] },
            actualRevenue: { $ifNull: ["$salesInfo.totalRevenue", 0] },
            orderCount: { $ifNull: ["$salesInfo.orderCount", 0] },
            stockStatus: {
              $cond: {
                if: { $lt: ["$totalStock", 10] },
                then: "Low Stock",
                else: { $cond: { if: { $lt: ["$totalStock", 50] }, then: "Medium Stock", else: "High Stock" } },
              },
            },
          },
        },
        { $sort: { actualSold: -1 } },
        { $limit: 20 },
      ]);

      // Product performance metrics
      const totalProducts = await Product.countDocuments();
      const outOfStockProducts = await Product.countDocuments({ totalStock: 0 });
      const lowStockProducts = await Product.countDocuments({ totalStock: { $lt: 10, $gt: 0 } });

      resolve({
        status: "Ok",
        message: "Product analytics retrieved successfully",
        data: {
          products: productAnalytics,
          metrics: {
            totalProducts,
            outOfStockProducts,
            lowStockProducts,
            inStockProducts: totalProducts - outOfStockProducts,
          },
        },
      });
    } catch (error) {
      reject({
        status: "Err",
        message: "Error retrieving product analytics",
        error: error.message,
      });
    }
  });
};

/**
 * Lấy thống kê hiệu suất bán hàng theo thời gian
 */
const getSalesPerformance = (period = "monthly") => {
  return new Promise(async (resolve, reject) => {
    try {
      let groupBy, sortBy, timeRange;
      const now = new Date();

      switch (period) {
        case "daily":
          timeRange = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000); // Last 30 days
          groupBy = {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
            day: { $dayOfMonth: "$createdAt" },
          };
          sortBy = { "_id.year": 1, "_id.month": 1, "_id.day": 1 };
          break;
        case "weekly":
          timeRange = new Date(now.getTime() - 12 * 7 * 24 * 60 * 60 * 1000); // Last 12 weeks
          groupBy = {
            year: { $year: "$createdAt" },
            week: { $week: "$createdAt" },
          };
          sortBy = { "_id.year": 1, "_id.week": 1 };
          break;
        case "monthly":
        default:
          timeRange = new Date(now.getFullYear() - 1, now.getMonth(), 1); // Last 12 months
          groupBy = {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          };
          sortBy = { "_id.year": 1, "_id.month": 1 };
          break;
      }

      const salesData = await Order.aggregate([
        {
          $match: {
            orderStatus: "delivered",
            createdAt: { $gte: timeRange },
          },
        },
        {
          $group: {
            _id: groupBy,
            revenue: { $sum: "$totalPrice" },
            orders: { $sum: 1 },
            averageOrderValue: { $avg: "$totalPrice" },
            totalItems: { $sum: { $sum: "$items.amount" } },
          },
        },
        { $sort: sortBy },
      ]);

      const formattedData = salesData.map((item) => {
        let label;
        if (period === "daily") {
          label = moment([item._id.year, item._id.month - 1, item._id.day]).format("DD/MM");
        } else if (period === "weekly") {
          label = `W${item._id.week}/${item._id.year}`;
        } else {
          label = moment([item._id.year, item._id.month - 1]).format("MM/YYYY");
        }

        return {
          period: label,
          revenue: Math.round(item.revenue),
          orders: item.orders,
          averageOrderValue: Math.round(item.averageOrderValue),
          totalItems: item.totalItems,
          revenuePerItem: item.totalItems > 0 ? Math.round(item.revenue / item.totalItems) : 0,
        };
      });

      resolve({
        status: "Ok",
        message: `Sales performance for ${period} period retrieved successfully`,
        data: formattedData,
        summary: {
          period,
          totalPeriods: formattedData.length,
          averageRevenue: formattedData.length > 0 ? 
            Math.round(formattedData.reduce((sum, item) => sum + item.revenue, 0) / formattedData.length) : 0,
        },
      });
    } catch (error) {
      reject({
        status: "Err",
        message: "Error retrieving sales performance data",
        error: error.message,
      });
    }
  });
};

/**
 * Lấy dashboard summary - kết hợp nhiều thống kê cho trang chủ admin
 */
const getDashboardSummary = () => {
  return new Promise(async (resolve, reject) => {
    try {
      // Get basic overview stats
      const overviewStats = await getOverviewStats();
      
      // Get recent orders (last 7 days)
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      const recentOrders = await Order.find({
        createdAt: { $gte: sevenDaysAgo }
      })
      .populate('user', 'fullName email')
      .sort({ createdAt: -1 })
      .limit(5)
      .select('_id orderStatus totalPrice createdAt user');

      // Get top 3 selling products
      const topProducts = await getTopSellingProducts(3);
      
      // Get low stock alerts
      const lowStockAlerts = await Product.find({ totalStock: { $lt: 5 } })
        .select('name totalStock category')
        .sort({ totalStock: 1 })
        .limit(5);

      // Format recent orders
      const formattedRecentOrders = recentOrders.map(order => ({
        _id: order._id,
        customerName: order.user?.fullName || 'Khách vãng lai',
        status: order.orderStatus,
        total: Math.round(order.totalPrice),
        date: order.createdAt,
      }));

      resolve({
        status: "Ok",
        message: "Dashboard summary retrieved successfully",
        data: {
          overview: overviewStats.data,
          recentOrders: formattedRecentOrders,
          topProducts: topProducts.data,
          lowStockAlerts: lowStockAlerts.map(product => ({
            name: product.name,
            stock: product.totalStock,
            category: product.category,
          })),
          alerts: {
            lowStockCount: lowStockAlerts.length,
            pendingOrdersCount: await Order.countDocuments({ orderStatus: 'pending' }),
          }
        },
      });
    } catch (error) {
      reject({
        status: "Err",
        message: "Error retrieving dashboard summary",
        error: error.message,
      });
    }
  });
};

module.exports = {
  getOverviewStats,
  getRevenueByPeriod,
  getRevenueByDateRange,
  getTopSellingProducts,
  getCategoryStats,
  getOrderStatusStats,
  getCustomerStats,
  getProductAnalytics,
  getSalesPerformance,
  getDashboardSummary,
};
