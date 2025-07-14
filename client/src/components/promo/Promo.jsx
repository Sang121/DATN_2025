import React from "react";
import styles from "./Promo.module.css";

function Promo() {
  const promoData = [
    {
      icon: (
        <svg
          width="32"
          height="32"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M1 3H3L3.4 5M7 13H17L21 5H5.4M7 13L5.4 5M7 13L4.7 15.3C4.3 15.7 4.6 16.5 5.1 16.5H17M17 13V17M9 19.5C9.8 19.5 10.5 20.2 10.5 21S9.8 22.5 9 22.5 7.5 21.8 7.5 21 8.2 19.5 9 19.5ZM20 19.5C20.8 19.5 21.5 20.2 21.5 21S20.8 22.5 20 22.5 18.5 21.8 18.5 21 19.2 19.5 20 19.5Z"
            stroke="#4CAF50"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M8 8H20"
            stroke="#4CAF50"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      ),
      title: "Vận chuyển miễn phí",
      subtitle: "Hóa đơn trên 5 triệu",
      bgColor: "#E3F2FD",
    },
    {
      icon: (
        <svg
          width="32"
          height="32"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M20 12V8H6L4 6H2"
            stroke="#E91E63"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="9" cy="21" r="1" stroke="#E91E63" strokeWidth="1.5" />
          <circle cx="20" cy="21" r="1" stroke="#E91E63" strokeWidth="1.5" />
          <path
            d="M6 6H22L20 16H8"
            stroke="#E91E63"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M14 10L16 12L14 14"
            stroke="#E91E63"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <rect
            x="10"
            y="9"
            width="8"
            height="6"
            rx="1"
            stroke="#E91E63"
            strokeWidth="1.5"
            fill="none"
          />
        </svg>
      ),
      title: "Quà tặng hấp dẫn",
      subtitle: "Build PC tặng quà cực khủng",
      bgColor: "#FCE4EC",
    },
    {
      icon: (
        <svg
          width="32"
          height="32"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
            stroke="#FF9800"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle
            cx="12"
            cy="12"
            r="8"
            stroke="#FF9800"
            strokeWidth="1.5"
            fill="none"
          />
        </svg>
      ),
      title: "Chứng nhận chất lượng",
      subtitle: "Sản phẩm chính hãng",
      bgColor: "#FFF8E1",
    },
    {
      icon: (
        <svg
          width="32"
          height="32"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M22 16.92V18.92C22.01 19.47 21.54 19.93 21 19.93C9.4 19.93 0.0700073 10.6 0.0700073 -1C0.0700073 -1.54 0.530007 -2 1.08 -2H3.08C3.63 -2 4.08 -1.54 4.08 -1C4.08 0.39 4.39 1.74 4.97 2.94C5.16 3.31 5.05 3.77 4.72 4.04L3.09 5.38C4.09 7.59 5.91 9.41 8.12 10.41L9.46 8.78C9.73 8.45 10.19 8.34 10.56 8.53C11.76 9.11 13.11 9.42 14.5 9.42C15.04 9.42 15.5 9.88 15.5 10.42V12.42C15.5 12.97 15.04 13.42 14.5 13.42H22Z"
            stroke="#2196F3"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M16 4H20V8M16 4L20 8"
            stroke="#2196F3"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      ),
      title: "Hotline: 0342656996",
      subtitle: "Hỗ trợ 24/7",
      bgColor: "#E8F5E8",
    },
  ];

  return (
    <div className={styles.promoContainer}>
      {promoData.map((item, index) => (
        <div
          key={index}
          className={styles.promoItem}
          style={{ backgroundColor: item.bgColor }}
        >
          <div className={styles.promoIcon}>{item.icon}</div>
          <div className={styles.promoContent}>
            <h3 className={styles.promoTitle}>{item.title}</h3>
            <p className={styles.promoSubtitle}>{item.subtitle}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

export default Promo;
