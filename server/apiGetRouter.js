const { pool } = require('./config/pgConfig')
const
    { empresas, veiculos, modeloChassi, carrocerias, equipamentos, seguradoras,
        seguros, socios, procuradores, procuracoes, empresasLaudo, laudos, acessibilidade } = require('./queries'),

    routes = {
        empresas, veiculos, modelosChassi: modeloChassi, carrocerias, equipamentos, seguradoras,
        seguros, socios, procuradores, procuracoes, empresasLaudo, laudos, acessibilidade
    }

const apiGetRouter = (req, res) => {
    let url = req.url.replace('/api/', '')        

    pool.query(routes[url], (err, table) => {
        if (err) res.send(err)
        if (table.rows.length === 0) { res.send(table.rows); return }
        res.json(table.rows)
    })    
}

module.exports = { apiGetRouter }