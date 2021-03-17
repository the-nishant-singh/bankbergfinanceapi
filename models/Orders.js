const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const generateOrderId = () => {
    return (Math.floor(Math.random() * (9999999999 - 1000000000)) + 1000000000).toString()
}


// Create Schema
const OrderSchema = new Schema({
  email: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  amount : {
    type: Number,
    required: true
  },
  operator : {
      type: String,
      required : true
  },
  orderId : {
      type : String,
      default : generateOrderId()
  },
  type : {
    type: String,
    required : true
  },
  number : {
    type: String,
    required : true
  },
  circle: {
    type: String,
    required: true
  },
  status : {
    type: String,
    default: 'Successfull'
  }

});

module.exports = Orders = mongoose.model("orders", OrderSchema);
