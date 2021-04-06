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
const UpdatePassword = require('../../validation/updatePassword')

// Load User model
const User = require("../../models/User");
//Load Cards Model
const Cards = require('../../models/Cards')
//Load address model
const Address = require('../../models/Address')
//Load checque model
const Cheque = require('../../models/Cheques')
// transaction models
const Transactions = require('../../models/Transaction')

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

  User.findOne({phone: req.body.phone}, (err, user) => {
    if (err) throw err
    if(user){return res.send({
      error : `${req.body.phone} already registered`
    })}else{
      User.findOne({ email: req.body.email }).then((user) => {
        if (user) {
          return res.status(400).json({ error: `${req.body.email} already registered` });
        } else {
          const newUser = new User({
            name: req.body.name,
            email: req.body.email,
            password: req.body.password,
            phone: req.body.phone,
            account : `91${req.body.phone}`,
            transactionPassword: bcrypt.hashSync(req.body.transactionPassword, 10)
          });
    
          // Hash password before saving in database
          bcrypt.genSalt(10, (err, salt) => {
            bcrypt.hash(newUser.password, salt, (err, hash) => {
              if (err) throw err;
              newUser.password = hash;
              newUser
                .save()
                .then((user) => {
                  res.json(user);
                  const debitcarddetails = generateCard(req.body.name, 'Regular Debit Card', req.body.email, 'Debit')
                  Cards.create({
                    email: req.body.email,
                    debit: [
                      debitcarddetails
                    ],
                    credit: []
                  }, (err, cards) => {
                      if(err) throw err
                        let add = {
                        email : req.body.email,
                        pincode : req.body.pincode,
                        city: req.body.city,
                        state: req.body.state,
                        fulladdress: req.body.fulladdress
                      }
    
                      Address.create(add, (err, createdAddress) => {
                        RegisterMail(req.body.email, newUser.account)
                      })
    
                      let year = new Date().getFullYear().toString()
                      let date = new Date()
                      let orders = {}
                      orders[year] = [date]
                      Cheque.create({
                        email: req.body.email,
                        orders
                      }, (err, chq) => {
                        if(err) throw err
                      })
                  })
                })
                .catch((err) => console.log(err));
            });
          });
        }
      });
    }
  })
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
              token
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
      Transactions.find({email : result.email}, (err, trans) => {
        if(err) throw error
        const userinfo = {
          balance: result.balance,
          _id: result._id,
          name: result.name,
          email: result.email,
          phone: result.phone,
          account: result.account,
          transactionPassword: result.transactionPassword,
          date: result.date,
          Transactions: trans.slice(-5)
        }
        return res.send(userinfo);
      })
    });
  });
});


//update password
router.put('/updatePassword', (req, res) => {
  let token = req.headers['x-access-token']
  if(!token) return res.status(500).send({auth : false,error : "No token provided"})
  jwt.verify(token,keys.secretOrKey, (err, data) => {
      if(err) return res.status(500).send({auth : false,error : "Invalid Token"})
      const { errors, isValid } = UpdatePassword(req.body);
      if (!isValid) {
        return res.status(400).json(errors);
      }
      User.findById(data.id,(err, result) => {
        if(err) throw err
        bcrypt.compare(req.body.password, result.password).then((isMatch) => {
          if(isMatch){
            let hash = bcrypt.hashSync(req.body.newpassword)
            User.updateOne({_id : data.id}, {password : hash}, (err, result) => {
            if (err) throw err
            return res.send({message: 'password updated'})
        })
          }else{
            return res.send({error: "Old password is incorrect"})
          }
        })
      })
  })
})

module.exports = router;
