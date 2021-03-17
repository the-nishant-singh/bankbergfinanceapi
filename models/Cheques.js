const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Create Schema
const ChequeSchema = new Schema({
  email: {
    type: String,
    required: true
  },
  orders: {
    type : Object,
    required : true
  }
});

module.exports = Cheque = mongoose.model("cheque", ChequeSchema);
