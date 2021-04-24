const
    express = require('express'),
    router = express.Router(),
    checkPermissions = require('../auth/checkPermissions'),
    addUser = require('./addUser'),
    editUser = require('./editUser'),
    deleteUser = require('./deleteUser')
    , { generatePass } = require('../auth/changePass')

router.post('/addUser', checkPermissions, generatePass, addUser)
//Essa rota não possui autenticação padrão porque o próprio usuário pode alterar seus dados.
router.put('/editUser', editUser)
router.delete('/deleteUser', checkPermissions, deleteUser)

module.exports = router