const
    express = require('express'),
    router = express.Router(),
    signUp = require('./signUp'),
    login = require('./login'),
    logout = require('./logout'),
    verifyUser = require('./verifyUser'),
    { generatePass, changePass, sendPass } = require('./changePass')

router.post('/signUp', signUp)
router.post('/login', login)
router.get('/logout', logout)
router.get('/verifyUser/:id', verifyUser)
router.post('/forgotPassword', generatePass, changePass, sendPass)

module.exports = router