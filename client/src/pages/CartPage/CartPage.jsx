import React, { useState, useEffect, useCallback, useRef } from "react";
import { Checkbox, Input, Button, Card, message } from "antd";
import { DeleteOutlined, MinusOutlined, PlusOutlined } from "@ant-design/icons";
import styles from "./CartPage.module.css";
import { useDispatch, useSelector } from "react-redux";
import {
  updateOrderItem,
  removeOrderItem,
  updateShippingInfo,
  updateOrder,
} from "../../redux/slices/orderSlice";
import ChangeInfo from "../../utils/changeInfo";
import { useNavigate } from "react-router-dom";
import SignInPage from "../SignInPage/SignInPage";
import SignUpPage from "../SignUpPage/SignUpPage";
import { removeFromCart, updateCartItem } from "../../services/userService";

function CartPage() {
  const [selectedItems, setSelectedItems] = useState([]);
  const [quantities, setQuantities] = useState([]);
  const [isChangeInfoOpen, setIsChangeInfoOpen] = useState(false);
  const [showSignIn, setShowSignIn] = useState(false);
  const [showSignUp, setShowSignUp] = useState(false);
  const user = useSelector((state) => state.user);
  const order = useSelector((state) => state.order);
  const cartItems = order.orderItems;
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const debounceTimeout = useRef(null);

  // Debounced function to update the cart on the server
  const debouncedUpdateAPI = useCallback((itemId, newQuantity) => {
    // Clear the previous timeout if it exists
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }

    // Set a new timeout
    debounceTimeout.current = setTimeout(async () => {
      try {
        await updateCartItem(itemId, newQuantity);
      } catch (error) {
        console.error("Failed to update cart item:", error);
        message.error("Có lỗi khi cập nhật giỏ hàng.");
      }
    }, 500); // 500ms delay
  }, []);

  // Auto scroll to top when component mounts
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
  }, []);

  const [shippingInfo, setShippingInfo] = useState(() => {
    const orderShipping = order.shippingInfo || {};
    const userInfo = user || {};

    return {
      fullName: orderShipping.fullName || userInfo.fullName || "",
      phone: orderShipping.phone || userInfo.phone || "",
      address: orderShipping.address || userInfo.address || "",
      email: orderShipping.email || userInfo.email || "",
    };
  });

  useEffect(() => {
    if (
      user &&
      (!shippingInfo.fullName ||
        !shippingInfo.phone ||
        !shippingInfo.address ||
        !shippingInfo.email)
    ) {
      const updatedInfo = {
        fullName: order.shippingInfo?.fullName || user.fullName || "",
        phone: order.shippingInfo?.phone || user.phone || "",
        address: order.shippingInfo?.address || user.address || "",
        email: order.shippingInfo?.email || user.email || "",
      };
      setShippingInfo(updatedInfo);
    }
  }, [
    user,
    order.shippingInfo,
    shippingInfo.fullName,
    shippingInfo.phone,
    shippingInfo.address,
    shippingInfo.email,
  ]);

  const summaryItem = selectedItems.reduce((acc, item) => {
    const itemData = cartItems.find((cartItem) => cartItem.id === item);
    if (itemData) {
      const itemTotal = itemData.originalPrice * itemData.amount;
      return acc + itemTotal;
    }
    return acc;
  }, 0);
  const summaryDiscount = selectedItems.reduce((acc, item) => {
    const itemData = cartItems.find((cartItem) => cartItem.id === item);
    if (itemData && itemData.isDiscount) {
      const discountPerItem = itemData.originalPrice - itemData.newPrice;
      const totalDiscount = discountPerItem * itemData.amount;
      return acc + totalDiscount;
    }
    return acc;
  }, 0);
  const summaryVAT = Math.round((summaryItem - summaryDiscount) * 0.01);

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedItems(cartItems.map((item) => item.id));
    } else {
      setSelectedItems([]);
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSelectItem = (itemId) => {
    if (selectedItems.includes(itemId)) {
      setSelectedItems(selectedItems.filter((id) => id !== itemId));
    } else {
      setSelectedItems([...selectedItems, itemId]);
    }
  };

  const updateQuantity = (itemId, newQuantity) => {
    if (newQuantity > 0) {
      setQuantities({
        ...quantities,
        [itemId]: newQuantity,
      });
      dispatch(
        updateOrderItem({
          ...cartItems.find((item) => item.id === itemId),
          amount: newQuantity,
        })
      );
      // Call the debounced function to update the backend
      debouncedUpdateAPI(itemId, newQuantity);
    }
  };

  const formatPrice = (price) => {
    const roundedPrice = Math.round(price);
    return new Intl.NumberFormat("vi-VN").format(roundedPrice) + "đ";
  };

  const handleRemoveItem = async (itemId) => {
    dispatch(removeOrderItem(itemId));
    const res = await removeFromCart(itemId);
    if (res) {
      message.success("Xóa sản phẩm khỏi giỏ hàng thành công!", res);
    } else {
      message.error("Có lỗi xảy ra khi xóa sản phẩm khỏi giỏ hàng.", res);
    }
  };

  const handleChangeInfo = () => {
    setIsChangeInfoOpen(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCloseChangeInfo = () => {
    setIsChangeInfoOpen(false);
  };

  const handleUpdateShippingInfo = (values) => {
    setShippingInfo(values);
    dispatch(updateShippingInfo(values));
    message.success("Cập nhật thông tin thành công!");
  };

  const processItemsImages = (items) => {
    return items.map((item) => {
      const processedItem = { ...item };
      if (processedItem.image) {
        processedItem.image = processedItem.image.replace(
          "http://localhost:3001/uploads/",
          ""
        );
      }
      return processedItem;
    });
  };
  const hasShippingInfo =
    shippingInfo.fullName &&
    shippingInfo.phone &&
    shippingInfo.address &&
    shippingInfo.email;
  const isUserLoggedIn = user && user.isAuthenticated !== false;

  const handleSwitchToSignUp = () => {
    setShowSignIn(false);
    setShowSignUp(true);
  };

  const handleSwitchToSignIn = () => {
    setShowSignUp(false);
    setShowSignIn(true);
  };

  const handleShowSignIn = () => {
    setShowSignIn(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleLoginSuccess = (userData) => {
    if (userData) {
      setShippingInfo({
        fullName: userData.fullName || "",
        phone: userData.phone || "",
        address: userData.address || "",
        email: userData.email || "",
      });
      setShowSignIn(false);
      setShowSignUp(false);
      message.success("Đăng nhập thành công!");
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const renderShippingSection = () => {
    if (!isUserLoggedIn) {
      return (
        <div className={styles.loginRequired}>
          <p>Vui lòng đăng nhập để xem thông tin giao hàng</p>
          <Button type="primary" onClick={handleShowSignIn}>
            Đăng nhập
          </Button>
        </div>
      );
    }

    if (!hasShippingInfo) {
      return (
        <div className={styles.emptyDeliveryInfo}>
          <p>Chưa có thông tin giao hàng</p>
          <Button
            type="primary"
            onClick={handleChangeInfo}
            className={styles.updateInfoButton}
          >
            Cập nhật thông tin giao hàng
          </Button>
        </div>
      );
    }

    return (
      <div className={styles.deliveryInfo}>
        <h3>Giao tới</h3>
        <div className={styles.customerName}>{shippingInfo.fullName}</div>
        <div className={styles.customerPhone}>{shippingInfo.phone}</div>
        <div className={styles.customerAddress}>{shippingInfo.address}</div>
        <div className={styles.changeAddress}>
          <Button
            type="link"
            onClick={handleChangeInfo}
            className={styles.changeAddressButton}
          >
            Thay đổi thông tin nhận hàng
          </Button>
        </div>
      </div>
    );
  };

  const handleCheckout = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });

    if (!isUserLoggedIn) {
      message.error("Vui lòng đăng nhập để thanh toán.");
      handleShowSignIn();
      return;
    }

    if (selectedItems.length === 0) {
      message.error("Vui lòng chọn ít nhất một sản phẩm để thanh toán.");
      return;
    }

    if (!hasShippingInfo) {
      message.error(
        "Vui lòng cập nhật thông tin giao hàng trước khi thanh toán."
      );
      handleChangeInfo();
      return;
    }

    try {
      const selectedCartItems = selectedItems.map((id) => {
        const cartItem = cartItems.find((item) => item.id === id);
        return {
          ...cartItem,
          variant: {
            size: cartItem.variant?.size || cartItem.size,
            color: cartItem.variant?.color || cartItem.color,
            stock: cartItem.variant?.stock || cartItem.stock,
          },
        };
      });

      const processedItems = processItemsImages(selectedCartItems);
      dispatch(
        updateOrder({
          user: user._id,
          items: processedItems,
          itemsPrice: summaryItem,
          taxPrice: summaryVAT,
          totalDiscount: summaryDiscount,
          totalPrice: summaryItem - summaryDiscount + summaryVAT,
          shippingInfo: shippingInfo,
        })
      );

      navigate("/payment");
    } catch (error) {
      console.error("Error updating order:", error);
      message.error("Có lỗi xảy ra khi xử lý đơn hàng.");
    }
  };

  return (
    <div className={styles.cartContainer}>
      <div className={styles.cartContent}>
        <Card className={styles.cartList}>
          <div className={styles.cartHeader}>
            <Checkbox
              onChange={handleSelectAll}
              checked={selectedItems.length === cartItems.length}
            >
              Tất cả ({cartItems.length} sản phẩm)
            </Checkbox>
            <span>Đơn giá</span>
            <span>Số lượng</span>
            <span>Thành tiền</span>
            <DeleteOutlined />
          </div>

          {cartItems.map((item) => (
            <div key={item.id} className={styles.cartItem}>
              <Checkbox
                checked={selectedItems.includes(item.id)}
                onChange={() => handleSelectItem(item.id)}
              />
              <img
                className={styles.itemImage}
                src={item.image}
                alt={item.name}
              />
              <div className={styles.itemInfo}>
                <div className={styles.itemName}>{item.name}</div>
                <div className={styles.itemVariant}>
                  Size: {item.variant.size} / Color: {item.variant.color}
                </div>
              </div>
              {item.isDiscount ? (
                <div className={styles.itemPrice}>
                  <div className={styles.discountedPrice}>
                    {formatPrice(Math.floor(item.newPrice))}
                  </div>
                  <div className={styles.originalPrice}>
                    {formatPrice(Math.floor(item.originalPrice))}
                  </div>
                </div>
              ) : (
                <div className={styles.currentPrice}>
                  {formatPrice(Math.floor(item.newPrice))}
                </div>
              )}
              <div className={styles.quantityControl}>
                <Button
                  icon={<MinusOutlined />}
                  onClick={() =>
                    updateQuantity(
                      item.id,
                      (quantities[item.id] || item.amount) - 1
                    )
                  }
                />
                <Input
                  value={quantities[item.id] || item.amount}
                  onChange={(e) =>
                    updateQuantity(item.id, parseInt(e.target.value) || 1)
                  }
                />
                <Button
                  icon={<PlusOutlined />}
                  onClick={() =>
                    updateQuantity(
                      item.id,
                      (quantities[item.id] || item.amount) + 1
                    )
                  }
                  disabled={item.amount >= item.variant.stock}
                />
              </div>

              <div className={styles.totalPrice}>
                {formatPrice(
                  item.newPrice * (quantities[item.id] || item.amount)
                )}
              </div>

              <DeleteOutlined
                onClick={() => handleRemoveItem(item.id)}
                className={styles.deleteIcon}
              />
            </div>
          ))}
          {cartItems.length === 0 && (
            <div className={styles.emptyCart}>Giỏ hàng của bạn đang trống</div>
          )}
        </Card>
        <Card className={styles.orderSummary}>
          {renderShippingSection()}

          <div className={styles.summary}>
            <div className={styles.summaryItem}>
              <span>Tổng tiền hàng</span>
              <span>{formatPrice(summaryItem)}</span>
            </div>
            <div className={styles.fee}>
              <span>Giảm giá</span>
              <span>- {formatPrice(summaryDiscount)}</span>
            </div>
            <div className={styles.fee}>
              <span>VAT</span>
              <span>+ {formatPrice(summaryVAT)}</span>
            </div>
            <div className={styles.total}>
              <span>Tổng tiền thanh toán</span>
              <span className={styles.totalAmount}>
                {formatPrice(summaryItem - summaryDiscount + summaryVAT)}
              </span>
            </div>
          </div>

          <Button
            type="primary"
            onClick={handleCheckout}
            className={styles.checkoutButton}
            disabled={!isUserLoggedIn || selectedItems.length === 0}
          >
            Thanh Toán ({selectedItems.length} sản phẩm)
          </Button>
        </Card>
      </div>

      <SignInPage
        open={showSignIn}
        onClose={() => setShowSignIn(false)}
        onSwitchToSignUp={handleSwitchToSignUp}
        onLoginSuccess={handleLoginSuccess}
      />

      <SignUpPage
        open={showSignUp}
        onClose={() => setShowSignUp(false)}
        onSwitchToSignIn={handleSwitchToSignIn}
      />

      <ChangeInfo
        isOpen={isChangeInfoOpen}
        onClose={handleCloseChangeInfo}
        defaultInfo={shippingInfo}
        onSubmit={handleUpdateShippingInfo}
      />
    </div>
  );
}

export default CartPage;
