const
    { pool } = require("./config/pgConfig"),
    updateVehicleStatus = require("./taskManager/veiculos/updateVehicleStatus")

const deleteVehiclesInsurance = async vehicleIds => {

    let
        condition = '',
        delQuery = `
        UPDATE veiculos SET apolice = 'Seguro não cadastrado', situacao = 'Seguro vencido!!!'
        `

    vehicleIds.forEach(id => {
        condition += `WHERE veiculo_id = ${id} OR `
    })

    condition = condition.slice(0, condition.length - 3)
    delQuery += condition
    //console.log("🚀 ~ file: deleteVehiclesInsurance.js ~ line 19 ~ delQuery", delQuery)

    await pool.query(delQuery, (err, t) => {
        if (err)
            console.log(err)
        if (t)
            console.log('deleteVehicleInsurance: seg n cadastrado registered.', t)
    })

    await updateVehicleStatus(vehicleIds)
    console.log('deleted vehicle apolice number')
    return
}

module.exports = deleteVehiclesInsurance