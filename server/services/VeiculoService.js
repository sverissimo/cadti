//@ts-check
const fs = require('fs')
const xlsx = require('xlsx')
const userSockets = require("../auth/userSockets")
const { pool } = require("../config/pgConfig")
const deleteVehiclesInsurance = require("../deleteVehiclesInsurance")
const updateVehicleStatus = require("../taskManager/veiculos/updateVehicleStatus")
const oldVehiclesModel = require('../mongo/models/oldVehiclesModel')
const getFormattedDate = require('../utils/getDate')

class VeiculoService {

    static updateInsurance = async (req, res) => {
        const { column, value, placas, deletedVehicles } = req.body
        let { table, ids, tablePK } = req.body

        if (!table)
            table = 'veiculos'
        if (placas) {
            tablePK = 'placa'
            ids = placas
        }

        let condition = ''

        //Se houver veículos para apagar, altera a apólice deles para "SegNaoCadastrado"
        if (deletedVehicles) {
            await deleteVehiclesInsurance(deletedVehicles)

            deletedVehicles.forEach(id => {
                condition = condition + `veiculo_id = '${id}' OR `
            })
            condition = condition.slice(0, condition.length - 3)
            console.log("🚀 ~ file: server.js ~ line 727 ~ app.put ~ condition", condition)

            //DESNECESSÁRIO chamar aqui e abaixo de novo...
            //@ts-ignore
            userSockets({ req, res, table: 'veiculos', condition: `WHERE ${condition}`, event: 'updateVehicle', noResponse: true })
        }
        //Atualiza o campo "apólice" dos veículos com id informado
        if (ids && ids[0]) {
            //column === 'apolice'
            let query = `
                    UPDATE ${table}
                    SET ${column} = '${value}'
                    WHERE `

            condition = ''
            ids.forEach(id => {
                condition = condition + `${tablePK} = '${id}' OR `
            })

            condition = condition.slice(0, condition.length - 3)

            query = query + condition + ` RETURNING *`
            //console.log(query)
            await pool.query(query, async (err, t) => {
                if (err) console.log(err)
                if (t && t.rows) {
                    await updateVehicleStatus(ids)
                    condition = 'WHERE ' + condition     //Adaptando para o userSocket fazer o getUpdatedData
                    //updateVehicle manda apenas os objetos atualizados, por isso o RETURNING *
                    //@ts-ignore
                    await userSockets({ req, res, table: 'veiculos', condition, event: 'updateVehicle', noResponse: true }) //noResponse é p não enviar res p o client, sendo a função abaixo vai faze-lo
                    //@ts-ignore
                    userSockets({ req, res, table: 'seguros', event: 'updateInsurance' }) //Atualiza os seguros com o join da coluna apolice dos veiculos atualizada
                }
            })
        }
        //Se não houver nenhum id, a intenção era só apagar o n de apólice do(s) veículo(s). Nesse caso res = 'no changes'
        else
            res.send('No changes whatsoever.')
    }

    getOldVehiclesXls = async () => {
        try {
            const dischargedVehicles = await oldVehiclesModel.find().select('-__v -_id').lean()
            const currentDate = getFormattedDate()
            const fileName = `Veículos baixados - ${currentDate}.xlsx`
            const wb = xlsx.utils.book_new()
            const wb_opts = { bookType: 'xlsx', type: 'binary' }
            const ws = xlsx.utils.json_to_sheet(dischargedVehicles)

            xlsx.utils.book_append_sheet(wb, ws, 'Veículos baixados')
            //@ts-ignore
            xlsx.writeFile(wb, fileName, wb_opts);

            const stream = fs.createReadStream(fileName);
            return { fileName, stream }
        } catch (error) {
            throw new Error(error.message)
        }
    }
}

module.exports = { VeiculoService }
