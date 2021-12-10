const { request, response } = require("express")
const userSockets = require("../../auth/userSockets")
const logsModel = require("../../mongo/models/logsModel")

//@ts-check
class Solicitacoes {

    /**
 * @param req {request} 
 * @param res {response}
 * @returns {Promise<void>}
*/
    async list(req, res) {

        const { filter } = req

        logsModel.find(filter)
            .then(doc => res.send(doc))
            .catch(err => console.log(err))
    }


    /**
     * @param req {request} 
     * @param res {response}
     * @returns {Promise<void>}
     */
    async create(req, res) {
        const
            { collection } = req.body,
            { id, doc } = res.locals,
            insertedObjects = [doc]

        let event
        //Se a solicitação é nova, insere no socket pelo event 'insert' (StoreHOC ouvindo no client)
        if (!id)
            event = 'insertElements'
        //Senão, apenas atualiza os objetos no store do client pelo socket
        else
            event = 'updateLogs'

        userSockets({ req, res, event, collection, mongoData: insertedObjects })
    }
}


module.exports = Solicitacoes