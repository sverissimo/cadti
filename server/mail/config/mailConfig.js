const dotenv = require('dotenv')

if (!process.env.MAIL_SERVICE)
    dotenv.config({ path: '../../../.env' })
if (!process.env.MAIL_SERVICE)
    dotenv.config({ path: '../../.env' })

module.exports = {
    service: process.env.MAIL_SERVICE,
/*     port: process.env.MAIL_PORT,
    secure: true,
 */    auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS
    }
}