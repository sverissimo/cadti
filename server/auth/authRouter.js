const
    express = require('express'),
    router = express.Router(),
    signUp = require('./signUp'),
    login = require('./login')

router.post('/signUp', signUp)
router.post('/login', login)

module.exports = router