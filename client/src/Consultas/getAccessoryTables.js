//@ts-check
import altContratoTable from '../Forms/altContratoTable'
import { procuracaoForm } from '../Empresas/Procuracoes/forms/procuracaoForm'
import { procuradorEmpresaTable as procTable } from '../Forms/procuradorEmpresaTable'
import createFormPattern from "../Utils/createFormPattern"

export const getProcuradoresTable = ({ tab, data, empresas, procuradores, procuracoes, empresaDocs }) => {
    const element = createFormPattern(tab, data) || [] //Element é o form com a adição do campo value, inserindo data para cada objeto(field)
    const razaoSocial = element.find(el => el.field === 'razaoSocial')?.value
    const codigoEmpresa = empresas.find(e => e.razaoSocial === razaoSocial)?.codigoEmpresa
    const selectedDocs = procuracoes.filter(p => p.codigoEmpresa === codigoEmpresa)
    const selectedFiles = empresaDocs.filter(d => d.metadata?.fieldName === 'procuracao' && d.metadata?.empresaId === codigoEmpresa)
    const selectedProcs = []
    let
        tableHeaders = [],
        arrayOfRows = [],
        row = [],
        rowObj

    //Cria uma array de procuradores com base na array de procuradorId disponível na tabela Procuracao do Postgresql
    procuradores.forEach(pr => {
        selectedDocs.forEach(doc => {
            if (doc.procuradores.some(p => p === pr.procuradorId)) {
                const
                    tableRow = { ...pr, vencimento: doc.vencimento },
                    file = empresaDocs.find(f => f.metadata.procuracaoId === doc.procuracaoId) // achar arquivo da procuração, se houver

                if (file)
                    tableRow.fileId = file?.id
                selectedProcs.push(tableRow)
            }
        })
    })

    selectedProcs.forEach(proc => {
        procTable.forEach(fieldObj => {
            const { field } = fieldObj
            //insere o cabeçalho da tabela (apenas uma vez)
            if (!tableHeaders.some(t => t === fieldObj.title))
                tableHeaders.push(fieldObj.title)
            //insere as linhas (também apenas uma vez)
            if (proc.hasOwnProperty(field) && !row.some(o => o.hasOwnProperty(field))) {

                //se a coluna/field for um arquivo o valor que aparecerá na tabela é "Clique para baixar..."
                if (field === 'fileId' && proc.fileId)
                    rowObj = { ...fieldObj, value: 'Clique para baixar a procuração', fileId: proc.fileId }
                //Senão, o valor é o valor da célula
                else
                    rowObj = { ...fieldObj, value: proc[field] }

                //se a célula possuir um método de autoFormatação, aplicar
                if (fieldObj.format) {
                    const value = fieldObj.format(proc[field])
                    rowObj = { ...fieldObj, value }
                }
                row.push(rowObj)
            }
        })
        arrayOfRows.push(row)
        row = []
    })

    //Cria uma array de arquivos com base no id de cada procuração
    if (selectedProcs[0]) {
        //setProcs(selectedProcs)
        const table = {
            mainTitle: `Procuradores cadastrados para ${data?.razaoSocial}`,
            tableHeaders,
            arrayOfRows,
            docs: selectedFiles
        }
        return table
    }

}

//Cria a tabela que lista as alterações de contrato social caso o objeto exibido seja uma empresa
export const getAltContratuaisTable = ({ altContrato, data, empresaDocs }) => {
    if (altContrato) {
        const
            alteracoes = altContrato.filter(a => a.codigoEmpresa === data.codigoEmpresa),
            altDocs = empresaDocs.filter(doc => doc?.metadata?.fieldName === 'altContratoDoc' && doc?.metadata.empresaId === data.codigoEmpresa)

        let tableHeaders = [], arrayOfRows = [], row = [], rowObj = {}

        alteracoes.forEach(alt => {
            altContratoTable.forEach(fieldObj => {
                const { field } = fieldObj
                if (!tableHeaders.includes(fieldObj.label))
                    tableHeaders.push(fieldObj.label)
                if (field === 'fileId' || !row.some(o => o.hasOwnProperty(field))) {
                    //se a coluna/field for um arquivo o valor que aparecerá na tabela é "Clique para baixar..."
                    if (field === 'fileId') {
                        let fileId = altDocs.find(d => d.metadata.numeroAlteracao === alt.numeroAlteracao)
                        fileId = fileId?.id
                        if (fileId)
                            rowObj = { ...fieldObj, value: fieldObj?.value, fileId }
                        else
                            rowObj = { ...fieldObj, value: '-' }

                    }
                    //Senão, o valor é o valor da célula
                    else
                        rowObj = { ...fieldObj, value: alt[field] || '-' }
                    //se a célula possuir um método de autoFormatação, aplicar
                    if (fieldObj.format) {
                        const value = fieldObj.format(alt[field]) || '-'
                        rowObj = { ...fieldObj, value }
                    }
                    row.push(rowObj)
                }
            })

            arrayOfRows.push(row)
            row = []
        })

        if (alteracoes[0]) {
            //setProcs(true)
            const table2 = {
                mainTitle: `Alterações do contrato social - ${data?.razaoSocial}`,
                tableHeaders,
                arrayOfRows,
                docs: altDocs
            }
            return table2
        }
    }
}

export const getProcuracoesTable = ({ data, procuracoes, empresaDocs }) => {

    let
        tableHeaders = [],
        arrayOfRows = [],
        row = [],
        rowObj

    const
        procuradorId = (data?.procuradorId),
        procs = procuracoes.filter(p => p.procuradores.includes(procuradorId))
    let file
    procs.forEach(p => {
        file = empresaDocs.find(({ metadata }) => metadata?.procuracaoId === p.procuracaoId)
        p.fileId = file?.id
    })

    procs.forEach(proc => {
        procuracaoForm.forEach(fieldObj => {
            const { field } = fieldObj

            //insere o cabeçalho da tabela (apenas uma vez)
            if (!tableHeaders.some(t => t === fieldObj.title))
                tableHeaders.push(fieldObj.title)

            //insere as linhas (também apenas uma vez)
            if (proc.hasOwnProperty(field) && !row.some(o => o.hasOwnProperty(field))) {

                //se a coluna/field for um arquivo o valor que aparecerá na tabela é "Clique para baixar..."
                if (field === 'fileId' && proc.fileId)
                    rowObj = { ...fieldObj, value: 'Clique para baixar a procuração', fileId: proc.fileId }
                //Senão, o valor é o valor da célula
                else
                    rowObj = { ...fieldObj, value: proc[field] }

                //se a célula possuir um método de autoFormatação, aplicar
                if (fieldObj.format) {
                    const value = fieldObj.format(proc[field])
                    rowObj = { ...fieldObj, value }
                }
                row.push(rowObj)
            }
        })
        arrayOfRows.push(row)
        row = []
    })
    //Cria uma array de arquivos com base no id de cada procuração
    if (procs[0]) {
        const procuracoesTable = {
            mainTitle: `Procurações cadastrados para ${data?.nomeProcurador}`,
            tableHeaders,
            arrayOfRows,
            docs: empresaDocs
        }
        return procuracoesTable
    }
}