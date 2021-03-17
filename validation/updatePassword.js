const Validator = require("validator");
const isEmpty = require("is-empty");

module.exports = function UpdatePassword(data) {
  let errors = {};

  // Convert empty fields to an empty string so we can use validator functions
  data.password = !isEmpty(data.password) ? data.password : "";
  data.newpassword = !isEmpty(data.password) ? data.newpassword : "";
  data.newpassword2 = !isEmpty(data.password) ? data.newpassword2 : "";
  
  // Password checks
  if (Validator.isEmpty(data.password)) {
    errors.password = "Password field is required";
  }
  if (Validator.isEmpty(data.newpassword)) {
    errors.newpassword = "New password field is required";
  }
  if (Validator.isEmpty(data.newpassword2)) {
    errors.newpassword2 = "Confirm password field is required";
  }
  if (!Validator.equals(data.newpassword, data.newpassword2)) {
    errors.newpassword2 = "Passwords must match";
  }
  if (Validator.equals(data.password, data.newpassword)) {
    errors.newpassword2 = "New and old Passwords should be different";
  }

  return {
    errors,
    isValid: isEmpty(errors)
  };
};
