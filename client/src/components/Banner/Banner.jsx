import React, { useEffect, useState } from "react";
import styles from "./banner.module.css";
import { useNavigate } from "react-router-dom";
import { CloseOutlined } from "@ant-design/icons";
function Banner() {
  const [showPromoBanner, setShowPromoBanner] = useState(true);
  const navigate = useNavigate();

  // Xử lý đóng banner
  const handleCloseBanner = () => {
    setShowPromoBanner(false);
    localStorage.setItem("defaultPageBannerClosed", "true");
  };

  // Xử lý click vào nút "Mua ngay"
  const handlePromoAction = () => {
    navigate("/promotions");
  };

  // Kiểm tra xem banner đã được đóng chưa
  useEffect(() => {
    const bannerClosed = localStorage.getItem("defaultPageBannerClosed");
    if (bannerClosed === "true") {
      setShowPromoBanner(false);
    }
  }, []);

  return (
    <div>
      {showPromoBanner && (
        <div className={styles.promoBanner}>
          <div className={styles.promoBannerContent}>
            <div className={styles.promoText}>
              <span className={styles.promoIcon}>🔥</span>
              <span className={styles.promoMessage}>
                BLACK FRIDAY - GIẢM GIÁ LÊN ĐẾN 70% - MIỄN PHÍ VẬN CHUYỂN TOÀN
                QUỐC
              </span>
              <span className={styles.promoAction} onClick={handlePromoAction}>
                Mua ngay!
              </span>
            </div>
            <div
              className={styles.promoBannerClose}
              onClick={handleCloseBanner}
            >
              <CloseOutlined className={styles.closeIcon} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Banner;
