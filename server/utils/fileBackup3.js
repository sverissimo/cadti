const fileBackup = (request, response, next) => {
    var form = new multiparty.Form();

    form.on('part', function (formPart) {
        var contentType = formPart.headers['content-type'];

        var formData = {
            file: {
                value: formPart,
                options: {
                    filename: formPart.filename,
                    contentType: contentType,
                    knownLength: formPart.byteCount
                }
            }
        }
        const backupSocket = req.app.get('backupSocket')
        //console.log("🚀 ~ file: fileBackup.js ~ line 9 ~ fileBackup ~ req.files", req.files)
        backupSocket.emit({ name: 'a', data: formData })
        next()
    })

    form.on('error', function (error) {
        next(error);
    });

    form.on('close', function () {
        response.send('received upload');
    });

    form.parse(request);
    next()
};