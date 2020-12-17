const logout = (req, res) => {
    res.clearCookie('aToken');
    res.sendStatus(200);
}

module.exports = logout