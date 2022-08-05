const sendMail = require('./sendMail.js')

sendMail({
    to: 'sverissimo2@gmail.com',
    subject: "Hi, Sandro!",
    vocativo: "Dear Sandro,",
    message: "This is a test",    
    sendMail: true
}) 