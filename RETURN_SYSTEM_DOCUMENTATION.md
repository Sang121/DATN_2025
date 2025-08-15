# Hệ Thống Quản Lý Yêu Cầu Trả Hàng & Hoàn Tiền

## Tổng Quan
Hệ thống trả hàng & hoàn tiền cho phép khách hàng gửi yêu cầu trả hàng cho các đơn hàng đã giao thành công và admin quản lý, xử lý các yêu cầu này. Hệ thống tích hợp hoàn toàn với thống kê dashboard và AI chatbot để phân tích.

## Tính Năng Chính

### Cho Khách Hàng:
1. **Tạo Yêu Cầu Trả Hàng**
   - Chỉ áp dụng cho đơn hàng đã giao thành công (`orderStatus: "delivered"`)
   - Thời hạn: 7 ngày kể từ ngày nhận hàng (`deliveredAt`)
   - Lý do trả hàng: 
     - `defective` - Sản phẩm lỗi
     - `not_as_described` - Không đúng mô tả
     - `wrong_size` - Sai kích thước
     - `wrong_color` - Sai màu sắc
     - `not_satisfied` - Không hài lòng
     - `other` - Khác
   - **Phương thức hoàn tiền**: Chỉ hỗ trợ chuyển khoản ngân hàng (`bank`)

2. **Theo Dõi Trạng Thái**
   - `pending` - Chờ xử lý
   - `approved` - Đã phê duyệt
   - `rejected` - Đã từ chối
   - `completed` - Hoàn thành (đã hoàn tiền)

### Cho Admin:
1. **Quản Lý Yêu Cầu Trả Hàng**
   - Xem danh sách tất cả yêu cầu với pagination
   - Lọc theo trạng thái (`pending`, `approved`, `rejected`, `completed`)
   - Xem chi tiết yêu cầu với thông tin đầy đủ
   - **Phê duyệt yêu cầu**: Cập nhật trạng thái đơn hàng thành `return_requested`
   - **Từ chối yêu cầu**: Yêu cầu ghi chú bắt buộc
   - **Đánh dấu hoàn thành**: Nút "Đã hoàn tiền" để cập nhật trạng thái thành `refunded`

2. **Thống Kê & Analytics**
   - Dashboard tích hợp với thống kê tổng quan
   - Thống kê theo trạng thái yêu cầu
   - Thống kê theo lý do trả hàng
   - Tổng số tiền hoàn trả theo thời gian
   - **AI Chatbot Analytics**: Phân tích xu hướng và đề xuất cải thiện

3. **Quản Lý Trạng Thái Đơn Hàng**
   - `delivered` → `return_requested` (khi phê duyệt)
   - `return_requested` → `returned` (khi nhận hàng)
   - `returned` → `refunded` (khi hoàn tiền xong)

## Cách Sử Dụng

### Khách Hàng:
1. Vào trang "Đơn hàng của tôi"
2. Tìm đơn hàng có trạng thái "Đã giao"
3. Nhấn nút "Trả hàng" (chỉ hiển thị trong vòng 7 ngày)
4. Điền form yêu cầu trả hàng:
   - Chọn lý do
   - Mô tả chi tiết
   - Chọn phương thức hoàn tiền
   - Nhập thông tin ngân hàng (nếu chọn chuyển khoản)
5. Gửi yêu cầu và chờ admin xử lý

### Admin:
1. Vào trang Admin > Quản lý đơn hàng > Yêu cầu trả hàng
2. Xem danh sách yêu cầu
3. Nhấn "Xem chi tiết" để xem thông tin đầy đủ
4. Nhấn "Phê duyệt" hoặc "Từ chối"
5. Nhập ghi chú (bắt buộc khi từ chối)

## API Endpoints

### User APIs:
- `POST /api/return/orders/:orderId/return-request` - Tạo yêu cầu trả hàng
- `GET /api/return/user/return-requests` - Lấy danh sách yêu cầu của user
- `GET /api/return/return-requests/:id` - Xem chi tiết yêu cầu

### Admin APIs:
- `GET /api/return/admin/return-requests` - Lấy tất cả yêu cầu
- `PUT /api/return/admin/return-requests/:id/process` - Xử lý yêu cầu
- `GET /api/return/admin/return-requests/stats` - Thống kê

## Database Schema

### ReturnRequest Model:
```javascript
{
  order: ObjectId, // Ref đến Order
  reason: String, // Lý do trả hàng
  description: String, // Mô tả chi tiết
  refundMethod: String, // Phương thức hoàn tiền
  bankInfo: {
    bankName: String,
    accountNumber: String,
    accountHolder: String
  },
  status: String, // pending, approved, rejected, completed
  adminNote: String, // Ghi chú của admin
  processedBy: ObjectId, // Admin xử lý
  processedAt: Date,
  refundAmount: Number,
  originalPaymentMethod: String
}
```

## Business Logic

1. **Điều Kiện Trả Hàng:**
   - Đơn hàng phải có trạng thái "delivered"
   - Trong vòng 7 ngày kể từ deliveredAt
   - Chưa có yêu cầu trả hàng nào đang xử lý

2. **Xử Lý Phê Duyệt:**
   - Cập nhật trạng thái đơn hàng thành "returned"
   - Hoàn lại số lượng sản phẩm trong kho
   - Xử lý hoàn tiền (tùy theo payment gateway)
   - Cập nhật analytics

3. **Xử Lý Từ Chối:**
   - Cập nhật trạng thái thành "rejected"
   - Thông báo lý do cho khách hàng

## Tích Hợp

### Frontend Components:
- `MyOrder.jsx` - Giao diện tạo yêu cầu cho user
- `ReturnRequestManager.jsx` - Giao diện quản lý cho admin

### Backend:
- `ReturnRequest.js` - Model
- `returnRequestController.js` - Controller
- `returnRequestRoutes.js` - Routes

### Services:
- `orderService.js` - API calls

## Lưu Ý Quan Trọng

1. **Bảo Mật:**
   - Xác thực người dùng cho tất cả API
   - Kiểm tra quyền sở hữu đơn hàng
   - Validate dữ liệu đầu vào

2. **Performance:**
   - Index trên các trường thường query
   - Pagination cho danh sách
   - Cache thống kê nếu cần

3. **Tích Hợp Payment:**
   - Hiện tại chưa tích hợp gateway thực tế
   - Cần implement theo từng phương thức thanh toán
   - Log các giao dịch hoàn tiền

4. **Notification:**
   - Thông báo cho user khi admin xử lý
   - Email confirmation
   - SMS notification (tùy chọn)

## Mở Rộng Tương Lai

1. **Trả Hàng Một Phần:**
   - Cho phép trả một số sản phẩm trong đơn hàng
   - Tính toán hoàn tiền theo tỷ lệ

2. **Upload Hình Ảnh:**
   - Cho phép user upload ảnh sản phẩm lỗi
   - Lưu trữ evidence

3. **Tự Động Hóa:**
   - Auto-approve cho một số trường hợp
   - Rule engine cho xử lý

4. **Analytics Nâng Cao:**
   - Báo cáo chi tiết theo sản phẩm
   - Trend analysis
   - Quality insights
