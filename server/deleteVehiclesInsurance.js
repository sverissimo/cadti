const { pool } = require("./config/pgConfig")

const deleteVehiclesInsurance = vehicleIds => {

    let
        condition = '',
        delQuery = `
        UPDATE veiculos SET apolice = 'Seguro não cadastrado', situacao = 'Seguro vencido'    
        `

    vehicleIds.forEach(id => {
        condition += `WHERE veiculo_id = ${id} OR `
    })

    condition = condition.slice(0, condition.length - 3)
    delQuery += condition

    console.log(delQuery)
    pool.query(delQuery, (err, t) => {
        if (err) console.log(err)
        if (t) console.log(t)
    })

}

module.exports = deleteVehiclesInsurance