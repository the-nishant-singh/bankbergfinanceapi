const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const keys = require("../../config/keys");
const passport = require("passport");
const {RegisterMail,LoginMail} = require("../../mailer/sendMails");
const generateCard = require('../../cardGenerator/generateCard')

// Load input validation
const validateRegisterInput = require("../../validation/register");
const validateLoginInput = require("../../validation/login");

// Load User model
const User = require("../../models/User");
//Load Cards Model
const Cards = require('../../models/Cards')

// @route POST api/users/register
// @desc Register user
// @access Public
router.post("/register", (req, res) => {
  // Form validation

  const { errors, isValid } = validateRegisterInput(req.body);

  // Check validation
  if (!isValid) {
    return res.status(400).json(errors);
  }

  User.findOne({ email: req.body.email }).then((user) => {
    if (user) {
      return res.status(400).json({ email: "Email already exists" });
    } else {
      RegisterMail(req.body.email)
      return res.send("hello")
      // const newUser = new User({
      //   name: req.body.name,
      //   email: req.body.email,
      //   password: req.body.password
      // });

      // // Hash password before saving in database
      // bcrypt.genSalt(10, (err, salt) => {
      //   bcrypt.hash(newUser.password, salt, (err, hash) => {
      //     if (err) throw err;
      //     newUser.password = hash;
      //     newUser
      //       .save()
      //       .then((user) => {
      //         res.json(user);
      //         RegisterMail(req.body.email)
      //         Cards.create({
      //           email: req.body.email,
      //           debit: [
      //             generateCard(req.body.name, 'Regular Debit Card')
      //           ],
      //           credit: []
      //         }, (err, cards) => {
        
      //         })
      //       })
      //       .catch((err) => console.log(err));
      //   });
      // });

    }
  });
});

// @route POST api/users/login
// @desc Login user and return JWT token
// @access Public
router.post("/login", (req, res) => {
  // Form validation

  const { errors, isValid } = validateLoginInput(req.body);

  // Check validation
  if (!isValid) {
    return res.status(400).json(errors);
  }

  const email = req.body.email;
  const password = req.body.password;

  // Find user by email
  User.findOne({ email }).then((user) => {
    // Check if user exists
    if (!user) {
      return res.status(404).json({ emailnotfound: "Email not found" });
    }

    // Check password
    bcrypt.compare(password, user.password).then((isMatch) => {
      if (isMatch) {
        // User matched
        // Create JWT Payload
        const payload = {
          id: user.id,
          name: user.name,
        };

        // Sign token
        jwt.sign(
          payload,
          keys.secretOrKey,
          {
            expiresIn: 31556926, // 1 year in seconds
          },
          (err, token) => {
            LoginMail(req.body.email)
            res.json({
              success: true,
              token: "Bearer " + token,
            });
          }
        );
      } else {
        return res
          .status(400)
          .json({ passwordincorrect: "Password incorrect" });
      }
    });
  });
});

//user details
router.get("/userInfo", (req, res) => {
  let token = req.headers["x-access-token"];
  if (!token)
    return res.status(500).send({ auth: false, error: "No token provided" });
  jwt.verify(token, keys.secretOrKey, (err, data) => {
    if (err)
      return res.status(500).send({ auth: false, error: "Invalid Token" });
    User.findById(data.id, { password: 0 }, (err, result) => {
      res.send(result);
    });
  });
});
module.exports = router;
