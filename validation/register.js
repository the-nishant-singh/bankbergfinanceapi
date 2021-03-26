const Validator = require("validator");
const isEmpty = require("is-empty");

module.exports = function validateRegisterInput(data) {
  let errors = {};

  // Convert empty fields to an empty string so we can use validator functions
  data.name = !isEmpty(data.name) ? data.name : "";
  data.email = !isEmpty(data.email) ? data.email : "";
  data.password = !isEmpty(data.password) ? data.password : "";
  data.password2 = !isEmpty(data.password2) ? data.password2 : "";
  data.transactionPassword = !isEmpty(data.transactionPassword) ? data.transactionPassword : "";
  data.pincode = !isEmpty(data.pincode) ? data.pincode : "";
  data.city = !isEmpty(data.city) ? data.city : "";
  data.state = !isEmpty(data.state) ? data.state : "";
  data.fulladdress = !isEmpty(data.fulladdress) ? data.fulladdress : "";

  // Name checks
  if (Validator.isEmpty(data.name)) {
    errors.error = "Name field is required";
  }

  // Email checks
  if (Validator.isEmpty(data.email)) {
    errors.error = "Email field is required";
  } else if (!Validator.isEmail(data.email)) {
    errors.error = "Email is invalid";
  }

  // Password checks
  if (Validator.isEmpty(data.password)) {
    errors.error = "Password field is required";
  }

  if (Validator.isEmpty(data.password2)) {
    errors.error = "Confirm password field is required";
  }

  if (!Validator.isLength(data.password, { min: 6, max: 30 })) {
    errors.error = "Password must be at least 6 characters";
  }

  if (!Validator.equals(data.password, data.password2)) {
    errors.error = "Passwords must match";
  }

  if (!Validator.isLength(data.transactionPassword, { min: 6, max: 30 })) {
    errors.error = "Transaction Password must be at least 6 characters";
  }

  if (Validator.equals(data.password, data.transactionPassword)) {
    errors.error = "Password and Transaction Password cannot be same";
  }

  //address checks
  if (Validator.isEmpty(data.pincode)) {
    errors.error = "Pincode field is required";
  }
  if (!Validator.isLength(data.pincode, { min: 6, max: 6 })) {
    errors.errorv = "pincode must be 6 characters";
  }
  if (Validator.isEmpty(data.state)) {
    errors.error = "state field is required";
  }
  if (Validator.isEmpty(data.fulladdress)) {
    errors.error = "fulladdress field is required";
  }
  if (Validator.isEmpty(data.city)) {
    errors.error = "city field is required";
  }


  return {
    errors,
    isValid: isEmpty(errors)
  };
};
