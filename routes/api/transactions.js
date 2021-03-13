const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const keys = require("../../config/keys");

router.get('/transactionhealth', (req, res) => {
    return res.send('transaction route is working')
})







module.exports=router