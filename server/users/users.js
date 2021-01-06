const
    express = require('express'),
    router = express.Router(),
    checkPermissions = require('../auth/checkPermissions'),
    addUser = require('./addUser'),
    editUser = require('./editUser'),
    deleteUser = require('./deleteUser')


router.post('/addUser', checkPermissions, addUser)
router.put('/editUser', checkPermissions, editUser)
router.delete('/deleteUser', checkPermissions, deleteUser)

module.exports = router