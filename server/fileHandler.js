const crypto = require('crypto')
const dotenv = require('dotenv')
dotenv.config()

const algorithm = 'aes-256-cbc',
    key = Buffer.from("ifsweudqifsweudqifsweudqifsweuA0")
    iv = Buffer.from("svom0aasd32146A0")

const encrypt = (fileName) => {
    let cipher = crypto.createCipheriv(algorithm, key, iv)
    let encrypted = cipher.update(fileName)
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    const pass = encrypted.toString('hex')
    return pass
}

const decrypt = (hash) => {
    let decipher = crypto.createDecipheriv(algorithm, key, iv)
    let decrypted = decipher.update(Buffer.from(hash, 'hex'))
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    const fileName = decrypted.toString()
    return fileName
}

module.exports = { encrypt, decrypt }
