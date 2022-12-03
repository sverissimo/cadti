//@ts-check
const
    { request, response } = require('express')
    , VeiculoRepository = require("../repositories/VeiculoRepository")
    , userSockets = require('../auth/userSockets')
    , { Controller } = require('./Controller')
const { pool } = require('../config/pgConfig')
const { getUpdatedData } = require('../getUpdatedData')
const oldVehiclesModel = require('../mongo/models/oldVehiclesModel')

/**
 * @class 
 */
class VeiculoController extends Controller {


    /**
     * @param {request} req 
     * @param {response} res 
     * @returns {Promise<void | res>}
     */
    async create(req, res) {
        const veiculo = req.body
        try {
            const veiculoRepository = new VeiculoRepository('veiculos', 'veiculo_id')
                , exists = await veiculoRepository.find({ placa: veiculo.placa })

            if (exists.length)
                return res.status(409).send('A placa informada já está cadastrada no sistema.')

            const veiculoId = await veiculoRepository.create(veiculo)
                , condition = `WHERE veiculos.veiculo_id = '${veiculoId}'`

            //@ts-ignore
            //Atualiza os dados no frontEnd por meio de webSockets
            userSockets({
                req,
                table: 'veiculos',
                event: 'insertVehicle',
                condition,
                veiculo_id: veiculoId,
                noResponse: true
            })

            res.status(201).send(JSON.stringify(veiculoId))

        } catch (error) {
            console.error("🚀 ~ file: VeiculoController.js ~ line 64 ~ VeiculoController ~ create ~ error", error)
            res.status(500).send(error.message)
        }
    }


    /**
     * @override
     * @param {request} req 
     * @param {response} res 
     * @returns {Promise<void | res>}
     */
    update = async (req, res) => {

        const
            veiculoRepository = new VeiculoRepository('veiculos', 'veiculo_id')
            , { codigoEmpresa, ...veiculo } = req.body
            , condition = `WHERE veiculos.veiculo_id = '${req.body.veiculo_id}'`

        if (Object.keys(veiculo).length <= 1)
            return res.status(409).send('Nothing to update...')

        try {
            const exists = await veiculoRepository.find(req.body.veiculo_id)
            if (!exists.length)
                return res.status(409).send('Veículo não cadastrado na base de dados.')

            const veiculoId = await veiculoRepository.update(veiculo)
            res.send(JSON.stringify(veiculoId))
        } catch (error) {
            console.log("🚀 ~ file: VeiculoController.js ~ line 72 ~ VeiculoController ~ update= ~ error", error)
            throw error
        }


        //@ts-ignore
        userSockets({ req, noResponse: true, table: 'veiculos', condition, event: 'updateVehicle' })
    }



    getAllVehicles = async (req, res) => {

        const { codigoEmpresa } = req.query
        if (!codigoEmpresa) {
            return res.status(400).send('Código da empresa obrigatório para esse request.')
        }

        const segCondition = `WHERE seguros.codigo_empresa = ${codigoEmpresa} `
        const seguros = await getUpdatedData('seguros', segCondition) || []

        let vehicleIds = []

        //Pega todos os veículos assegurados, pertencentes ou não à frota, com compartilhamento ou não(irregulares)
        seguros.forEach(s => {
            if (s.veiculos && s.veiculos[0])
                vehicleIds.push(...s.veiculos)
        })
        if (!vehicleIds[0])
            //@ts-ignore
            vehicleIds = 0

        const vQuery = `
        SELECT veiculos.veiculo_id, veiculos.placa, veiculos.codigo_empresa, e.razao_social as empresa, e2.razao_social as compartilhado
        FROM veiculos
        LEFT JOIN empresas e
            ON veiculos.codigo_empresa = e.codigo_empresa
        LEFT JOIN empresas e2
            ON veiculos.compartilhado_id = e2.codigo_empresa
        WHERE veiculos.codigo_empresa = ${codigoEmpresa} 
            OR veiculos.compartilhado_id = ${codigoEmpresa}
            OR veiculos.veiculo_id IN (${vehicleIds})
                `
        //console.log("🚀 ~ file: server.js ~ line 288 ~ app.get ~ vQuery ", vQuery)

        pool.query(vQuery, (err, t) => {
            if (err) console.log(err)
            if (t && t.rows)
                res.send(t.rows)
            else res.send([])
        })
    }

    getOldVehicles = async (req, res) => {

        if (!req.query.placa) {
            return res.status(400).send('É obrigatório informar a placa para essa consulta.')
        }

        const placa = req.query.placa.toUpperCase()
        const query = { "Placa": { $in: [placa, placa.replace('-', '')] } }
        const result = await oldVehiclesModel.find(query).exec()
        res.send(result)
    }

    /**
     * Busca pela placa e altera um registro da coleção OldVehicles no mongoDB
     * A alteração é no atributo "Situação" que passa de 'Baixado' para 'Reativado'
     */
    reactivateVehicle = async (req, res) => {

        if (!req.body.placa && !req.body.Placa) {
            return res.status(400).send('É obrigatório informar a placa para essa solicitação.')
        }

        const { placa, Placa } = req.body
        const filter = { Placa: placa || Placa }
        const update = { 'Situação': 'Reativado' }

        oldVehiclesModel.findOneAndUpdate(filter, update, (err, doc) => {
            if (err)
                console.log(err)
            else
                res.send('Veículo reativado.')
        })
    }


    baixaVeiculo = async (req, res) => {

        if (!req.body.placa && !req.body.Placa) {
            return res.status(400).send('É obrigatório informar a placa para a baixa.')
        }

        const { placa, Placa, ...update } = req.body
        const filter = { Placa: Placa || placa }

        oldVehiclesModel.findOneAndUpdate(
            filter,
            update,
            { upsert: true, new: true },
            (err, doc) => {
                if (err) {
                    console.log(err)
                    return res.status(500).send(err.message)
                }
                res.send(doc)
            }
        )
    }

    /** Pesquisa entre veículos ativos e baixados */
    checkVehicleExistence = async (req, res) => {
        const { placa } = req.query;
        const queryString = `SELECT * FROM veiculos WHERE placa = '${placa}'`;
        const regularQuery = await pool.query(queryString);

        let foundOne;

        if (regularQuery.rows && regularQuery.rows[0]) {
            const { veiculo_id, placa, situacao } = regularQuery.rows[0];
            const vehicleFound = { veiculoId: veiculo_id, placa, situacao };

            foundOne = { vehicleFound, status: 'existing' };
        }
        //Se não encontrado veículo ativo, procura entre os baixados
        else {
            const dischargedQuery = { "Placa": { $in: [placa, placa.replace('-', '')] } };
            let old = await oldVehiclesModel.find(dischargedQuery).lean();

            if (old.length > 0) {
                foundOne = { vehicleFound: old[0], status: 'discharged' }
            }
        };
        if (!foundOne) {
            return res.send(false)
        };

        res.send(foundOne)
    }
}

module.exports = VeiculoController
