const encrypter = require('encrypter-js');
const cardgenerator = require("fake_credit_card");
const number = cardgenerator.flag(cardgenerator.flags.VISA).cardNumber


const cvvgenerator = () => {
  return (Math.floor(Math.random() * (999 - 100)) + 100).toString()
}

const generateCard = (name, cardType) => {
    var d = new Date();
    expiry = '01/01/' + (d.getFullYear()+3)

    const card = {
    number: number[0].number,
    cvv : cvvgenerator(),
    expiry,
    name,
    type : 'Visa',
    cardType
    }

    let encryptedCard = encrypter.encrypt(card);
    return encryptedCard
}

module.exports=generateCard
