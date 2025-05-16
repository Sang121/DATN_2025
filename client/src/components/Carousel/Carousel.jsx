import React from "react";
import Slider from "react-slick";
import "./Carousel.css";

function Carousel() {
  var settings = {
    dots: true,
    arows:true,
    infinite: true,
    speed: 500,
    slidesToShow: 1, // mỗi slide là 1 nhóm 2 ảnh
    slidesToScroll: 1,
    autoplay: true,
  };
  return (
    <Slider {...settings} className="carousel">
      <div>
        <div className="slider">
          <img
            className="imageSlider"
            alt="sliderImage"
            src="https://salt.tikicdn.com/cache/w750/ts/tikimsp/1f/7f/6e/78d8c9976eb8b7b3b6133671573d1a56.png"
          />
          <img
            className="imageSlider"
            alt="sliderImage"
            src="https://salt.tikicdn.com/cache/w750/ts/tikimsp/27/a0/e9/bbe8b3f5cdb8837e352eb891da0a9794.jpg"
          />
        </div>
      </div>
      <div>
        <div className="slider">
          <img
            className="imageSlider"
            alt="sliderImage"
            src="https://salt.tikicdn.com/cache/w750/ts/tikimsp/1f/7f/6e/78d8c9976eb8b7b3b6133671573d1a56.png"
          />
          <img
            className="imageSlider"
            alt="sliderImage"
            src="https://salt.tikicdn.com/cache/w750/ts/tikimsp/27/a0/e9/bbe8b3f5cdb8837e352eb891da0a9794.jpg"
          />
        </div>
      </div>
      <div>
        <div className="slider">
          <img
            className="imageSlider"
            alt="sliderImage"
            src="https://salt.tikicdn.com/cache/w750/ts/tikimsp/1f/7f/6e/78d8c9976eb8b7b3b6133671573d1a56.png"
          />
          <img
            className="imageSlider"
            alt="sliderImage"
            src="https://salt.tikicdn.com/cache/w750/ts/tikimsp/27/a0/e9/bbe8b3f5cdb8837e352eb891da0a9794.jpg"
          />
        </div>
      </div>
    </Slider>
  );
}

export default Carousel;
