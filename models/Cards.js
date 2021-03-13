const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Create Schema
const CardSchema = new Schema({
  email: {
    type: String,
    required: true
  },
  debit : {
      type: Array,
      required: true
  },
  credit : {
    type: Array,
    required: true
}
});

module.exports = Cards = mongoose.model("cards", CardSchema);
