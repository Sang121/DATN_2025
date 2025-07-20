import React from "react";
import { Card } from "antd";

function ListCategory() {
  
  return (
    <Card
      hoverable
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <img
        src="https://example.com/your-image.jpg"
        alt="Category"
        style={{ width: "100%", height: "auto" }}
      />
    </Card>
  );
}

export default ListCategory;
