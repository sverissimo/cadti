import axios from 'axios'
import humps from 'humps'
import { batch } from 'react-redux'
import { idsToString } from '../Utils/idsToString'

export const getData = (collectionsArray = []) => {
    return async (dispatch, getState) => {
        let
            promiseArray = [],
            globalState = {}

        if (collectionsArray.length > 0) {
            collectionsArray.forEach(collectionName => {
                promiseArray.push(axios.get(`/api/${collectionName}`))
            })

            await Promise.all(promiseArray)
                .then(res => res.map(r => humps.camelizeKeys(r.data)))
                .then(responseArray => {
                    responseArray.forEach((el, i) => {
                        let key = collectionsArray[i]
                            .replace('getFiles/', '')
                            .replace('lookUpTable/', '')
                            .replace('/logs/', '')
                        key = humps.camelize(key)
                        Object.assign(globalState, { [key]: el })
                    })
                })
        }

        if (['acessibilidade', 'equipamentos'].every(p => globalState.hasOwnProperty(p))) {
            const { acessibilidade, equipamentos } = globalState
            let veiculos = globalState.veiculos || getState().data?.veiculos

            const updatedData = idsToString(veiculos, equipamentos, acessibilidade)
            globalState.veiculos = updatedData
        }

        dispatch({
            type: 'GET_DATA',
            payload: globalState
        })
    }
}

export const insertData = (dataFromServer, collection) => (dispatch, getState) => {

    let data = humps.camelizeKeys(dataFromServer)
    const
        payload = { collection, data },
        seguradoras = getState().data.seguradoras

    if (!seguradoras) {
        dispatch({ type: 'INSERT_DATA', payload })
        return
    }

    if (collection === 'veiculos' && data[0]) {

        const { acessibilidade, equipamentos } = getState().data

        let
            eqNames = [],
            acNames = []

        if (data[0]?.equipa) {
            data[0].equipa.forEach(eqId => {
                equipamentos.forEach(({ id, item }) => {
                    if (eqId.toString() === id.toString()) eqNames.push(item)
                })
            })
        }

        if (data[0]?.acessibilidadeId) {
            data[0].acessibilidadeId.forEach(acId => {
                acessibilidade.forEach(({ id, item }) => {
                    if (acId.toString() === id.toString()) {
                        acNames.push(item)
                    }
                })
            })
        }
        data[0].equipamentos = eqNames
        data[0].acessibilidade = acNames
    }

    if (collection === 'seguros' && data[0].placas && data[0].placas.length === 1) {

        const seguradora = seguradoras.find(sg => sg.id === data[0].seguradoraId)
        let
            seguro = data[0],
            plates = [], vehicles = [],
            veiculos = getState().data.veiculos,

            updatedCollection = veiculos.map(v => {
                if (v.apolice === seguro.apolice) {
                    v.seguradora = seguradora.seguradora
                    v.dataEmissao = seguro.dataEmissao
                    v.vencimento = seguro.vencimento
                }
                return v
            })

        veiculos.forEach(v => {
            if (v.apolice === seguro.apolice) {
                plates.push(v.placa)
                vehicles.push(v.veiculoId)
            }
        })
        seguro.placas = plates
        seguro.veiculos = vehicles
        seguro = [seguro]

        const collectionPayload = { data: updatedCollection, collection: 'veiculos' }
        batch(() => {
            dispatch({ type: 'INSERT_DATA', payload: { data: seguro, collection: 'seguros' } })
            dispatch({ type: 'UPDATE_COLLECTION', payload: collectionPayload })
        })
    } else dispatch({ type: 'INSERT_DATA', payload })

}

export const updateData = (dataFromServer, collection, id) => (dispatch, getState) => {

    //Se a collection for vehicleDocs, o que vem do servidor são os ids
    let i = 0
    if (i > 0) return
    let data = humps.camelizeKeys(dataFromServer)

    if (collection === 'vehicleDocs') {
        const { vehicleDocs } = getState().data
        let updatedData = vehicleDocs.filter(v => dataFromServer.some(id => id === v.id))

        updatedData.forEach(doc => doc.metadata.tempFile = 'false')
        data = updatedData
    }


    if (collection === 'veiculos') {
        const { equipamentos, acessibilidade } = getState().data
        data = idsToString(data, equipamentos, acessibilidade)
    }

    const payload = { collection, data, id }
    dispatch({ type: 'UPDATE_DATA', payload })
    return
}

export const updateDocs = (ids, metadata, collection, primarykey) => (dispatch, getState) => {

    const stateCollection = getState().data[collection]
    console.log(stateCollection)
    let updatedDocs

    if (ids && ids[0] && metadata) {
        let selectedDocs = stateCollection.filter(doc => ids.some(id => id === doc[primarykey]))
        console.log(selectedDocs, ids)
        updatedDocs = selectedDocs.map(doc => {
            doc.metadata = { ...doc.metadata, ...metadata }
            console.log(doc)
            return doc
        })
    }
    if (updatedDocs) {
        const payload = { collection, data: updateDocs, id: primarykey }
        dispatch({ type: 'UPDATE_DATA', payload })
    }
}

export const updateCollection = (data, collection) => dispatch => {

    data = humps.camelizeKeys(data)
    const payload = { data, collection }
    console.log(payload)
    dispatch({
        type: 'UPDATE_COLLECTION',
        payload
    })
}

export const updateInsurance = ({ value, ids }) => (dispatch, getState) => {
    const
        apolice = value,
        seguros = getState().data.seguros,
        veiculos = getState().data.veiculos

    if (!seguros || !veiculos) return

    let seguro = seguros.find(s => s.apolice === apolice),
        placas = seguro.placas || [], vehicleIDs = seguro.veiculos || []

    veiculos.forEach(v => {
        ids.forEach(id => {
            if (v.veiculoId === id) {
                placas.push(v.placa)
                vehicleIDs.push(v.veiculoId)
            }
        })
    })

    seguro.placas = placas
    seguro.veiculos = vehicleIDs
    seguro = [seguro]
    console.log(seguro)

    const payload = { collection: 'seguros', data: seguro, id: 'apolice' }

    dispatch({ type: 'UPDATE_DATA', payload })
}

export const removeInsurance = (apolice, placaIndex, vehicleIndex) => dispatch => {

    dispatch({
        type: 'REMOVE_FROM_INSURANCE',
        payload: { apolice, placaIndex, vehicleIndex }
    })
}

export const deleteOne = (id, tablePK, collection) => dispatch => {
    tablePK = humps.camelize(tablePK)
    dispatch({
        type: 'DELETE_ONE',
        payload: { id, tablePK, collection }
    })
}