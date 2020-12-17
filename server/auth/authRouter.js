const
    express = require('express'),
    router = express.Router(),
    signUp = require('./signUp'),
    login = require('./login'),
    logout = require('./logout')

router.post('/signUp', signUp)
router.post('/login', login)
router.get('/logout', logout)

module.exports = router