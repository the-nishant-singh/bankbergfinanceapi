const nodemailer = require("nodemailer");

let transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "bankbergfinance@gmail.com",
    pass: "capstone@project",
  },
});


//


//  register mail
const RegisterMail = (email) => {
  let mailOptions = {
    from: "bankbergfinance@gmail.com",
    to: email,
    subject: "Welcome you are registered",
    text: "Hi, welcome to Bank Berg Finance, We are happy to see you on board",
  };

  transporter.sendMail(mailOptions, (err, data) => {
    if (err) console.log("error", err);
    console.log("mail sent!");
  });
};

// login mail
const LoginMail = (email) => {
  let mailOptions = {
    from: "bankbergfinance@gmail.com",
    to: email,
    subject: "Login Notification",
    text: "We have noticed a login from your account",
  };

  transporter.sendMail(mailOptions, (err, data) => {
    if (err) console.log("error", err);
    console.log("mail sent!");
  });
};

module.exports = {RegisterMail, LoginMail}

