import { setNamesFromIds } from './idsToString'

export const setDemand = (demand, redux) => {
    const
        { veiculos, empresas, vehicleDocs, equipamentos, acessibilidade } = redux,
        history = demand?.history,

        vehicle = veiculos.find(v => v.veiculoId.toString() === demand.veiculoId.toString()),
        originalVehicle = Object.freeze(vehicle),

        selectedEmpresa = empresas.find(e => e.razaoSocial === demand?.empresa),
        razaoSocial = selectedEmpresa?.razaoSocial,
        delegatario = razaoSocial

    let
        selectedVehicle = { ...vehicle } || null,
        alteracoes,
        compartilhado

    //******************Adjust data to handle Delegatário compartilhado 
    const
        length = history?.length,
        delCompartilhado = history[length - 1]?.alteracoes?.delegatarioCompartilhado

    if (delCompartilhado) {
        compartilhado = empresas.find(e => e.delegatarioId === delCompartilhado)?.razaoSocial
        if (alteracoes && typeof alteracoes === 'object') alteracoes.compartilhado = compartilhado
    }

    //******************Get the last log updates
    if (Array.isArray(history)) alteracoes = history.reverse().find(el => el.hasOwnProperty('alteracoes'))?.alteracoes

    //******************Set Alterações into State and set equipa/acessibilidade array of names for each vehicle

    if (alteracoes) {
        Object.keys(alteracoes).forEach(key => selectedVehicle[key] = alteracoes[key])
        const { equipa, acessibilidadeId } = alteracoes
        if (equipa) selectedVehicle.equipamentos = setNamesFromIds(equipamentos, equipa)
        if (acessibilidadeId) selectedVehicle.acessibilidade = setNamesFromIds(acessibilidade, acessibilidadeId)
    }

    //******************Get latest uploaded files per field
    let fileIds = [], allDemandFiles, latestDocs = [], filesPerFieldName = {}
    history
        .filter(el => el.files)
        .map(el => el.files)
        .forEach(array => {
            array.forEach(id => fileIds.push(id))
        })
    allDemandFiles = vehicleDocs.filter(doc => fileIds.indexOf(doc.id) !== -1)

    let fieldExists = []
    allDemandFiles.forEach(file => {
        const { fieldName } = file.metadata
        if (!fieldExists.includes(fieldName)) {
            fieldExists.push(fieldName)
            filesPerFieldName[fieldName] = [file]
        }
        else filesPerFieldName[fieldName].push(file)
    })

    Object.keys(filesPerFieldName).forEach(field => {
        const arrayOfFiles = filesPerFieldName[field]
        let lastDoc
        lastDoc = arrayOfFiles.reduce((a, b) => new Date(a.uploadDate) > new Date(b.uploadDate) ? a : b)
        latestDocs.push(lastDoc)
        lastDoc = []
    })
    console.log(filesPerFieldName, latestDocs)
    //****************** Return the object
    return {
        ...selectedVehicle, originalVehicle, delegatario, compartilhado, razaoSocial, selectedEmpresa,
        demand, demandFiles: latestDocs, alteracoes, getUpdatedValues
    }
}

function getUpdatedValues(originalObj, newObj) {
    Object.keys(newObj).forEach(key => {
        if (newObj[key] && originalObj[key]) {

            if (key === 'equipa' || key === 'acessibilidadeId')
                newObj[key].sort((a, b) => a - b)

            if (newObj[key].toString() === originalObj[key].toString())
                delete newObj[key]
        }
        if (newObj[key] === '' || newObj[key] === 'null' || !newObj[key]) delete newObj[key]
    })
    const updatedFields = newObj
    return updatedFields
}