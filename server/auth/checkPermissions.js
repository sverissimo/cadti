//Verifica permissão do usuário
const checkPermissions = (req, res, next) => {

    const role = req.user && req.user.role

    if (role && role !== 'admin' || !role)
        return res.status(403).send('O usuário não possui acesso para esta parte do CadTI.')

    next()
}

module.exports = checkPermissions