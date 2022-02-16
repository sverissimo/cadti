class Socio {

    table = 'socios'
    primaryKey = 'socio_id'

    /** Insere a coluna empresas [{codigoEmpresa, share}] para cada sócio
        * @param {number | string} codigoEmpresa 
        * @param {Array<any>} socios 
        * @returns {Array<any>} socios
        */
    addEmpresaAndShareArray(codigoEmpresa, socios) {
        for (let socio of socios) {
            //Os sócios podem já ter cadastro no sistema (outra empresa) ou ser novos
            let { empresas, share } = socio
            if (empresas && empresas instanceof Array)
                empresas.push({ codigoEmpresa, share })
            //Os novos não vêm com a coluna 'empresas' do frontEnd (req.body)
            else
                empresas = [{ codigoEmpresa, share }]

            socio.empresas = empresas
            socio.empresas = JSON.stringify(empresas)
        }
        return socios
    }

}

module.exports = { Socio }