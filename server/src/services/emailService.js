const nodemailer = require("nodemailer");
const dotenv = require("dotenv");
dotenv.config();
// Create a test account or replace with real credentials.
const sendMail = async (orderData) => {
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  (async () => {
    // Format items to display in email
    const itemRows = orderData.items
      .map(
        (item) => `
      <tr>
       
        <td style="padding: 10px; border-bottom: 1px solid #e0e0e0;">
          <p style="font-weight: 500; display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2; margin: 0 0 5px 0;">${item.name}</p>
          ${
            item.variant.color
              ? `<p style="color: #666; font-size: 13px; margin: 0;">Màu: ${item.variant.color}</p>`
              : ""
          }
          ${
            item.variant.size
              ? `<p style="color: #666; font-size: 13px; margin: 0;">Kích thước: ${item.variant.size}</p>`
              : ""
          }
        </td>
        <td style="padding: 10px; border-bottom: 1px solid #e0e0e0; text-align: center;">${
          item.amount
        }</td>
        <td style="padding: 10px; border-bottom: 1px solid #e0e0e0; text-align: right;">${Number(
          item.price
        ).toLocaleString()}đ</td>
        <td style="padding: 10px; border-bottom: 1px solid #e0e0e0; text-align: right;">${(
          item.price * item.amount
        ).toLocaleString()}đ</td>
      </tr>
    `
      )
      .join("");

    // Tạo mã màu dựa trên trạng thái thanh toán
    const statusColor = orderData.isPaid ? "#10b981" : "#f59e0b";
    const paymentStatus = orderData.isPaid
      ? "Đã thanh toán"
      : "Chưa thanh toán";

    // Format ngày
    const orderDate = new Date().toLocaleDateString("vi-VN", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    const info = await transporter.sendMail({
      from: '"S-Fashion" <no-reply@s-fashion.com>',
      to: orderData.shippingInfo.email,
      subject: `[S-Fashion] Xác nhận đơn hàng tại S-Fashion`,
      html: `
      <!DOCTYPE html>
      <html lang="vi">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Xác nhận đơn hàng</title>
        <style>
          body, html {
            font-family: 'Arial', sans-serif;
            line-height: 1.6;
            color: #333;
            margin: 0;
            padding: 0;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            background-color: #ffffff;
            text-align: center;
            padding: 20px 0;
            border-bottom: 3px solid #f5f5f5;
          }
          .header img {
            max-height: 50px;
          }
          .order-status {
            text-align: center;
            padding: 20px;
            background-color: ${statusColor};
            color: white;
            font-size: 18px;
            font-weight: bold;
            border-radius: 4px;
            margin: 20px 0;
          }
          .section {
            margin-bottom: 30px;
          }
          .section-title {
            font-size: 18px;
            font-weight: bold;
            margin-bottom: 15px;
            color: #333;
            border-bottom: 1px solid #e0e0e0;
            padding-bottom: 10px;
          }
          .order-details {
            background-color: #f9f9f9;
            padding: 15px;
            border-radius: 4px;
          }
          .order-detail-item {
            display: flex;
            justify-content: space-between;
            margin-bottom: 10px;
          }
          .order-detail-label {
            font-weight: 500;
          }
          .order-products {
            width: 100%;
            border-collapse: collapse;
          }
          .order-products th {
            background-color: #f5f5f5;
            padding: 10px;
            text-align: left;
          }
          .summary {
            margin-top: 20px;
            border-top: 2px solid #e0e0e0;
            padding-top: 15px;
          }
          .summary-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 10px;
          }
          .total {
            font-size: 18px;
            font-weight: bold;
            color: #d32f2f;
          }
          .footer {
            margin-top: 30px;
            text-align: center;
            font-size: 13px;
            color: #666;
            border-top: 1px solid #e0e0e0;
            padding-top: 20px;
          }
          @media only screen and (max-width: 600px) {
            .container {
              width: 100%;
              padding: 10px;
            }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="color: #d32f2f; margin: 0;">S-Fashion</h1>
            <p style="margin: 5px 0 0 0;">Đẳng Cấp Thời Trang</p>
          </div>
          
          <div style="margin-top: 30px;">
            <h2>Xin chào ${orderData.shippingInfo.fullName},</h2>
            <p>Cảm ơn bạn đã đặt hàng tại S-Fashion! Chúng tôi rất vui thông báo rằng đơn hàng của bạn đã được xác nhận.</p>
          </div>
          
          <div class="order-status">
            ${
              orderData.isPaid
                ? "Đơn hàng đã được thanh toán"
                : "Đơn hàng đang chờ xử lý"
            }
          </div>
          
          <div class="section">
            <div class="section-title">Chi tiết đơn hàng: </div>
            <div class="order-details">
              <div class="order-detail-item">
                <span class="order-detail-label">Ngày đặt hàng:</span>
                <span>${orderDate}</span>
              </div>
              <div class="order-detail-item">
                <span class="order-detail-label">Trạng thái thanh toán:</span>
                <span style="color: ${statusColor}; font-weight: 500;">${paymentStatus}</span>
              </div>
              <div class="order-detail-item">
                <span class="order-detail-label">Phương thức thanh toán:</span>
                <span>${
                  orderData.paymentMethod === "COD"
                    ? "Thanh toán khi nhận hàng"
                    : orderData.paymentMethod === "VNPAY"
                    ? "VNPAY"
                    : orderData.paymentMethod === "paypal"
                    ? "PayPal"
                    : orderData.paymentMethod
                }</span>
              </div>
              <div class="order-detail-item">
                <span class="order-detail-label">Phương thức vận chuyển:</span>
                <span>${
                  orderData.deliveryMethod === "GHTK"
                    ? "Giao hàng tiết kiệm"
                    : orderData.deliveryMethod === "GHN"
                    ? "Giao hàng nhanh"
                    : orderData.deliveryMethod
                }</span>
              </div>
            </div>
          </div>
          
          <div class="section">
            <div class="section-title">Địa chỉ giao hàng</div>
            <div class="order-details">
              <p style="margin: 0 0 5px 0;"><strong>${
                orderData.shippingInfo.fullName
              }</strong></p>
              <p style="margin: 0 0 5px 0;">${
                orderData.shippingInfo.address
              }</p>
              <p style="margin: 0 0 5px 0;">Điện thoại: ${
                orderData.shippingInfo.phone
              }</p>
              <p style="margin: 0;">Email: ${orderData.shippingInfo.email}</p>
            </div>
          </div>
          
          <div class="section">
            <div class="section-title">Sản phẩm đã đặt</div>
            <table class="order-products" style="width: 100%;">
              <thead>
                <tr>
                  <th style="text-align: left;">Sản phẩm</th>
                  <th style="text-align: center;">SL</th>
                  <th style="text-align: right;">Đơn giá</th>
                  <th style="text-align: right;">Thành tiền</th>
                </tr>
              </thead>
              <tbody>
                ${itemRows}
              </tbody>
            </table>
            
            <div class="summary">
              <div class="summary-row">
                <span>Tổng tiền hàng:</span>
                <span>${Number(orderData.itemsPrice).toLocaleString()}đ</span>
              </div>
              <div class="summary-row">
                <span>VAT:</span>
                <span>+${Number(
                  orderData.taxPrice || 0
                ).toLocaleString()}đ</span>
              </div>
              <div class="summary-row">
                <span>Giảm giá:</span>
                <span>-${Number(
                  orderData.totalDiscount || 0
                ).toLocaleString()}đ</span>
              </div>
              <div class="summary-row total">
                <span>Tổng thanh toán:</span>
                <span>${Number(orderData.totalPrice).toLocaleString()}đ</span>
              </div>
            </div>
          </div>
          
          <div class="section">
            <p>Chúng tôi sẽ thông báo cho bạn khi đơn hàng được giao cho đơn vị vận chuyển.</p>
            <p>Nếu bạn có bất kỳ câu hỏi nào về đơn hàng, vui lòng liên hệ với chúng tôi qua email <a href="mailto:support@s-fashion.com">support@s-fashion.com</a> hoặc gọi <a href="tel:+84901234567">0901234567</a>.</p>
          </div>
          
          <div class="footer">
            <p>© 2025 S-Fashion. Tất cả các quyền được bảo lưu.</p>
            <p>Địa chỉ: 172/211 Khương Trung, Thanh Xuân, Hà Nội</p>
          </div>
        </div>
      </body>
      </html>
      `,
    });

  })();
};
module.exports = {
  sendMail,
};
