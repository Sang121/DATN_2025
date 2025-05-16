import axios from "axios";
import React from "react";

import { BaseUrl } from "./dumpApi";
export const fetchProducts = () => {
  return axios
    .get(`${BaseUrl}/products?limit=10`)
    .then((response) => {
      return response.data.products;
    })
    .catch((error) => {
      console.error(error);
    });
};

export let products = [];

fetchProducts().then((data) => {
  products = data;
});

export default fetchProducts;
