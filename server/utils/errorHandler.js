
function notFound(req, res, next) {
    const error = new Error("Not found!!!!");
    error.status = 404
    next(error);
}

function internalError(error, req, res, next) {
    res.status(error.status || 500);

    const
        { message, name } = error,
        errorLines = error.stack.split('\n')

    console.log(
        '\n******************' +
        '\nError name: ' + name +
        '\nError message: ' + message +
        '\nError line: ' + errorLines[1] +
        //      '\nError line2: ' + errorLines[2] +
        '\n*********************\n'
    )

    res.json({
        errorStatus: error.status || 500,
        errorMessage: message,
    });
}

module.exports = [notFound, internalError]
