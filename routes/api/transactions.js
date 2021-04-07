const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const keys = require("../../config/keys");
const User = require("../../models/User");
const bcrypt = require("bcryptjs");
const { AddMoneyMail, MoneyTransferMail, MoneyReceivedMail, ChequeOrderMail, BillandRechargeMail } = require('../../mailer/sendMails')

//load transaction model
const Transactions = require('../../models/Transaction')
//load cheque model
const Cheque = require('../../models/Cheques');
//load order model
const Order = require('../../models/Orders')
//import address models
const Address = require('../../models/Address')

router.get('/transactionhealth', (req, res) => {
    return res.send('transaction route is working')
})

router.post('/addMoney', (req, res) => {
    let token = req.headers['x-access-token']
    if (!token) return res.status(500).send({ auth: false, error: "No token provided" })
    jwt.verify(token, keys.secretOrKey, (err, data) => {
        if (err) return res.status(500).send({ auth: false, error: "Invalid Token" })
        User.findById(data.id, { password: 0, date: 0, _id: 0 }, (err, result) => {
            User.updateOne({ _id: data.id }, { balance: result.balance + req.body.amount }, (err, updatedbalance) => {
                if (err) throw err
                let trans = {
                    email: result.email,
                    amount: req.body.amount,
                    type: 'CR',
                    curBalance: result.balance + req.body.amount,
                    about: 'Add Money'
                }
                Transactions.create(trans, (err, transaction) => {
                    AddMoneyMail(trans.email, trans.amount, trans.curBalance)
                    return res.send({ message: `Rs ${req.body.amount} successfully added to your account` })
                })
            })
        })
    })
})

//sendMoney to same bank:
router.post('/sendmoney', (req, res) => {
    let token = req.headers['x-access-token']
    if (!token) return res.status(500).send({ auth: false, error: "No token provided" })
    jwt.verify(token, keys.secretOrKey, (err, data) => {
        if (err) return res.status(500).send({ auth: false, error: "Invalid Token" })
        User.findById(data.id, { password: 0, date: 0, _id: 0 }, (err, result) => {
            if (err) {
                console.log(err)
                return res.send(err)
            }
            if (bcrypt.compareSync(req.body.transactionPassword, result.transactionPassword)) {
                if (req.body.amount > 0) {
                    if (result.balance >= req.body.amount) {
                        User.findOne({ account: req.body.account }, (err, recepient) => {
                            if (!recepient) { return res.send({ error: 'Invalid Recepient' }) }
                            else {
                                User.updateOne({ _id: data.id }, { balance: result.balance - req.body.amount }, (err, updatedbalance) => {
                                    if (err) throw err
                                    let trans = {
                                        email: result.email,
                                        amount: req.body.amount,
                                        type: 'DR',
                                        curBalance: result.balance - req.body.amount,
                                        about: `Money Transfer to ${req.body.account}`
                                    }
                                    Transactions.create(trans, (err, transaction) => {
                                        if (err) throw err
                                        User.updateOne({ account: req.body.account }, { balance: recepient.balance + req.body.amount }, (err, updatedbenificiary) => {
                                            if (err) throw err
                                            let benf = {
                                                email: recepient.email,
                                                amount: req.body.amount,
                                                type: 'CR',
                                                curBalance: recepient.balance + req.body.amount,
                                                about: `Money Received from ${result.account}`
                                            }
                                            Transactions.create(benf, (err, received) => {
                                                if (err) throw err
                                                MoneyTransferMail(trans.email, trans.amount, trans.curBalance, toAccount = req.body.account.slice(-4))
                                                MoneyReceivedMail(benf.email, benf.amount, benf.curBalance, fromAccount = result.account.slice(-4))
                                                return res.send({ message: `Rs ${req.body.amount} successfully transferred` })
                                            })
                                        })
                                    })
                                })
                            }
                        })
                    } else {
                        res.send({ error: 'Insufficient Balance' })
                    }
                } else {
                    return res.send({ error: 'Invalid Amount' })
                }
            } else {
                return res.send({ error: 'Incorrect Transaction Password' })
            }
        })
    })
})


// check for statements
// router.post('/statements', (req, res) => {
//     let token = req.headers['x-access-token']
//     if(!token) return res.status(500).send({auth : false,error : "No token provided"})
//     jwt.verify(token,keys.secretOrKey, (err, data) => {
//         if(err) return res.status(500).send({auth : false,error : "Invalid Token"})
//         User.findById(data.id, { password: 0, date: 0, _id: 0 }, (err, result) => {
//             User.updateOne({_id : data.id}, {balance:  result.balance + req.body.amount}, (err, updatedbalance) => {
//                 if (err) throw err
//                 let trans = {
//                     email: result.email,
//                     amount: req.body.amount,
//                     type: 'CR',
//                     curBalance : result.balance + req.body.amount,
//                     about: 'Add Money'
//                 }
//                 Transactions.create(trans,(err, transaction) => {
//                     AddMoneyMail(trans.email, trans.amount, trans.curBalance)
//                     return res.send({message: `Rs ${req.body.amount} successfully added to your account`})
//                 })
//             })
//         })
//     })
// })


//get statement
router.post('/getstatement', (req, res) => {
    let token = req.headers['x-access-token']
    if (!token) return res.status(500).send({ auth: false, error: "No token provided" })
    jwt.verify(token, keys.secretOrKey, (err, data) => {
        if (err) return res.status(500).send({ auth: false, error: "Invalid Token" })
        User.findById(data.id, { password: 0, date: 0, _id: 0 }, (err, result) => {
            if (!req.body.from || !req.body.to) {
                Transactions.find({ email: result.email }, (err, trans) => {
                    return res.send(trans.slice(-5))
                })
            } else {
                Transactions.find({
                    email: result.email, date: {
                        $gte: `${req.body.from}T00:00:00.000+00:00`,
                        $lt: `${req.body.to}T23:59:59.000+00:00`
                    }
                }, (err, data) => {
                    if (data) {
                        console.log(data.length)
                        return res.send(data)
                    }
                })
            }
        })
    })
})

