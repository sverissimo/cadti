//@ts-check
const { pool } = require("../config/pgConfig")
const { getUpdatedData } = require("../getUpdatedData")
const segurosModel = require("../mongo/models/segurosModel")
const { seguros } = require("../queries")
/**REFACTOR!!!!!!!!!!!!! */

class SeguroService {

    static updateInsurance = async (req, res) => {
        const { columns, updates, id, vehicleIds } = req.body
        const io = req.app.get('io')

        let queryString = ''
        columns.forEach(col => {
            queryString += `
                    UPDATE seguros
                    SET ${col} = '${updates[col]}'
                    WHERE id = ${id};
            `
        })

        await pool.query(queryString, (err, t) => {
            if (err) console.log(err)
            pool.query(seguros, (err, t) => {
                if (err) console.log(err)
                if (t && t.rows) io.sockets.emit('updateInsurance', t.rows)
            })
        })

        let
            condition = '',
            query = `
                SELECT * FROM veiculos
                WHERE `

        if (vehicleIds && vehicleIds[0]) {
            vehicleIds.forEach(id => {
                condition = condition + `veiculos.veiculo_id = '${id}' OR `
            })
            condition = condition.slice(0, condition.length - 3)
            query = query + condition

            await pool.query(query, (err, t) => {
                if (err) console.log(err)
                if (t && t.rows) {
                    const data = getUpdatedData('veiculos', `WHERE ${condition}`)
                    data.then(async res => {
                        await io.sockets.emit('updateVehicle', res)
                        pool.query(seguros, (err, t) => {
                            if (err) console.log(err)
                            if (t && t.rows) io.sockets.emit('updateInsurance', t.rows)
                        })
                    })
                }
            })
            res.send(vehicleIds)
        } else res.send('No changes whatsoever.')
    }

    static saveUpComingInsurances = (req, res) => {
        const { user, body } = req
        const role = user && user.role
        const segModel = new segurosModel(body)

        if (role === 'empresa')
            return res.status(403).send('O usuário não possui permissões para esse cadastro no cadTI.')

        segModel.save(function (err, doc) {
            if (err) console.log(err)
            if (doc) res.locals = { doc }
            res.send('saved in mongoDB')
        })
    }
}

module.exports = { SeguroService }
