const { HarmCategory } = require("@google/generative-ai");
const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const detailModal = new Schema({
  Category: { type: String, required: true },
});

module.exports = mongoose.model("detailProduct", detailModal);
