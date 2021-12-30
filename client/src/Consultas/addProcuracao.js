//@ts-check
import { formatDate } from '../Utils/formatValues'


//Função especial de formatação para a tabela procuradores, pois foi solicitado linhas em duplicidade caso um procurador represente mais de uma empresa
const addProcuracao = (data, procuracoes) => {

    const rawData = JSON.parse(JSON.stringify(data))
    let result = []
    for (let obj of rawData) {
        const
            { procuradorId } = obj
            , procs = procuracoes.filter(p => p.procuradores.includes(procuradorId))

        procs.length && procs.forEach(({ codigoEmpresa, razaoSocial, vencimento }) => {
            const { nomeProcurador, cpfProcurador, emailProcurador, telProcurador, createdAt } = obj
            result.push({
                "Nome do Procurador": nomeProcurador,
                "CPF": cpfProcurador,
                "E-mail": emailProcurador,
                "Telefone": telProcurador,
                'Razão Social': razaoSocial,
                'Código da Empresa': codigoEmpresa,
                "Data de inclusão no sistema": formatDate(createdAt),
                'Validade da Procuração': vencimento ? formatDate(vencimento) : 'Prazo indeterminado'
            })
        })
    }

    return result
}

export default addProcuracao
