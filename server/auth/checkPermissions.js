//Verifica permissão do usuário
const requireAdmin = (req, res, next) => {
    const role = req.user && req.user.role
    if (role && role !== 'admin' || !role) {
        return res.status(403).send('O usuário não possui acesso para esta parte do CadTI.')
    }
    next()
}

const requireSeinfra = (req, res, next) => {
    if (req.method === 'GET') {
        next()
    }

    const role = req.user && req.user.role
    if (role !== 'admin' && role !== 'tecnico') {
        return res.status(403).send('O usuário não possui acesso para esta parte do CadTI.')
    }
    next()
}

module.exports = { requireAdmin, requireSeinfra }