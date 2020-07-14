import axios from 'axios'
import humps from 'humps'
import { batch } from 'react-redux'
import { idsToString } from '../Utils/idsToString'

export const getData = (collectionsArray = []) => {
    return async (dispatch, getState) => {
        let
            promiseArray = [],
            returnObj = {}

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
                        Object.assign(returnObj, { [key]: el })
                    })
                })
        }

        if (['acessibilidade', 'equipamentos'].every(p => returnObj.hasOwnProperty(p))) {
            const { acessibilidade, equipamentos } = returnObj
            let veiculos = returnObj.veiculos || getState().data?.veiculos

            const updatedData = idsToString(veiculos, equipamentos, acessibilidade)
            returnObj.veiculos = updatedData
        }

        dispatch({
            type: 'GET_DATA',
            payload: returnObj
        })
    }
}

export const insertData = (dataFromServer, collection) => (dispatch, getState) => {
    const
        data = humps.camelizeKeys(dataFromServer),
        payload = { collection, data },
        seguradoras = getState().data.seguradoras

    if (!seguradoras) {
        dispatch({ type: 'INSERT_DATA', payload })
        return
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
    let data = humps.camelizeKeys(dataFromServer)

    if (collection === 'vehicleDocs') {
        const { vehicleDocs } = getState().data
        let updatedData = vehicleDocs.filter(v => dataFromServer.some(id => id === v.id))

        console.log(updatedData)
        updatedData.forEach(doc => doc.metadata.tempFile = 'false')
        data = updatedData
    }


    if (collection === 'veiculos') {
        const { equipamentos, acessibilidade } = getState().data
        data = idsToString(data, equipamentos, acessibilidade)
    }

    if (collection = 'vehicleDocs') {
        const
            { vehicleDocs } = getState().data,
            updatedDocs = vehicleDocs.filter(v => v?.id.toString() === updatedDocs?.id.toString())
        data = updatedDocs
    }

    const payload = { collection, data, id }
    dispatch({ type: 'UPDATE_DATA', payload })
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