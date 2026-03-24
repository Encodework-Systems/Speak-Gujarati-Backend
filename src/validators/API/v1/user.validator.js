// Import the necessary functions from the express-validator library
const { body, query } = require("express-validator");

// Validator for sending OTP to mobile or email
exports.register = [
  // Check if 'email_or_phone_number' exists

  body("email")
    .exists()
    .withMessage("email is required")
    // Check if 'email_or_phone_number' is not empty
    .isLength({
      min: 1,
    })
    .withMessage("email cannot be empty")
    // Check if 'email_or_phone_number' is a string
    .isString()
    .withMessage("email should be a string"),

  body("password")
    .exists()
    .withMessage("password is required")
    // Check if 'email_or_phone_number' is not empty
    .isLength({
      min: 1,
    })
    .withMessage("password cannot be empty"),
  // Check if 'email_or_phone_number' is a string

  // body("fullname")
  //   .exists()
  //   .withMessage("fullname is required")
  //   .isLength({
  //     min: 1,
  //   })
  //   .withMessage("fullname cannot be empty")
    
  // body("confirmPassword")
  //   .exists()
  //   .withMessage("confirm password is required")
  //   // Check if 'email_or_phone_number' is not empty
  //   .isLength({
  //     min: 1,
  //   })
  //   .withMessage("confirm password cannot be empty"),
  // Check if 'email_or_phone_number' is a string
];

exports.login = [
  body("email")
    .exists()
    .withMessage("email is required")
    // Check if 'firstname' is not empty
    .isLength({
      min: 1,
    })
    .withMessage("email cannot be empty")
    // Check if 'firstname' is a string
    .isString()
    .withMessage("email should be a string"),

  // Check if 'lastname' exists
  body("password")
    .exists()
    .withMessage("password is required")
    // Check if 'lastname' is not empty
    .isLength({
      min: 1,
    })
    .withMessage("password cannot be empty")
    // Check if 'lastname' is a string
    .isString()
    .withMessage("password should be a string"),
];
exports.forgotPassword = [
  body("email")
    .exists()
    .withMessage("email is required")
    // Check if 'firstname' is not empty
    .isLength({
      min: 1,
    })
    .withMessage("email cannot be empty")
    // Check if 'firstname' is a string
    .isString()
    .withMessage("email should be a string"),
];
exports.changePassword = [
  body("oldPassword")
    .exists()
    .withMessage("old password is required")
    // Check if 'firstname' is not empty
    .isLength({
      min: 1,
    })
    .withMessage("old password cannot be empty")
    // Check if 'firstname' is a string
    .isString()
    .withMessage("old password should be a string"),

  body("newPassword")
    .exists()
    .withMessage("new password is required")
    // Check if 'firstname' is not empty
    .isLength({
      min: 1,
    })
    .withMessage("new password cannot be empty")
    // Check if 'firstname' is a string
    .isString()
    .withMessage("new password should be a string"),
];

// Validator for sending OTP to mobile or email

// Validator for sending OTP to mobile or email
exports.updateLevel = [
  body("level")
    .exists()
    .withMessage("level is required")

    .isLength({
      min: 1,
    })
    .withMessage("level cannot be empty"),
];
