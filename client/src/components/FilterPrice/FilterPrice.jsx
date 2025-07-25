import React, { useState, useEffect } from "react";
import { Slider, InputNumber, Button, Typography, Card, Divider } from "antd";
import { FilterOutlined } from "@ant-design/icons";
import { useSearchParams } from "react-router-dom";
import styles from "./FilterPrice.module.css";

const { Title } = Typography;

function FilterPrice() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [priceRange, setPriceRange] = useState([0, 2000000]);

  // Initialize price from URL params
  useEffect(() => {
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");

    if (minPrice || maxPrice) {
      setPriceRange([
        minPrice ? parseInt(minPrice) : 0,
        maxPrice ? parseInt(maxPrice) : 2000000,
      ]);
    }
  }, [searchParams]);

  const handleSliderChange = (value) => {
    setPriceRange(value);
  };

  const handleMinInputChange = (value) => {
    setPriceRange([value || 0, priceRange[1]]);
  };

  const handleMaxInputChange = (value) => {
    setPriceRange([priceRange[0], value || 2000000]);
  };

  const handleApply = () => {
    const params = new URLSearchParams(searchParams);

    if (priceRange[0] > 0) {
      params.set("minPrice", priceRange[0].toString());
    } else {
      params.delete("minPrice");
    }

    if (priceRange[1] < 2000000) {
      params.set("maxPrice", priceRange[1].toString());
    } else {
      params.delete("maxPrice");
    }

    setSearchParams(params);
    console.log("Áp dụng lọc giá:", priceRange);
  };

  const handleReset = () => {
    setPriceRange([0, 2000000]);
    const params = new URLSearchParams(searchParams);
    params.delete("minPrice");
    params.delete("maxPrice");
    setSearchParams(params);
  };

  // Format giá tiền
  const formatter = new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    minimumFractionDigits: 0,
  });

  return (
    <Card className={styles.filterPriceContainer}>
      <Title level={5} className={styles.filterPriceTitle}>
        <FilterOutlined /> Lọc theo giá
      </Title>
      <Divider className={styles.divider} />

      <Slider
        range
        min={0}
        max={2000000}
        step={50000}
        value={priceRange}
        onChange={handleSliderChange}
        tooltip={{
          formatter: (value) => formatter.format(value),
        }}
        className={styles.priceSlider}
      />

      <div className={styles.filterPriceRange}>
        <InputNumber
          min={0}
          max={priceRange[1]}
          value={priceRange[0]}
          onChange={handleMinInputChange}
          formatter={(value) =>
            `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ".")
          }
          parser={(value) => value.replace(/\./g, "")}
          className={styles.filterPriceInput}
          placeholder="Từ"
          addonBefore="₫"
        />
        <span className={styles.filterPriceDash}>-</span>
        <InputNumber
          min={priceRange[0]}
          max={10000000}
          value={priceRange[1]}
          onChange={handleMaxInputChange}
          formatter={(value) =>
            `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ".")
          }
          parser={(value) => value.replace(/\./g, "")}
          className={styles.filterPriceInput}
          placeholder="Đến"
          addonBefore="₫"
        />
      </div>

      <div className={styles.filterActions}>
        <Button
          type="primary"
          onClick={handleApply}
          className={styles.filterPriceBtn}
          icon={<FilterOutlined />}
        >
          Áp dụng
        </Button>
        <Button onClick={handleReset} className={styles.resetBtn}>
          Đặt lại
        </Button>
      </div>
    </Card>
  );
}

export default FilterPrice;
