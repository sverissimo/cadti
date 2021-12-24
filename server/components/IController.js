const { request, response } = require("express")


//@ts-check
/**
 * @class
 * @interface IController
 */
class IController {

    /**
     * 
     * @param {request} req 
     * @param {response} res 
     * @returns {Promise<void>}
     */
    async shit(req, res) {

        return
    }

}

module.exports = IController