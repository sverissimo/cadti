const counter = i => (req, res, next) => {
    if (req.url === '/api/logs') {
        i++
        console.log('******************************************\n', i, 'times connected.', 'Connected from: ', req.connection.remoteAddress, '\n******************************************')
    }
    req.myCounter =
        next()
}

module.exports = counter