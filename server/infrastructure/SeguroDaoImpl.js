//@ts-check
const PostgresDao = require("./PostgresDao")

class SeguroDaoImpl extends PostgresDao {

    constructor() {
        super()
        this.table = 'seguros'
        this.primaryKey = 'id'
    }

    /** Método que implementa uma transaction com as operações de cadastro da empresa e dos sócios
     * @param {object} requestBody
     * @returns {Promise<any>}     */
    async updateInsurance(requestBody) {

        const
            { update } = requestBody
            , seguroQuery = this.createUpdateQuery(update, 'seguros', 'id')

        let
            { vehicleIds, deletedVehicles: deletedVehicleIds } = requestBody
            , newVehicles = []
            , deletedVehicles = []
            , veiculoQuery

        if (Array.isArray(vehicleIds) && vehicleIds.length)
            newVehicles = vehicleIds.map(id => ({
                veiculo_id: id,
                apolice: update.apolice
            }))

        if (Array.isArray(deletedVehicleIds) && deletedVehicleIds.length)
            deletedVehicles = deletedVehicleIds && deletedVehicleIds.map(id => ({
                veiculo_id: id,
                apolice: 'Seguro não cadastrado',
                situacao: 'Seguro vencido'
            }))

        const vehicleUpdates = newVehicles.concat(deletedVehicles)
        console.log("🚀 ~ file: SeguroDaoImpl.js ~ line 35 ~ SeguroDaoImpl ~ updateInsurance ~ vehicleUpdates", vehicleUpdates)

        if (vehicleUpdates.length)
            veiculoQuery = this.createUpdateQuery(vehicleUpdates, 'veiculos', 'veiculo_id')

        //console.log("🚀 ~ file: SeguroDaoImpl.js ~ line 21 ~ SeguroDaoImpl ~ saveEmpresaAndSocios ~ seguroQuery", seguroQuery)
        console.log("🚀 ~ file: SeguroDaoImpl.js ~ line 22 ~ SeguroDaoImpl ~ updateInsurance ~ veiculoQuery", veiculoQuery)
        return

        const client = await this.pool.connect()

        try {
            client.query('BEGIN')

            await client.query(seguroQuery)

            if (veiculoQuery)
                await client.query(veiculoQuery)

            await client.query('COMMIT')
            return 'Seguro e veículos atualizados'

        } catch (error) {
            client.query('ROLLBACK')
            this.handleError(error)
        }
        finally {
            client.release()
        }
    }
}

module.exports = { SeguroDaoImpl }