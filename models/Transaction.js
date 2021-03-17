const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Create Schema
const TransactionSchema = new Schema({
  email: {
    type: String,
    required: true
  },
  amount : {
      type: Number,
      required: true
  },
  type : {
    type: String,
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  curBalance: {
    type: Number,
    required: true
  },
  about : {
    type: String,
    required: true
  }

});

module.exports = Transactions = mongoose.model("transactions", TransactionSchema);
