const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const keys = require("../../config/keys");
const encrypter = require('encrypter-js');

router.get('/cardshealth', (req, res) => {
    return res.send('cards route is working properly')
})


//get debit cards
router.get('/getdebitcard', (req, res) => {
    let token = req.headers["x-access-token"];
    if (!token)
    return res.status(500).send({ auth: false, error: "No token provided" });
    jwt.verify(token, keys.secretOrKey, (err, data) => {
    if (err)
        return res.status(500).send({ auth: false, error: "Invalid Token" });
    User.findById(data.id, { password: 0, balance: 0, date: 0, _id: 0 }, (err, result) => {
        Cards.find({email: result.email}, (err, data) => {
            if(err) throw err

            card = []
            if(data[0].debit){
                data[0].debit.map((item) => {
                    card.push(encrypter.decrypt(item))
                })
            }
           
            return res.send(card)
        })
    });
    });
})


//get credit cards
router.get('/getcreditcard', (req, res) => {
    let token = req.headers["x-access-token"];
    if (!token)
    return res.status(500).send({ auth: false, error: "No token provided" });
    jwt.verify(token, keys.secretOrKey, (err, data) => {
    if (err)
        return res.status(500).send({ auth: false, error: "Invalid Token" });
    User.findById(data.id, { password: 0, balance: 0, date: 0, _id: 0 }, (err, result) => {
        Cards.find({email: result.email}, (err, data) => {
            if(err) throw err

            card = []
            if(data[0].credit){
                data[0].credit.map((item) => {
                    card.push(encrypter.decrypt(item))
                })
            }
           
            return res.send(card)
        })
    });
    });
})

module.exports = router;