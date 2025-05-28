
export const loadState = () => {
  try {
    const serializedState = sessionStorage.getItem("userState"); // Key dùng để lưu trữ toàn bộ user slice
    if (serializedState === null) {
      return undefined; // Trả về undefined để Redux dùng initialState
    }
    return JSON.parse(serializedState);
  } catch (err) {
    console.error("Lỗi khi tải state từ sessionStorage:", err);
    return undefined;
  }
};

export const saveState = (state) => {
  try {
    const serializedState = JSON.stringify(state);
    sessionStorage.setItem("userState", serializedState); // Key dùng để lưu trữ toàn bộ user slice
  } catch (err) {
    console.error("Lỗi khi lưu state vào sessionStorage:", err);
  }
};
