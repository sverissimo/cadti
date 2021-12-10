const { request, response } = require("express")
const altContratoAlert = require("../../alerts/altContratoAlert")
const userSockets = require("../../auth/userSockets")
const altContratoModel = require("../../mongo/models/altContratoModel")

//@ts-check
class AltContrato {

    /**
 * @param req {request} 
 * @param res {response}
 * @returns {Promise<void>}
*/
    async list(req, res) {

        const { filter } = req
        altContratoModel.find(filter)
            .then(doc => res.send(doc))
            .catch(err => console.log(err))
    }


    /**
     * @param req {request} 
     * @param res {response}
     * @returns {Promise<void>}
     */
    async create(req, res) {
        const { razaoSocial, ...body } = req.body
        console.log({ body })

        const newDoc = new altContratoModel(body)
        newDoc.save((err, doc) => {
            if (err) {
                console.log(err)
                return res.send(err)
            }

            altContratoAlert({ ...body, razaoSocial })
            console.log('line 31 /components/AltContrato = doc', doc)
            userSockets({ req, res, event: 'insertElements', collection: 'altContrato', mongoData: [doc] })
        })
    }
}


module.exports = AltContrato