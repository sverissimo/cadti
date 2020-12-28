const getUser = (req, res) => {
    const { user } = req
    if (user)
        return res.send(req.user)
    else
        return res.status(401).send(false)
}

module.exports = getUser 