import React, { useState } from "react";
import { Checkbox, Input, Button, Space, Card, message, Col } from "antd";
import { DeleteOutlined, MinusOutlined, PlusOutlined } from "@ant-design/icons";
import styles from "./CartPage.module.css";
import { useDispatch, useSelector } from "react-redux";
import {
  updateOrderItem,
  removeOrderItem,
} from "../../redux/slices/orderSlice";

function CartPage() {
  const [selectedItems, setSelectedItems] = useState([]);
  const [quantities, setQuantities] = useState({});

  const cartItems = useSelector((state) => state.order.orderItems);
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user);

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
      const discountPerItem = itemData.originalPrice - itemData.price;
      const totalDiscount = discountPerItem * itemData.amount;
      return acc + totalDiscount;
    }
    return acc;
  }, 0);
  const summaryVAT = Math.round((summaryItem - summaryDiscount) * 0.1);

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedItems(cartItems.map((item) => item.id));
      console.log(
        "Selected items:",
        selectedItems.map((item) => item.id)
      );
    } else {
      setSelectedItems([]);
      console.log("Selected items:", []);
    }
  };

  const handleSelectItem = (itemId) => {
    if (selectedItems.includes(itemId)) {
      setSelectedItems(selectedItems.filter((id) => id !== itemId));
    } else {
      setSelectedItems([...selectedItems, itemId]);
      console.log("Selected items:", [...selectedItems, itemId]);
    }
  };

  const updateQuantity = (itemId, newQuantity) => {
    if (newQuantity > 0) {
      setQuantities({
        ...quantities,
        [itemId]: newQuantity,
      });
      console.log("Updated quantities:", newQuantity);
      // Dispatch an action to update the quantity in the Redux store
      dispatch(
        updateOrderItem({
          ...cartItems.find((item) => item.id === itemId),
          amount: newQuantity,
        })
      );
    }
  };

  const formatPrice = (price) => {
    // Làm tròn đến số nguyên gần nhất
    const roundedPrice = Math.round(price);
    return new Intl.NumberFormat("vi-VN").format(roundedPrice) + "đ";
  };
  const handleRemoveItem = (itemId) => {
    dispatch(removeOrderItem(itemId));
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
                  <div className={styles.currentPrice}>
                    <div className={styles.discountedPrice}>
                      {formatPrice(Math.floor(item.price))}
                    </div>
                  </div>
                  <div className={styles.originalPrice}>
                    {formatPrice(Math.floor(item.originalPrice))}
                  </div>
                </div>
              ) : (
                <div className={styles.itemPrice}>
                  <div className={styles.currentPrice}>
                    {formatPrice(Math.floor(item.price))}
                  </div>
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
                  disabled={item.amount >= item.variant.stock ? true : false}
                />
              </div>{" "}
              <div className={styles.totalPrice}>
                {formatPrice(item.price * (quantities[item.id] || item.amount))}
              </div>
              <DeleteOutlined
                onClick={() => handleRemoveItem(item.id)}
                className={styles.deleteIcon}
              />
            </div>
          ))}
        </Card>
        <Card className={styles.orderSummary}>
          <h3>Giao tới</h3>
          <div className={styles.deliveryInfo}>
            <div className={styles.customerName}>{user.fullName}</div>
            <div className={styles.customerPhone}>{user.phone}</div>
            <div className={styles.customerAddress}>{user.address}</div>
          </div>

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

          <Button type="primary" className={styles.checkoutButton}>
            Thanh Toán ({selectedItems.length} sản phẩm)
          </Button>
        </Card>
      </div>
    </div>
  );
}

export default CartPage;
