import { setNamesFromIds } from './idsToString'

export const setDemand = (demand, redux) => {
    const
        { veiculos, empresas, vehicleDocs, equipamentos, acessibilidade } = redux,
        history = demand?.history,

        vehicle = veiculos.find(v => v.veiculoId === demand.veiculoId),
        originalVehicle = JSON.parse(JSON.stringify(vehicle)),

        selectedEmpresa = empresas.find(e => e.razaoSocial === demand?.empresa),
        razaoSocial = selectedEmpresa?.razaoSocial,
        delegatario = razaoSocial

    let
        selectedVehicle = { ...vehicle } || null,
        alteracoes

    //******************Get the last log updates
    if (Array.isArray(history))
        alteracoes = history.reverse().find(el => el.hasOwnProperty('alteracoes'))?.alteracoes

    //******************Set Alterações into State and set equipamentosId/acessibilidade array of names for each vehicle
    if (alteracoes) {
        Object.keys(alteracoes).forEach(key => selectedVehicle[key] = alteracoes[key])

        //Pega os nomes dos equipamentos e acessórios para renderizar
        const { equipamentosId, acessibilidadeId } = alteracoes
        if (equipamentosId) selectedVehicle.equipamentos = setNamesFromIds(equipamentos, equipamentosId)
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

    //****************** Return the object    
    return {
        ...selectedVehicle, originalVehicle, delegatario, razaoSocial, selectedEmpresa,
        demand, demandFiles: latestDocs, alteracoes, getUpdatedValues
    }
}

function getUpdatedValues(originalObj, newObj) {
    Object.keys(newObj).forEach(key => {
        if (newObj[key] && originalObj[key]) {

            if (key === 'equipamentosId' || key === 'acessibilidadeId')
                newObj[key].sort((a, b) => a - b)

            if (newObj[key].toString() === originalObj[key].toString())
                delete newObj[key]
        }
        if (newObj[key] === '' || newObj[key] === 'null' || !newObj[key]) delete newObj[key]
    })
    const updatedFields = newObj
    return updatedFields
}