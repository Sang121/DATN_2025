import React from 'react'

function ImgAds({ img }) {
  return (
    <div>
      <img style={{ width: "100%", height: "auto" }}
        src={img}
        alt="Quảng cáo"
      />
    </div>
  );
}

export default ImgAds