//order chequebook
router.get('/orderchequebook', (req, res) => {
    let token = req.headers['x-access-token']
    if (!token) return res.status(500).send({ auth: false, error: "No token provided" })
    jwt.verify(token, keys.secretOrKey, (err, data) => {
        if (err) return res.status(500).send({ auth: false, error: "Invalid Token" })
        User.findById(data.id, { password: 0, date: 0, _id: 0 }, (err, result) => {
            Cheque.findOne({ email: result.email }, (err, chequedata) => {
                let year = new Date().getFullYear().toString()
                if (chequedata.orders[year]) {
                    let amount = 50
                    if (result.balance >= amount) {
                        let chqarray = chequedata.orders[year]
                        let date = new Date()
                        let neworders = chequedata.orders
                        chqarray.push(date)
                        neworders[year] = chqarray
                        Cheque.updateOne({ email: result.email }, { orders: neworders }, (err, order) => {
                            if (err) throw err
                            Transactions.create({
                                email: result.email,
                                amount,
                                type: 'DR',
                                curBalance: result.balance - amount,
                                about: 'Chequebook orderd'
                            }, (err, trans) => {
                                if (err) throw err
                                User.updateOne({ email: result.email }, { balance: result.balance - amount }, (err, updatedbenificiary) => {
                                    if (err) throw err
                                    ChequeOrderMail(result.email, amount)
                                    return res.send({ message: 'cheque book ordered and you have been charged Rs 50' })
                                })
                            })
                        })
                    } else {
                        return res.send({ error: 'Insufficient balance in your account' })
                    }
                } else {
                    let date = new Date()
                    let neworders = chequedata.orders
                    neworders[year] = [date]
                    Cheque.updateOne({ email: result.email }, { orders: neworders }, (err, order) => {
                        if (err) throw err
                        ChequeOrderMail(result.email, 0)
                        return res.send({ message: 'cheque book ordered, You have not been charged' })
                    })
                }
            })
        })
    })
})

//get address 
router.get("/getaddress", (req, res) => {
    let token = req.headers["x-access-token"];
    if (!token)
      return res.status(500).send({ auth: false, error: "No token provided" });
    jwt.verify(token, keys.secretOrKey, (err, data) => {
      if (err)
        return res.status(500).send({ auth: false, error: "Invalid Token" });
      User.findById(data.id, { password: 0 }, (err, result) => {
        Address.find({email: result.email}, (err, address) => {
            if(err) throw err;
            return res.send(address[0])
        })
      });
    });
  });

router.post('/billandrecharges', (req, res) => {
    let token = req.headers['x-access-token']
    if (!token) return res.status(500).send({ auth: false, error: "No token provided" })
    jwt.verify(token, keys.secretOrKey, (err, data) => {
        if (err) return res.status(500).send({ auth: false, error: "Invalid Token" })
        User.findById(data.id, { password: 0, date: 0, _id: 0 }, (err, result) => {
            if (bcrypt.compareSync(req.body.transactionPassword, result.transactionPassword)) {
                if (req.body.amount > 0) {
                    if (result.balance > req.body.amount) {
                        User.updateOne({ _id: data.id }, { balance: result.balance - req.body.amount }, (err, updatedbalance) => {
                            if (err) throw err
                            Transactions.create({
                                email: result.email ,
                                amount: req.body.amount,
                                type: 'DR',
                                curBalance: result.balance - req.body.amount,
                                about: req.body.type
                            }, (err, trans) => {
                                if (err) throw err
                                Orders.create({
                                    email: result.email,
                                    amount: req.body.amount,
                                    operator: req.body.operator,
                                    type: req.body.type,
                                    number: req.body.number,
                                    circle: req.body.circle,
                                }, (err, order) => {
                                    if (err) throw err
                                    BillandRechargeMail(result.email, req.body.amount, req.body.type, req.body.operator, req.body.number)
                                    return res.send({ message: 'Payment Successfull' })
                                })
                            })
                        })
                    } else {
                        return res.send({ error: 'Incufficient Balance' })
                    }
                } else {
                    return res.send({ error: 'Invalid Amount' })
                }
            } else {
                return res.send({ error: 'Invalid Transactions Password' })
            }
        })
    })
})


// router.post('/addMoney', (req, res) => {
//     let token = req.headers['x-access-token']
//     if(!token) return res.status(500).send({auth : false,error : "No token provided"})
//     jwt.verify(token,keys.secretOrKey, (err, data) => {
//         if(err) return res.status(500).send({auth : false,error : "Invalid Token"})
//         User.findById(data.id, { password: 0, date: 0, _id: 0 }, (err, result) => {
//             User.updateOne({_id : data.id}, {balance:  result.balance + req.body.amount}, (err, updatedbalance) => {
//                 if (err) throw err
//                 let trans = {
//                     email: result.email,
//                     amount: req.body.amount,
//                     type: 'CR',
//                     curBalance : result.balance + req.body.amount,
//                     about: 'Add Money'
//                 }
//                 Transactions.create(trans,(err, transaction) => {
//                     AddMoneyMail(trans.email, trans.amount, trans.curBalance)
//                     return res.send({message: `Rs ${req.body.amount} successfully added to your account`})
//                 })
//             })
//         })
//     })
// })

module.exports = router