const detailProduct = require("../models/detailModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();
const createCategory = (newCategory) => {
  const category = new detailProduct(newCategory);
  return category.save();
};

module.exports = { createCategory };
