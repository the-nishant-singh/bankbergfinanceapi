const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Create Schema
const AddressSchema = new Schema({
  email: {
    type: String,
    required: true
  },
  pincode: {
    type: String,
    required: true
  },
  city: {
    type: String,
    required: true
  },
  state: {
    type: String,
    required: true
  },
  Country: {
    type: String,
    default: 'India'
  },
  fulladdress: {
      type: String,
      required: true
  }
});

module.exports = Address = mongoose.model("address", AddressSchema);
