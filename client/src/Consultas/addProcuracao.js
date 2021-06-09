import { formatDate } from '../Utils/formatValues'

const addProcuracao = (rawData, procuracoes) => {
    //Foi solicitado linhas em duplicidade caso um procurador represente mais de uma empresa
    let result = []
    rawData.forEach(obj => {
        const
            { procuradorId } = obj
            , procs = procuracoes.filter(p => p.procuradores.includes(procuradorId))

        delete obj.procuradorId

        procs.length && procs.forEach(({ codigoEmpresa, razaoSocial, vencimento }) => {
            result.push({
                ...obj,
                'Código da Empresa': codigoEmpresa,
                'Razão Social': razaoSocial,
                'Vencimento': vencimento ? formatDate(vencimento) : 'Prazo indeterminado'
            })
        })
    })

    return result
}

export default addProcuracao
