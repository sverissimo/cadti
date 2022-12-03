//@ts-check
const userSockets = require("../auth/userSockets");
const { pool } = require("../config/pgConfig");
const { getUpdatedData } = require("../getUpdatedData");
const { SocioDaoImpl } = require("../infrastructure/SocioDaoImpl");
const insertEmpresa = require("../users/insertEmpresa");
const { Controller } = require("./Controller");

class SocioController extends Controller {

    table = 'socios'
    primaryKey = 'socio_id'
    event = 'insertSocios'

    constructor() {
        super('socios', 'socio_id');
    }

    /*    REFACTOR PARENT CLASS ANT THIS CLASS METHOD!!!!!!!!!!!!!!!!!!!!
    async saveMany(req, res) {
   
           console.log("🚀 ~ file: SocioController.js:31 ~ SocioController ~ saveMany ~ req.body", req.body)
           const
               { codigo_empresa: codigoEmpresa, ...socios } = req.body
               , updatedSocios = new Socio().addEmpresaAndShareArray(codigoEmpresa, socios)
               , socioDaoImpl = new EntityDaoImpl(this.table, this.primaryKey)
               , ids = await socioDaoImpl.saveMany(updatedSocios)
   
           res.send(ids)
       } */

    /**Verifica existência de sócios */
    checkSocios = async (req, res) => {
        const { newCpfs } = req.body

        if (!Array.isArray(newCpfs)) {
            return res.send([])
        }

        //Checa se o(s) cpf(s) informado(s) também é sócio de alguma outra empresa do sistema    
        const cpfArray = newCpfs.map(cpf => `'${cpf}'`)
        const condition = `WHERE cpf_socio IN (${cpfArray})`
        const checkSocios = await getUpdatedData('socios', condition)

        //Parse da coluna empresas de string para JSON
        checkSocios.forEach(s => {
            if (s.empresas)
                s.empresas = JSON.parse(s.empresas)
        })
        res.send(checkSocios)
    }

    updateSocios = async (req, res, next) => {

        const { requestArray, table, codigoEmpresa, cpfsToAdd, cpfsToRemove } = req.body
        let
            queryString = '',
            socioIds = []

        const keys = await new SocioDaoImpl().getEntityPropsNames()
        //console.log("🚀 ~ file: server.js ~ line 708 ~ app.put ~  keys", keys)

        requestArray.forEach(o => {
            socioIds.push(o.socio_id)
            //@ts-ignore
            keys.forEach(key => {
                if (key !== 'socio_id' && key !== 'cpf_socio' && (o[key] || o[key] === '')) {
                    const value = o[key]

                    queryString += `
                        UPDATE ${table} 
                        SET ${key} = '${value}'
                        WHERE socio_id = ${o.socio_id};
                        `
                }
            })
        })

        pool.query(queryString, async (err, t) => {
            if (err) console.log(err)
            if (t) {
                //Adiciona permissões, se for o caso
                if (cpfsToAdd && cpfsToAdd[0])
                    insertEmpresa({ representantes: cpfsToAdd, codigoEmpresa })

                //@ts-ignore
                userSockets({ req, res, table: 'socios', event: 'updateSocios', noResponse: true })
                res.send('Socios updated.')
            }
        })
    }
}

module.exports = { SocioController }